# Saved invoice workspace

The admin invoice workspace is available at `/invoice` and `/bill`. It uses larger labelled inputs, multiline addresses and item descriptions, and quick-add controls for perfumes, samples, machines, oils and other business items. Each item can have its own description, unit, quantity, price and tax rate. Free sample lines are supported.

Choose **Save invoice** to store every editor field in the database. **Saved invoices** lets you search by customer, save name, invoice number or item description. **Open & edit** updates the existing saved record. **Use as new** copies its details into an unsaved invoice with a fresh number and date and resets payment status to Unpaid. **Save as copy** creates a separate record from the current edited form. Copies do not overwrite their source.

Saving is explicit. Unsaved changes trigger a warning before leaving or replacing the form. Changes from another tab/device are detected on update and rejected instead of silently overwritten. Server-side admin authentication protects saved customer data and the workspace is excluded from indexing.

Schema setup: `npx tsx scripts/apply-saved-invoices-schema.ts`. This creates only the new `saved_invoices` table, with no changes to orders or products. It has been applied to the configured database. If deployment uses a different database, run it there before using invoice saving.

Checks: `node --import tsx --test tests/invoice-document.test.ts`, `npx tsc --noEmit`, and `npx tsx scripts/check-saved-invoices.ts`. The database check saves, updates and reopens a synthetic record inside a transaction that is rolled back, leaving no test invoice behind.
