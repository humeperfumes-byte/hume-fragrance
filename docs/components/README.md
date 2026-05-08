# Component Map

## Purpose

This file maps the main components and what they own. Use it before editing so
changes happen in the right place.

## Global Components

`app/layout.tsx`

- Loads metadata, fonts, global CSS, providers, trackers, and Cloudflare beacon.
- Public body includes both sans and serif CSS variables.

`app/providers.tsx`

- Wraps the site with theme, tooltip, cart provider, toasts, and `CartDrawer`.

`components/Header.tsx`

- Public nav, mobile menu, search button, cart button, and shop navigation.
- Opens cart through `setIsCartOpen(true)`.
- Dispatches `cart_open` tracking from the header cart icon.

`components/Footer.tsx`

- Public footer/navigation area.

`components/ClientGlobalOverlays.tsx`

- Global client overlays outside route content.

## Storefront Components

`components/Hero.tsx`

- Home first screen.
- Direct selling headline, CTAs, trust points, live offer, image carousel.
- Loads hero slides from DB with fallback images.

`components/BestsellerSection.tsx`

- Best seller product surface on home.

`components/HumeSpecialSection.tsx`

- HUME special product surface on home.

`components/Collection.tsx`

- Home collection grid.
- Receives products already ranked by signals in `app/page.tsx`.
- Supports category filtering and links to shop.

`components/PerfumeCard.tsx`

- Product card for home/shop sections.
- Owns product click tracking and add-to-cart action.
- Uses accepted premium glassmorphic plus button.

`components/SearchOverlay.tsx`

- Search UI opened from header.

`components/ShopMegaMenu.tsx`

- Desktop shop/category navigation.

`components/HomeReviewsSection.tsx`

- Home social proof/reviews section.

`components/HomeFaqSection.tsx`

- Home FAQ section.

`components/KitPackShowcase.tsx`

- Home kit-pack section.

`components/RefillProgramSection.tsx`

- Refill/subscription section.

`components/SeoHubTeaser.tsx`

- SEO/internal discovery teaser.

## Product Detail Components

`app/product/[id]/ProductDetailView.tsx`

- Product detail layout and content.

`app/product/[id]/ProductDetailClient.tsx`

- Client-side add-to-cart and WhatsApp CTA.
- Mobile sticky add-to-cart bar.

`components/ProductImageGallery.tsx`

- Product imagery/gallery.

`components/ProductReviews.tsx`

- Product review display.

## Cart Components

`context/CartContext.tsx`

- Cart state, localStorage hydration/persistence, gift eligibility, item
  quantity/remove/add actions, and cart event dispatching.

`components/CartDrawer.tsx`

- Live right-side cart drawer.
- Owns gift progress, product rows, coupon/offers, SPECIAL-5 celebration,
  product price magic, footer totals, and checkout CTA.

`components/CartPreviewExperience.tsx`

- Preview/demo surface for cart design experiments.
- Current reliable route is `app/admin/cart-preview/page.tsx`.

`components/CartAnalyticsTracker.tsx`

- Listens for `hume:tracking` cart events and persists them to `/api/cart-events`.

For deeper cart rules, read:

- `docs/cart/README.md`

## Checkout Components

`components/CheckoutClient.tsx`

- Checkout form, local persistence, draft autosave, coupon math, WhatsApp/order
  creation, and source/UTM handoff.

`app/checkout/page.tsx`

- Checkout route wrapper.

For deeper checkout rules, read:

- `docs/checkout/README.md`

## Analytics Components

`components/ConsentCaptureBanner.tsx`

- Consent capture UI.

`components/ConsentTimelineTracker.tsx`

- Consent-gated timeline tracking and first-touch source persistence.

`components/analytics/BehavioralTracker.tsx`

- Page view, scroll, section view/dwell, exit intent, click, and hover tracking.

`components/CartAnalyticsTracker.tsx`

- Cart-specific anonymous session tracking.

For deeper analytics rules, read:

- `docs/analytics/README.md`

## Admin Components

`components/admin/AdminShell.tsx`

- Admin layout, top bar, market switcher, desktop sidebar, mobile sheet nav.

`components/admin/AppSidebar.tsx`

- Older/alternate sidebar component. Confirm usage before changing.

`components/admin/AdminDashboard.tsx`

- Older/alternate dashboard component. Confirm usage before changing.

Admin route components:

- `app/admin/(dashboard)/dashboard/page.tsx`
- `app/admin/(dashboard)/intelligence/IntelligenceFeed.tsx`
- `app/admin/(dashboard)/intelligence/SectionPerformance.tsx`
- `app/admin/(dashboard)/orders/OrdersTable.tsx`
- `app/admin/(dashboard)/checkouts/CheckoutsTable.tsx`
- `app/admin/(dashboard)/cart/CartLeadsTable.tsx`
- `app/admin/(dashboard)/coupon-leads/CouponLeadsTable.tsx`
- `app/admin/(dashboard)/products/ProductsTable.tsx`
- `app/admin/(dashboard)/products/ProductFormSheet.tsx`
- `app/admin/(dashboard)/blogs/BlogsTable.tsx`
- `app/admin/(dashboard)/blogs/BlogFormSheet.tsx`

For deeper admin rules, read:

- `docs/admin/README.md`

## Shared UI Components

`components/ui/*`

- Shared shadcn-style primitives.
- Prefer existing primitives before adding new UI libraries.

## Editing Rule

Before editing a component:

1. Find which flow owns it.
2. Read the matching docs file.
3. Preserve existing tracking/coupon/session behavior unless the user asks to
   change it.
4. Update docs if behavior or layout order changes.
