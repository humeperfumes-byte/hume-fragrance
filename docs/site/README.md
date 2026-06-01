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

SEO/domain helpers:

- `lib/site.ts` defines the supported HUME hosts and URL builders.
- `lib/request-site.ts` reads the current request host and returns the matching
  public base URL.
- `app/sitemap.ts` and `app/robots.ts` are host-aware. A `.in` request must
  return `.in` URLs, and a `.com` request must return `.com` URLs.
- Page-level structured data and important canonicals should use the request
  base URL instead of hardcoding one domain.

Global wrappers:

- Root layout: `app/layout.tsx`
- Providers: `app/providers.tsx`
- Cart state: `context/CartContext.tsx`
- Global cart drawer: `components/CartDrawer.tsx`
- Global analytics trackers:
  - `components/ConsentTimelineTracker.tsx`
  - `components/CartAnalyticsTracker.tsx`
  - `components/analytics/BehavioralTracker.tsx` exists but is currently not
    mounted because behavioral intelligence is disabled for Neon cost control

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

## Domain Strategy

HUME currently supports both `humefragrance.com` and `humefragrance.in`.

- Do not redirect `.in` to `.com` while `.in` is ranking and being evaluated in
  Search Console.
- Submit `https://www.humefragrance.in/sitemap.xml` in the `.in` Search Console
  property after deployment.
- Submit/keep `https://www.humefragrance.com/sitemap.xml` in the `.com` Search
  Console property.
- If the brand later chooses one permanent domain, redirect the other domain only
  after the chosen domain has stable indexing and clean Search Console signals.

## AI SEO / AEO

AI-search crawlability should be treated as a product discovery surface.

Current AI SEO assets:

- `app/robots.ts` allows major useful crawlers including Googlebot, GPTBot,
  OAI-SearchBot, PerplexityBot, ClaudeBot, Meta, and CCBot.
- `app/llms.txt/route.ts` provides a short model-readable brand map.
- `app/llms-full.txt/route.ts` provides live product facts, notes, prices,
  reviews, FAQs, and citation preferences.
- `app/fragrance-guides/page.tsx` links guide and recommendation clusters.
- `app/recommendations/[slug]/page.tsx` contains answer-first recommendation
  pages for high-intent perfume questions.
- `app/search/page.tsx` exists so WebSite SearchAction schema points to a real
  crawlable search route.

Entity/schema rules:

- Organization schema must use the real Instagram profile:
  `https://www.instagram.com/hume.perfume/`.
- Product schema should include price, INR currency, availability, shipping,
  return policy, SKU, size, notes, reviews, and canonical product URL.
- Recommendation pages should begin with a direct answer and then link to
  canonical product pages.

Backlink strategy:

- Prioritize real mentions from perfume creators, Google Business Profile,
  Instagram/YouTube captions, local Kannauj/business directories, fragrance
  blogs, useful Reddit/Quora answers, and press.
- Avoid spammy paid backlinks because they can hurt search trust.
