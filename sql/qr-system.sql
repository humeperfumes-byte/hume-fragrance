-- Additive migration: preserve existing campaigns and printed destinations.
CREATE TABLE IF NOT EXISTS qr_campaigns (
 id varchar(255) PRIMARY KEY, name varchar(255) NOT NULL, city varchar(100) NOT NULL,
 target_page varchar(100) NOT NULL, target_url varchar(2048) NOT NULL,
 body_type varchar(50) NOT NULL DEFAULT 'squares', eye_style varchar(50) NOT NULL DEFAULT 'square',
 logo_type varchar(50) NOT NULL DEFAULT 'none', qr_code_svg text,
 scan_count integer NOT NULL DEFAULT 0, last_scanned_at timestamp, created_at timestamp NOT NULL DEFAULT now()
);
ALTER TABLE qr_campaigns ADD COLUMN IF NOT EXISTS archived_at timestamptz;
CREATE TABLE IF NOT EXISTS qr_scan_events (
 id uuid PRIMARY KEY, campaign_id varchar(255) NOT NULL REFERENCES qr_campaigns(id),
 visitor_id uuid NOT NULL, scanned_at timestamptz NOT NULL DEFAULT now(),
 device varchar(20) NOT NULL, browser varchar(20) NOT NULL, referrer_host varchar(255),
 bucket bigint NOT NULL, UNIQUE(campaign_id, visitor_id, bucket)
);
CREATE INDEX IF NOT EXISTS qr_scan_campaign_time ON qr_scan_events(campaign_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS qr_scan_time ON qr_scan_events(scanned_at DESC);
