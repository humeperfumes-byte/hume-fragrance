# Delhivery shipment tracking

The customer page `/track-order/<AWB>` loads status, current location, expected delivery (when supplied), and the full scan timeline from Delhivery. Admin tracking uses the same adapter. Delhivery timestamps are shown in India Standard Time. Carrier responses may be cached server-side for up to 60 seconds.

## Setup

1. Paste the **production Delhivery Express/B2C API token** (the raw token only, without the `Token ` prefix) into `DELHIVERY_API_TOKEN` in `.env.local` for development. Use the same variable in Vercel project settings for Production (and Preview only if desired).
2. Restart the local server after editing `.env.local`. For production, redeploy after adding the variable; editing a local env file does not update Vercel.
3. Leave `DELHIVERY_TRACKING_ENDPOINT` unset for production. Its default is `https://track.delhivery.com/api/v1/packages/json/`.
4. For sandbox testing only, use a matching staging token and `DELHIVERY_TRACKING_ENDPOINT=https://staging-express.delhivery.com/api/v1/packages/json/`.
5. In the admin order, set carrier to **Delhivery** and enter the shipment's AWB. Existing tracking links and the tracking form then use live carrier data. A recognized Delhivery AWB can also be tracked without a matching website order.

The token is server-only: never use a `NEXT_PUBLIC_` prefix. Authentication uses the `Authorization: Token ...` header, not a URL query parameter. Do not put the token in a tracking link. Raw provider payloads are not returned by the public endpoint.

Missing/invalid credentials, unknown shipments, timeouts, and rate limiting show recoverable messages with the official tracker link. No shipment is marked delivered just because tracking is unavailable. Expected delivery is only an estimate provided by the carrier.

## Verification

Run `node --import tsx --test tests/delhivery-tracking.test.ts`. The tests mock Delhivery and require no live token. Once credentials are configured, open a known shipment at `/track-order/<AWB>` and confirm real scans, location and status. Live authentication cannot be verified without the token.

Official reference: https://one.delhivery.com/developer-portal/document/b2c/detail/order-tracking
