CREATE TABLE IF NOT EXISTS secure_checkout_sessions (
 id varchar(100) PRIMARY KEY, token_hash varchar(64) NOT NULL UNIQUE,
 owner_hash varchar(64) NOT NULL, order_id varchar(100) NOT NULL UNIQUE,
 order_number varchar(50) NOT NULL UNIQUE, cart jsonb NOT NULL DEFAULT '[]'::jsonb,
 details jsonb NOT NULL DEFAULT '{}'::jsonb, expires_at timestamp NOT NULL,
 created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS safe_diagnostics (
 reference varchar(100) PRIMARY KEY, code varchar(60) NOT NULL,
 occurred_at timestamp NOT NULL DEFAULT now()
);
ALTER TABLE secure_checkout_sessions ADD COLUMN IF NOT EXISTS expected_payment_minor integer;
CREATE INDEX IF NOT EXISTS safe_diagnostics_occurred_at_idx ON safe_diagnostics(occurred_at);
