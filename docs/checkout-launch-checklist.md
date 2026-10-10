# Checkout launch checklist

The new flow is enabled locally. Nothing in this checklist authorizes a live charge or enables production automatically.

## Account settings the owner supplies

1. Create an isolated staging/preview deployment using a test database, and configure Razorpay **test-mode** keys there. Set matching `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`, plus the corresponding `RAZORPAY_KEY_SECRET`. Do not replace live keys on the live shop. Add the staging hostname to the existing Razorpay allowed-host setting if required. Enter secrets in the hosting dashboard; do not paste them into chat.
2. In Razorpay test mode, configure the webhook URL `https://<staging-host>/api/razorpay/webhook`. Set the same secret as `RAZORPAY_WEBHOOK_SECRET` on staging. Enable the payment/order events required by the existing integration and check delivered webhook responses. Keep existing live refund, dispute and payment-link subscriptions intact.
3. Choose an HTTPS receiver for error alerts and configure `ERROR_ALERT_WEBHOOK_URL`. It receives only error code, generated reference and timestamp. Do not use a Slack/email destination until sending to it is explicitly authorized.
4. Confirm the actual production host (Vercel or Cloudflare) and configure request-log redaction/exclusions for `/checkout/<token>` and `/order/<token>`, including region-prefixed routes. App-side analytics are already excluded; provider access logs are outside the app's control.

## Staging verification

- Apply the two additive schema files listed in `docs/secure-checkout.md`, then enable the feature flags and set a stable server-only signing secret. Configure `CRON_SECRET` with at least 32 random characters. The reconciliation endpoint now rejects requests when this secret is missing, including spoofed `vercel-cron` headers.
- Run `node --import tsx scripts/check-checkout-readiness.ts`. It prints pass/missing checks without key values and makes no provider calls. It checks the environment loaded by the current process, not the hosting dashboard remotely.
- Complete test-mode full payment and 20% advance COD. Check one HUME order, correct received amount/COD balance, customer order redirect, admin status and webhook delivery.
- Refresh before paying, cancel/retry, and test a missed callback by reopening the same checkout. Confirm no second provider order/charge is created. Verify admin fulfillment states survive repeat payment events.
- Open a saved link in another browser: personal contact/address details must remain hidden. Check deployed `Cache-Control`, `Referrer-Policy`, `X-Robots-Tag` and CSP headers and ensure private pages send no third-party analytics requests.
- Vercel already schedules `/api/cron/razorpay-reconciliation` daily in `vercel.json`; ensure cron is enabled and authenticated. Cloudflare needs an authenticated scheduler calling that endpoint; the repository has no corresponding Worker cron configuration.

## Production release

Only after staging passes: apply the additive schema to the production database, configure server-only secrets/flags and the alert receiver, then deploy with the existing live Razorpay keys/webhook integration. Monitor `/admin/diagnostics` and reconcile the first orders. Never switch off secure checkout while its unresolved payment sessions remain outstanding.

Current local readiness: schema, matching live key configuration, webhook secret and cron secret are present. Test-mode keys and an error-alert destination still need owner setup. No live provider payment was attempted.
