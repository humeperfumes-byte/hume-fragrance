# Supabase public database access remediation

## Confirmed audit

On 28 October 2026 a read-only catalog audit of project `dwgwlayrpgypbbpezxiu` found 42 public tables, 41 with RLS disabled, and grants to `anon` / `authenticated` on all 42. No public RLS policies or custom public RPC functions were found. The HUME Fragrance application uses server-side `DATABASE_URL` connections as `postgres`, a role with BYPASSRLS; no Supabase browser Data API client was found in this repository. This establishes an access-control problem, not proof that data has been stolen.

## Prepared change

`sql/harden_public_database_access.sql` enables RLS on ordinary public application tables, revokes public API table/column/sequence access, and removes automatic public grants on future tables and sequences created by postgres. It does not force RLS on the application's privileged server role, and changes no order, customer, invoice, or product rows. No unrestricted `USING (true)` policies are added. Supabase-managed schemas are excluded.

Review other applications or integrations using this same Supabase project before applying, because any direct browser/REST/GraphQL reads of these public tables will stop. The website's own authorized server API remains the intended access path.

## Commands

- Read-only audit: `node --import tsx scripts/audit-database-access.ts`
- Detailed schema/permissions audit (no row data): append `--details`.
- Plan only, no permissions changed: `node --import tsx scripts/harden-database-access.ts`
- Apply explicitly: `node --import tsx scripts/harden-database-access.ts --apply`

The apply script verifies the target project and server role, saves the previous object/default/column ACL metadata under ignored `output/security/`, applies within a transaction with a short lock timeout, verifies public access is denied and the application role retains access, and rolls back on failure. Do not commit these local snapshots. Review the snapshot before preparing a permission rollback; restoring public access reintroduces the exposure.

## After applying

Rerun the read-only audit. Expect zero tables without RLS and zero public-role-accessible application tables. Verify store product pages, checkout reads, account login flow, invoice list and order tracking. Rerun Supabase Security Advisor; delivery of an older warning email does not indicate the fix failed. No application redeploy is required for the permission change itself.

This does not audit historical data access, eliminate compromised privileged credentials, or assess other Supabase services. Investigate access logs before deciding whether any sessions/keys need rotation. Do not reset all production credentials blindly.

For every future migration, enable RLS on new public tables and rerun the audit. The default-grant change helps keep new tables private even before RLS is enabled.

Official guidance: https://supabase.com/docs/guides/api/securing-your-api

## Applied verification - 28 October 2026

The change was applied transactionally to the confirmed project. Post-change audit: all 42 application tables have RLS enabled; zero tables grant data access to anon/authenticated roles. Actual role-switched order reads were denied with PostgreSQL permission errors. Server-role reads of orders, invoices, account sessions, products and coupons succeeded. Production product catalog, site settings, coupon and authenticated admin invoice endpoints all returned HTTP 200. No customer records were modified by the migration or verification. The pre-change permission snapshot is stored locally under ignored output/security/.
