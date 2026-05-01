use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, sqlx::FromRow)]
pub struct MoneyDenomination {
    pub id: Uuid,
    pub denomination: i32,
    pub money_type: String,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMoneyItem {
    pub denomination: i32,
    pub quantity: i32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMoneyRequest {
    pub denominations: Vec<UpdateMoneyItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChangeItem {
    pub value: i32,
    pub quantity: i32,
}
