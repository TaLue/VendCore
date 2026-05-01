use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    errors::{AppError, AppResult},
    models::product::{CreateProduct, UpdateProduct},
    repository::product as repo,
};

pub async fn list(State(pool): State<PgPool>) -> AppResult<impl axum::response::IntoResponse> {
    let products = repo::list(&pool).await?;
    Ok(Json(products))
}

pub async fn get(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> AppResult<impl axum::response::IntoResponse> {
    let product = repo::get_by_id(&pool, id)
        .await?
        .ok_or_else(|| AppError::NotFound("Product not found".into()))?;
    Ok(Json(product))
}

pub async fn create(
    State(pool): State<PgPool>,
    Json(body): Json<CreateProduct>,
) -> AppResult<impl axum::response::IntoResponse> {
    if body.price <= 0 {
        return Err(AppError::BadRequest("Price must be positive".into()));
    }
    if body.stock < 0 {
        return Err(AppError::BadRequest("Stock cannot be negative".into()));
    }
    let product = repo::create(&pool, body).await?;
    Ok((StatusCode::CREATED, Json(product)))
}

pub async fn update(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateProduct>,
) -> AppResult<impl axum::response::IntoResponse> {
    if let Some(price) = body.price {
        if price <= 0 {
            return Err(AppError::BadRequest("Price must be positive".into()));
        }
    }
    if let Some(stock) = body.stock {
        if stock < 0 {
            return Err(AppError::BadRequest("Stock cannot be negative".into()));
        }
    }
    let product = repo::update(&pool, id, body)
        .await?
        .ok_or_else(|| AppError::NotFound("Product not found".into()))?;
    Ok(Json(product))
}

pub async fn delete(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> AppResult<impl axum::response::IntoResponse> {
    let deleted = repo::delete(&pool, id).await?;
    if !deleted {
        return Err(AppError::NotFound("Product not found".into()));
    }
    Ok(StatusCode::NO_CONTENT)
}
