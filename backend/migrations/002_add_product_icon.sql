ALTER TABLE products ADD COLUMN IF NOT EXISTS icon VARCHAR(10) NOT NULL DEFAULT '🛒';

-- Update existing seeded products with proper icons
UPDATE products SET icon = '💧' WHERE name = 'น้ำเปล่า';
UPDATE products SET icon = '🥤' WHERE name = 'โค้ก';
UPDATE products SET icon = '🥤' WHERE name = 'เป๊ปซี่';
UPDATE products SET icon = '🍊' WHERE name = 'น้ำส้ม';
UPDATE products SET icon = '🍵' WHERE name = 'ชาเขียว';
UPDATE products SET icon = '☕' WHERE name = 'กาแฟ';
UPDATE products SET icon = '🍟' WHERE name = 'มันฝรั่ง';
UPDATE products SET icon = '🍫' WHERE name = 'ช็อกโกแลต';
UPDATE products SET icon = '⚡' WHERE name = 'เรดบูล';
UPDATE products SET icon = '🥥' WHERE name = 'น้ำมะพร้าว';
