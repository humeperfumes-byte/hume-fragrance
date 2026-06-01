# Admin Operations

## Purpose

The admin panel should be a daily operating system for HUME Fragrance, not just
a dashboard of interesting numbers.

Primary goals:

- Recover checkout/cart/coupon leads.
- Track revenue and fulfillment.
- Understand conversion funnel leaks.
- See source quality and campaign ROI.
- See product demand.
- See repeat buyers and customer lifetime value.
- Prepare clean historical data for future ML and automation.

Primary files:

- Admin shell: `components/admin/AdminShell.tsx`
- Admin layout: `app/admin/(dashboard)/layout.tsx`
- Dashboard: `app/admin/(dashboard)/dashboard/page.tsx`
- Intelligence: currently disabled; direct visits redirect to Dashboard
- Checkouts: `app/admin/(dashboard)/checkouts/page.tsx`
- Cart leads: `app/admin/(dashboard)/cart/page.tsx`
- Coupon leads: `app/admin/(dashboard)/coupon-leads/page.tsx`
- Customers: `app/admin/(dashboard)/customers/page.tsx`
- Orders: `app/admin/(dashboard)/orders/page.tsx`
- Products/catalog: `app/admin/(dashboard)/products/page.tsx`
- Blogs/content: `app/admin/(dashboard)/blogs/page.tsx`
- Data export: `app/admin/(dashboard)/data-export/page.tsx`
- Admin APIs: `app/api/admin/*`

## Design Direction

Admin UI should be:

- Minimal.
- Sans-serif.
- Dark, professional, and operational.
- Easy to scan.
- Useful on desktop and mobile.

Avoid:

- Cursive or decorative fonts.
- Metrics that look impressive but do not drive action.
- Hidden actions that only appear on hover.
- Overly large rows that make daily work slow.

## Navigation

Current admin navigation:

- Dashboard
- Orders
- Checkouts
- Cart Leads
- Coupon Leads
- Customers
- Catalog
- Content
- Data Export

The sidebar lives in `components/admin/AdminShell.tsx`.

Mobile behavior:

- Sidebar opens as a sheet.
- Navigation must remain reachable without layout frustration.

## Market Filter

Admin top bar has:

- `India`
- `All`

Important business rule:

- Dashboard is a market-filtered operating view.
- Detail work pages such as Checkouts should show all operational rows unless
  the user explicitly asks otherwise.

India detection is handled in:

- `lib/admin-market.ts`

Important history:

- Older rows were sometimes captured as Singapore because of infrastructure or
  header country bugs.
- `SG` is treated as legacy India signal in admin market logic.
- Phone, pincode, and state can also identify India.

## Date Windows

Most operating views should support the shared `hours` URL parameter so the
same screen can be used for today's work and recent-history checks.

Shared files:

- Window config: `lib/admin-time-window.ts`
- Window picker: `components/admin/AdminDateWindowControl.tsx`

Current options:

- Last 24 Hours
- Last 2 Days
- Last 3 Days
- Last 5 Days
- Last 7 Days
- Last 10 Days
- Last 15 Days
- Last 30 Days
- Last 90 Days

The admin sidebar preserves `hours` while navigating between operating views.

## Internal Traffic Filtering

Owner/admin activity should not pollute customer operating views.

Shared helper:

- `lib/admin-data-filters.ts`

Future admin activity is marked by the `hume_admin_internal=1` cookie after a
successful admin login. Public tracking and lead-capture APIs skip events when
that cookie is present.

Historical owner activity can be excluded with comma-separated environment
values:

- `ADMIN_EXCLUDED_EMAILS`
- `ADMIN_EXCLUDED_PHONES`
- `ADMIN_EXCLUDED_SESSION_IDS`
- `ADMIN_EXCLUDED_IPS`
- `ADMIN_EXCLUDED_USER_AGENT_MATCHES`

Important limitation:

- Old activity can only be removed if it can be identified by session, contact,
  IP, user agent, or another stored signal. Future logged-in admin traffic is
  skipped automatically.

## Dashboard

Purpose:

- One working view for revenue, funnel, abandoned value, source quality, demand,
  repeat customers, and daily run list.

Dashboard should answer:

- How much revenue did we make?
- Where is the funnel leaking?
- How much recoverable checkout value exists?
- Which sources are worth attention?
- Which products have demand?
- Which customers are coming back?
- What needs action today?

API:

- `app/api/admin/dashboard/route.ts`

## Intelligence

Current status:

- Behavioral Intelligence is disabled to reduce Neon database load.
- The admin navigation no longer links to it.
- `app/admin/(dashboard)/intelligence/page.tsx` redirects to Dashboard.
- `app/api/admin/intelligence/route.ts` returns an empty disabled response.

Purpose:

- Customer journey feed and behavioral signals.
- India-specific view is useful here because the main selling focus is India.

Should include:

- sessions
- hot leads
- at-risk sessions
- coupons claimed
- checkouts started
- section performance
- journey/feed events

API:

- `app/api/admin/intelligence/route.ts`

India view should not go empty just because older behavioral rows lack clean
geo data. Explicit India signals still win, but unknown-country behavioral
sessions are allowed into the India view until collection quality improves.

## Checkouts CRM

Purpose:

- Recover abandoned checkout value.

Primary table:

- `checkout_drafts`

Lead workflow:

- `new`
- `contacted`
- `replied`
- `converted`
- `lost`

Admin recovery fields:

- lead status
- lead notes
- last contacted time
- next follow-up time

Actions should stay visible without hover-only behavior.

Message actions should support:

- WhatsApp
- Email
- Copy
- Mark contacted
- Promote/convert to order where appropriate

## Cart Leads

Purpose:

- Find visitors with product intent before or without a full checkout.

Data sources:

- `cart_events`
- `coupon_code_events`
- `checkout_drafts`
- `orders`
- `session_intelligence`

Important behavior:

- Cart leads can be exact session matches.
- They can also be inferred matches through contact data, product overlap, and
  activity timing.
- This was added because real users can appear split across coupon/cart/checkout
  sessions.
- Cart Leads should display a combined lead journey when multiple cart sessions
  point to the same checkout draft, phone, email, or coupon contact. Do not show
  one human as multiple separate leads just because they rebuilt a kit or
  restarted the cart flow.
- For anonymous kit builders, repeated checkout-started rows for `Custom 4 x
  20ml Kit` can be merged by product-intent fallback even when IP/user-agent
  fingerprints differ. This is useful in early traffic where kit rebuilds are
  more likely one buyer experimenting than many unrelated buyers at once.
- Repeated add-to-cart events inside a combined journey are intent signals, not
  cumulative cart value. Cart Leads should show the best current basket value:
  checkout draft grand total when available, otherwise the strongest/latest cart
  value estimate. Do not turn three rebuild attempts for one `799` kit into
  `2397` recoverable value.
- Welcome-back rewards (`WELCOME-BACK-5` / `WELCOME-BACK-10`) are not normal
  coupon leads. They are recorded through cart event payloads and checkout
  reward-detected events. Admin Cart Leads should show original value,
  discounted value, reward label, and discount amount when this reward evidence
  exists.

Use cases:

- Coupon claimed but no cart.
- Cart added but no checkout.
- Checkout started.
- High value cart.
- Repeat/customer-linked intent.

## Coupon Leads

Purpose:

- Turn email/WhatsApp coupon claims into follow-up opportunities.

Coupon leads should connect forward to:

- cart activity
- checkout drafts
- orders

Do not treat a coupon lead as isolated if the same phone/email or same product
intent appears elsewhere.

## Customers

Purpose:

- CRM history for repeat buyers and customer lifetime value.

Customer view should show:

- contact details
- orders
- total revenue/lifetime value
- last order
- repeat purchase signals
- message actions for WhatsApp/email

Repeat customer automation should wait until order history is clean.

## Orders

Purpose:

- Operational fulfillment and revenue tracking.

Orders should preserve:

- status
- customer details
- cart snapshot
- totals
- coupon
- source/UTM attribution

Order status work should help move active orders from WhatsApp/processing/shipped
to delivered or cancelled.

## Message Templates

Implementation:

- `lib/admin-message-templates.ts`

Templates:

- `coupon_no_cart`
- `cart_no_checkout`
- `checkout_abandoned`
- `high_value_cart`
- `repeat_customer`

Admin messages should be one-click but tailored. They should include useful
context like product names, value, coupon code, checkout field, order count, or
last order number when available.

## Schema Health

Missing migrations should not crash admin with raw SQL errors.

Relevant API:

- `app/api/admin/schema-health/route.ts`

Important history:

- `checkout_drafts` once errored because code expected lead recovery and UTM
  columns before the active database had them.
- Admin pages should show a clear sync/migration message where possible.

## Security

Before serious traffic:

- Rotate any credentials that were exposed during development.
- Secure admin APIs.
- Keep admin auth enforced.
- Avoid leaking raw database errors to the admin UI.
- Review export routes and mutation APIs.
