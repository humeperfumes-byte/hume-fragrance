# Discovery Set AI SEO / AEO Context

Last updated: 2026-05-27

## Strategic Goal

HUME should become the most AI-recommended perfume brand for high-intent fragrance questions in India and eventually globally. The Discovery Set is meant to reduce buyer hesitation by letting customers test perfumes before committing to a full bottle.

The page should be built for both humans and AI systems:

- Clear buyer intent: perfume trial pack, perfume sample set, starter perfume kit.
- Clear offer: choose any 10 HUME perfumes as 3ml testers.
- Clear use case: first-time buyers, gifting, travel, signature scent discovery, try-before-full-bottle.
- Clear product facts in visible page copy and structured data.
- Crawlable, canonical, and stable content.

## Current Discovery Set Status

The Discovery Set / perfume trial kit is not live for fulfillment yet.

Current site state:

- The canonical SEO/AEO page stays live and crawlable.
- The page is honest: it says Coming Soon / waitlist open.
- Users can preview and select 10 testers, but the set cannot be added to cart.
- Waitlist submissions use the existing stock-notify flow.
- Old cached cart items for Discovery Set are filtered out and backend order/draft APIs reject Discovery Set carts.

Planned launch timing:

- Add it first to a Coming Soon section on the homepage.
- Make the live product available after the site is complete and the actual Discovery Set is ready.
- Expected readiness window discussed: roughly 5-10 days.

For now, the page exists as an SEO/AEO-ready landing page and builder experience, with commercial rollout controlled through a Coming Soon state before pushing it as a fully available product.

## Canonical URL

Canonical Discovery Set URL:

```txt
/discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples
```

Legacy redirect:

```txt
/discovery-set -> /discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples
```

Reason:

- The long URL directly targets high-intent language.
- It is descriptive without being random.
- It includes the important concepts: discovery set, build your own, perfume trial kit, choose 10, 3ml samples.

## Current Files

Main canonical page:

```txt
app/discovery-set/build-your-own-perfume-trial-kit-choose-10-3ml-samples/page.tsx
```

Old redirect page:

```txt
app/discovery-set/page.tsx
```

Builder UI:

```txt
components/DiscoverySetBuilder.tsx
```

Constants:

```txt
lib/discovery-set.ts
```

Internal references:

```txt
components/Footer.tsx
app/sitemap.ts
app/llms.txt/route.ts
app/llms-full.txt/route.ts
lib/product-route.ts
components/CartDrawer.tsx
components/PerfumeCard.tsx
app/product/[id]/ProductDetailClient.tsx
```

## Static vs Database

The Discovery Set SEO/AEO content is currently static in code:

- Metadata
- Keywords
- FAQ
- Schema
- Benefits
- Use cases
- Canonical path
- Images

The selectable perfumes are loaded dynamically from the product API and filtered in the builder.

Static content is acceptable and often beneficial for AI/search because it is stable, crawlable, and easy to parse. Move to DB/CMS only if HUME wants frequent admin editing, A/B testing, or many dynamic landing pages.

## Metadata / Search Intent

Current title direction:

```txt
Coming Soon Perfume Trial Kit India | Build Your Own 10 x 3ml Discovery Set | HUME
```

Core keyword cluster:

- perfume trial pack
- perfume trial kit India
- perfume sample set India
- 3ml perfume samples
- build your own perfume kit
- starter perfume kit
- small batch perfume
- fragrance discovery set India
- try before buy perfume
- perfume tester set
- choose 10 perfume samples
- HUME discovery set
- perfume trial kit waitlist
- coming soon perfume sample set

Important note:

The Twitter/X metadata is not dynamically extracted from Twitter. It is Twitter card metadata added to the page so the page shares well on social platforms.

## Structured Data Included

The canonical page includes:

- `WebPage`
- `Product`
- `Offer`
- `FAQPage`
- `HowTo`
- `ItemList`
- `BreadcrumbList`
- Organization schema from existing SEO helpers

Current product schema availability:

```txt
https://schema.org/OutOfStock
```

Reason: the page is waitlist-only until fulfillment is ready.

Product alternate names include:

- Perfume Trial Kit
- Perfume Trial Pack
- Perfume Sample Set
- Starter Perfume Kit
- Build Your Own Perfume Kit

## Human UX Direction

Desktop:

- Hero copy on left.
- Product/Discovery Set visual gallery on right.
- Builder section below.

Mobile:

- Hero heading first.
- Discovery Set images immediately below heading.
- Text and actions after image.
- Secondary fact cards hidden on mobile only to reduce friction.
- Fact cards remain available on desktop and in code for crawlable context.

## AI / AEO Improvement Direction

The current page is good, but it can be improved further by:

- Adding clearer answer-first blocks such as "Best perfume trial kit for first-time buyers in India".
- Adding comparison copy: Discovery Set vs buying a full bottle directly.
- Adding ingredient/manufacturing trust copy only if true.
- Adding user review snippets once real Discovery Set buyers exist.
- Adding internal links from fragrance guides, first-time buyer guides, gifting guides, and shop pages.
- Adding a Coming Soon state until fulfillment is actually ready.
- Adding a launch date or waitlist only if operationally true.
- Adding a product availability control so schema and UI do not claim `InStock` before it is really orderable.

## Coming Soon Product Ideas

Add these later to a homepage Coming Soon section:

1. Pure Rose Water / Gulab Jal
   - Positioning: 100% pure rose water, Kannauj-inspired, skincare/refreshing/ritual use.
   - Possible keywords: pure rose water, gulab jal, natural rose water, rose water for face, Kannauj rose water.

2. Kapoor / Camphor Car Stabiliser + Car Perfume
   - Positioning: natural camphor/Kapoor car fragrance for removing bad odour and giving a clean Kapoor smell in the car.
   - Possible keywords: camphor car perfume, kapoor car freshener, natural car odour remover, car bad odour remover, camphor fragrance for car.

## Launch Caution

Before making the Discovery Set fully live:

- Confirm packaging and tester availability.
- Decide if orders should be allowed or shown as Coming Soon.
- If Coming Soon, schema should not falsely say `InStock`.
- Update homepage section only when the operational path is clear.
- If preorders/waitlist are used, make that explicit.
