CREATE TABLE IF NOT EXISTS customer_access_links (
  id varchar(100) PRIMARY KEY,
  token_hash varchar(64) NOT NULL UNIQUE,
  scope varchar(20) NOT NULL CHECK (scope IN ('order', 'checkout')),
  resource_id varchar(255) NOT NULL,
  expires_at timestamp NOT NULL,
  revoked_at timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
