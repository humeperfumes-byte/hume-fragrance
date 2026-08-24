-- Additive payment reconciliation metadata. Existing order rows and audit history are preserved.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id varchar(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id varchar(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS captured_payment_amount numeric(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_captured_at timestamp;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reconciled_at timestamp;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_sync_status varchar(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_attempt_count integer;

CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON orders (razorpay_order_id);
CREATE INDEX IF NOT EXISTS orders_razorpay_payment_id_idx ON orders (razorpay_payment_id);
