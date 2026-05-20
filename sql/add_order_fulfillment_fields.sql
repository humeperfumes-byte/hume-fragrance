alter table "orders"
add column if not exists "fulfillment_carrier" varchar(100),
add column if not exists "tracking_number" varchar(120),
add column if not exists "tracking_url" varchar(2048),
add column if not exists "tracking_status" varchar(80),
add column if not exists "tracking_last_checked_at" timestamp,
add column if not exists "shipped_at" timestamp,
add column if not exists "delivered_at" timestamp;

create index if not exists "orders_tracking_number_idx"
on "orders" ("tracking_number");

