# Customer order links, resumable checkout and error monitoring

Status: initial audit followed by a staged implementation. See `customer-journey-implementation.md` for current changes, feature flags, verification and remaining launch gates. The existing customer redirects remain in place.

## Existing flow

1. `app/checkout/page.tsx` renders `components/CheckoutClient.tsx`.
2. Checkout captures cart and delivery details in `/api/checkout-drafts`, keyed by a browser session ID. This is lead capture, not an authenticated resume mechanism.
3. `getOrderIdentity` generates/reuses a local order UUID and readable number in localStorage based on a checkout signature.
4. Online checkout checks availability, calls `/api/create-order` to create a Razorpay order, saves a local payment-pending order through `/api/orders`, and opens Razorpay.
5. The Razorpay callback calls `/api/verify-payment`, then posts a processing order to `/api/orders`. It marks the draft complete, clears the cart and payment recovery, and redirects to `/order-success?order=...&channel=razorpay`.
6. Signed `/api/razorpay/webhook` events and `/api/cron/razorpay-reconciliation` provide additional payment reconciliation. Exact event ordering and amount checks need regression tests before redirect changes.
7. WhatsApp checkout saves through `/api/orders` and uses the same generic success page with a WhatsApp channel.
8. Admin manual orders save through `/api/admin/orders/manual?saveOnly=1`, display the saved order, then generate/recover a Razorpay payment link. Full payment and 20% advance/80% COD share this flow.
9. Courier tracking already exists through `/track-order`, `/api/tracking` and `lib/tracking/public-lookup.ts`. Reuse its carrier logic without exposing its full delivery destination in an unverified token page.

## Findings and release gates

- **Success is currently presentation, not evidence.** `app/order-success/page.tsx` uses query parameters and displays confirmation without fetching the saved order. The new order page must derive status from the database, and distinguish received/pending/paid/fulfilled.
- **Paid-save failure loses recovery state.** In the successful-payment callback, `orderSaved` can be false while checkout still clears the cart/recovery data and navigates to confirmation. Reproduce and fix this in an isolated change with a regression test before customer redirect rollout.
- **Order writes trust browser input.** `/api/orders` accepts client-supplied identity, status, prices and details and upserts by supplied ID. `/api/create-order` accepts the amount from the browser. `/api/verify-payment` verifies a signature but does not itself bind and persist an amount-verified local order. A token endpoint must not use possession of a client-supplied order ID as proof of ownership, or return a token in an unrestricted upsert response.
- **Do not claim paid from a status alone.** The new customer projection needs verified payment evidence and expected amount, including advance/COD distinctions. Unexpected or conflicting evidence should show a neutral verification-pending state.
- **Draft updates need ownership protection.** A session ID alone must not permit a caller to read private details or overwrite another customer's restored checkout.
- **Tracking privacy must be reviewed.** Public tracking lookup reads customer name, phone and address. New order pages must use an explicitly restricted projection and must not introduce another path to that data.
- **Existing logging is not centralized monitoring.** Console errors exist, but no dedicated monitoring integration was found in this audit. Some error objects may include provider or request details; never forward these wholesale.

These are code-review findings, not evidence that a live customer order or payment was compromised. Do not alter live records to test them.

## Stage 1: safe monitoring

Add a single fail-open reporting interface, initially disabled by configuration. The monitored operation must keep the same result whether reporting succeeds, fails or times out.

Use an allowlisted event schema: event code, operation, safe route template, timestamp, random diagnostic reference, severity and release identifier. Examples: order-save failure, payment verification failure, provider timeout and checkout resume failure.

Exclude request bodies, names, phone numbers, email, addresses, cart notes, cookies, authorization headers, provider secrets, signatures, raw stack URLs, payment URLs and order/checkout tokens. Prefer route templates such as `/order/[token]`. Do not log query strings. Browser errors require equivalent redaction.

Deduplicate and rate-limit reports. Protect any admin monitoring viewer with existing admin authentication. A public reporting endpoint cannot accept arbitrary log content or make unbounded database writes. Retention and alert thresholds must be explicit. Choose the production sink after checking hosting/runtime compatibility; do not silently send customer data to an external service.

Gate: unit tests for redaction and reporting failure isolation; simulated server/client failures; verify no payload secrets reach the sink. Feature flag off must restore existing behaviour.

## Stage 2: read-only `/order/<token>`

Introduce an independent access-token store instead of changing order IDs. Generate at least 32 random bytes server-side, store only a cryptographic hash, bind it to one order and scope, and support expiry/revocation. Database changes must be additive.

Start with authenticated admin issuance and a Copy customer order link action. Existing checkout and success redirects remain unchanged. Existing readable order numbers remain on invoices and messages.

The token page may show order number, purchased items/selections, purchased totals, restricted payment/fulfilment status and tracking updates. Show masked contact information and general delivery location. Full address, invoice with private details, or order modification requires existing account/OTP verification and an ownership check.

The page is read-only: visiting or refreshing never creates an order, charges a payment, updates payment status, or modifies the cart. Token access is scoped to the particular order, not other orders for that phone number.

Use dynamic rendering and private/no-store responses, `noindex, nofollow`, and `Referrer-Policy: no-referrer`. Exclude tokens from sitemaps, analytics, error reports, session replay and link previews containing private data. Avoid third-party scripts on private pages. Robots directives alone are not privacy controls.

Invalid/expired/revoked tokens return a generic unavailable result without revealing whether an order exists. Rate-limit lookups and issuance. No raw database order serialization.

Gate: two-order isolation tests; pending/paid/partial-COD/refund/cancelled states; token expiry and revocation; projection privacy tests; cache/header checks; browser refresh/back navigation. First release is admin-only issuance behind a flag.

## Stage 3: `/checkout/<token>` resume

Build on checkout drafts using a separate scoped, expiring token. Do not expose the current draft session ID as the public token. Issue tokens only to an ownership-proven draft/session.

Restore product IDs, quantities and discovery/kit selections into an explicit preview. Never silently replace a non-empty active cart: let the customer choose whether to restore it. Revalidate current catalogue prices, currency, availability, sample eligibility, coupons and shipping using the existing authoritative rules. Explain changes before payment.

Restore private delivery details only after ownership verification. Do not restore payment credentials, Razorpay signatures, stale payment authorizations or a previous payment-completed state. Prevent concurrent resume writes from silently overwriting newer changes.

Completed drafts should lead to the linked order where access is proven; expired links should offer a fresh checkout. Never charge automatically or create a second order by opening a resume URL. Recover ambiguous order/payment attempts before offering another payment attempt.

Gate: fresh/expired/completed drafts; cross-device verified access; changed price, removed/sold-out products and invalid coupons; 15-sample discovery sets; existing cart conflicts; repeated clicks, concurrent tabs and interrupted network requests.

## Customer redirect rollout and rollback

Use independent server-side flags for monitoring, order links, checkout resume and customer redirect adoption. Flags default off until their gates pass. Flags must not be bypassed by arbitrary public query parameters.

After admin-only order pages pass, integrate token issuance with ownership-proven normal and manual checkout results. Only then adopt `/order/<token>` as the new success destination. Keep `/checkout`, `/order-success`, account access and tracking URLs functional throughout. Do not redirect legacy order-number URLs to private pages without ownership proof.

Deploy to a separate test environment with a test database and Razorpay test-mode keys first. Do not use live orders, production secrets or a fake payment status to demonstrate success.

Test full payment, partial COD, WhatsApp orders, manual orders, discovery sets, payment decline/cancel, delayed/duplicate/out-of-order webhook delivery, browser close/refresh, successful payment with order-save failure, and provider timeout recovery. Each purchased amount must reconcile with verified payment evidence.

Rollback disables new issuance/resume/redirect adoption independently. It leaves historical orders, token records and payments intact; no destructive reverse migration. Valid issued order pages should remain available during a redirect rollback unless access is explicitly revoked.

## Next implementation task

Build the monitoring interface and its redaction/failure-isolation tests. Separately reproduce and fix the paid-save recovery issue. Then implement the token store and restricted order projection with admin-only issuance. Do not change the normal checkout redirects in those patches.
