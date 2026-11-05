-- Additive only: no order, payment, or existing diagnostic records are changed.
ALTER TABLE safe_diagnostics ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;
