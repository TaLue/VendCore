# VendCore — Blue Vending Machine

Full-stack vending machine web application built for the SE Challenge.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand |
| Backend | Rust (Axum), sqlx |
| Database | PostgreSQL 16 |
| Infrastructure | Docker + Docker Compose |

## Design Decisions

**Why Axum?**
Axum is modern, tokio-native, and composes cleanly with tower middleware. Its extractor pattern makes handler signatures self-documenting.

**Why sqlx over an ORM?**
sqlx gives compile-time SQL verification without hiding what queries run. For a project this size, raw SQL is clearer and faster than an ORM abstraction.

**Change Algorithm**
Greedy algorithm iterating denominations [1000, 500, 100, 50, 20, 10, 5, 1] from highest to lowest. This is optimal for Thai currency denominations, which satisfy the greedy property. Change is calculated on the stock *after* adding the customer's inserted money — this gives the machine a more realistic stock picture before dispensing.

**Race Conditions**
The purchase flow uses a PostgreSQL transaction with `SELECT ... FOR UPDATE` on the product row. This prevents two concurrent purchases from overselling the same product.

**Integer arithmetic**
All monetary values are stored and computed as integers (Thai Baht). No floating-point is used anywhere in the purchase flow.

## Assumptions

- Prices are whole numbers (no satang)
- A single vending machine instance (no distributed sync needed)
- Inserted money is not added to machine stock on failed purchases
- Greedy algorithm is sufficient for Thai denominations (mathematically guaranteed)

## Running the Application

### Prerequisites
- Docker and Docker Compose installed

### Start everything
```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Database: localhost:5432

The backend automatically runs migrations and seeds data on first start.

### Stop
```bash
docker compose down
```

### Reset data
```bash
docker compose down -v
docker compose up --build
```

## Running Unit Tests

```bash
# Run backend unit tests (requires local Rust toolchain)
cd backend
cargo test

# Or via Docker
docker compose run --rm backend cargo test
```

Unit tests cover:
- No change needed (exact payment)
- Standard multi-denomination change
- Cannot make change → error
- Respects available quantity per denomination
- Single denomination exact change

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List all products |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
| GET | `/money` | List all denominations |
| PUT | `/money` | Update denomination quantities |
| POST | `/purchase` | Process a purchase |

### Purchase Request
```json
{
  "product_id": "uuid",
  "inserted_money": [
    { "value": 50, "quantity": 1 },
    { "value": 10, "quantity": 1 }
  ]
}
```

### Purchase Response (success)
```json
{
  "status": "SUCCESS",
  "change": [{ "value": 20, "quantity": 2 }],
  "change_amount": 40,
  "message": "ซื้อ โค้ก สำเร็จ"
}
```

### Purchase Response (failure)
```json
{
  "status": "FAILED",
  "reason": "CANNOT_MAKE_CHANGE",
  "message": "ไม่มีเหรียญ/ธนบัตรเพียงพอสำหรับทอนเงิน"
}
```

Failure reasons: `INSUFFICIENT_PAYMENT`, `OUT_OF_STOCK`, `CANNOT_MAKE_CHANGE`

## Known Limitations

- No authentication on admin panel (out of scope for challenge)
- No WebSocket real-time stock sync between browser tabs
- Single machine instance only (distributed sync not implemented)
