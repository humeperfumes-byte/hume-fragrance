# Site Overview

## Purpose

The site is the full ecommerce system for HUME Fragrance:

- Storefront for selling inspired perfumes.
- Cart and checkout flow for converting visitors.
- Lead capture and recovery through coupons, cart signals, checkout drafts, and
  WhatsApp/email follow-up.
- Admin panel for daily operations and growth decisions.
- Analytics foundation for future prediction and automation.

The public brand should stay direct and sales-focused. The site can feel premium,
but it should not become only a luxury mood board. The customer must quickly
understand:

- What is being sold.
- Why it is good value.
- What offer or trust reason helps them buy now.
- How to add to cart, checkout, or ask on WhatsApp.

## Application Shape

Main app router areas:

- Home: `app/page.tsx`
- Shop all: `app/shop/page.tsx`
- Product detail: `app/product/[id]/page.tsx`
- Checkout: `app/checkout/page.tsx`
- Admin: `app/admin/(dashboard)/*`
- APIs: `app/api/*`
- SEO/programmatic pages: `app/(programmatic)/*`, `app/(seasonal-seo)/*`

Global wrappers:

- Root layout: `app/layout.tsx`
- Providers: `app/providers.tsx`
- Cart state: `context/CartContext.tsx`
- Global cart drawer: `components/CartDrawer.tsx`
- Global analytics trackers:
  - `components/ConsentTimelineTracker.tsx`
  - `components/CartAnalyticsTracker.tsx`
  - `components/analytics/BehavioralTracker.tsx`

## Global Runtime Flow

1. `app/layout.tsx` loads fonts, metadata, SEO defaults, providers, and trackers.
2. `Providers` wraps the site with theme, tooltip, cart state, toasts, and the
   cart drawer.
3. Public pages render storefront content.
4. User actions dispatch `hume:tracking` events.
5. Trackers persist cart, behavioral, consent, and source signals into API routes.
6. Checkout autosaves draft details and UTM/source data.
7. Orders preserve cart, coupon, source, and customer data.
8. Admin reads this historical data and turns it into daily operating views.

## Brand and UX Principles

Public storefront:

- Clean, sharp, premium, and easy to buy from.
- Serif display type is allowed on brand/home/product surfaces.
- Buttons and CTAs must be obvious and conversion-focused.
- Mobile matters heavily.
- The product, price, offer, delivery, trust, and WhatsApp path should never be
  hidden behind vague luxury copy.

Admin:

- Minimal, sans-serif, professional, and work-focused.
- No cursive or decorative typography.
- Metrics should support daily action, not just look interesting.
- Detail views should make follow-up easier: who to contact, why, with what
  message, and what value is at risk.

## Business Memory

The site is being built toward a larger brand and serious analytics operation.
Every new feature should help one of these loops:

- Visitor to product click.
- Product click to add to cart.
- Cart open to checkout.
- Checkout draft to WhatsApp/order.
- Order to repeat customer.
- Data signal to admin decision.
- Admin decision to better storefront/offer/follow-up.

Do not add automation before the data is trustworthy.
