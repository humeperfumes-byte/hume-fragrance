import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { CheckoutsTable } from "./CheckoutsTable";

export const dynamic = "force-dynamic";

export default async function CheckoutsPage() {
  const drafts = await db.select().from(checkoutDrafts).orderBy(desc(checkoutDrafts.updatedAt)).limit(500);

  const activeDrafts = drafts.filter((d) => d.status !== "complete").length;
  const recoverable = drafts.filter((d) => d.status !== "complete" && d.status !== "whatsapp_initiated" && (d.phone || d.email || d.fullName)).length;
  const whatsappInitiated = drafts.filter((d) => d.status === "whatsapp_initiated").length;
  const totalAbandonedValue = drafts
    .filter((d) => d.status !== "complete")
    .reduce((acc, d) => acc + Number.parseFloat(String(d.grandTotal ?? "0")), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif">Abandoned Checkouts CRM</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Recover lost sales. Carts are scored by value and likelihood of recovery.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="rounded-3xl border border-border/40 bg-card/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Active Drafts</p>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-4xl font-serif text-foreground">{activeDrafts}</p>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Live</span>
          </div>
        </div>
        <div className="rounded-3xl border border-border/40 bg-card/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Recoverable Leads</p>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-4xl font-serif text-amber-600">{recoverable}</p>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse ml-1" />
          </div>
        </div>
        <div className="rounded-3xl border border-border/40 bg-card/60 p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">WhatsApp Pending</p>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="text-4xl font-serif text-green-600">{whatsappInitiated}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-primary/10 bg-primary/[0.02] p-6 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-bold">Total Recovery Value</p>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-lg font-serif text-primary/80">₹</span>
            <p className="text-4xl font-serif text-primary tracking-tight">{Math.round(totalAbandonedValue).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <CheckoutsTable initialDrafts={drafts} />
    </div>
  );
}
