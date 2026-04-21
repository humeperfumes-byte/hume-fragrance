create table if not exists coupon_code_events (
  id varchar(255) primary key,
  session_id varchar(255),
  channel varchar(30) not null,
  event_type varchar(50) not null default 'sent',
  coupon_code varchar(100),
  destination varchar(255),
  path varchar(2048),
  referrer varchar(2048),
  country varchar(8),
  ip_address varchar(255),
  user_agent text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamp not null default now()
);

create index if not exists idx_coupon_code_events_created_at
  on coupon_code_events (created_at desc);

create index if not exists idx_coupon_code_events_coupon_code
  on coupon_code_events (coupon_code);

create index if not exists idx_coupon_code_events_channel
  on coupon_code_events (channel);
