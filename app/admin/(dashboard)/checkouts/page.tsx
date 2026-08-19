import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { and, desc, gte, lte } from "drizzle-orm";
import { CheckoutsTable } from "./CheckoutsTable";
import { formatINR } from "@/lib/currency";
import { filterExcludedAdminRows, collectExcludedSessionIds } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { parseAdminMarket, isIndiaCheckoutSignal } from "@/lib/admin-market";
import { RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string; market?: string; from?: string; to?: string }> | { hours?: string; market?: string; from?: string; to?: string };
};

export default async function CheckoutsPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours, params?.from, params?.to);
  let drafts: (typeof checkoutDrafts.$inferSelect)[] = [];
  let dbError = false;

  try {
    drafts = await db
      .select()
      .from(checkoutDrafts)
      .where(and(gte(checkoutDrafts.updatedAt, timeWindow.since), lte(checkoutDrafts.updatedAt, timeWindow.until)))
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(500);
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
        <div>
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

  const activeDrafts = drafts.filter((d) => d.status !== "complete").length;
  const recoverable = drafts.filter(
    (d) => d.status !== "complete" && d.status !== "whatsapp_initiated" && (d.phone || d.email || d.fullName),
  ).length;
  const whatsappInitiated = drafts.filter((d) => d.status === "whatsapp_initiated").length;
  const totalAbandonedValue = drafts
    .filter((d) => d.status !== "complete")
    .reduce((acc, d) => acc + Number.parseFloat(String(d.grandTotal ?? "0")), 0);

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
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
