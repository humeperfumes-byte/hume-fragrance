-- Server-only database architecture: application requests use postgres through DATABASE_URL.
-- Apply using scripts/harden-database-access.ts --apply (transactional, with a metadata backup).
-- No customer/order/product rows are inserted, updated or deleted by this migration.
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '30s';
DO $guard$
BEGIN
  IF current_user <> 'postgres' OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname=current_user AND rolbypassrls) THEN
    RAISE EXCEPTION 'Expected the existing postgres server role with BYPASSRLS; aborting';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f','S') AND NOT pg_has_role(current_user,c.relowner,'MEMBER')) THEN
    RAISE EXCEPTION 'Unexpected object ownership in public; review before applying';
  END IF;
END $guard$;
DO $secure$
DECLARE obj record; columns text;
BEGIN
  FOR obj IN SELECT c.relname,c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','f','S')
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.classid='pg_class'::regclass AND d.objid=c.oid AND d.deptype='e')
  LOOP
    IF obj.relkind IN ('r','p') THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',obj.relname);
    END IF;
    IF obj.relkind='S' THEN
      EXECUTE format('REVOKE ALL PRIVILEGES ON SEQUENCE public.%I FROM PUBLIC, anon, authenticated',obj.relname);
    ELSE
      EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated',obj.relname);
      SELECT string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum) INTO columns FROM pg_attribute a
        WHERE a.attrelid=format('public.%I',obj.relname)::regclass AND a.attnum>0 AND NOT a.attisdropped;
      IF columns IS NOT NULL THEN
        EXECUTE format('REVOKE ALL PRIVILEGES (%s) ON TABLE public.%I FROM PUBLIC, anon, authenticated',columns,obj.relname);
      END IF;
    END IF;
  END LOOP;
END $secure$;
-- New application tables and sequences should not inherit public API grants.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon, authenticated;
