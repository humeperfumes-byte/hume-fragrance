# HUME Fragrance Living Context

This file is the first place to read when context is lost.

It captures the business intent, technical decisions, and current direction of
the HUME Fragrance website/admin system. Detailed implementation notes live in
the feature-specific README files.

## Business Direction

HUME Fragrance is an India-focused ecommerce brand selling premium
luxury-inspired perfumes at accessible pricing.

The product positioning is:

- inspired perfumes
- affordable premium feel
- Indian buyer focus
- WhatsApp-friendly sales and recovery
- clean, sharp, modern storefront
- admin panel as a daily operating system

The goal is to build HUME into a serious brand and eventually a large business.

## Current Priorities

Near-term priorities:

- improve conversion from homepage to cart to checkout
- make cart and checkout feel trustworthy, fast, and premium
- recover abandoned cart/checkout leads
- keep admin operational and useful every day
- collect only useful customer data
- keep infrastructure cost low while traffic is early

Later priorities:

- prediction and automation
- ML lead scoring
- source ROI forecasting
- product demand forecasting
- automatic lead follow-up

Important rule:

- ML/automation should come after clean historical data, not before it.

## Storefront Direction

The storefront should sell directly, not only create a luxury mood.

Design direction:

- clean and sharp
- premium but mass-appeal
- not over-decorated
- mobile-first conversion
- simple product cards
- clear add-to-cart behavior
- no confusing hover-only actions

The frontend is sensitive because a lot of work has gone into it. Do not touch
major storefront sections without reviewing the user request and keeping changes
scoped.

Homepage video direction:

- a three-item video carousel lives below the collection section
- current videos use local HUME packaging and unboxing clips from
  `public/videos`
- keep videos muted, performance-conscious, and synced to the carousel progress

## Cart Direction

The cart is a right-side drawer, not a full cart page.

Cart priorities:

- compact premium sidebar design
- clear product rows
- visible quantity controls
- easy removal
- gift progress bar
- offer section with applied and available coupon rows
- checkout as the primary action
- no unnecessary continue-shopping CTA

The cart includes a special return-visitor offer system:

- 2nd visit can unlock 5% extra off
- 4th visit can unlock 10% extra off
- 10% replaces 5% when it becomes available
- the return-visitor discount stacks with coupons and gifts
- the offer shows a 24-hour countdown banner
- the offer uses a celebration animation
- discounted prices animate from old price to new price

Current user preference:

- the offer banner should be short and emotionally teasing
- do not show too much explanatory text
- focus the customer on the discount and urgency

## Checkout Direction

The current checkout flow is considered mostly good.

Checkout should:

- show packaging/product expectation clearly
- preserve gift images correctly
- save checkout drafts
- preserve UTM/source fields
- convert checkout drafts into orders
- keep WhatsApp as an important fallback/sales channel
- support Razorpay Standard Checkout with backend order creation, signature
  verification, and webhooks for reliable payment confirmation

Current Razorpay handoff:

- see `docs/checkout/RAZORPAY_HANDOFF_2026-05-18.md`
- local env is live-mode, but production also needs matching Vercel env vars
- webhook setup should use `/api/razorpay/webhook` with only payment/order
  events needed for the checkout flow

Avoid large redesigns unless requested.

## Admin Direction

Admin should be minimal, sans-serif, and operational.

It should feel like a daily operating system, not decorative analytics.

Core admin views:

- Dashboard: revenue, funnel, abandoned value, source quality, product demand
- Intelligence: currently disabled to reduce Neon database load
- Checkouts: abandoned checkout CRM
- Cart Leads: cart/coupon/checkout connected leads
- Coupon Leads: coupon claim follow-up opportunities
- Orders: fulfillment and revenue tracking
- Customers: repeat buyers and lifetime value

Admin must support:

- India vs All market view for Dashboard
- date windows such as last 24 hours, 2 days, 3 days, 5 days, 10 days, etc.
- owner/admin traffic filtering
- visible actions, not hover-only actions

Admin pages should not include owner testing data in daily metrics.

## Analytics Direction

Analytics should support selling, not create expensive noise.

Current cost-control decision:

- do not run heavy behavioral intelligence during normal browsing
- unlock behavioral intelligence only after buying intent
- buying intent includes add to cart, cart open with items, coupon request/apply,
  checkout start, or similar strong actions
- do not track empty cart opens as intent
- slow batching is preferred over real-time raw behavior collection

Reason:

- Neon cost became too high because analytics created too many database writes
- early-stage business data should focus on sales signals first

Keep:

- cart events
- checkout drafts
- orders
- coupons
- source/UTM data
- useful lead signals

Reduce:

- scroll tracking
- hover tracking
- section dwell tracking
- repeated behavior writes before intent

## Database Direction

Current database is Neon/Postgres with Drizzle.

Cost concern:

- Neon bill reached roughly 12-15 USD
- likely cause was heavy analytics writes and admin polling
- analytics has been changed to intent-gated mode to reduce cost

Migration discussion:

- Supabase is possible because it is also Postgres
- migration should be delayed until after monitoring Neon usage after cost fixes
- do not migrate only because of one billing period
- keep Neon active for 7-14 days if migration happens

Preferred migration strategy if needed:

- migrate schema carefully
- selectively migrate business data
- avoid carrying noisy old analytics data unless needed

## SEO / Domains

Domains discussed:

- humefragrance.in
- humefragrance.com

Current direction:

- keep both working for now
- `.in` was ranking well in Google, so avoid immediate redirect-only strategy
- build sitemap/SEO support for both
- later decide canonical/redirect strategy after SEO settles

AI SEO / AEO direction:

- keep `robots.txt` open for useful crawlers such as Googlebot, GPTBot,
  OAI-SearchBot, PerplexityBot, ClaudeBot, and CCBot
- maintain `/llms.txt` and `/llms-full.txt` for model-readable brand/product
  facts
- make answer-first recommendation pages for high-intent queries
- keep product schema rich with price, shipping, returns, reviews, notes, size,
  and canonical product URLs
- build backlinks from real perfume creators, Google Business Profile, social
  profiles, local Kannauj/business directories, press, and useful fragrance
  content
- avoid spammy paid backlinks

## Operating Rule For Future Work

When changing a flow, update the matching docs:

- cart changes: `docs/cart/README.md`
- checkout changes: `docs/checkout/README.md`
- admin changes: `docs/admin/README.md`
- analytics/data changes: `docs/analytics/README.md` or `docs/data/README.md`
- high-level direction changes: this file

The docs are implementation memory, not marketing copy.
