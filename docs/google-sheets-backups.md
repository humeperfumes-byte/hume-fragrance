# Automatic weekly Google Sheets business backups

## What runs

Every Sunday around **3:30 AM IST** (Saturday 22:00 UTC, cron `0 22 * * 6`), the website creates a new private spreadsheet in **HUME Database Backups**, owned by the connected Google account. Keep every snapshot; the system never deletes old backups. On Vercel Hobby, execution can fall anywhere within the following hour. There are no Telegram/email notifications; check Admin > Data Export for current status and failures.

Only approved business tables and fields are exported, for all historical rows. `lib/google-backup/registry.ts` fixes the SQL columns; `catalog.ts` explicitly filters nested JSON. Customers are kept by source reference, not merged by name. Account Contacts contains identity/contact information, not login sessions. Credentials, OTPs, login/access tokens, IPs, user agents, raw payment webhooks, analytics events, visitor session identifiers, and generated WhatsApp messages are excluded. The analytics-only site setting is excluded. Google connection/run tables are never exported. Source records are never updated by the backup.

Tabs include a Backup Summary, source table tabs, contact tabs and Data Chunks. IDs/phones/decimals use RAW text; formulas are not evaluated. `__row_json` preserves the approved typed record. Oversized fields reference `@chunk:<id>`; join Data Chunks by Reference and numeric Part, verify SHA256, then decode according to Encoding. Canonical JSON uses `{__hume_chunk, __hume_encoding}` references. Chunks are at most 20,000 UTF-16 code units and do not split surrogate pairs. Never truncate a field. No JSON companion files are created.

This is a business-data backup, not a complete PostgreSQL disaster-recovery backup: authentication infrastructure, SQL schema, permissions, remote media files, and excluded telemetry are not copied. Image URLs are retained; embedded database images are preserved in chunks. Restoration remains a separate reviewed operation; spreadsheet edits never update the database.

## One-time setup

1. Apply additive private metadata tables: `node --import tsx scripts/apply-google-backups.ts`. These have RLS enabled and no anon/authenticated/PUBLIC grants. They do not change existing business tables or records.
2. In a Google Cloud project, enable **Google Drive API** and **Google Sheets API**.
3. Configure an OAuth web application with scopes `openid`, `email`, and `https://www.googleapis.com/auth/drive.file`. Use Production consent configuration for long-lived offline access; Testing refresh tokens can expire after seven days. Add the intended Google account as required by your consent configuration.
4. Add an exact production redirect URI, for example `https://www.humefragrance.com/api/admin/backups/google/callback`. It MUST match the admin site's actual origin. For local testing separately authorize `http://localhost:3002/api/admin/backups/google/callback`.
5. Configure server-only `GOOGLE_BACKUP_CLIENT_ID`, `GOOGLE_BACKUP_CLIENT_SECRET`, `GOOGLE_BACKUP_REDIRECT_URI`, and `GOOGLE_BACKUP_ENCRYPTION_KEY`. The encryption key is base64-encoded 32 random bytes. Generate once with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` and store privately in Vercel. A local key is already generated in ignored `.env.local`; do not commit it. Keep the production key stable or reconnect Google after changing it.
6. Ensure `ADMIN_API_TOKEN` and `CRON_SECRET` are configured. Use Vercel Fluid compute with support for 300-second Node functions. Enable the cron in production deployment; do not invoke it more frequently.
7. Redeploy and visit Admin > Data Export in a regular browser. Choose **Connect Google**. Confirm the intended owner account. An initial verification backup starts automatically after connection. Weekly runs remain disabled until that backup passes read-back verification.

No Google credentials are included in `.env.example`; it contains placeholders only. OAuth credentials are not database export data. Refresh tokens are AES-256-GCM encrypted at rest. The private folder must have only its owner's permission; the worker refuses publicly or otherwise shared folders. Google files are created with drive.file access rather than broad access to the user's Drive.

## Operations and limits

- Manual runs are optional and share the weekly engine. The schedule is UTC-defined and always shows IST in admin.
- Snapshot reads run in one read-only repeatable-read transaction, in deterministic batches. The database is released before Google upload.
- Each job has a 10-minute lease, longer than its 300-second function limit. A partial unique index permits only one running job. Scheduled occurrences are unique per Google account/week. Stale jobs are marked interrupted on the next status/run request.
- Writes use RAW input, bounded batches below 1.5 MB, per-client request pacing and bounded retry/backoff. The writer reads all exported cells/chunks back and verifies exact values, counts and canonical-data digests before marking complete.
- IN PROGRESS / FAILED files are never shown as verified backups. Previous successful files remain untouched. Creating a file after an uncertain network failure is not blindly retried; run metadata is used for reconciliation.
- Safe ceilings: 50 MiB serialized source data and 8 million allocated cells. Larger exports fail with a clear message rather than losing rows; implement file partitioning before raising these bounds.
- Supabase egress increases only when a snapshot is captured, not when the status page polls. Admin shows serialized payload bytes and a weekly-to-monthly estimate; actual wire transfer includes database protocol overhead. Google retries reuse the already captured snapshot.
- Disconnect stops scheduling and clears stored credentials without deleting files. If Google revocation fails, admin warns that the Google account grant should also be removed manually.
- Backup errors stored in metadata are fixed safe codes, never provider responses, tokens, source rows or customer data.

## Verification commands

- `node --import tsx --test tests/google-backup.test.ts`: serializer, exclusion, scheduling, authenticated encryption, endpoint guards, mocked Google write/read-back and failure cases. No live Google requests.
- `node --import tsx scripts/check-google-backup.ts`: capture and verify an in-memory snapshot; print counts/sizes only; upload nothing.
- `node --import tsx scripts/verify-google-backup-state.ts`: check metadata RLS/grants and transactionally test duplicate/overlap constraints; roll back every test row. Refuses to run with an active connected account or running backup.
- `node --import tsx scripts/audit-database-access.ts`: verify overall public database access remains blocked.

Live Google ownership, OAuth and upload can only be verified after the one-time Cloud configuration and owner sign-in. The system does not pretend it is connected when credentials are missing.

## Rollout verification (28 October 2026)

The additive metadata migration has been applied. Metadata security and overlap/deduplication checks passed with all verification rows rolled back. A read-only historical snapshot reconstructed successfully: 25 source tables plus two contact projections, 11,851,437 serialized bytes, 62,765 allocated cells and 143 oversized-value chunks. All 70 backup, invoice and tracking tests passed. No business records were modified and no Google upload occurred. Google Cloud credentials, production function-duration support and the initial real Google upload still require production setup and verification; scheduling stays gated until that first upload succeeds.
