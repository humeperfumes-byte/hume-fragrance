# Customer search, repeat orders and exports

Orders and Customers both contain an all-history customer search, independent of the dashboard date range. Search name, email, mobile, order number or tracking number. Requests debounce and cancel when the query changes; server results paginate in batches of 40. The history drawer retains the search underneath and loads older records on demand.

Valid Indian mobile numbers are normalized across +91, 0091, leading zero and common formatting. Mobile is the primary identity. Email is a fallback for records without a valid Indian mobile; names never merge identities, and different valid mobiles sharing an email remain separate. A phone identity represents records entered with that number, not independently verified ownership.

Repeat order opens a new editable manual order. It copies contact/address and eligible items/quantities, including the fifteen discovery samples. Current catalogue prices apply; price/name changes, missing products, gifts and unavailable selections are flagged. Previous payment receipts, Razorpay IDs, invoice numbers, tracking, discounts and shipping fees are not copied. The server recalculates prices and rechecks repeat-order stock/sample availability. Nothing is created until the administrator submits the new form. Creation retains the existing request-ID retry protection.

CSV downloads are authenticated and non-cacheable. All-history downloads are the default; optionally restrict to the current search. Order CSV contains one row per order, including unpaid/cancelled orders. Customer CSV combines orders and saved checkout drafts into one row per valid Indian mobile, including incomplete contact profiles. Incomplete-lead CSV selects those mobile identities with no saved order. Email-only or malformed/mobile-less profiles are excluded from customer CSV, not from order exports. Order value is explicitly labelled as including unpaid orders, not revenue received.

CSV uses UTF-8 with BOM, quotes commas/newlines and neutralizes spreadsheet formula prefixes. Exports select operational fields only: no checkout/resume tokens, payment URLs, provider credentials, raw browser metadata or webhook payloads. Existing configured internal/admin record exclusions apply. Exports stop with an explicit error above 25,000 source records rather than silently truncating. Downloaded files contain customer data and should be stored within the business's authorized systems.

Optional/additive database optimization: `node scripts/apply-admin-customer-search-indexes.mjs` creates concurrent mobile/email and history-sort indexes. This does not update customer/order rows. Name/partial-number/substring searches still use bounded server-side SQL searches; no records are preloaded into the browser for global search.

Validation:

```
node --require ./scripts/server-only-test-register.cjs --import tsx --test tests/admin-customer-records.test.ts tests/manual-order.test.ts tests/external-order-payment.test.ts
node --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-admin-customer-workspace.ts
```

The API verification creates synthetic fixtures inside a transaction and rolls them back. It does not create provider payment links or send notifications.
