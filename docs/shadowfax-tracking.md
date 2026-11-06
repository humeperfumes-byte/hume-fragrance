# Shadowfax tracking

Shadowfax is available in **Admin → Orders → carrier**, and **Admin → Tracking** for single or bulk AWB lookups. Customer `/track-order/<AWB>` links use the same adapter. Saved carrier names take precedence; unlinked AWBs starting with `SF` are recognized as Shadowfax. Tracking is read-only: it does not book pickups, buy labels, change order status, or send customer messages.

## Production setup

1. Open [the Worker settings](https://dash.cloudflare.com/45c2b5bc1711cd1778bb746701c8e6b2/workers/services/view/hume-fragrance/production/settings).
2. Under **Variables and Secrets**, add **Secret** named `SHADOWFAX_API_TOKEN`. Paste the raw **production** token, without `Token ` in front.
3. Save/deploy the change. Leave `SHADOWFAX_API_BASE_URL` unset in production. The code uses `https://dale.shadowfax.in/api` automatically.
4. In an order's fulfillment settings, select **Shadowfax**, save the AWB, and check it from the tracking desk. Both `.com` and `.in` customer links use this configuration.

No database migration or public token is required. Keep the test token out of production. `.env.example` documents the setting; local private configuration stays in the existing ignored `.env.cloudflare.local` when needed.

## Sandbox

On an isolated test environment, use the staging token in `SHADOWFAX_API_TOKEN` and set `SHADOWFAX_API_BASE_URL=https://dale.staging.shadowfax.in/api`. Staging and production have separate tokens and shipments. The code accepts only these two official API bases and rejects redirects to avoid leaking credentials.

The integration calls `GET /v4/clients/orders/{awb_number}/track/` with `Authorization: Token ...`. It displays current status, scan location, delivery estimate when provided, and full scan history newest first. RTS/RTO is shown as returned, including return-delivered states; delivery-failure codes are never shown as successful delivery. Offset-free carrier times use IST. Errors are bounded and sanitized, and carrier contact details/raw payloads are not returned.

## Verification

Run `node --conditions=react-server --import tsx --test tests/shadowfax-tracking.test.ts tests/delhivery-tracking.test.ts` for mocked provider and authenticated admin-route checks. These tests use fake credentials and do not make carrier requests. A separate read-only staging lookup can verify a supplied token and test AWB; an invalid staging AWB cannot verify real shipment scans.

Official references: [tracking API](https://developer.shadowfax.in/docs/api/forward-logistics/tracking), [environments and authentication](https://developer.shadowfax.in/docs/forward-logistics/quickstart), [status codes](https://developer.shadowfax.in/docs/forward-logistics/order-lifecycle).
