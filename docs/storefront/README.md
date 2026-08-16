# Storefront Flow

## Purpose

The storefront should convert perfume visitors into buyers. It should make the
offer clear quickly, show products with confidence, and move users toward cart,
checkout, or WhatsApp help.

Primary files:

- Home: `app/page.tsx`
- Header: `components/Header.tsx`
- Hero: `components/Hero.tsx`
- Best sellers: `components/BestsellerSection.tsx`
- HUME special: `components/HumeSpecialSection.tsx`
- Collection: `components/Collection.tsx`
- Product card: `components/PerfumeCard.tsx`
- Shop page: `app/shop/page.tsx`
- Shop content/filtering: `app/shop/ShopContent.tsx`
- Product detail: `app/product/[id]/ProductDetailView.tsx`
- Product purchase box: `app/product/[id]/ProductDetailClient.tsx`

## Homepage Order

Current home order in `app/page.tsx`:

1. Header
2. Hero
3. Best sellers
4. HUME special
5. Collection
6. Kit pack
7. Refill program
8. Reviews
9. FAQ
10. SEO hub teaser
11. Craft
12. Journal
13. About
14. Footer

Important history:

- The first screen was rewritten to sell directly, not only create luxury mood.
- On mobile, hero image appears first and the gap below the navbar was tightened.
- Reviews were moved back near their earlier position.
- HUME special should sit below best sellers and above collection.
- Collection should show products ordered by real signals where possible:
  orders, revenue, add-to-cart, product clicks, product views, and badge boosts.

## Hero

Implementation:

- `components/Hero.tsx`
- Hero slides load from `getImagesByUsage("hero")`.
- Fallback slides exist for safety.
- Offer copy is region-aware through `lib/geo.ts`.

Hero intent:

- First-viewport message should immediately say what HUME sells.
- Main offer should be clear: premium inspired perfumes without designer prices.
- Primary CTA should point to best sellers.
- Secondary CTA should point to all perfumes.
- Trust points should stay light and readable, not bulky badge cards.

Do not:

- Turn the hero into vague luxury-only mood copy.
- Add a heavy loading video before the page unless performance is carefully
  tested and the user approves.

## Product Cards

Implementation:

- `components/PerfumeCard.tsx`

Current behavior:

- Product image links to product detail.
- Add button is a premium glassmorphic plus button on the bottom-right of image.
- Product click dispatches `product_click` through `hume:tracking`.
- Add button calls cart context and dispatches `add_to_cart`.

Design memory:

- A text-heavy add-to-cart button was rejected.
- A cheap-looking glass button was rejected.
- The accepted direction is small, sleek, square/rounded glassmorphism with a
  white plus, placed over the product image without hiding important product art.

## Shop All

Implementation:

- `app/shop/page.tsx`
- `app/shop/ShopContent.tsx`

Shop all should:

- Show all public products.
- Support filtering by selection, nature, gender, occasion, and celebrity.
- Keep mobile filters easy to open and close.
- Use the same `PerfumeCard` behavior so tracking and cart actions stay unified.

## Product Detail

Implementation:

- `app/product/[id]/ProductDetailView.tsx`
- `app/product/[id]/ProductDetailClient.tsx`

Product detail should:

- Show product imagery, notes, inspiration, price, reviews, and trust signals.
- Keep `Add to Bag` obvious.
- Offer WhatsApp as a help/order path.
- Show delivery/payment/trust clarity near the CTA.
- On mobile, keep a sticky bottom purchase bar.

Conversion priorities:

- Make blind-buy confidence stronger.
- Keep reviews close enough to product decision points.
- Make WhatsApp help feel easy, not like a fallback.
- Avoid confusing claims that are not backed by database/product data.

## Removed/Deprioritized Areas

## Raksha Bandhan Gift Boxes

Implementation:

- Page: `app/raksha-bandhan-gifts/page.tsx`
- Interactive box selector: `components/RakshaBandhanGiftPage.tsx`

Current offer has four cart-ready variants:

- Him or Her Essential box: one HUME-curated perfume, Pure Gulab Jal, chosen
  Rakhi, and gift presentation for INR 1,299.
- Him or Her Grand box: two HUME-curated perfumes, Pure Gulab Jal, chosen Rakhi,
  and gift presentation for INR 1,999.

The exact perfume lineup remains intentionally unspecified until HUME finalizes
it. Do not hardcode perfume names or imply that representative imagery confirms
the final bottles. The customer's Rakhi choice is preserved in the cart item's
kit selections.

The final campaign video is `/videos/raksha-bandhan-hero.mp4`. It plays behind
the Raksha Bandhan hero and once as a global public-storefront opening overlay
after a fresh load or refresh. The overlay does not replay during client-side
navigation, excludes `/admin`, includes Skip, and has a safety timeout.

Personalised bottle section:

- User decided to remove it from the site.
- Do not reintroduce it without explicit approval.

Video loading idea:

- A perfume spray video can be useful as a section or lightweight muted hero
  element, but a blocking preloader risks performance and conversion.
- Prefer optimized inline video only after image LCP is safe.
