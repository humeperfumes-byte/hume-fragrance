# Checkout audit — 27 October 2026

## Fixes

- Account requests time out after 20 seconds (including stalled response bodies), exit loading, and offer a working retry. Storage failures also exit loading rather than trapping the customer.
- Checkout waits for coupon data and the saved total adjustment before enabling payment or saving its first priced draft. Failed pricing requests show a retry action. Frozen orders retain their recorded total.
- `orders.cod_fee` stores the COD fee separately. The additive migration copies the fee already included in earlier labelled orders without changing their totals or captured amounts. Payment switching reads this field, and returning to full payment clears the fee.
- Admin price edits preserve the fee and correctly distinguish it from coupon discounts. Customer order summaries and confirmation email templates show the fee separately.
- The animated payment button has a stable accessible name.
- Checkout CSP permits the Razorpay CDN script used by its checkout SDK. Other private-page protections remain in place.
- Currency displays preserve paise, so ₹1,500.01 is not displayed as ₹1,500.

## Policy

COD eligibility uses the discounted order total including shipping before the ₹50 COD charge. Exactly ₹1,500 is eligible; ₹1,500.01 is not. New cart checkout uses full payment. Resumed eligible checkouts show both payment choices. The whole payment-options card is hidden above the COD limit.

## Verification

- 27 targeted tests passed across pricing, timeout handling, COD policy, order edits, customer privacy, payment settlement, and notification mocks.
- Expanded `scripts/verify-secure-checkout.ts` passed against generated database fixtures with mocked Razorpay responses, including the ₹1,500 boundary, full → COD → full switches with existing unpaid provider requests, durable fee storage, captured/processing payment protection, retries, late payments and callback idempotency. Generated records were removed.
- Mobile browser checked at 390 × 844: account timeout and successful retry; payment disabled on offer failure and restored after retry; fresh checkout hides payment choices; resumed checkout allows both selections; compact section fits without horizontal overflow; card hidden above ₹1,500.
- Applied MUMBAI100 in the mobile cart, opened checkout, and refreshed: the coupon remained selected and displayed in the checkout summary.
- Browser pricing/error scenarios use controlled API responses and temporary draft fixtures. No browser payment was initiated.
- TypeScript passed. Lint passed with pre-existing unused-code warnings in the account component.

## Database rollout

`sql/add_order_cod_fee.sql` was applied to the configured database using `node --import tsx scripts/apply-order-cod-fee.ts`. Apply the same additive migration before deploying the application to any other database. Application code is still local and has not been deployed.

## Limits

A real Razorpay payment or bank settlement was not performed. Local Next.js compilation occasionally produced timeouts and a transient empty-manifest error; the relevant pages recovered and the completed UI checks were repeated after compilation.
