use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::models::money::ChangeItem;

#[derive(Debug, Deserialize)]
pub struct InsertedMoneyItem {
    pub value: i32,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct PurchaseRequest {
    pub product_id: Uuid,
    pub inserted_money: Vec<InsertedMoneyItem>,
}

#[derive(Debug, Serialize)]
#[serde(tag = "status")]
pub enum PurchaseResponse {
    #[serde(rename = "SUCCESS")]
    Success {
        change: Vec<ChangeItem>,
        change_amount: i32,
        message: String,
    },
    #[serde(rename = "FAILED")]
    Failed {
        reason: String,
        message: String,
    },
}

#[allow(dead_code)]
#[derive(Debug, sqlx::FromRow)]
pub struct Transaction {
    pub id: Uuid,
    pub product_id: Option<Uuid>,
    pub inserted_amount: i32,
    pub change_amount: i32,
    pub status: String,
    pub failure_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}
