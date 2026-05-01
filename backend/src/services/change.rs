use crate::models::money::{ChangeItem, MoneyDenomination};

const DENOMINATIONS: [i32; 8] = [1000, 500, 100, 50, 20, 10, 5, 1];

pub fn calculate_change(
    change_needed: i32,
    stock: &[MoneyDenomination],
) -> Result<Vec<ChangeItem>, &'static str> {
    if change_needed == 0 {
        return Ok(vec![]);
    }

    let mut remaining = change_needed;
    let mut result: Vec<ChangeItem> = Vec::new();

    for &denom in &DENOMINATIONS {
        if remaining == 0 {
            break;
        }
        let available = stock
            .iter()
            .find(|m| m.denomination == denom)
            .map(|m| m.quantity)
            .unwrap_or(0);

        if available == 0 || denom > remaining {
            continue;
        }

        let use_qty = (remaining / denom).min(available);
        if use_qty > 0 {
            remaining -= denom * use_qty;
            result.push(ChangeItem { value: denom, quantity: use_qty });
        }
    }

    if remaining != 0 {
        return Err("Cannot make exact change");
    }

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    fn make_stock(pairs: &[(i32, i32)]) -> Vec<MoneyDenomination> {
        pairs.iter().map(|&(denom, qty)| MoneyDenomination {
            id: Uuid::new_v4(),
            denomination: denom,
            money_type: if denom <= 10 { "COIN".into() } else { "BANKNOTE".into() },
            quantity: qty,
        }).collect()
    }

    #[test]
    fn test_no_change_needed() {
        let result = calculate_change(0, &make_stock(&[(10, 5)])).unwrap();
        assert!(result.is_empty());
    }

    #[test]
    fn test_standard_change() {
        let stock = make_stock(&[(20, 2), (10, 5), (5, 5), (1, 10)]);
        let result = calculate_change(25, &stock).unwrap();
        let total: i32 = result.iter().map(|c| c.value * c.quantity).sum();
        assert_eq!(total, 25);
    }

    #[test]
    fn test_cannot_make_change() {
        let result = calculate_change(3, &make_stock(&[(10, 5), (5, 5)]));
        assert!(result.is_err());
    }

    #[test]
    fn test_respects_available_quantity() {
        let stock = make_stock(&[(100, 1), (10, 10), (1, 10)]);
        let result = calculate_change(200, &stock).unwrap();
        let total: i32 = result.iter().map(|c| c.value * c.quantity).sum();
        assert_eq!(total, 200);
        assert_eq!(result.iter().find(|c| c.value == 100).unwrap().quantity, 1);
    }

    #[test]
    fn test_exact_amount_with_single_denomination() {
        let stock = make_stock(&[(50, 5), (10, 10)]);
        let result = calculate_change(100, &stock).unwrap();
        let total: i32 = result.iter().map(|c| c.value * c.quantity).sum();
        assert_eq!(total, 100);
    }
}
