# Checkout configuration without extra Vercel variables

Checkout and privacy-safe error monitoring now default to enabled. No `ENABLE_SECURE_CHECKOUT` or `ENABLE_ERROR_MONITORING` setting is required. Existing explicit `false` values still disable the corresponding feature; remove them if enabling the feature.

No additional signing secret is required. Visit-discount cookie signatures use an HMAC-derived key from the existing server-only `RAZORPAY_KEY_SECRET`, with a distinct HUME signing context. An existing dedicated `CHECKOUT_SESSION_SIGNING_SECRET` remains supported and takes precedence. Neither key is exposed to the browser. Changing the source secret invalidates old visit rewards; saved checkout ownership and order capabilities are independent random tokens and are unaffected.

The production database must contain all additive checkout/customer-link/diagnostics and invoice tables before deploying this default-enabled release. Existing payment keys, webhook configuration and authenticated reconciliation scheduling remain required. Error diagnostics are stored internally; external alerts still require an optional destination.

This document supersedes earlier rollout instructions requiring the two enable flags and a separate checkout signing secret. The current release still needs its production build and live provider verification after these configuration changes.
