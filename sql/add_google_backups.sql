BEGIN;
CREATE TABLE IF NOT EXISTS public.google_backup_connections (
 id varchar(20) PRIMARY KEY CHECK(id='business'),google_sub varchar(255) NOT NULL,account_email varchar(320) NOT NULL,folder_id varchar(255) NOT NULL,refresh_ciphertext text NOT NULL,connected boolean NOT NULL DEFAULT true,weekly_enabled boolean NOT NULL DEFAULT false,verified_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.google_backup_runs (
 id varchar(36) PRIMARY KEY,google_sub varchar(255) NOT NULL,trigger varchar(20) NOT NULL CHECK(trigger IN ('manual','scheduled')),scheduled_for timestamptz,status varchar(20) NOT NULL CHECK(status IN ('running','succeeded','failed')),lease_until timestamptz NOT NULL,started_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz,spreadsheet_id varchar(255),spreadsheet_url text,error_code varchar(80),record_count integer,source_bytes integer,cells integer,table_counts jsonb
);
CREATE UNIQUE INDEX IF NOT EXISTS google_backup_one_running ON public.google_backup_runs ((true)) WHERE status='running';
CREATE UNIQUE INDEX IF NOT EXISTS google_backup_occurrence ON public.google_backup_runs (google_sub,scheduled_for) WHERE trigger='scheduled';
CREATE INDEX IF NOT EXISTS google_backup_runs_started ON public.google_backup_runs(started_at DESC,id);
ALTER TABLE public.google_backup_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_backup_runs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.google_backup_connections,public.google_backup_runs FROM PUBLIC,anon,authenticated;
COMMIT;
