use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::{money::ChangeItem, transaction::{InsertedMoneyItem, PurchaseResponse}},
    repository::{money as money_repo, transaction as tx_repo},
    services::change::calculate_change,
};

pub async fn process_purchase(
    pool: &PgPool,
    product_id: Uuid,
    inserted_money: Vec<InsertedMoneyItem>,
) -> anyhow::Result<PurchaseResponse> {
    let inserted_amount: i32 = inserted_money.iter().map(|m| m.value * m.quantity).sum();

    let mut tx = pool.begin().await?;

    let product = sqlx::query_as::<_, (Uuid, String, i32, i32)>(
        "SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE"
    )
    .bind(product_id)
    .fetch_optional(&mut *tx)
    .await?;

    let (_, name, price, stock) = match product {
        None => return Ok(PurchaseResponse::Failed {
            reason: "OUT_OF_STOCK".into(),
            message: "ไม่พบสินค้า".into(),
        }),
        Some(p) => p,
    };

    if stock <= 0 {
        tx_repo::insert_failure(&mut tx, product_id, inserted_amount, "OUT_OF_STOCK").await?;
        tx.commit().await?;
        return Ok(PurchaseResponse::Failed {
            reason: "OUT_OF_STOCK".into(),
            message: format!("{} หมด", name),
        });
    }

    if inserted_amount < price {
        tx_repo::insert_failure(&mut tx, product_id, inserted_amount, "INSUFFICIENT_PAYMENT").await?;
        tx.commit().await?;
        return Ok(PurchaseResponse::Failed {
            reason: "INSUFFICIENT_PAYMENT".into(),
            message: format!("เงินไม่พอ ต้องการ {} บาท", price),
        });
    }

    let change_needed = inserted_amount - price;
    let money_stock = money_repo::list_for_update(&mut tx).await?;

    let mut stock_with_inserted = money_stock.clone();
    for item in &inserted_money {
        if let Some(slot) = stock_with_inserted.iter_mut().find(|m| m.denomination == item.value) {
            slot.quantity += item.quantity;
        }
    }

    let change_items: Vec<ChangeItem> = match calculate_change(change_needed, &stock_with_inserted) {
        Ok(items) => items,
        Err(_) => {
            tx_repo::insert_failure(&mut tx, product_id, inserted_amount, "CANNOT_MAKE_CHANGE").await?;
            tx.commit().await?;
            return Ok(PurchaseResponse::Failed {
                reason: "CANNOT_MAKE_CHANGE".into(),
                message: "ไม่มีเหรียญ/ธนบัตรเพียงพอสำหรับทอนเงิน".into(),
            });
        }
    };

    sqlx::query("UPDATE products SET stock = stock - 1, updated_at = NOW() WHERE id = $1")
        .bind(product_id)
        .execute(&mut *tx)
        .await?;

    for item in &inserted_money {
        money_repo::add_inserted_money(&mut tx, item.value, item.quantity).await?;
    }

    for item in &change_items {
        money_repo::deduct_change(&mut tx, item.value, item.quantity).await?;
    }

    let change_json = serde_json::to_value(&change_items)?;
    tx_repo::insert_success(&mut tx, product_id, inserted_amount, change_needed, change_json).await?;

    tx.commit().await?;

    Ok(PurchaseResponse::Success {
        change: change_items,
        change_amount: change_needed,
        message: format!("ซื้อ {} สำเร็จ", name),
    })
}
