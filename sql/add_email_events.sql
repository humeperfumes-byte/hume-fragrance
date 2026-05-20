CREATE TABLE IF NOT EXISTS email_events (
  id VARCHAR(255) PRIMARY KEY,
  message_type VARCHAR(80) NOT NULL,
  provider VARCHAR(50) NOT NULL DEFAULT 'resend',
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'pending',
  provider_message_id VARCHAR(255),
  related_type VARCHAR(80),
  related_id VARCHAR(255),
  error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_message_type_created_at
  ON email_events (message_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_events_status_created_at
  ON email_events (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_events_to_email_created_at
  ON email_events (to_email, created_at DESC);
