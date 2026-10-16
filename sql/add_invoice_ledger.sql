CREATE TABLE IF NOT EXISTS invoice_counters (financial_year varchar(7) PRIMARY KEY, last_number integer NOT NULL DEFAULT 0 CHECK(last_number >= 0));
CREATE TABLE IF NOT EXISTS issued_invoices (invoice_id varchar(100) PRIMARY KEY REFERENCES saved_invoices(id), financial_year varchar(7) NOT NULL, invoice_number varchar(16) NOT NULL UNIQUE, document jsonb NOT NULL, issued_at timestamp NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS invoice_revisions (id varchar(100) PRIMARY KEY, invoice_id varchar(100) NOT NULL REFERENCES saved_invoices(id), action varchar(30) NOT NULL, title varchar(255) NOT NULL, document jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS invoice_revisions_invoice_idx ON invoice_revisions(invoice_id,created_at);
