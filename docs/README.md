# HUME Fragrance Implementation Notes

This folder stores living implementation notes for the HUME Fragrance codebase.

Use these notes when changing existing flows so the intent, order of behavior,
and conversion logic stay consistent even after context is lost.

## Brand Direction

HUME Fragrance is a conversion-focused ecommerce site for premium inspired
perfumes in India. The business goal is to turn visitors into customers through
clear product discovery, strong cart/checkout recovery, clean attribution data,
and an admin panel that works like a daily operating system.

Near-term priority:

- Sell more perfume with a smoother storefront, cart, checkout, and WhatsApp flow.
- Capture clean historical data for every meaningful buyer signal.
- Make admin views useful for daily work: revenue, funnel, leads, carts, orders,
  repeat customers, product demand, and source quality.

Later priority:

- Add prediction and automation on top of reliable historical data.
- Avoid ML/automation before the data layer is disciplined enough to trust.

## Current Notes

- [Site Overview](./site/README.md)
- [Storefront Flow](./storefront/README.md)
- [Cart Drawer](./cart/README.md)
- [Checkout and Orders](./checkout/README.md)
- [Admin Operations](./admin/README.md)
- [Analytics and Lead Signals](./analytics/README.md)
- [Data Layer](./data/README.md)
- [Component Map](./components/README.md)

## Editing Rule

When a feature changes, update the matching README in the same PR/work session.
These docs are not marketing copy. They are implementation memory for the next
developer or AI agent working on the site.
