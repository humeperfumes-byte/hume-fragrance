# Data Layer

## Catalog repair — October 1, 2026

### Pacific Chill restoration

Pacific Chill (`pacific-chill`) was restored as a public, sold-out 50ml perfume
at INR 799 using `scripts/insert-pacific-chill.ts`. It inserts only missing data,
backs up the catalog, and verifies every existing product unchanged. Categories
are Fresh, Citrus, and Fruity. Replace `/images/logo.png` through Admin → Products
→ Pacific Chill → Images. Sample selection stays disabled while sold out.
`lib/pacific-chill.ts` contains initial data and FAQs referencing Louis Vuitton's
official Pacific Chill product page and story. Scent descriptors reference the
inspiration rather than an identical HUME formula; wear-test results are pending.
No celebrity claims, reviews, or numerical longevity promises are seeded.
Schema and merchant feed await actual product photography. The canonical route
is `/product/hume-pacific-chill-inspired-by-louis-vuitton-pacific-chill`.

### Night Out restoration

Night Out (`night-out`) was restored separately as a public, sold-out 50ml
perfume at INR 799. `scripts/insert-night-out.ts` inserts only a missing record,
backs up the catalog, verifies all existing rows unchanged, and never overwrites
later admin edits. It maps the product to Fruity, Spicy, and Amber categories.
Its inspiration is Afnan 9 PM Night Out, verified against
https://india.afnan.com/products/9pm-night-out . Notes describe that inspiration;
no exact similarity, celebrity endorsement, or wear-time claim is made.
No reviews are seeded. Sample selection remains disabled while sold out.
The temporary image is `/images/logo.png`, clearly identified as a brand mark
on the product page. Replace it through Admin → Products → Night Out → Images.
Product image schema and merchant-feed inclusion activate once real images
replace the brand mark. Change sold-out status only when stock is ready.
The canonical route is `/product/hume-night-out-inspired-by-afnan-9-pm-night-out`.

- `scripts/repair-catalog.ts` backs up all product rows under ignored
  `output/catalog-backups/`, then transactionally changes only the discovery set
  and duplicate `tom-ford-oud-wood` row. All other rows are verified unchanged.
- Discovery-set data now matches the storefront: INR 999, 15 x 3ml samples.
- `oud-wood` is the canonical Oud Wood record because it retains existing reviews.
  The duplicate remains `seo_only` for historical references, excluded from
  sample selections and sitemap entries. No orders, reviews, or carts are deleted.
- `lib/product-route-aliases.ts` preserves known historical product-name URLs.
  Product routes use permanent redirects to the current canonical URL.
- The eight removed perfume records are not reseeded from placeholder data.
  `lib/unavailable-products.ts` preserves their ID and historical SEO routes as
  noindex unavailable pages with no price, stock promise, or purchase button.
  A subsequently restored database record takes precedence over these pages.
- JSON-LD uses a native script element so structured data is included in the
  initial server HTML. Less-than characters remain escaped to protect scripts.
- Database changes affect the configured database immediately; deployed catalog
  caches can take up to six hours to refresh. Route and HTML fixes require deployment.

## Purpose

The data layer is the foundation for admin, recovery, attribution, and future ML.
The site should collect clean historical data before automation makes decisions.

Primary files:

- Drizzle schema: `db/schema.ts`
- DB client: `db/index.ts`
- Migrations: `db/migrations/*`
- SQL helper scripts: `sql/*`
- Product loaders: `lib/db/products.ts`
- Image loaders: `lib/db/images.ts`
- Coupon loaders: `lib/db/coupons.ts`

## Important Tables

Catalog/content:

- `products`
- `reviews`
- `blog_posts`
- `accessories`
- `images`
- `coupons`
- `product_categories`

Lead and commerce:

- `cart_events`
- `checkout_drafts`
- `orders`
- `coupon_code_events`

Analytics/intelligence:

- `consent_events`
- `consent_timeline_events`
- `behavioral_events`
- `session_intelligence`
- `section_attribution`

## Products

Products should preserve:

- id
- name
- inspiration
- inspiration brand
- category/category ids
- gender
- images
- price/currency
- descriptions/SEO fields
- badges
- notes
- longevity
- size
- visibility

Homepage collection ranking uses product IDs to connect analytics and order
signals back to products.

## Images

Images table fields:

- id
- label
- url
- link
- usage
- tags

Hero images are loaded with:

- `getImagesByUsage("hero")`

Important history:

- A missing `images.usage` column once caused homepage query errors.
- If image schema changes, confirm `lib/db/images.ts` still matches the live DB.

## Coupons

Coupons table fields include:

- code
- title
- description
- type
- value
- min subtotal
- active
- display in cart

Important coupon:

- `SPECIAL-5`

`SPECIAL-5` can exist as a hidden fallback in code so the recovery flow does not
break if the DB coupon row is missing.

## Checkout Drafts

`checkout_drafts` is a CRM table for unfinished or WhatsApp checkout intent.

Important fields:

- session id
- status
- path
- acquisition/source fields
- UTM fields
- full name, phone, email, address fields
- subtotal, shipping fee, grand total
- cart snapshot
- country/ip/user-agent
- lead status
- lead notes
- last contacted at
- next follow-up at
- WhatsApp initiated at

Lead statuses:

- new
- contacted
- replied
- converted
- lost

## Orders

`orders` stores final order state and should not lose attribution.

Important fields:

- order number
- session id
- status
- checkout channel
- customer details
- applied coupon code
- subtotal, shipping fee, grand total
- cart snapshot
- source/UTM fields
- WhatsApp message
- country/ip/user-agent

## Migrations and Schema Sync

Important SQL scripts:

- `sql/add_lead_recovery_and_utm_fields.sql`
- `sql/add_orders_table.sql`
- `sql/add_coupon_code_events.sql`
- `sql/import_hume_reviews.sql`

Important history:

- Admin checkout crashed when code expected lead recovery/UTM columns that had
  not been applied to the active Neon/Postgres database.
- Future schema changes should include both Drizzle schema updates and a clear
  migration path for the active database.

## Neon/Postgres Notes

The active database is expected to come from:

- `.env.local`
- `DATABASE_URL`

Do not paste credentials into docs or chat.

Before serious traffic:

- Rotate exposed credentials.
- Confirm migrations are applied.
- Confirm admin schema-health checks pass.
- Add indexes where admin pages start scanning too much data.

## Data Discipline Rules

When adding data:

- Prefer structured fields over string parsing.
- Keep product IDs stable.
- Keep session IDs consistent across cart and checkout.
- Preserve original order snapshots.
- Store source/UTM fields on drafts and orders.
- Keep lead workflow state explicit.
- Do not delete historical signal tables without an export/backup plan.

Althair was restored as a public, sold-out 50ml product at INR 799 using scripts/insert-althair.ts. The insert backs up and verifies every existing product remains unchanged. Add actual product photography in Admin before enabling stock.

Angels Share was restored as a public, sold-out 50ml product at INR 799 using scripts/insert-angels-share.ts. The insert backs up and verifies existing products remain unchanged. Add actual photography through Admin before enabling stock.

Hugo Boss Man was restored with the historical hugo-boss ID as a public, sold-out 50ml product at INR 799 using scripts/insert-hugo-boss.ts. Existing products were backed up and verified unchanged. Add product photography through Admin.

Most Wanted was restored with the most-wanted ID as a public, sold-out 50ml product at INR 799 using scripts/insert-most-wanted.ts. Existing products were backed up and verified unchanged. The existing Parfum inspiration is preserved; add real photos in Admin.

Her was restored with the her ID as a public, sold-out 50ml product at INR 799 using scripts/insert-her.ts. Existing products are backed up and verified unchanged. Add real photography in Admin.

J'adore was added with the jadore ID as a public, sold-out 50ml product at INR 799 using scripts/insert-jadore.ts. Existing products were backed up and verified unchanged. Add real product photos through Admin.

Eros was added with the eros ID as a public, sold-out 50ml product at INR 799 using scripts/insert-eros.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

1 Million was added with the 1-million ID as a public, sold-out 50ml product at INR 799 using scripts/insert-one-million.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

La Nuit was added with the la-nuit ID as a public, sold-out 50ml product at INR 799 using scripts/insert-la-nuit.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

Tobacco Vanille was added with the tobacco-vanille ID as a public, sold-out 50ml product at INR 799 using scripts/insert-tobacco-vanille.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

Noir Extreme was added with the noir-extreme ID as a public, sold-out 50ml product at INR 799 using scripts/insert-noir-extreme.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

Bright Crystal was added with the bright-crystal ID as a public, sold-out 50ml product at INR 799 using scripts/insert-bright-crystal.ts. Existing products are backed up and verified unchanged. Add real photos through Admin.

Goddess was added with the goddess ID as a public, sold-out 50ml product at INR 799 using scripts/insert-goddess.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.

Invictus was added with the invictus ID as a public, sold-out 50ml product at INR 799 using scripts/insert-invictus.ts. Existing products were backed up and verified unchanged. Add real photos through Admin.
