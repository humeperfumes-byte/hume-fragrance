# Checkout payment launch and retries

The owned checkout renders its form after restoring the cart/details. It does not call `/api/checkout-session/recover` or put a full-page payment-history gate in front of the form. Explicit payment-mode switching retains its server checks because it changes the amount of a payment request.

Place Order sends the contact/cart/quote inside the authenticated `/api/create-order` request. The server saves the order with authoritative catalogue pricing and then creates or reuses the provider request. The browser no longer serializes availability, order save and payment preparation as three separate network requests for a secure checkout. Legacy non-token checkout retains its existing flow.

Normal retries return the already attached Razorpay order ID and the frozen server amount without querying provider payment history or order status. Dismissed/failed/missing windows can reopen that same request. Razorpay's Orders API rejects new payments once an order is paid. Local confirmed receipts/captures redirect to order confirmation rather than asking the customer to check manually.

Provider creation is claimed under a bounded local transaction, with external calls outside the lock. If creation was interrupted, the next click looks up the receipt automatically. It attaches a matching provider request rather than creating another. A stale claim with no provider record can be reclaimed with a conditional update after 45 seconds; an inconclusive/full lookup or concurrent in-progress creation does not spawn another request. A definite provider rejection releases the claim; unknown network outcomes retain it for recovery. Stale mode-switch claims recover without changing provider identity.

Legacy review flags are checked only when already present, and only cleared when prior/current provider evidence proves unpaid. Actual captures, amount mismatches, refunds, disputes and different-amount COD transitions remain protected. Existing signature, ownership, authoritative amount, webhook and callback idempotency checks remain in place.

The customer-facing “Check saved payment” link is removed from startup errors. Network failures preserve details and release Place Order. A missing Razorpay iframe releases the button after the watchdog and closes the old instance before a new one is opened. SDK loading has one bounded 10-second wait per attempt; the next click can replace a failed script. A verified-pending-save marker is scoped to its order so an unrelated checkout does not block a new one.

Validation:

```
node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-secure-checkout.ts
node --require ./scripts/server-only-test-register.cjs --import tsx --test tests/checkout-fetch.test.ts tests/secure-checkout.test.ts tests/checkout-continuation.test.ts tests/safe-error-monitoring.test.ts
```

Integration uses mocked provider responses and generated fixtures, then removes those rows. Browser checks use a synthetic pending checkout and mocked SDK/API responses: no initial recovery request, retriable startup error, same-order retry, no separate order-save request, and missing-window button recovery. No real charges are made.

Provider reference: https://razorpay.com/docs/api/orders/fetch-with-id/
