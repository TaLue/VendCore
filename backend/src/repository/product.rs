use sqlx::PgPool;
use uuid::Uuid;

use crate::models::product::{CreateProduct, Product, UpdateProduct};

pub async fn list(pool: &PgPool) -> anyhow::Result<Vec<Product>> {
    let products = sqlx::query_as::<_, Product>(
        "SELECT * FROM products ORDER BY created_at ASC"
    )
    .fetch_all(pool)
    .await?;
    Ok(products)
}

pub async fn get_by_id(pool: &PgPool, id: Uuid) -> anyhow::Result<Option<Product>> {
    let product = sqlx::query_as::<_, Product>(
        "SELECT * FROM products WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(product)
}

pub async fn create(pool: &PgPool, input: CreateProduct) -> anyhow::Result<Product> {
    let icon = input.icon.unwrap_or_else(|| "🛒".to_string());
    let product = sqlx::query_as::<_, Product>(
        "INSERT INTO products (name, icon, price, stock) VALUES ($1, $2, $3, $4) RETURNING *"
    )
    .bind(input.name)
    .bind(icon)
    .bind(input.price)
    .bind(input.stock)
    .fetch_one(pool)
    .await?;
    Ok(product)
}

pub async fn update(pool: &PgPool, id: Uuid, input: UpdateProduct) -> anyhow::Result<Option<Product>> {
    let product = sqlx::query_as::<_, Product>(
        r#"
        UPDATE products
        SET
            name = COALESCE($2, name),
            icon = COALESCE($3, icon),
            price = COALESCE($4, price),
            stock = COALESCE($5, stock),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
        "#
    )
    .bind(id)
    .bind(input.name)
    .bind(input.icon)
    .bind(input.price)
    .bind(input.stock)
    .fetch_optional(pool)
    .await?;
    Ok(product)
}

pub async fn delete(pool: &PgPool, id: Uuid) -> anyhow::Result<bool> {
    let result = sqlx::query("DELETE FROM products WHERE id = $1")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}
