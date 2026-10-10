# Local preview

Run `npm run dev` from the project folder. It uses webpack and port 3002, consistently with the current local preview. Only one development server should use this checkout at a time.

After changing development compilers, hard-refresh the browser once to replace old development chunks. First-time compilation of a route can still take longer than a warm request. A shared loading boundary now displays page transitions while server data is fetched.

Homepage journal and product-related journal sections stream separately from browsing and purchase content. Product links use Next's normal navigation instead of manually preventing the click. Manual hover prefetches have been removed; the Link component manages its own prefetching. Public settings requests have a ten-second client deadline and can retry after a network failure.

Browser verification covers homepage → shop → product → bag → token checkout. First visits require development compilation; warm requests are faster. No real payments or notification sends are part of local browser verification.

These changes do not alter stored products, orders, or payment verification rules.

Automatic consent/cart analytics and Cloudflare beacons are disabled during development to avoid competing with page requests and writing preview traffic to the live database. Chat remains available when opened; unopened chat does not activate/poll automatically during development. Set `NEXT_PUBLIC_ENABLE_LOCAL_TELEMETRY=true` only when specifically testing those integrations. Production behavior is unchanged.

The secure checkout entry allows 60 seconds during development for first compilation (20 seconds in production), with a readable retry message on timeout. On an 8 GB machine, run TypeScript/lint checks sequentially while the preview is open; parallel checks can exhaust memory and stall compilation. Clear any already-pending local requests with a server restart after changing these development settings.

The PostgreSQL driver is external to development bundles so hot reloads do not replace its connection internals. For a Supabase pooler URL on port 6543, development uses the same host/credentials on session-pool port 5432. It reuses one small pool and allows 15 seconds for connection setup. Driver pipelining uses its default; artificially lowering it breaks transactions under concurrent requests. Production keeps the original URL and pool settings. Coupon GET requests do not automatically seed coupons during development; existing database coupons are still loaded. Ordinary perfume checkouts skip the kit-availability query; kits retain that validation.
