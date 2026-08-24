import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { and, desc, gte, inArray, lte, or, sql } from "drizzle-orm";
import { CheckoutsTable } from "./CheckoutsTable";
import { formatINR } from "@/lib/currency";
import { filterExcludedAdminRows, collectExcludedSessionIds } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { parseAdminMarket, isIndiaCheckoutSignal } from "@/lib/admin-market";
import { RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string; market?: string; from?: string; to?: string }>;
};

export default async function CheckoutsPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours, params?.from, params?.to);
  let drafts: Array<typeof checkoutDrafts.$inferSelect & { hasOrderRecord: boolean; hasConfirmedOrder: boolean; linkedOrderNumber: string | null; linkedOrderStatus: string | null }> = [];
  let dbError = false;

  try {
    const checkoutWindow = timeWindow.isCustom
      ? and(gte(checkoutDrafts.updatedAt, timeWindow.since), lte(checkoutDrafts.updatedAt, timeWindow.until))
      : sql`${checkoutDrafts.updatedAt} >= (now() - (${timeWindow.hours} * interval '1 hour'))::timestamp
          and ${checkoutDrafts.updatedAt} <= now()::timestamp`;
    const checkoutRows = await db
      .select()
      .from(checkoutDrafts)
      .where(checkoutWindow)
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(500);
    const sessionIds = checkoutRows.map((draft) => draft.sessionId).filter((value): value is string => Boolean(value));
    const emails = checkoutRows.map((draft) => draft.email?.trim().toLowerCase()).filter((value): value is string => Boolean(value));
    const phones = checkoutRows.map((draft) => draft.phone?.replace(/\D/g, "")).filter((value): value is string => Boolean(value));
    const matchConditions = [];
    if (sessionIds.length) matchConditions.push(inArray(orders.sessionId, sessionIds));
    if (emails.length) matchConditions.push(inArray(orders.email, emails));
    if (phones.length) matchConditions.push(inArray(orders.phone, phones));
    const linkedOrders = matchConditions.length
      ? await db.select({ sessionId: orders.sessionId, email: orders.email, phone: orders.phone, orderNumber: orders.orderNumber, status: orders.status, createdAt: orders.createdAt })
          .from(orders).where(or(...matchConditions)).orderBy(desc(orders.createdAt))
      : [];
    const bySession = new Map(linkedOrders.filter((order) => order.sessionId).map((order) => [order.sessionId, order]));
    const byEmail = new Map(linkedOrders.filter((order) => order.email).map((order) => [order.email!.trim().toLowerCase(), order]));
    const byPhone = new Map(linkedOrders.filter((order) => order.phone).map((order) => [order.phone!.replace(/\D/g, ""), order]));
    const confirmedStatuses = new Set(["payment_authorized", "processing", "shipped", "delivered", "complete"]);
    drafts = checkoutRows.map((draft) => {
      const linkedOrder = bySession.get(draft.sessionId)
        || (draft.email ? byEmail.get(draft.email.trim().toLowerCase()) : undefined)
        || (draft.phone ? byPhone.get(draft.phone.replace(/\D/g, "")) : undefined);
      return {
        ...draft,
        hasOrderRecord: Boolean(linkedOrder),
        hasConfirmedOrder: Boolean(linkedOrder && confirmedStatuses.has(linkedOrder.status)),
        linkedOrderNumber: linkedOrder?.orderNumber || null,
        linkedOrderStatus: linkedOrder?.status || null,
      };
    });
    drafts = filterExcludedAdminRows(drafts, collectExcludedSessionIds(drafts));

    const market = parseAdminMarket(params?.market);
    if (market === "india") {
      drafts = drafts.filter(isIndiaCheckoutSignal);
    } else if (market === "out_of_india") {
      drafts = drafts.filter((row) => !isIndiaCheckoutSignal(row));
    }
  } catch (error) {
    console.error("Checkouts page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
        <div className="admin-page-intro-copy">
          <h1 className="text-2xl font-semibold text-white">Abandoned Checkouts CRM</h1>
        </div>
        <div className="rounded-xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              The checkout_drafts table is missing columns. Run{" "}
              <code className="rounded bg-white/10 px-2 py-1 text-xs">npm run db:push</code>{" "}
              in your terminal to sync the schema, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeDrafts = drafts.filter((d) => !d.hasConfirmedOrder).length;
  const recoverable = drafts.filter(
    (d) => !d.hasConfirmedOrder && d.status !== "whatsapp_initiated" && (d.phone || d.email || d.fullName),
  ).length;
  const whatsappInitiated = drafts.filter((d) => !d.hasConfirmedOrder && d.status === "whatsapp_initiated").length;
  const totalAbandonedValue = drafts
    .filter((d) => !d.hasConfirmedOrder)
    .reduce((acc, d) => acc + Number.parseFloat(String(d.grandTotal ?? "0")), 0);

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-5">
      <div className="admin-page-intro-copy flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f2d56b]/20 bg-[#f2d56b]/10 shadow-[inset_0_1px_rgba(255,255,255,.08)]">
            <RotateCcw className="h-5 w-5 text-[#f2d56b]" />
          </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f2d56b]/60">Revenue recovery</p>
          <h1 className="mt-1 text-2xl font-semibold text-white">Abandoned Checkouts</h1>
          <p className="mt-1 text-sm text-white/45">
            Recover lost sales. Carts are scored by value and likelihood of recovery.
          </p>
          <p className="mt-1 text-xs text-white/35">Showing checkout leads from {timeWindow.label.toLowerCase()}.</p>
        </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="relative overflow-hidden rounded-[20px] border border-white/10 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-[#c5a9ff]/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Active Drafts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-white">{activeDrafts}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[20px] border border-amber-400/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/45">Recoverable Leads</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-amber-200">{recoverable}</p>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[20px] border border-emerald-400/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/45">WhatsApp Pending</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{whatsappInitiated}</p>
        </div>
        <div className="relative overflow-hidden rounded-[20px] border border-[#c5a9ff]/15 bg-[#19191c] p-4 shadow-[inset_0_1px_rgba(255,255,255,.04)] sm:p-5">
          <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-[#c5a9ff]/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Total Recovery Value</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{formatINR(totalAbandonedValue)}</p>
        </div>
      </div>

      <CheckoutsTable initialDrafts={drafts} />
    </div>
  );
}
