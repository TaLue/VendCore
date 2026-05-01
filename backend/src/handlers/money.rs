use axum::{extract::State, Json};
use sqlx::PgPool;

use crate::{
    errors::AppResult,
    models::money::UpdateMoneyRequest,
    repository::money as repo,
};

pub async fn list(State(pool): State<PgPool>) -> AppResult<impl axum::response::IntoResponse> {
    let money = repo::list(&pool).await?;
    Ok(Json(money))
}

pub async fn update(
    State(pool): State<PgPool>,
    Json(body): Json<UpdateMoneyRequest>,
) -> AppResult<impl axum::response::IntoResponse> {
    let money = repo::bulk_update(&pool, &body.denominations).await?;
    Ok(Json(money))
}
