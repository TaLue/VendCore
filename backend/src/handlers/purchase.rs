use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::{
    errors::AppResult,
    models::transaction::PurchaseRequest,
    services::purchase::process_purchase,
};

pub async fn purchase(
    State(pool): State<PgPool>,
    Json(body): Json<PurchaseRequest>,
) -> AppResult<impl axum::response::IntoResponse> {
    let response = process_purchase(&pool, body.product_id, body.inserted_money).await?;
    Ok(Json(response))
}
