# Safer checkout diagnostics — 28 October 2026

## Local change

Future secure checkout failures can record a random request reference, operation (`start`, `draft`, `order`), fixed stage, fixed error category and an allowlisted SQLSTATE. The same random reference is returned as `X-Hume-Request-Reference` and included in slow/error request timing logs.

No customer identifiers, cart contents, full URLs, checkout capabilities, raw exceptions, SQL query text, credentials or payment tokens are included. Metadata is filtered at runtime; TypeScript types alone are not trusted.

Distinct instrumented requests are counted separately, duplicate reports for the same request are suppressed, and a burst cap of 20 events per process per five seconds protects the application database and alert destination. Counts remain diagnostic events, never a count of affected customers. Existing non-instrumented callers retain their five-second suppression. Storage/sink failures cannot change a checkout response.

## Rollout

The optional additive migration is `sql/add_safe_diagnostic_details.sql`. It adds a JSONB `details` field to `safe_diagnostics`, leaving existing records unchanged. It has NOT been applied to the production/configured database. Neither code nor settings were deployed or pushed for this change.

The writer and admin diagnostics endpoint both fall back to the old database shape when the optional column is missing. Persisted historical errors still cannot reveal causes that were not recorded at the time. Deploy the schema and logging code together when approved for release.

## Verification

19 targeted tests passed: metadata privacy, safe category classification, nested causes, cyclic causes, request/header correlation, duplicate suppression, burst limiting, migration compatibility, failed/disabled monitoring, existing payment protections and request timeouts. Lint and TypeScript checks passed.

Live smoke check: https://www.humefragrance.com/checkout opens and returns HTTP 200; an isolated empty-cart browser reaches 'Your bag is waiting'; the 390 × 844 mobile layout does not overflow; the initial console check was clean. A later background chat poll recorded ERR_NETWORK_IO_SUSPENDED in the audit browser; no checkout failure was observed. No customer form was submitted, order created, payment initiated or production configuration changed. A real payment and settlement were not tested.
