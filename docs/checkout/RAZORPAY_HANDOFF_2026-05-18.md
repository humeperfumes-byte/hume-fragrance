# Razorpay Handoff - 2026-05-18

This note captures where we stopped after integrating Razorpay so the next
session can resume without rereading the chat.

## Current State

Razorpay Standard Checkout is integrated in the Next.js app.

Completed:

- Installed the `razorpay` Node SDK.
- Added backend order creation at `POST /api/create-order`.
- Added backend payment signature verification at `POST /api/verify-payment`.
- Added frontend Razorpay modal flow on the checkout page.
- Updated checkout so a local `payment_pending` order is saved before the
  Razorpay modal opens.
- Added Razorpay webhook receiver at `POST /api/razorpay/webhook`.
- Added admin status support for:
  - `payment_pending`
  - `payment_authorized`
  - `payment_failed`
  - `refund_initiated`
  - `partially_refunded`
  - `refunded`
  - `refund_failed`
  - `payment_disputed`
  - `dispute_action_required`
  - `dispute_under_review`
  - `dispute_won`
  - `dispute_lost`
  - `dispute_closed`
  - `processing`
- Added a `razorpay_webhook_events` ledger table in the Drizzle schema for
  payment, refund, dispute, settlement, and payment downtime events.
- Confirmed the Razorpay dashboard test transaction worked.
- Switched local Razorpay env keys to live mode.

## Important Env Variables

These exist locally in `.env` and `.env.local`, but they are ignored by git.
Do not paste real secret values into docs or source files.

Required variables:

```text
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_WEBHOOK_SECRET=...
```

Notes:

- `RAZORPAY_KEY_SECRET` must stay server-only.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` is allowed on the frontend.
- `RAZORPAY_WEBHOOK_SECRET` is the secret chosen for webhook signature
  validation. It is different from the Razorpay key secret.
- Add the same values in Vercel Production environment variables before
  deploying.

## Webhook Setup

In Razorpay Dashboard:

1. Go to `Settings -> Webhooks`.
2. Create a webhook.
3. Webhook URL should be the live production endpoint:

```text
https://www.humefragrance.com/api/razorpay/webhook
```

Use the correct live domain if production is on another host.

4. Secret should be the exact value of `RAZORPAY_WEBHOOK_SECRET`.
5. Alert email can be the store/admin email.
6. Select these active events:

```text
payment.authorized
payment.failed
payment.captured
order.paid
refund.created
refund.processed
refund.failed
refund.speed_changed
payment.dispute.created
payment.dispute.action_required
payment.dispute.under_review
payment.dispute.won
payment.dispute.lost
payment.dispute.closed
settlement.processed
payment.downtime.started
payment.downtime.updated
payment.downtime.resolved
```

Do not select unrelated RazorpayX, Subscription, Route, Smart Collect, or
non-payment product events unless the site starts using those products.

## Payment Flow

Checkout now works like this:

1. Customer fills checkout form.
2. Customer clicks `Place Order`.
3. The app creates a Razorpay order through `/api/create-order`.
4. The app saves a local HUME order as `payment_pending`.
5. Razorpay Checkout opens.
6. On frontend success:
   - `/api/verify-payment` checks the payment signature.
   - the order moves to `processing`.
7. Independently, Razorpay webhooks can also update the order:
   - `payment.authorized` -> `payment_authorized`
   - `payment.failed` -> `payment_failed`
   - `payment.captured` or `order.paid` -> `processing`
   - `refund.created` -> `refund_initiated`
   - `refund.processed` -> `partially_refunded` or `refunded`
   - `refund.failed` -> `refund_failed`
   - dispute events -> the matching dispute status
8. Settlement and payment downtime events are stored in the webhook ledger.

This protects against the user closing the browser after payment.

## Files Added Or Changed For Razorpay

Core Razorpay files:

- `app/api/create-order/route.ts`
- `app/api/verify-payment/route.ts`
- `app/api/razorpay/webhook/route.ts`
- `components/CheckoutClient.tsx`
- `app/api/orders/route.ts`

Admin/status support:

- `app/admin/(dashboard)/orders/OrdersTable.tsx`
- `app/api/admin/orders/[id]/status/route.ts`
- `app/api/admin/dashboard/route.ts`
- `app/api/admin/export/route.ts`
- `app/api/admin/schema-health/route.ts`
- `db/schema.ts`

Package changes:

- `package.json`
- `package-lock.json`

## Verification Already Done

These checks passed after webhook work:

```text
npm run lint
npm run build
```

Lint passed with existing warnings only. No blocking errors.

Webhook tests:

- signed fake webhook returned `200`
- bad signature returned `400`
- production build shows route `ƒ /api/razorpay/webhook`

## Next Steps When Resuming

1. Finish creating the Razorpay webhook in the dashboard.
2. Sync the database schema so the webhook ledger table exists:

```text
npm run db:push
```

3. Add all Razorpay env variables to Vercel Production:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_WEBHOOK_SECRET`
4. Redeploy Vercel.
5. Do one small real payment on the live site.
6. Check:
   - Razorpay `Transactions -> Payments`
   - Razorpay webhook delivery logs
   - HUME admin `Orders`
7. Confirm the order becomes `processing`.

## Caution

- Do not commit `.env` or `.env.local`.
- Do not hardcode Razorpay secrets in source files.
- Do not select unnecessary webhook events yet.
- If a secret is ever accidentally exposed somewhere public, rotate it in
  Razorpay/Vercel/local env before launch.
