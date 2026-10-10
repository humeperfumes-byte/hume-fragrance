# Checkout activity and customer reasons

Order details show a compact Checkout exit insight with the last recorded stage and a possible reason, using the checkout session ID. The full timeline and checkout-panel addition were removed as requested. Historical sessions have no activity until they are reopened on this release. No new database table or environment variable is needed.

Events are recorded for secure checkout owners only, using the existing HttpOnly ownership cookie and scoped checkout token. Requests enforce same origin, a 2 KB body limit, allowlisted events and predefined reason codes. No arbitrary messages, customer inputs, provider descriptions, tokens or URLs are stored in activity records. Server timestamps, an 80-event bound and duplicate suppression limit history. Existing pricing/admin override fields are preserved under the same transaction lock as draft saves. Activity never changes payment, order or lead status.

There is no customer-facing exit question. Activity collection runs silently. Suggested reasons remain explicitly uncertain; COD preference, price concerns and other intentions must not be inferred from navigation alone.

The timeline distinguishes recorded actions from an explicit customer reason. A tab becoming hidden can mean switching apps, especially during mobile payment; it is not proof of abandonment. Browser exit events can be lost. Payment-window opening is an SDK open request, not proof of visibility; missing-window detection records separately. Payment callback verification is a browser observation; the order record is the source of truth for captured money. Viewing a payment option does not prove wanting full COD. Old sessions without events must not be treated as never having tapped Place order.

Tracking is asynchronous with a 5-second request limit. Events are grouped into batches of up to 20 (strict 2 KB request limit) and deferred during payment preparation, then flushed when the payment window opens or the customer leaves. This keeps tracking writes out of the payment startup path. It creates no orders and sends no customer/admin messages. Data lives under `checkout_drafts.pricing_breakdown.checkoutActivity`, with admin-only read access. Legacy manual orders without a secure checkout may show no events.

Verification: activity unit tests cover event filtering, private metadata removal, bounds and deduplication. The secure checkout service verification checks ownership rejection, unexpected-field rejection and persistence across draft autosave, using generated records and mocked payments.

