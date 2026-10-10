# Checkout preview release verification

> Updated configuration: checkout and monitoring default to enabled; a separate signing secret is optional. See [current configuration](checkout-default-configuration.md).

Verified locally on 2026-10-11:

- `npm run build` completed successfully, including TypeScript and static generation.
- The focused checkout, recovery, diagnostics, invoice and admin-order suite passed all 33 tests.
- Service integration passed full payment, advance COD, provider-order reuse, amount mismatch rejection, repeated callbacks, fulfillment preservation, admin drafts and owner/account recovery. All Razorpay responses were mocked, notifications were disabled, and generated records were removed.
- ESLint over changed and new TypeScript files reported no errors; 10 warnings remain for unused code and image lint guidance.
- The production server returned `/shop` successfully. Invalid test capabilities on checkout/order routes retained `private, no-store`, `no-referrer` and `noindex, nofollow, noarchive` headers. This checks local middleware, not hosting header overrides.
- Local readiness confirmed secure checkout storage, matching payment keys, signing/webhook secrets and cron configuration. These checks do not confirm remote deployment settings. The configured Razorpay mode is live; no real provider requests or payments were made.
- Release-file secret-pattern scanning passed. Environment files and local build/server logs are excluded from Git.

## Preview setup still required

Use an isolated database and matching Razorpay test-mode browser/server keys on the preview host. Apply `sql/add_customer_access_links.sql`, `sql/add_secure_checkout_sessions.sql` and `sql/add_saved_invoices.sql` there. Never copy production customer records into preview.

Configure the test webhook, stable server-only checkout signing secret, authenticated reconciliation schedule and an HTTPS sanitized error-alert receiver. Confirm the hosting platform and private-path access-log redaction.

Then complete full-payment and 20% advance COD browser tests, cancellation/retry, missed-callback recovery and webhook delivery. Recheck deployed private headers because hosting configuration can override local responses. Production checkout activation remains gated on these checks; pushing this preview branch does not verify them.

See `docs/checkout-launch-checklist.md` for the deployment sequence. Do not disable secure checkout while unresolved secure payment sessions exist.
