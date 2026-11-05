CREATE OR REPLACE FUNCTION growth_customer_key(p text,e text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
 SELECT CASE WHEN regexp_replace(coalesce(p,''),'[^0-9]','','g') ~ '^(91|0091|0)?[6-9][0-9]{9}$' THEN 'phone:'||right(regexp_replace(p,'[^0-9]','','g'),10) WHEN trim(coalesce(e,'')) LIKE '%@%' THEN 'email:'||lower(trim(e)) ELSE NULL END
$$;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS rules jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coins_used integer NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coin_customer_key text;
ALTER TABLE customer_account_sessions ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
UPDATE customer_account_sessions SET last_login_at=created_at WHERE last_login_at IS NULL;
CREATE TABLE IF NOT EXISTS growth_settings(id text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO growth_settings(id,value) VALUES ('rewards','{"earningEnabled":false,"earnPercent":5,"maxRedeemPercent":20,"holdDays":7,"referralsEnabled":false,"referralCoins":50,"friendDiscount":50,"referralMinSubtotal":499,"earnFrom":null}') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS growth_accounts(
 customer_key text PRIMARY KEY, phone varchar(30), email varchar(255), name varchar(255) NOT NULL DEFAULT '',
 marketing_opt_in boolean NOT NULL DEFAULT false, consent_source text, consent_at timestamptz,
 referral_code varchar(30) UNIQUE NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS growth_coin_ledger(
 id uuid PRIMARY KEY,customer_key text NOT NULL REFERENCES growth_accounts(customer_key), delta integer NOT NULL,
 source text NOT NULL UNIQUE, order_id varchar(255), kind varchar(40) NOT NULL, note varchar(500) NOT NULL DEFAULT '',
 available_at timestamptz NOT NULL DEFAULT now(), voided boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_ledger_customer ON growth_coin_ledger(customer_key,available_at);
CREATE TABLE IF NOT EXISTS growth_coin_reservations(
 id uuid PRIMARY KEY, customer_key text NOT NULL REFERENCES growth_accounts(customer_key), coins integer NOT NULL CHECK(coins>=0),
 order_id varchar(255) UNIQUE, status varchar(20) NOT NULL DEFAULT 'reserved', expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_reservation_customer ON growth_coin_reservations(customer_key,status);
CREATE TABLE IF NOT EXISTS growth_coupon_uses(
 order_id varchar(255) PRIMARY KEY, coupon_id varchar(255) NOT NULL REFERENCES coupons(id), customer_key text,
 status varchar(20) NOT NULL DEFAULT 'reserved',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS growth_coupon_usage ON growth_coupon_uses(coupon_id,customer_key,status);
CREATE TABLE IF NOT EXISTS growth_order_benefits(
 order_id varchar(255) PRIMARY KEY REFERENCES orders(id),customer_key text, reservation_id uuid, coins integer NOT NULL DEFAULT 0,
 referral_code varchar(30),referral_discount integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS growth_referrals(
 id uuid PRIMARY KEY, referrer_key text NOT NULL REFERENCES growth_accounts(customer_key),referred_key text NOT NULL UNIQUE,
 order_id varchar(255) NOT NULL UNIQUE REFERENCES orders(id),coins integer NOT NULL, status varchar(20) NOT NULL DEFAULT 'pending',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS growth_campaigns(
 id uuid PRIMARY KEY,title varchar(150) NOT NULL, body varchar(1000) NOT NULL, link varchar(2048) NOT NULL,
 status varchar(25) NOT NULL DEFAULT 'draft',template_name varchar(255) NOT NULL,language varchar(20) NOT NULL DEFAULT 'en',
 scheduled_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS growth_campaign_recipients(
 id uuid PRIMARY KEY,campaign_id uuid NOT NULL REFERENCES growth_campaigns(id),customer_key text NOT NULL,phone varchar(30) NOT NULL,name varchar(255) NOT NULL DEFAULT '',
 status varchar(25) NOT NULL DEFAULT 'queued',provider_id text UNIQUE,error_code varchar(100),claimed_at timestamptz,sent_at timestamptz,updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(campaign_id,customer_key)
);
CREATE INDEX IF NOT EXISTS growth_campaign_queue ON growth_campaign_recipients(campaign_id,status);
CREATE TABLE IF NOT EXISTS growth_saved_segments(id uuid PRIMARY KEY,name varchar(100) NOT NULL,filters jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE growth_coin_reservations ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;
ALTER TABLE growth_accounts ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE growth_accounts ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
INSERT INTO growth_accounts(customer_key,phone,email,name,referral_code,last_login_at,last_activity_at)
SELECT growth_customer_key(phone,email),max(phone),max(email),'','HUME'||upper(substr(md5(growth_customer_key(phone,email)),1,12)),max(coalesce(last_login_at,created_at)),max(last_used_at)
FROM customer_account_sessions WHERE growth_customer_key(phone,email) IS NOT NULL GROUP BY growth_customer_key(phone,email)
ON CONFLICT(customer_key) DO UPDATE SET last_login_at=greatest(growth_accounts.last_login_at,excluded.last_login_at),last_activity_at=greatest(growth_accounts.last_activity_at,excluded.last_activity_at);
