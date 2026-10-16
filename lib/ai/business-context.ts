/** Pure reporting rules shared with regression tests. No customer data here. */
const DAY = 86_400_000;
const IST = 5.5 * 3_600_000;
export function completedBusinessWeeks(now: Date) {
  const local = new Date(now.getTime() + IST);
  const daysSinceMonday = (local.getUTCDay() + 6) % 7;
  const periodEnd = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysSinceMonday) - IST);
  return { periodEnd, periodStart: new Date(periodEnd.getTime() - 7 * DAY), previousStart: new Date(periodEnd.getTime() - 14 * DAY) };
}
export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
export function capturedFundsInWindow(rows: Array<{ paymentCapturedAt: Date | null; capturedPaymentAmount: string | null }>, start: Date, end: Date) {
  return rows.reduce((sum, row) => {
    const amount = Number(row.capturedPaymentAmount);
    return row.paymentCapturedAt && row.paymentCapturedAt >= start && row.paymentCapturedAt < end && Number.isFinite(amount) && amount > 0 ? sum + amount : sum;
  }, 0);
}
export function safeAnalyticsPath(raw: string) {
  try {
    const path = new URL(raw, 'https://humefragrance.com').pathname;
    return path.replace(/\/(checkout|order|checkout-resume)\/.*/gi, '/$1/[private]').replace(/\/tracking\/.*/gi, '/tracking/[private]');
  } catch { return '/[unavailable]'; }
}
export const businessContext = {
  version: 2,
  brand: 'HUME Fragrance, India; direct-to-consumer inspired perfumes, Discovery Sets and a separate Spaces scenting range.',
  schedule: 'Monday 08:00 Asia/Kolkata. Compare the last completed Monday–Sunday week with the preceding completed week; end boundaries are exclusive.',
  platform: {
    checkout: 'Cart opens an owner-protected /checkout/<token>; drafts, pending orders and successful payments are distinct stages. A pending saved order is not a sale.',
    payments: 'Razorpay full payment or 20% advance plus 80% COD. The COD advance uses Razorpay too. A closed payment window is not a confirmed failure or proof the customer wanted full COD.',
    recovery: 'Saved checkout links, a site resume prompt and account payment actions already exist. Recommend investigating measured failures before rebuilding these features.',
    discovery: 'Discovery Set is a pre-order of 15 chosen 3ml samples for INR 999. It has its own sample eligibility and availability validation; count one set as one ordered product unit, not fifteen bottles.',
    catalog: 'Public and SEO-only products differ. SEO-only stock flags do not mean shoppers cannot purchase a public alternative. Prioritize public stockouts with demand evidence, not every catalogue stock flag.',
    fulfillment: 'Admin tracking and status edits are operational signals, not proof of payment, delivery or COD collection.',
    outreach: 'Admin has manual sharing and recovery actions. Recommendations must not imply automated emails or customer notifications were sent.',
  },
  definitions: {
    revenue: 'Gross recorded Razorpay capturedPaymentAmount grouped by paymentCapturedAt in the week, including captures for older orders. This is not net revenue: refunds, settlements, fees, cash COD receipts, costs and profit are not reconciled here.',
    qualifiedOrderValue: 'Full value of operationally qualified orders created in the week. Separate from captured revenue; fulfillment/paymentMethod alone never proves funds received.',
    averageOrderValue: 'Qualified order value divided by qualified orders in the creation-week cohort.',
    conversion: 'Unique qualified-order sessions matched to checkout drafts created in the same week, divided by unique draft sessions. Not an end-to-end customer funnel or a claim of attribution; manual/WhatsApp orders can lack a matched draft.',
    repeatCustomers: 'Repeat ordering within this week only, not lifetime retention.',
    demand: 'Weighted mixture of cart events, drafts and orders; duplicated intent is possible. Not unique buyers or forecast units.',
    rates: 'Always include numerator and denominator. Null percentage change means no nonzero comparison baseline, not 100% growth. Rate differences are percentage points.',
  },
  limitations: ['No verified ad spend, margin, COD cash receipts, complete refund ledger, search rankings or competitor data.', 'No action-completion tracking: previous recommendations are hypotheses to re-evaluate, not evidence that fixes were deployed.', 'Diagnostics are aggregate error codes; missing errors do not prove every customer succeeded.'],
} as const;
