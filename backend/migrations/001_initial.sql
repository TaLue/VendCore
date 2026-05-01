CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE money_type AS ENUM ('COIN', 'BANKNOTE');

CREATE TABLE money (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    denomination INTEGER NOT NULL UNIQUE CHECK (denomination IN (1, 5, 10, 20, 50, 100, 500, 1000)),
    money_type money_type NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0)
);

CREATE TYPE transaction_status AS ENUM ('SUCCESS', 'FAILED');
CREATE TYPE failure_reason AS ENUM ('INSUFFICIENT_PAYMENT', 'OUT_OF_STOCK', 'CANNOT_MAKE_CHANGE');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    inserted_amount INTEGER NOT NULL,
    change_amount INTEGER NOT NULL DEFAULT 0,
    change_breakdown JSONB,
    status transaction_status NOT NULL,
    failure_reason failure_reason,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: money denominations
INSERT INTO money (denomination, money_type, quantity) VALUES
    (1,    'COIN',      50),
    (5,    'COIN',      50),
    (10,   'COIN',      50),
    (20,   'BANKNOTE',  30),
    (50,   'BANKNOTE',  20),
    (100,  'BANKNOTE',  20),
    (500,  'BANKNOTE',  10),
    (1000, 'BANKNOTE',  5);

-- Seed: products
INSERT INTO products (name, price, stock) VALUES
    ('น้ำเปล่า',         15,  10),
    ('โค้ก',             20,  8),
    ('เป๊ปซี่',          20,  8),
    ('น้ำส้ม',           25,  6),
    ('ชาเขียว',          25,  6),
    ('กาแฟ',             30,  5),
    ('มันฝรั่ง',         35,  8),
    ('ช็อกโกแลต',        40,  5),
    ('เรดบูล',           45,  4),
    ('น้ำมะพร้าว',       35,  6);
