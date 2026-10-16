# Saved invoice workspace

The admin invoice workspace is available at `/invoice` and `/bill`. It uses larger labelled inputs, multiline addresses and item descriptions, and quick-add controls for perfumes, samples, machines, oils and other business items. Each item can have its own description, unit, quantity, price and tax rate. Free sample lines are supported.

Choose **Save invoice** to store every editor field in the database. **Saved invoices** lets you search by customer, save name, invoice number or item description. **Open & edit** updates the existing saved record. **Use as new** copies its details into an unsaved invoice with a fresh number and date and resets payment status to Unpaid. **Save as copy** creates a separate record from the current edited form. Copies do not overwrite their source.

Saving is explicit. Unsaved changes trigger a warning before leaving or replacing the form. Changes from another tab/device are detected on update and rejected instead of silently overwritten. Server-side admin authentication protects saved customer data and the workspace is excluded from indexing.

Schema setup: `npx tsx scripts/apply-saved-invoices-schema.ts`. This creates only the new `saved_invoices` table, with no changes to orders or products. It has been applied to the configured database. If deployment uses a different database, run it there before using invoice saving.

Checks: `node --import tsx --test tests/invoice-document.test.ts`, `npx tsc --noEmit`, and `npx tsx scripts/check-saved-invoices.ts`. The database check saves, updates and reopens a synthetic record inside a transaction that is rolled back, leaving no test invoice behind.

## Drafts, issue register and PDF export

New work uses a draft reference until **Issue invoice & lock details** is selected. The server allocates `HF/2627/000001`-style consecutive numbers inside a financial-year transaction, writes an immutable issue snapshot, and records revisions. The three additive tables are prepared by `node --import tsx scripts/apply-invoice-ledger.ts` using `sql/add_invoice_ledger.sql`. Existing saved documents are not rewritten or retroactively marked issued. The first subsequent edit retains their prior state as a legacy snapshot. New deployment environments need the additive migration before invoice saving/issuing is used.

Issued customer, item, tax and identity fields cannot be edited through the API or editor. Manual payment records/visibility can be updated, with history; this does not collect or refund money. Corrections to issued financial details require an appropriate accounting process such as a credit/debit note; those documents are not automatically created here.

`lib/invoice-calculations.ts` is shared by the editor, saved register, server validation and PDF. Prices can be inclusive or exclusive of GST. Invoice-time target-total discounts are allocated to item gross values in paise before recomputing tax; shipping remains outside that discount and has an explicit reviewed GST rate. Invalid targets/overpayments are blocked. Rounding preserves the sum of taxable value and tax, with any odd paise assigned consistently between CGST/SGST. GST rates/HSN/SAC are entered by the operator, not inferred from product names.

Tax treatment supports domestic CGST/SGST, IGST, and an explicit No GST option. Place of supply must be determined by the operator; it is not inferred solely from the shipping address or buyer GSTIN. GSTIN format/state and HSN presence checks are structural, not verification against the GST portal. Export/SEZ/LUT, reverse-charge handling, credit/debit-note generation, digital signatures, e-invoice IRNs/e-way bills and GST return filing are outside this implementation. Confirm applicable requirements with the accountant before issuing real documents.

The direct PDF endpoint uses the same totals and produces selectable text on true A4 pages, repeating item headings and numbering continued pages. Latin/Devanagari fonts and the uploaded black logo are packaged with the route. Filenames use the invoice date, IST export time, customer and HUME Fragrance. Issued PDF exports load their saved server document instead of trusting edited client financial fields.

References: [CBIC invoice rules](https://taxinformation.cbic.gov.in/content-page/explore-rules/1000136/1000001) and [CGST Section 15, value of taxable supply](https://taxinformation.cbic.gov.in/content-page/explore-act/1000284/1000001).

Checks: `node --import tsx --test tests/invoice-accounting.test.ts tests/invoice-document.test.ts tests/invoice-filename.test.ts`. `scripts/verify-invoice-ledger.ts` wraps every write, audit entry and number allocation in a rolled-back transaction. `scripts/render-invoice-fixtures.ts` creates synthetic PDF fixtures for Poppler review, without saving or issuing customer invoices.
