# Data Layer

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
