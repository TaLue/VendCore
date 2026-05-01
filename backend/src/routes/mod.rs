use axum::{routing::{get, post}, Router};
use sqlx::PgPool;

use crate::handlers::{money, products, purchase};

pub fn app_router(pool: PgPool) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/products", get(products::list).post(products::create))
        .route("/products/:id", get(products::get).put(products::update).delete(products::delete))
        .route("/money", get(money::list).put(money::update))
        .route("/purchase", post(purchase::purchase))
        .with_state(pool)
}

async fn health() -> &'static str {
    "OK"
}
