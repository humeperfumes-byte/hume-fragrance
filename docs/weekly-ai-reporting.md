# Weekly business intelligence

The Vercel cron `/api/cron/ai-weekly` runs Mondays at 08:00 Asia/Kolkata (`30 2 * * 1` UTC). It uses the existing CRON_SECRET bearer authorization; keep the same secret configured in Vercel. No additional environment variables or database migrations are required. A deployment must succeed for code changes to take effect.

Reports compare the most recently completed Monday–Sunday IST week with the preceding complete week. Manual runs use the same windows. Report dates are displayed in admin. History generated before context version 2 used rolling windows and different money definitions and is explicitly labelled legacy.

`lib/ai/business-context.ts` describes the platform and measurement definitions. Update it when the actual purchase, sample, COD or recovery workflow changes. It provides context, not unrestricted access to code, secrets or customer information.

Gross recorded Razorpay captures are attributed by capture timestamp. Qualified order value and average order value use order-creation cohorts. Gross captures are neither net revenue nor profit: refunds, fees, cash COD receipts and settlements are not reconciled in this snapshot. Shipment/tracking does not prove money collected. Older orders captured in the reporting week are included in captured funds.

Checkout conversion matches distinct qualified-order sessions to distinct checkout-draft sessions created in the same week. Raw numerator and denominator are supplied. Draft state remains mutable; this is not a historical immutable funnel. Stage counts are retained events, not unique customers, and can be incomplete.

The AI receives aggregated metrics, explicit caveats, public-versus-SEO catalogue availability, checkout stages, safe diagnostic codes, and a previous completed report when available. Previous actions are not proof of execution. Contact information and capability URLs must never be sent. Query limits and low sample sizes lower confidence; no previous baseline means null percentage growth.

Generation is advisory and cannot change orders, payments, stock or contact customers. A database advisory lock prevents overlapping runs; completed scheduled windows are reused on repeat triggers. Existing fallback models remain available, and the interface explains that a backup model is not a fallback business-data estimate.

Verification: `node --import tsx --test tests/ai-business-context.test.ts tests/ai-provider.test.ts`.
