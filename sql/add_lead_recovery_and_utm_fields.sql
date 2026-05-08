alter table checkout_drafts
  add column if not exists utm_source varchar(120),
  add column if not exists utm_medium varchar(120),
  add column if not exists utm_campaign varchar(180),
  add column if not exists utm_term varchar(180),
  add column if not exists utm_content varchar(180),
  add column if not exists lead_status varchar(50) not null default 'new',
  add column if not exists lead_notes text,
  add column if not exists last_contacted_at timestamp,
  add column if not exists next_follow_up_at timestamp;

alter table orders
  add column if not exists utm_source varchar(120),
  add column if not exists utm_medium varchar(120),
  add column if not exists utm_campaign varchar(180),
  add column if not exists utm_term varchar(180),
  add column if not exists utm_content varchar(180);

create index if not exists idx_checkout_drafts_lead_status
  on checkout_drafts (lead_status);

create index if not exists idx_checkout_drafts_next_follow_up_at
  on checkout_drafts (next_follow_up_at);

create index if not exists idx_checkout_drafts_last_contacted_at
  on checkout_drafts (last_contacted_at desc);

create index if not exists idx_orders_customer_phone
  on orders (phone);

create index if not exists idx_orders_customer_email
  on orders (email);

create index if not exists idx_orders_utm_source
  on orders (utm_source);
