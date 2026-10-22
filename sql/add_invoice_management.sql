BEGIN;
CREATE TABLE IF NOT EXISTS invoice_customers (
  id varchar(100) PRIMARY KEY, name varchar(255) NOT NULL, address text NOT NULL DEFAULT '',
  email varchar(320) NOT NULL DEFAULT '', phone varchar(50) NOT NULL DEFAULT '', gstin varchar(15) NOT NULL DEFAULT '',
  created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoice_customers_name_idx ON invoice_customers(lower(name),id);
CREATE TABLE IF NOT EXISTS invoice_customer_links (
  invoice_id varchar(100) PRIMARY KEY REFERENCES saved_invoices(id),
  customer_id varchar(100) NOT NULL REFERENCES invoice_customers(id), updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoice_customer_links_customer_idx ON invoice_customer_links(customer_id,invoice_id);
CREATE TABLE IF NOT EXISTS invoice_correction_counters (
  financial_year varchar(7) PRIMARY KEY, last_number integer NOT NULL CHECK(last_number >= 0)
);
CREATE TABLE IF NOT EXISTS invoice_corrections (
  id varchar(100) PRIMARY KEY, invoice_id varchar(100) NOT NULL REFERENCES issued_invoices(invoice_id),
  kind varchar(10) NOT NULL CHECK(kind IN ('credit','refund','cancel')),
  number varchar(24) NOT NULL UNIQUE, date varchar(10) NOT NULL, reason text NOT NULL,
  reference varchar(255) NOT NULL DEFAULT '', amount_minor numeric(18,0) NOT NULL CHECK(amount_minor >= 0),
  details jsonb NOT NULL, request_fingerprint text NOT NULL, created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invoice_corrections_invoice_idx ON invoice_corrections(invoice_id,created_at,id);
CREATE UNIQUE INDEX IF NOT EXISTS invoice_single_cancellation_idx ON invoice_corrections(invoice_id) WHERE kind='cancel';
CREATE INDEX IF NOT EXISTS saved_invoices_updated_id_idx ON saved_invoices(updated_at DESC,id);
CREATE INDEX IF NOT EXISTS saved_invoices_date_id_idx ON saved_invoices((document->>'invoiceDate'),id);
COMMIT;
