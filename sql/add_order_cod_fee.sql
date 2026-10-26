ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_fee numeric(10, 2) NOT NULL DEFAULT 0;
UPDATE orders SET cod_fee = 50 WHERE cod_fee = 0 AND payment_method LIKE '%₹50 COD fee%';
