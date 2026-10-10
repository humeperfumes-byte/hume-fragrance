CREATE TABLE IF NOT EXISTS saved_invoices (
  id varchar(100) PRIMARY KEY,
  title varchar(255) NOT NULL,
  document jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
