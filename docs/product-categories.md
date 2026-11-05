# Fragrance categories

The category manager is at `/admin/categories`, linked from Catalog and the admin sidebar. It supports creating categories, renaming display labels, descriptions, display order, storefront visibility and selecting products with checkboxes. Public counts exclude products that are available only through direct links. Products may belong to multiple scent families; their primary category is protected from removal in the category manager and can be changed in the product editor.

`catalog_categories` is the shared source for category names, order and visibility. `product_categories` stores product membership. Each product/category pair is unique. IDs remain stable when a display name changes. New product forms use a primary-category dropdown and additional-category checkboxes. The older dashboard form uses the same controls.

Homepage filters, shop filters, navigation menus, footer links, product-card labels and admin filters use `lib/product-categories.ts`. It normalizes legacy IDs, includes primary categories when mapping arrays are empty, deduplicates counts and prevents incorrect legacy labels from aliasing unrelated scent families. Mobile shop filters use a focus-managed drawer. Only visible families with public products appear in storefront filters; a hidden family keeps its assignments and existing category URLs remain usable.

Descriptions appear above shop results when a family is selected. Homepage family filters expand in place and their view-all link opens that family's shop results. Category links use stable IDs. Shop filtering preserves the current route prefix and unrelated query parameters.

## Setup

Run `npm run db:setup-categories` before deploying to another database. This repeatable migration creates the definitions table, normalizes category IDs, seeds definitions, repairs incorrect assignment labels, removes duplicate membership rows and adds unique indexes. It retains product memberships. Existing defaults for hidden scent families are preserved and can now be changed in admin. It was applied to this workspace's configured database.

Product creation and category changes run in transactions. Ordinary product edits preserve secondary categories, explicitly clearing secondary categories is supported, failed updates roll back, and category-manager saves reject stale edits. Category changes expire the shared product cache and revalidate storefront pages. Definitions and memberships are included in the existing Google backup registry.

## Checks

`npm run test:categories` covers normalization, missing mappings, corrupted labels, duplicate counts, visibility, ordering and custom labels. With the local server on port 3002, `npm run test:categories:integration` creates a temporary hidden product and category, checks authenticated category management and atomic product updates, and removes its own test data. Existing products and memberships are not used as test fixtures.

This implementation is local source work; deployment remains separate.
