# Token checkout integration

Plan: use the existing checkout_drafts and orders tables as the admin/notification sources, linked by the secure session ID. Opening checkout creates a started draft; autosave fills customer details, server-calculated totals and acquisition fields. Serialize writes per session and queue started/contact alerts after commit, once per transition. Local development and tests do not send real notifications by default.

Customer continuation is a separate owner-checked, no-store endpoint. It returns only the active checkout path, product summary and amount, never customer details or the owner secret. Homepage and account use that same source and return to the existing checkout. Completed/cancelled/refunded orders and expired sessions do not produce a continuation reminder. Legacy verified-payment recovery continues to block repeat payment.

Account lookups for secure session IDs must require the owner cookie or a valid authenticated account identity. A secure session UUID alone is not authorization. Admin-issued resume links and legacy checkout behavior remain supported.

Verification: generated fixture records only, mocked provider/notification delivery, checks for admin values, transition deduplication, unauthorized lookups, pending/finished reminders and same-order recovery. Browser checks cover home/account reminders and returning to the same checkout. No production deployment is part of this change.

Implemented: full admin draft persistence and attribution, one started/contact alert per transition, pending-order alerts labelled as awaiting payment, owner-checked active checkout, home/account continuation, and account retries preserving the saved payment amount and provider order. Authenticated account recovery can renew an expired session; it registers the derived order-view link as well. A closed order clears only its matching local payment reminder.

Local alerts are disabled unless ENABLE_LOCAL_CUSTOMER_NOTIFICATIONS=true. Production keeps existing Telegram/email configuration. An unfinished checkout appears in Admin Checkouts; a submitted order appears in Admin Orders. Existing internal phone/email exclusions still apply.

Validation commands: node --import tsx --test tests/checkout-alerts.test.ts tests/checkout-continuation.test.ts tests/secure-checkout.test.ts tests/customer-journey.test.ts tests/safe-error-monitoring.test.ts; node --conditions=react-server --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-secure-checkout.ts. The integration script uses the session pool for its local process and deletes only its generated records.

Verified locally: all 15 safety/notification tests, generated-record database integration for full and partial COD payment, TypeScript and targeted lint (no errors). Browser showed the home badge and the account card with the saved item and discounted total; the account continuation link matched the original checkout token. Screenshot: .next/checkout-account-connected.png. Live external notifications and real payment transactions were not performed.

Payment startup: stock/draft/order/provider/verification requests now bound both headers and response-body waits to 30 seconds without automatic retries. Secure order preparation saves customer details once; it does not wait for another draft write or repeat the pending-order save after provider creation. Buttons identify the current step. A missing provider window offers a full-page check of the existing payment; it keeps another payment blocked until that check. The animation-frame wait has a fallback for background tabs. Tests include stalled headers, stalled bodies and preservation of HTTP error responses; live payment was not initiated for verification.
