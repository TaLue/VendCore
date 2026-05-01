use serde_json::Value;
use sqlx::{Transaction, Postgres};
use uuid::Uuid;

pub async fn insert_success(
    tx: &mut Transaction<'_, Postgres>,
    product_id: Uuid,
    inserted_amount: i32,
    change_amount: i32,
    change_breakdown: Value,
) -> anyhow::Result<()> {
    sqlx::query(
        r#"
        INSERT INTO transactions (product_id, inserted_amount, change_amount, change_breakdown, status)
        VALUES ($1, $2, $3, $4, 'SUCCESS')
        "#
    )
    .bind(product_id)
    .bind(inserted_amount)
    .bind(change_amount)
    .bind(change_breakdown)
    .execute(&mut **tx)
    .await?;
    Ok(())
}

pub async fn insert_failure(
    tx: &mut Transaction<'_, Postgres>,
    product_id: Uuid,
    inserted_amount: i32,
    reason: &str,
) -> anyhow::Result<()> {
    sqlx::query(
        r#"
        INSERT INTO transactions (product_id, inserted_amount, change_amount, status, failure_reason)
        VALUES ($1, $2, 0, 'FAILED', $3::failure_reason)
        "#
    )
    .bind(product_id)
    .bind(inserted_amount)
    .bind(reason)
    .execute(&mut **tx)
    .await?;
    Ok(())
}
