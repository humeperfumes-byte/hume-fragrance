# Admin receipts for payments received outside checkout

The custom-order payment selector includes **Already paid · Confirmed order**. The admin records UPI/QR, bank transfer or cash plus a reference. Prices and total are still calculated from the catalogue on the server. The order starts confirmed (`processing`), fully paid, and generates no Razorpay link or automatic customer message.

Existing orders have **Record full payment** in the order details. Enter the receipt for the remaining balance only: a ₹1,000 COD order with ₹200 captured by Razorpay requires an ₹800 external receipt. The API locks the current order, checks its version and exact remaining amount, stores one receipt, and writes an audit. Retries cannot add the receipt twice. Fulfillment progress is retained. Refund, dispute and cancelled orders require their own resolution first.

External receipts live in an admin-only JSONB order field, separate from Razorpay capture fields and customer-supplied messages. Public checkout payloads cannot set it. Existing Razorpay captures and references are not fabricated, erased or reclassified. Unpaid manual payment links are revoked before settlement; already-paid links must first have their capture reconciled. If another provider capture later arrives, the order details show any excess received for manual review; refunds are never sent automatically.

Full settlement removes COD due and payment-resume prompts. The customer order view reports payment received. The existing Razorpay-only revenue metrics still report provider captures; these external receipts are not presented as Razorpay captures.

Schema setup (additive, no existing data rewrite): `node --import tsx scripts/apply-external-order-receipt.ts`. Applied to the configured database. Other databases require `sql/add_external_order_receipt.sql` before this code is deployed.

Checks: `node --import tsx --test tests/external-order-payment.test.ts tests/manual-order.test.ts tests/checkout-continuation.test.ts`. Database API verification: `node --require ./scripts/server-only-test-register.cjs --import tsx scripts/verify-external-order-payment.ts`; every synthetic receipt, order and audit is rolled back, with no provider request or notification.
