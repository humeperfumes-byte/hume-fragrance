# Storefront Flow

## Pacific Chill — October 1, 2026

Pacific Chill uses the existing public product layout with sold-out purchase
controls and stock notifications. The page and FAQ schema use product-specific
answers from `lib/pacific-chill.ts`, distinguish HUME from Louis Vuitton, cite the
official inspiration, and disclose temporary imagery. Stock status is included
in `/llms-full.txt`; placeholder brand imagery is excluded from the merchant feed
and product image schema until real photographs are added through admin.

## Night Out — October 1, 2026

Night Out is restored as a public but sold-out product. Existing sold-out controls
disable purchase and provide stock notifications. Homepage stock filtering keeps
it out of available-product sections; the Shop page can show its sold-out card.
`lib/night-out.ts` holds the initial data and specific buyer FAQs, used by both
visible FAQs and structured data. The product page adds an inspiration reference
and identifies temporary imagery. `/llms-full.txt` now explicitly reports each
product's stock status so unavailable perfumes are not described as purchasable.
Images remain an admin task; do not replace existing perfumes or manufacture
reviews/performance evidence while preparing Night Out.

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

Althair has a canonical product page with original Parfums de Marly Althair inspiration context and matching FAQs. Until Admin photography is added, the logo is disclosed as a placeholder and omitted from Product image schema and the merchant feed. Availability remains OutOfStock.

Angels Share includes Kilian inspiration context, FAQs and OutOfStock structured data. Its logo placeholder is disclosed and excluded from Product image schema and the merchant feed until actual product photos are added.

Hugo Boss Man references the HUGO Man inspiration with FAQs and OutOfStock schema. Its historical Hugo Boss URL redirects to the new canonical name. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photos are added.

Most Wanted includes The Most Wanted Parfum inspiration context, FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Her references the original Burberry Her Eau de Parfum with FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photos are added.

J'adore includes Dior Eau de Parfum inspiration context and FAQs. Reference floral notes are grouped for browsing, not asserted as a verified progression. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until actual photography is added.

Eros references Versace Eros Eau de Parfum with FAQs and OutOfStock schema, separately from Eros Flame. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

1 Million references Rabanne 1 Million Eau de Toilette with FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

La Nuit references YSL La Nuit de L'Homme Eau de Toilette with FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Tobacco Vanille references Tom Ford's inspiration profile with FAQs and OutOfStock schema. Reference notes are grouped for browsing rather than a verified progression. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Noir Extreme references Tom Ford Noir Extreme Eau de Parfum with FAQs and OutOfStock schema. Reference notes are grouped for browsing rather than a verified progression. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Bright Crystal references Versace's original Eau de Toilette with FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Goddess references Burberry's original Eau de Parfum with FAQs and OutOfStock schema. Reference vanilla and lavender themes are grouped for browsing rather than a verified progression. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Invictus references the original Rabanne Eau de Toilette with FAQs and OutOfStock schema. The disclosed logo placeholder is excluded from Product image schema and the merchant feed until real photography is added.

Strong With You content cluster: /guides indexes 15 distinct guides from lib/perfume-guides.ts. Guides render answers, FAQs, Article/FAQPage/Breadcrumb schema, live database price and size, product and Discovery Set links. Approximately 40% oil is a user-provided HUME specification; no measured longevity or similarity is asserted. The product links to the cluster and the sitemap includes all guide URLs. Published source date: 2026-10-02.

### Acqua di Gio guide cluster
The `/guides` index now groups 15 Acqua di Gio guides and 15 Strong With You guides. `lib/perfume-guides.ts` owns each cluster's product identity and official inspiration reference; the shared route uses that identity for live product cards, stock, price, related guides and shopping links. Acqua di Gio uses the HUME-provided approximately 40% fragrance-oil specification, with no invented performance or similarity figures. The Profondo comparison includes a factual table; the alternatives guide links live fresh-product routes. All 30 guides are included in the sitemap. Product pages link back to their guides. No catalog rows are changed by this content feature.

### Aventus guide cluster
Added 15 Aventus guides in `lib/aventus-guides.ts`, registered through `lib/perfume-guides.ts`. The guide index groups all 45 topics across Aventus, Acqua di Gio and Strong With You; sitemap entries follow the registry. Aventus resolves to `creed-aventus`, uses Creed's official inspiration reference and affiliation disclosure, and displays live product price, photo, size and stock. The original comparison contains a factual table; the alternatives page links live Sauvage, Acqua di Gio and Viking Spirit products and related existing guides. Approximately 40% fragrance oil is the user-provided HUME specification; no invented hours, similarity scores, independent reviews or batch findings. The product page links back to `/guides#aventus`. No catalog data writes are part of this feature.

### Black Opium guide cluster
Added 15 Black Opium guides in `lib/black-opium-guides.ts`, registered in `lib/perfume-guides.ts`. The index and sitemap now include 60 guides across four perfumes. Black Opium uses product `black-opium`, YSL's official Eau de Parfum reference and a YSL affiliation disclosure. Every guide displays live product photo, price, size, stock and a product-page shopping link plus Discovery Set and related articles. The direct comparison includes a factual table; alternatives link Good Girl, Libre Intense, Flora and Paradoxe with availability context. Approximately 40% fragrance oil comes from the user's HUME specification; review, longevity and similarity pages disclose evidence limits. The product links back to `/guides#black-opium`. No product records are modified.

### Good Girl guide cluster
Added 15 Good Girl guides in `lib/good-girl-guides.ts`, registered in `lib/perfume-guides.ts`. The index and sitemap include 75 guides across five perfumes. Good Girl resolves to product `good-girl`, uses Carolina Herrera's official Eau de Parfum reference and designer-specific affiliation disclosure. Every guide includes the live product photo, price, size, availability, shopping link, Discovery Set and related guides. The direct comparison has a factual table; alternatives link Black Opium, Libre Intense, Paradoxe and Flora, plus existing Black Opium guides. Approximately 40% fragrance oil is the user-provided HUME specification. No invented hours, similarity scores, independent reviews or comparison findings. The product links back to `/guides#good-girl`. Product data remains unchanged.

### Hawas guide cluster
Added 15 Hawas guides in `lib/hawas-guides.ts`, registered in `lib/perfume-guides.ts`. The index and sitemap contain 90 guides across six perfumes. Hawas resolves to product `hawas` with Rasasi's original Hawas for Him reference and affiliation disclosure. Guides include the live photo, price, size, stock, purchase-page link, Discovery Set and related articles. The direct comparison has a factual table; alternatives link Hawas Ice, Acqua di Gio, Sauvage, Aventus and Ultra Male with availability context, plus existing Acqua di Gio and Aventus guides. Approximately 40% fragrance oil is HUME's user-provided specification. College and gym advice uses conservative trial application rather than invented tested spray counts. No invented longevity, similarity scores or wear-test results. The product links back to `/guides#hawas`. No product records are modified.

### Imagine guide cluster
Added 15 Imagine guides in `lib/imagine-guides.ts`, registered in `lib/perfume-guides.ts`. The index and sitemap contain 105 guides across seven perfumes. Imagine resolves to existing product `lv-imagination`, with Louis Vuitton's official Imagination reference and affiliation disclosure. Guides include live product photo, price, size, availability, shopping link, Discovery Set and related articles. The direct comparison includes a factual table; alternatives use the shared catalog to link Acqua di Gio, Aventus, Sauvage, Pacific Chill and Myself, plus existing Acqua di Gio and Aventus guides. Approximately 40% fragrance oil is HUME's user-provided specification; no invented duration, similarity scores or wear-test findings. The product links back to `/guides#imagine`. Product data remains unchanged.

### Khamrah Qahwa guide cluster
Added 15 Khamrah Qahwa guides in `lib/khamrah-qahwa-guides.ts`, registered in `lib/perfume-guides.ts`. The index and sitemap contain 120 guides across eight perfumes. The cluster resolves to the existing `lattafa-khamrah-qahwa-100ml` ID but renders current customer-facing size from the product mapper, never from that legacy ID. It uses Lattafa's official Qahwa reference and affiliation disclosure. Guides include live photo, price, size, stock, purchase link, Discovery Set and related articles. The comparison has a factual table; alternatives link Black Opium, Strong With You, Most Wanted and Ultra Male from the shared catalog, plus existing related guides. Approximately 40% fragrance oil is HUME's user-provided specification; no invented duration, similarity scores or test findings. Content welcomes women and men by preference. The product links back to `/guides#khamrah-qahwa`. No product records are modified.

### Le Male Elixir guide cluster
Added 15 Le Male Elixir guides in `lib/le-male-elixir-guides.ts`, registered in `lib/perfume-guides.ts`. Index and sitemap contain 135 guides across nine perfumes. This cluster resolves to existing product `le-male-elixir`, with Jean Paul Gaultier's original Elixir Parfum reference and affiliation disclosure. Guides display live photo, price, size, availability, product shopping link, Discovery Set and related articles. The direct comparison includes a factual table, distinguishing the original's Parfum label from a verified numerical oil percentage. Alternatives link Strong With You, Most Wanted, Khamrah Qahwa, Ultra Male and Sauvage Elixir through the shared catalog, with existing related guides. Approximately 40% fragrance oil is HUME's user-provided specification; no invented duration, similarity scores or wear-test findings. The product links back to `/guides#le-male-elixir`. No product records are modified.

### Myrrh & Tonka guide cluster
Added 15 Myrrh & Tonka guides in `lib/myrrh-tonka-guides.ts`, registered in `lib/perfume-guides.ts`. Index and sitemap contain 150 guides across ten perfumes. This cluster resolves to existing product `myrrh-tonka`, with Jo Malone's official Cologne Intense reference and affiliation disclosure. Guides display live photo, price, size, availability, shopping link, Discovery Set and related articles. The direct comparison distinguishes the original's Cologne Intense name from a verified numerical oil percentage. Alternatives link Khamrah Qahwa, Oud Wood, Strong With You, Black Opium and Le Male Elixir through the shared catalog, plus existing related guides. Approximately 40% fragrance oil is HUME's user-provided specification; no invented duration, similarity scores or wear-test findings. Content welcomes women and men by preference and covers office, dates and formal use. The product links back to `/guides#myrrh-tonka`. No product records are modified.

### No 5 guide cluster

Added 15 No 5 buying guides referencing Chanel N°5 Eau de Parfum, with live product cards, comparison facts, related floral products, index and product backlinks, FAQ/Article metadata and automatic sitemap inclusion. Total: 165 guides across 11 perfumes. Claims distinguish HUME statements from verified testing; no database products changed. Local implementation only.

### Omb Leather guide cluster

Added 15 answer-first Omb Leather guides referencing Tom Ford Ombré Leather Eau de Parfum, with live product cards, related perfumes, comparison facts, product and index backlinks, FAQs and automatic sitemap inclusion. Total: 180 guides across 12 perfumes. No invented similarity or performance results. Local code only; no database changes.

### Ombre Nomade guide cluster

Added 15 answer-first Ombre Nomade guides with live product cards, related perfumes, comparison facts, product and index backlinks, FAQs and automatic sitemap inclusion. Total: 195 guides across 13 perfumes. Louis Vuitton official references support the original oud, benzoin, raspberry and incense direction. No invented performance results or original concentration; Purple Oud omitted because no existing product is available. Local code only; no database changes.

### Oud Wood guide cluster

Added 15 answer-first Oud Wood guides referencing Tom Ford Oud Wood Eau de Parfum, with live product cards, related perfumes, comparison facts, product and index backlinks, FAQs and automatic sitemap inclusion. Total: 210 guides across 14 perfumes. No invented similarity or performance results. Purple Oud omitted because no existing product is available. Local code only; no database changes.

### Red Tobacco guide cluster

Added 15 answer-first Red Tobacco guides referencing original Mancera Red Tobacco rather than Intense Red Tobacco, with live product cards, related perfumes, comparison facts, product and index backlinks, FAQs and automatic sitemap inclusion. Total: 225 guides across 15 perfumes. No invented similarity or performance results. Local code only; no database changes.

### Sauvage guide cluster

Added 15 answer-first Sauvage guides referencing Dior Sauvage Eau de Toilette, distinct from EDP, Parfum and Elixir. Live product cards, related perfumes, comparison facts, product and index backlinks, FAQs and automatic sitemap inclusion. Total: 240 guides across 16 perfumes. No invented performance results. Existing product data preserved; local code only.

### SRK Special guide cluster

Added the 15 primary SRK Special strategy pages, with live product cards, comparisons, related perfumes, index and product backlinks, FAQs and sitemap inclusion. Total: 255 guides across 17 perfumes. GQ original statement names Dunhill and Diptyque, not exact variants; HUME’s Tam Dao + Icon interpretation has no celebrity endorsement. Official Diptyque and Icon references linked. Additional celebrity and layering topics remain future ideas. No database changes; local code only.

### Terre de Hermes guide cluster

Added 15 answer-first Terre de Hermes guides using original Hermès Terre d’Hermès Eau de Toilette as the reference. Live product cards, related perfumes, comparison table, index and product backlinks, FAQs and sitemap inclusion. Total: 270 guides across 18 perfumes. Product confirmed at ₹799 / 50ml; no database changes. No invented performance or similarity results; local code only.

### The Blue guide cluster

Added 15 The Blue guides with live product cards, comparison table, FAQs, index and product backlinks, related perfumes and sitemap inclusion. Total: 285 guides across 19 perfumes. Existing listing does not specify a Chanel edition; official EDP reference provides context only. No product data changes or invented performance results. Local code only.

### Viking Spirit guide cluster

Added 15 Viking Spirit guides referencing original Creed Viking, distinct from Viking Cologne, with live product cards, comparisons, related perfumes, FAQs, index and product backlinks and sitemap inclusion. Total: 300 guides across 20 perfumes. No database changes or invented performance results; local code only.

### Y EDP guide cluster

Added 15 Y EDP guides referencing YSL Y Eau de Parfum, with live product cards, comparisons, related perfumes, FAQs, index and product backlinks and sitemap inclusion. Total: 315 guides across 21 perfumes. No database changes or invented performance results; local code only.

### 1 Million guide cluster

Added 15 1 Million guides referencing original Rabanne 1 Million EDT, with live product cards, comparisons, related perfumes, FAQs, index and product backlinks and sitemap inclusion. Total: 330 guides across 22 perfumes. Current stock is shown live. No database changes or invented performance results; local code only.

### Althair guides
Added 15 Althair guides referencing original Parfums de Marly Althaïr Eau de Parfum, distinct from Exclusif. Live product cards, FAQ/Article schema, comparison table, related guides and product backlink follow the shared template. Total: 345 guides across 23 perfumes. Local source changes only; no database writes.

### Angels Share guides
Added 15 Angels Share guides using original Kilian Angels’ Share as the reference, with cognac/spice/gourmand descriptors and no verified-formula or measured-performance claims. Live product cards, schema, comparison table, related links and product backlink follow the shared template. Total: 360 guides across 24 perfumes. No database writes or deployment.

### Bright Crystal guides
Added 15 Bright Crystal guides referencing original Versace Bright Crystal EDT, distinct from Absolu and Parfum. Live product cards, schema, comparison, related links and product backlink follow the shared template. Total: 375 guides across 25 perfumes. Local changes only; no database writes.

### Eros guides
Added 15 Eros guides using Versace Eros EDP as reference, distinct from EDT, Parfum and Flame. Shared live product cards, schema, comparisons and product backlink. Total: 390 guides across 26 perfumes. Local changes only; no database writes.

### Goddess guides
Added 15 Goddess guides referencing original Burberry Goddess EDP, distinct from Intense and Parfum. Vanilla/lavender descriptors do not establish matching extracts or a timed HUME note pyramid. Shared live product cards, schema, comparison and backlink. Total: 405 guides across 27 perfumes. No database writes or deployment.

### Her guides
Added 15 Her guides referencing original Burberry Her EDP, distinct from Elixir and EDT. Shared live product cards, FAQ/Article schema, comparison, related links and product backlink. Total: 420 guides across 28 perfumes. No database writes or deployment.

### Hugo Boss Man guides
Added 15 guides referencing HUGO Man EDT, distinguished from BOSS Bottled. Shared product cards, schema, comparison, related links and product backlink. Total: 435 guides across 29 perfumes. Local changes only; no database writes.

### Invictus guides
Added 15 guides using original Rabanne Invictus EDT, also searched as Paco Rabanne Invictus, distinguished from Victory, Aqua and Parfum. Shared live product cards, schema, comparison, related links and product backlink. Total: 450 guides across 30 perfumes. No database writes or deployment.

### J’adore guides
Added 15 guides using Dior J’adore EDP, distinguished from L’Or and Parfum d’eau. Floral descriptors do not establish matching extracts or a timed HUME pyramid. Shared live product cards, schema, comparison and product backlink. Total: 465 guides across 31 perfumes. No database writes or deployment.

### La Nuit guides
Added 15 guides using YSL La Nuit de L’Homme EDT, distinct from EDP, Le Parfum and Bleu Electrique. Shared product cards, schema, comparison, related links and product backlink. Total: 480 guides across 32 perfumes. No database writes or deployment.

### Most Wanted guides
Added 15 guides using Azzaro The Most Wanted Parfum, distinguished from EDP Intense. Shared live product cards, schema, comparison and backlink. Total: 495 guides across 33 perfumes. No database writes or deployment.

### Night Out guides
Added 15 guides using Afnan 9 PM Night Out Extrait de Parfum, distinguished from original 9 PM and Rebel. Shared live product cards, schema, comparison and backlink. Total: 510 guides across 34 perfumes. No database writes or deployment.

### Noir Extreme guides
Added 15 guides using Tom Ford Noir Extreme EDP, distinct from Parfum. Shared live cards, schema, comparison and product backlink. Total: 525 guides across 35 perfumes. No database writes or deployment.

### Pacific Chill guides
Added 15 guides using Louis Vuitton Pacific Chill. No cooling or detox health benefits asserted. Shared live cards, schema, comparison and backlink. Total: 540 guides across 36 perfumes. No database writes or deployment.

### Tobacco Vanille guides
Added 15 guides using Tom Ford Tobacco Vanille EDP, distinct from Parfum/body formats. Scent descriptors do not establish tobacco or nicotine content. Shared cards, schema, comparison and backlink. Total: 555 guides across 37 perfumes. No database writes or deployment.

### Allure Sport guides
Added 15 guides using Chanel Allure Homme Sport, distinguished from Eau Extrême. Official EDT source supplies original scent context without assigning an edition to HUME. Shared cards, schema, comparison and backlink. Total: 570 guides across 38 perfumes. No database writes or deployment.

BR 540: 15 buying guides added (585 guides across 39 perfumes). Existing seo_only visibility preserved. MFK EDP is a contextual reference; the catalogue Pure Perfume label does not establish a specific original edition.

Guilty Pour Homme: 15 guides added (600 total across 40 perfumes), using guilty-homme. Existing seo_only visibility preserved; Gucci EDT provides context without confirming the HUME inspiration edition.

Hawas Ice: 15 guides added (615 total across 41 perfumes). Uses the separate hawas-ice product and Rasasi Ice reference; existing visibility preserved.

Homme Intense: 15 guides added (630 across 42 perfumes), using the existing homme-intense product. Dior Intense EDP reference distinguished from Dior Homme Parfum; existing visibility preserved.

Jazz Club: 15 guides added (645 across 43 perfumes), using replica-jazz-club-100ml. Live size and visibility preserved; original REPLICA EDT concentration is distinct from HUME’s specification.

Libre Intense: 15 guides added (660 across 44 perfumes), using the existing libre-intense product. Intense EDP is distinguished from Libre EDP and Le Parfum. Product visibility preserved.

Myself: 15 guides added (675 across 45 perfumes), using the existing myself product and correct YSL MYSLF spelling. EDP is contextual; exact inspiration edition unconfirmed. Existing visibility preserved.

Oud Maracuja: 15 guides added (690 across 46 perfumes), using oud-maracuja. Maison Crivelli Extrait reference and HUME scent descriptors distinguished; visibility preserved.

Paradoxe: 15 guides added (705 across 47 perfumes), using the existing paradoxe product. Original Prada Paradoxe EDP distinguished from Intense and Virtual Flower; product visibility preserved.

Roma Intense: 15 guides added (720 across 48 perfumes), using valentino-born-in-roma-intense. Uomo Intense EDP context distinguished from Donna and other Uomo editions; existing visibility preserved.

Guide URL migration: all 765 articles now use /<guide-slug>. /guides remains the index; known legacy /guides/<slug> routes redirect permanently (308), unknown slugs remain 404. Sitemap, canonical/Open Graph/schema URLs and AI discovery files use root article URLs.
