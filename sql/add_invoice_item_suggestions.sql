CREATE TABLE IF NOT EXISTS invoice_item_suggestions (
 id varchar(64) PRIMARY KEY,
 name varchar(1000) NOT NULL,
 category varchar(20) NOT NULL,
 unit varchar(20) NOT NULL,
 price numeric(12,2) NOT NULL CHECK(price >= 0),
 created_at timestamp NOT NULL DEFAULT now(),
 updated_at timestamp NOT NULL DEFAULT now()
);
