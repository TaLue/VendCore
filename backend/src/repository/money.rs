use sqlx::{PgPool, Transaction, Postgres};

use crate::models::money::{MoneyDenomination, UpdateMoneyItem};

pub async fn list(pool: &PgPool) -> anyhow::Result<Vec<MoneyDenomination>> {
    let rows = sqlx::query_as::<_, MoneyDenomination>(
        "SELECT id, denomination, money_type::text as money_type, quantity FROM money ORDER BY denomination DESC"
    )
    .fetch_all(pool)
    .await?;
    Ok(rows)
}

pub async fn list_for_update(tx: &mut Transaction<'_, Postgres>) -> anyhow::Result<Vec<MoneyDenomination>> {
    let rows = sqlx::query_as::<_, MoneyDenomination>(
        "SELECT id, denomination, money_type::text as money_type, quantity FROM money ORDER BY denomination DESC FOR UPDATE"
    )
    .fetch_all(&mut **tx)
    .await?;
    Ok(rows)
}

pub async fn bulk_update(pool: &PgPool, updates: &[UpdateMoneyItem]) -> anyhow::Result<Vec<MoneyDenomination>> {
    let mut tx = pool.begin().await?;
    for item in updates {
        sqlx::query("UPDATE money SET quantity = $1 WHERE denomination = $2")
            .bind(item.quantity)
            .bind(item.denomination)
            .execute(&mut *tx)
            .await?;
    }
    tx.commit().await?;
    list(pool).await
}

pub async fn add_inserted_money(
    tx: &mut Transaction<'_, Postgres>,
    denomination: i32,
    qty: i32,
) -> anyhow::Result<()> {
    sqlx::query("UPDATE money SET quantity = quantity + $1 WHERE denomination = $2")
        .bind(qty)
        .bind(denomination)
        .execute(&mut **tx)
        .await?;
    Ok(())
}

pub async fn deduct_change(
    tx: &mut Transaction<'_, Postgres>,
    denomination: i32,
    qty: i32,
) -> anyhow::Result<()> {
    sqlx::query("UPDATE money SET quantity = quantity - $1 WHERE denomination = $2")
        .bind(qty)
        .bind(denomination)
        .execute(&mut **tx)
        .await?;
    Ok(())
}
