# Secure checkout and customer order flow

> Updated configuration: checkout and monitoring default to enabled; a separate signing secret is optional. See [current configuration](checkout-default-configuration.md).

The new flow is implemented and enabled in `.env.local` for local review. Production settings have not been changed and code has not been pushed or deployed.

## Buying flow

1. `/checkout` creates or reuses a server session, then opens `/checkout/<token>` automatically.
2. The URL token identifies the checkout. A separate HttpOnly browser ownership cookie is required for personal details and all order/payment mutations. Another browser sees products only; an already-created order is shown instead of offering another purchase.
3. Refreshing the token route restores the saved bag and details in the owner browser. Private paths omit third-party analytics and use no-referrer/noindex headers. Hosting request logs still need token-path redaction.
4. Before opening Razorpay, the server creates one HUME order using current catalogue prices, server coupon rules, signed visit rewards, configured shipping and any authenticated admin override. Client totals must match. Gift quantities come from server thresholds.
5. The server creates and reuses one provider order. Amount/currency/reference are server controlled. The intended payment amount is stored separately from later admin total adjustments. Authenticated edits update resume data; payment amounts can change only before a provider request starts. An ambiguous creation can recover the existing provider order by its unique receipt; it never blindly creates another charge. Existing authorized or captured attempts block a new payment attempt.
6. Signature verification also fetches the provider payment and checks its order, INR currency, captured status and exact amount. Full payments and rounded 20% advance COD follow the same amount rules as checkout. Repeated callbacks preserve fulfillment/refund/dispute states.
7. Paid and WhatsApp orders redirect to `/order/<token>`. The customer view shows actual order/payment totals and stored shipment status, excluding full contact/address fields and internal notes.
8. Reopening an unresolved checkout checks the existing provider order and can recover a captured payment after a missed callback or failed local save. It does not create a fresh payment. Existing webhook and scheduled reconciliation remain in place; amount mismatch and partial-COD handling have been tightened.

## Diagnostics

`/admin/diagnostics` shows fixed error codes, generated references and timestamps. Events are stored in `safe_diagnostics` with a 30-day retention cleanup. Error objects, customer details, payment bodies and private URLs are excluded. An optional HTTPS `ERROR_ALERT_WEBHOOK_URL` receives the same limited event; no destination has been configured locally. Monitoring failures do not affect purchasing.

## Configuration and rollout

- Apply `sql/add_customer_access_links.sql` and `sql/add_secure_checkout_sessions.sql` before enabling the new flow. These tables are additive; existing customer/product/order rows are not migrated.
- Set `ENABLE_SECURE_CHECKOUT=true`, `ENABLE_ERROR_MONITORING=true` and a strong random `CHECKOUT_SESSION_SIGNING_SECRET` on the intended environment. The signing secret must stay server-only and stable across instances. Separate admin link flags remain available.
- Default production behaviour remains the legacy flow until the flag is enabled. Do not disable the new flow while unresolved secure checkouts exist; recover those orders first. Keep webhook/reconciliation enabled.
- Complete a real Razorpay test-mode browser checkout and staging webhook delivery before production rollout. Local automated tests mock the provider and do not contact Razorpay or send customer notifications.
- Personal data restoration across another device requires customer authentication/OTP. A shared link alone restores selection only.
- The currently advertised kit builder is marked coming soon; historical supported five-fragrance kits are validated at the configured existing ₹999 price. Unsupported selections fail closed.

## Verification

See `docs/checkout-launch-checklist.md` for account setup and release steps. Run `node --import tsx scripts/check-checkout-readiness.ts` to check loaded settings and storage without exposing secrets or contacting Razorpay.

Run `node --import tsx --test tests/secure-checkout.test.ts` for ownership, pricing, signed offers, payment matching and bounded request bodies. The broader focused suite includes invoice and admin-order regression checks.

Run `node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-secure-checkout.ts` for service-level integration. It uses generated fixture rows, mocks all provider calls, disables notifications/monitoring and removes its fixture rows in `finally`. Existing customer orders are untouched.

Local verification: 28 focused tests passed, and the service integration passed full payment, advance COD, amount mismatch, provider-order reuse, lost-provider-ID recovery, repeated callbacks and fulfillment preservation. The token route and refresh restoration were observed in the browser before the final server restart; the final browser reload was blocked by browser URL policy. A real test-mode payment and staging webhook remain rollout checks.

Provider contracts were checked against the official [Razorpay Orders API](https://github.com/razorpay/razorpay-node/blob/master/documents/order.md) and [payment events](https://github.com/razorpay/markdown-docs/blob/master/webhooks/payments.md).
