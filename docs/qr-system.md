# QR codes

The single management page is `/admin/qr-generator`, labeled **QR Codes** in the sidebar. `/admin/flyer-campaigns` redirects there.

Create a named QR code for any public site route (`/perfumes?source=pack#rose`) or complete HTTP/HTTPS URL. Downloads encode a permanent `https://www.humefragrance.com/q/{id}` link, never the destination itself. Editing the destination preserves printed codes. SVG and 1600px PNG exports use black square modules, rounded finder frames, high error correction and a four-module white border. Previews and exports share the renderer in `lib/qr-svg.ts`.

## Setup

Run `npm run db:setup-qr` against each deployment database before deploying this code. The additive, repeatable migration preserves existing campaigns, SVGs, event history and counters. The migration was applied to this workspace's configured database during implementation. No schema changes run during requests.

Admin APIs use the existing `ADMIN_API_TOKEN` protection. `/q/{id}` is public, uses uncached temporary redirects, and reads the current destination on every request. Archive pauses a tracking link with HTTP 410; restore reactivates it. There is no public campaign creation or destructive bulk-delete endpoint.

## Reporting

The page shows all-time totals and individual reports for the last 7, 30, 90 or 365 days. Reports include visit timestamps in IST, daily totals in IST, unique browsers, device and browser family, referrer hostname, paginated activity and CSV export (UTC timestamps).

A visit means a request to the tracking link, which can also be shared or typed. It is not proof that a physical camera scanned a flyer. Known bots, prefetches and HEAD requests are excluded. Requests from the same anonymous browser in the same fixed ten-second window count once. An HTTP-only random visitor cookie expires after one year. No IP address, full user agent, referrer path or customer identity is saved. Cookie deletion, browser switching and cookie blocking affect unique-browser counts. This is practical traffic measurement, not fraud-proof human identification.

If event storage fails after destination lookup succeeds, the visitor is still redirected and the failure is logged. Counts may consequently underreport during database failures. Revenue and orders are not reported as verified conversions: the public legacy analytics endpoint rejects purchase/revenue claims.

## Existing printed codes

Existing campaign records remain labeled Legacy. New downloads for those records encode the new tracking link. Destination edits affect that tracking link, not old printed graphics with embedded destinations. Legacy counters remain visible separately and are not merged into the new event reports. Bare flyer URLs are no longer assigned to guessed campaigns. Previously unattributed printed batches cannot be reconstructed reliably.

Stored SVG supplied by older clients is not inserted into the new admin page. The preview and exports are generated from the permanent link. Campaign IDs are server-generated UUIDs. Destinations reject script schemes, credentials, protocol-relative URLs, and recursive/private routes on the HUME domain.

## Verification

`npm run test:qr` checks destination normalization, unsafe and recursive targets, CSV safety, and device/browser classification. With the local server on port 3002, `npm run test:qr:integration` checks authentication, creation, redirects, destination edits, archive/restore, reports, unique browsers, deduplication, bot/HEAD exclusions, and rejection of destructive deletion and forged purchases. It creates and removes a temporary QR in the configured database. Browser checks covered creation, desktop/mobile layout, SVG/PNG downloads and decoder verification at 200, 320 and 600px. Physical print testing remains necessary at the chosen final print size.
