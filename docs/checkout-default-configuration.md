# Checkout configuration without extra Vercel variables

Secure checkout, customer order links, checkout resume links and privacy-safe error monitoring are enabled in `lib/checkout-settings.ts`. These are fixed product settings; the four former `ENABLE_*` environment variables are ignored and can be removed from deployment settings.

No additional signing secret is required. Visit-discount cookie signatures use an HMAC-derived key from the existing server-only `RAZORPAY_KEY_SECRET`, with a distinct HUME signing context. An existing dedicated `CHECKOUT_SESSION_SIGNING_SECRET` remains supported and takes precedence. Neither key is exposed to the browser. Changing the source secret invalidates old visit rewards; saved checkout ownership and order capabilities are independent random tokens and are unaffected.

The production database must contain all additive checkout/customer-link/diagnostics and invoice tables before deploying this default-enabled release. Existing payment keys, webhook configuration and authenticated reconciliation scheduling remain required. Error diagnostics are stored internally; external alerts still require an optional destination.

This document supersedes earlier rollout instructions requiring the two enable flags and a separate checkout signing secret. The current release still needs its production build and live provider verification after these configuration changes.
