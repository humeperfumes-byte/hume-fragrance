import { db } from "@/db";
import { orders, products, type Order, type Product } from "@/db/schema";
import { and, asc, desc, gte, lte } from "drizzle-orm";
import { OrdersTable } from "./OrdersTable";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { parseAdminMarket, isIndiaCheckoutSignal } from "@/lib/admin-market";
import { PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string; market?: string; from?: string; to?: string }> | { hours?: string; market?: string; from?: string; to?: string };
};

export default async function OrdersPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours, params?.from, params?.to);
  let allOrders: Order[] = [];
  let productOptions: Product[] = [];
  let tableExists = true;

  try {
    allOrders = await db
      .select()
      .from(orders)
      .where(and(gte(orders.createdAt, timeWindow.since), lte(orders.createdAt, timeWindow.until)))
      .orderBy(desc(orders.createdAt))
      .limit(200);
    allOrders = filterExcludedAdminRows(allOrders, collectExcludedSessionIds(allOrders));

    const market = parseAdminMarket(params?.market);
    if (market === "india") {
      allOrders = allOrders.filter(isIndiaCheckoutSignal);
    } else if (market === "out_of_india") {
      allOrders = allOrders.filter((row) => !isIndiaCheckoutSignal(row));
    }
  } catch (error) {
    console.error("Orders table might be missing:", error);
    tableExists = false;
  }

  try {
    productOptions = await db.select().from(products).orderBy(asc(products.name));
  } catch (error) {
    console.error("Unable to load product replacement options:", error);
  }

  return (
    <div className="admin-page-layout mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c5a9ff]/25 bg-[#c5a9ff]/10 shadow-[inset_0_1px_rgba(255,255,255,.08)]">
            <PackageCheck className="h-5 w-5 text-[#d5c1ff]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#c9b0ff]/65">Sales operations</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Order Management</h1>
          <p className="mt-1 text-sm text-white/45">
            Master list of all checkout attempts and successful purchases.
          </p>
          <p className="mt-1 text-xs text-white/35">Showing orders from {timeWindow.label.toLowerCase()}.</p>
          </div>
        </div>
      </div>

      {!tableExists ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium">Database Sync Required</h3>
            <p className="text-sm text-muted-foreground">
              The new Orders table has not been created in your database yet.
              Please run the migration or use the Neon console to add the table.
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable initialOrders={allOrders} productOptions={productOptions} />
      )}
    </div>
  );
}
