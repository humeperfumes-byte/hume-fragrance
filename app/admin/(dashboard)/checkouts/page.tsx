import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CheckoutsTable } from "./CheckoutsTable";
import { formatINR } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function CheckoutsPage() {
  let drafts: (typeof checkoutDrafts.$inferSelect)[] = [];
  let dbError = false;

  try {
    drafts = await db
      .select()
      .from(checkoutDrafts)
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(500);
  } catch (error) {
    console.error("Checkouts page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
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
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-white">Abandoned Checkouts CRM</h1>
        <p className="mt-1 text-sm text-white/45">
          Recover lost sales. Carts are scored by value and likelihood of recovery.
        </p>
        <p className="mt-1 text-xs text-white/35">Showing all checkout leads.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Active Drafts</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-white">{activeDrafts}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Live</span>
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/15 bg-amber-500/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/45">Recoverable Leads</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-amber-200">{recoverable}</p>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          </div>
        </div>
        <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/45">WhatsApp Pending</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-200">{whatsappInitiated}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Total Recovery Value</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{formatINR(totalAbandonedValue)}</p>
        </div>
      </div>

      <CheckoutsTable initialDrafts={drafts} />
    </div>
  );
}
