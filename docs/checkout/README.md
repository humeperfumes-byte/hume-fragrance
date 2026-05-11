# Checkout and Orders

## Purpose

Checkout is both a purchase step and a lead capture system. If a customer does
not finish, the data should still become useful for admin recovery.

Primary files:

- Checkout page: `app/checkout/page.tsx`
- Checkout client: `components/CheckoutClient.tsx`
- Draft API: `app/api/checkout-drafts/route.ts`
- Order API: `app/api/orders/route.ts`
- Admin convert API: `app/api/admin/convert-to-order/route.ts`
- Checkout drafts table: `checkout_drafts`
- Orders table: `orders`

## Session and Storage Keys

Checkout and cart share session identity so lead stitching works:

- Cart session: `hume_cart_session_id`
- Checkout session: `hume_checkout_session_id`
- Checkout form details: `hume_checkout_details_v1`
- First-touch source: `hume_first_touch_source`
- Applied coupon: `hume_applied_coupon_code`
- Welcome-back reward:
  - `hume_welcome_back_visit_count_v1`
  - `hume_welcome_back_last_visit_at_v1`
  - `hume_welcome_back_reward_v1`
- Last order guards:
  - `hume_last_order_signature_v1`
  - `hume_last_order_id_v1`
  - `hume_last_order_number_v1`

## Checkout Draft Flow

1. User opens checkout.
2. Checkout creates or reuses the cart session id.
3. Form details are saved locally.
4. Draft payload is autosaved to `/api/checkout-drafts`.
5. Draft status is inferred:
   - `started`
   - `partial`
   - `complete`
   - `whatsapp_initiated`
6. Payload includes:
   - customer details
   - cart snapshot
   - subtotal, shipping, grand total
   - path
   - source/category/referrer
   - UTM source/medium/campaign/term/content
   - last edited field

Checkout drafts power abandoned checkout recovery in admin.

## Offer Handoff

Cart and checkout totals must stay aligned.

Current offer layers:

- Manual coupon from `hume_applied_coupon_code`
- Welcome-back reward from `hume_welcome_back_reward_v1`
- Gift products from cart state
- Free delivery from threshold or welcome-back reward

Checkout must:

- Read the applied coupon from localStorage.
- Read the active welcome-back reward from localStorage.
- Calculate the same discount shown in cart.
- Stack manual coupon and welcome-back reward.
- Preserve offer codes on order creation.
- Include the deal in the WhatsApp/order context.

Welcome-back rewards:

- Visit 2 unlocks `Welcome Back 5` / `WELCOME-BACK-5`.
- Visit 4 upgrades to `Welcome Back 10` / `WELCOME-BACK-10`.
- The reward lasts 24 hours.
- The reward stacks with normal coupon codes and gifts.

## Order Flow

Orders preserve the final state of the checkout:

- order number
- session id
- status
- checkout channel
- payment/shipping method fields
- acquisition source/category/referrer
- UTM fields
- customer details
- applied coupon code
- subtotal, shipping fee, grand total
- WhatsApp message
- cart snapshot
- country/ip/user-agent metadata

Important:

- Source and UTM data should survive checkout-to-order conversion.
- Cart snapshot should preserve product names, quantity, price, size, and gift
  status at the time of order.
- Do not recalculate historic order value from current product prices.

## WhatsApp Role

WhatsApp is a major sales and recovery channel.

Checkout should make WhatsApp ordering/help easy, while admin should preserve
enough context to send a direct, tailored message.

## Do Not Regress

When changing checkout:

- Draft autosave must keep working.
- Form values must persist after refresh.
- Drafts must include cart snapshot and source/UTM fields.
- Cart and checkout offer math must match.
- Manual coupons and welcome-back rewards must stack.
- Orders must preserve coupon/source/UTM data.
- Empty cart behavior should not create bad orders.
- Duplicate order guards should remain in place.

## Validation

After checkout changes, run:

```bash
npx eslint components/CheckoutClient.tsx
npx tsc --noEmit --pretty false
```

Then manually check:

- Add item to cart.
- Apply a coupon and/or unlock a welcome-back reward.
- Continue to checkout.
- Confirm totals match cart.
- Fill fields and refresh.
- Confirm admin checkout draft updates.
