ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "archived_at" timestamp;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "manual_adjustment" numeric(10,2) DEFAULT '0' NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "adjustment_reason" text;

CREATE TABLE IF NOT EXISTS "order_edit_audits" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "order_id" varchar(255) NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "change_type" varchar(80) NOT NULL,
  "reason" text,
  "actor" varchar(120) DEFAULT 'admin' NOT NULL,
  "before_snapshot" jsonb NOT NULL,
  "after_snapshot" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "order_edit_audits_order_created_idx"
  ON "order_edit_audits" ("order_id", "created_at");
