create table if not exists orders (
  id varchar(255) primary key,
  order_number varchar(50) not null unique,
  session_id varchar(255) not null,
  status varchar(50) not null default 'whatsapp_initiated',
  checkout_channel varchar(50) not null default 'whatsapp',
  payment_method varchar(100),
  shipping_method varchar(100),
  path varchar(2048),
  acquisition_source varchar(100),
  acquisition_category varchar(50),
  acquisition_referrer_host varchar(255),
  full_name varchar(255),
  phone varchar(50),
  email varchar(255),
  address_line_1 text,
  address_line_2 text,
  city varchar(255),
  state varchar(255),
  pincode varchar(20),
  notes text,
  applied_coupon_code varchar(50),
  subtotal numeric(10, 2),
  shipping_fee numeric(10, 2),
  grand_total numeric(10, 2),
  whatsapp_message text,
  cart_snapshot jsonb not null default '[]'::jsonb,
  gift_items jsonb not null default '[]'::jsonb,
  country varchar(8),
  ip_address varchar(255),
  user_agent text,
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  whatsapp_initiated_at timestamp not null default now()
);

create index if not exists idx_orders_session_id on orders (session_id);
create index if not exists idx_orders_created_at on orders (created_at desc);
create index if not exists idx_orders_status on orders (status);
