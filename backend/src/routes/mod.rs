use axum::{routing::{get, post}, Router};
use sqlx::PgPool;
use tower_http::services::ServeDir;

use crate::handlers::{money, products, purchase, upload};

pub fn app_router(pool: PgPool) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/products", get(products::list).post(products::create))
        .route("/products/:id", get(products::get).put(products::update).delete(products::delete))
        .route("/money", get(money::list).put(money::update))
        .route("/purchase", post(purchase::purchase))
        .route("/upload", post(upload::upload_image))
        .nest_service("/uploads", ServeDir::new("/app/uploads"))
        .with_state(pool)
}

async fn health() -> &'static str {
    "OK"
}
