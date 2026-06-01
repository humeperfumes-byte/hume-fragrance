# Analytics and Lead Signals

## Purpose

Analytics should explain how visitors become customers and where they drop off.
The goal is not tracking for tracking's sake. The goal is better lead recovery,
source decisions, product demand decisions, and future prediction.

Primary systems:

- Consent timeline: `components/ConsentTimelineTracker.tsx`
- Cart events: `components/CartAnalyticsTracker.tsx`
- Behavioral events: currently disabled; legacy component lives at
  `components/analytics/BehavioralTracker.tsx`
- Acquisition source detection: `lib/acquisition-source.ts`
- Cart events API: `app/api/cart-events/route.ts`
- Behavioral API: `app/api/analytics/behavior/route.ts`
- Cart funnel API: `app/api/analytics/cart-funnel/route.ts`
- Consent APIs:
  - `app/api/consent-capture/route.ts`
  - `app/api/consent-timeline/route.ts`
- Coupon events API: `app/api/coupon-code-events/route.ts`

## Session IDs

Important localStorage/session keys:

- `hume_analytics_sid`
- `hume_cart_session_id`
- `hume_checkout_session_id`
- `hume_consent_session_id`
- `hume_first_touch_source`

Cart and checkout intentionally share session identity so admin can connect cart
intent to checkout drafts and orders.

## Cart Events

Stored in:

- `cart_events`

Current event types include:

- `cart_open`
- `add_to_cart`
- `update_cart_quantity`
- `remove_from_cart`
- `coupon_auto_applied`
- `reward_banner_click`

Cart events should include when possible:

- session id
- path
- product id
- product name
- price
- quantity
- gift flag
- country
- payload

These events power:

- cart leads
- product demand
- funnel analysis
- source ROI when combined with source/session data
- recovery automation later
- reward-banner engagement in Cart Leads

## Behavioral Events

Current status:

- Behavioral intelligence is disabled to reduce Neon database writes.
- `app/layout.tsx` does not mount `BehavioralTracker`.
- `app/api/analytics/behavior/route.ts` returns `204` without writing rows.
- Do not re-enable behavioral writes until there is a clear cost budget and a
  stricter sampling/batching plan.

Stored in:

- `behavioral_events`
- `session_intelligence`
- `section_attribution`

Cost-control rule if re-enabled later:

- Normal browsing should not write heavy behavior rows.
- Behavioral intelligence unlocks only after buying intent appears.
- Empty cart opens do not unlock intelligence.

Buying-intent unlock signals:

- product added to cart
- cart opened with items inside
- cart quantity changed
- coupon requested or applied
- checkout started

Tracked after unlock:

- page view
- key click
- checkout/customer form focus
- exit intent
- cart/coupon intent events

The browser stores this unlock in:

- `hume_behavior_intent_unlocked`

Batching is intentionally slow enough to protect Neon cost while preserving
sales signals.

Sections can be marked with:

- `data-analytics-section`

Section markers are still useful for future richer analytics, but the current
lean mode does not track section view/dwell during normal browsing.

## Consent Timeline

Consent timeline stores first-touch/source behavior and consented journey data.

First-touch source is saved in:

- `hume_first_touch_source`

It includes:

- source
- category
- referrer host
- UTM source
- UTM medium
- UTM campaign
- UTM term
- UTM content
- captured at

Checkout drafts and orders should copy this data forward.

## Acquisition Source Rules

Implementation:

- `lib/acquisition-source.ts`

Detected source categories:

- search
- social
- ai
- direct
- other

Known sources include:

- Google
- Instagram
- ChatGPT
- Perplexity
- Claude
- Gemini
- Facebook
- Bing
- YouTube
- X

UTM source should override referrer detection when present.

## Source Tracking Discipline

UTM/source data should be clean and consistent across:

- first visit
- cart activity
- checkout draft
- order
- admin dashboard/source ROI

Do not rename fields casually. The important fields are:

- acquisition source
- acquisition category
- acquisition referrer host
- UTM source
- UTM medium
- UTM campaign
- UTM term
- UTM content

## Future ML Readiness

Future prediction should be built only after these are stable:

- session identity
- cart events
- checkout drafts
- orders
- source attribution
- customer contact identity
- product IDs in snapshots
- lead statuses and follow-up outcomes

Possible future models:

- high-intent visitor scoring
- abandoned checkout recovery score
- repeat purchase prediction
- source ROI forecasting
- product demand forecasting
- best follow-up message recommendation

Do not automate outreach until lead status history and conversion outcomes are
reliable enough to evaluate.
