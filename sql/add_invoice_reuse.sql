BEGIN;
ALTER TABLE invoice_item_suggestions ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS invoice_reusable_defaults (
  id varchar(30) PRIMARY KEY, document jsonb NOT NULL, updated_at timestamp NOT NULL DEFAULT now()
);
COMMIT;
