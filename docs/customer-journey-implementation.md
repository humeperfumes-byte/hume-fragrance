# Customer journey implementation

The initial implementation below has now been extended into automatic token checkout locally. See `secure-checkout.md` for the current flow, configuration and verification. It has not been pushed or deployed; the remainder of this document records the first staged implementation.

## Included

- Admin-issued customer order links with 32-byte random tokens, SHA-256 hashes in a new additive table, 30-day expiry and admin revocation. Only the limited order projection reaches the browser; addresses, phone numbers, emails and internal notes are excluded.
- Admin-issued checkout links with seven-day expiry and single-use cart restoration. Opening a link does not change the bag. Restoration requires an explicit click, reloads current prices and availability, and supports validated discovery selections. Customer and payment information is never restored. Custom kits currently require rebuilding.
- Private pages have no-store, no-referrer and noindex headers, a restrictive content security policy and no global analytics/third-party overlays. Hosting access logs may still record request paths; configure token-path redaction before production launch.
- Diagnostics accept only fixed error codes, generated references and timestamps. No error objects, customer fields, payloads or private URLs enter these diagnostic events. Admin-only `/api/admin/diagnostics` exposes a bounded process-local recent-event buffer; server logs contain the same events. This is not a durable external alert service.
- Once payment verification succeeds, an order-save failure preserves the cart and recovery marker and blocks another payment attempt in checkout, recovery prompts and account retries. This marker is browser-local, not a replacement for server-side payment idempotency.

## Flags and rollback

All three flags default to disabled: `ENABLE_CUSTOMER_ORDER_LINKS`, `ENABLE_CHECKOUT_RESUME_LINKS`, `ENABLE_ERROR_MONITORING`. Set individual flags to `true` only in a controlled test environment first. Disabling either link flag immediately makes that scope unavailable. The empty additive `customer_access_links` table has been created; existing order/product rows were not migrated or rewritten.

The current checkout redirects, Razorpay amounts and public purchase endpoints are preserved. No live payment or customer notification was generated during implementation.

## Required before production rollout

1. Run Razorpay test-mode purchase scenarios: full online payment, advance COD, verification failure, verified payment plus order-save failure, webhook before/after callback and repeat callbacks.
2. Harden legacy order creation and verification so ownership, product prices, payment amounts and order identity are enforced by the server. The pre-existing public order-save endpoint must not be treated as proof of ownership or payment.
3. Verify valid, expired, revoked and consumed links in a staging database; test concurrent restoration and explicit replacement of an existing bag. Multiple separately issued links and checkout on another device still need server-side duplicate-order protection.
4. Review cache/CDN behaviour and redact token paths in hosting logs. Configure an external monitoring destination and alerting if persistent history is needed.
5. Only then adopt customer token pages as normal success redirects. Keep the current success route during the transition.

## Checks

The focused regression suite covers token scope/expiry/revocation, customer-field exclusion, payment amount/refund presentation, fresh-price restoration, unavailable items, diagnostics privacy and existing invoice/manual-order/edit/message behaviour. TypeScript and ESLint are checked separately.
