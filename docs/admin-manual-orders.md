# Admin customer orders and payment links

In `/admin/orders`, expand **Create customer order**. Enter the customer and Indian shipping address, choose available public INR perfumes and quantities, and choose full online payment or 20% advance with 80% COD. Optional shipping and discount amounts are included in the total; discounts require a reason.

The server uses catalogue prices and saves a pending order before creating a Razorpay Standard Payment Link. A partial-COD link requests exactly 20% of the total, rounded to paise. Razorpay partial payments are disabled because the requested advance itself must be paid in full. No email or SMS is sent automatically. The admin can copy a link or customer message.

Payment details and immutable amounts are stored in a structured line of the existing order's `whatsappMessage`. No schema migration is needed. Financial edits and payment-mode edits on these orders are blocked to keep the link and order consistent. Operational details remain editable. Unpaid orders cannot be marked as ready to process or ship.

Creation retries use the same request UUID and Razorpay reference. Concurrent attempts claim creation once. An uncertain provider response is recovered by looking up the reference; it does not issue a second link. Authentication failures can be retried after fixing credentials. For an ambiguous failure where Razorpay has no link, resolve the creation attempt with Razorpay support before creating another order.

Existing Razorpay server credentials are required: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`. Configure the signed webhook at `/api/razorpay/webhook` with `RAZORPAY_WEBHOOK_SECRET`, and enable `payment_link.paid` (optionally `payment_link.expired` and `payment_link.cancelled`). Existing payment events also reconcile manual orders when matched. The **Check Razorpay payment** button and existing reconciliation job provide additional checks.

The server fetches the link from Razorpay and verifies its reference, currency, expected online amount and paid amount. A verified advance moves a partial-COD order to processing while preserving the COD balance. Repeated checks are idempotent. Cancellation revokes unpaid links; paid orders need payment reconciliation before cancellation, and refunds remain a separate operation.

Set the remaining COD amount in the courier booking yourself. This feature does not create courier shipments or reconcile courier COD settlements. Delivery alone does not prove that the COD balance was settled.

Validation: `node --import tsx --test tests/manual-order.test.ts`, TypeScript and targeted ESLint. Local route checks cover rendering, authentication rejection and invalid-input rejection. No live orders, charges or payment links are created during these checks. A Razorpay test-mode end-to-end payment remains necessary before production use.
