CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(120) PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value, updated_at)
VALUES ('kit_availability', '{"outOfStock": false}'::jsonb, now())
ON CONFLICT (key) DO NOTHING;
