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

ก่อนเริ่มต้องติดตั้งสิ่งต่อไปนี้:

#### 1. Docker Desktop
Docker Desktop รวม Docker Engine + Docker Compose มาให้ในตัว

- **Windows / macOS** → ดาวน์โหลดที่ https://www.docker.com/products/docker-desktop
- **Linux (Ubuntu/Debian)**
  ```bash
  sudo apt-get update
  sudo apt-get install -y docker.io docker-compose-plugin
  sudo usermod -aG docker $USER   # ให้รัน docker โดยไม่ต้อง sudo (logout แล้ว login ใหม่)
  ```

ตรวจสอบว่าติดตั้งสำเร็จ:
```bash
docker --version          # Docker version 24.x.x หรือสูงกว่า
docker compose version    # Docker Compose version v2.x.x หรือสูงกว่า
```

> **Windows users** — ต้องเปิด Docker Desktop ทิ้งไว้ก่อนรันคำสั่งด้านล่าง

#### 2. Git
ใช้สำหรับ clone โปรเจกต์

- **Windows** → https://git-scm.com/download/win
- **macOS** → `brew install git` หรือติดตั้งผ่าน Xcode Command Line Tools
- **Linux** → `sudo apt-get install -y git`

---

### Step 1 — Clone โปรเจกต์

```bash
git clone https://github.com/TaLue/VendCore.git
cd VendCore
```

### Step 2 — Build และ Start

```bash
docker compose up --build
```

ครั้งแรกจะใช้เวลาสักครู่เพราะต้อง build Rust binary และ Next.js ถ้าเห็น log ประมาณนี้แปลว่าพร้อมใช้งานแล้ว:

```
backend   | Listening on 0.0.0.0:8080
frontend  | Ready on http://localhost:3000
```

### Step 3 — เปิดใช้งาน

| หน้า | URL |
|------|-----|
| Vending Machine (ผู้ใช้) | http://localhost:3000 |
| Admin Dashboard | http://localhost:3000/admin |
| Backend API | http://localhost:8080 |

> Database จะรันอยู่ที่ `localhost:5432` (ใช้ต่อตรงผ่าน psql ได้ถ้าต้องการ)

Migration และ seed data จะรันอัตโนมัติทุกครั้งที่ backend start — ไม่ต้องทำอะไรเพิ่ม

### Stop

```bash
# หยุด แต่ยังเก็บ data ไว้
docker compose down

# หยุดแล้วลบ data ทั้งหมด (reset กลับ seed data ใหม่)
docker compose down -v
docker compose up --build
```

---

## Running Unit Tests

```bash
# วิธีที่ 1 — รันผ่าน Docker (ไม่ต้องติดตั้ง Rust)
docker compose run --rm backend cargo test

# วิธีที่ 2 — รันในเครื่องโดยตรง (ต้องติดตั้ง Rust ก่อน: https://rustup.rs)
cd backend
cargo test
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
