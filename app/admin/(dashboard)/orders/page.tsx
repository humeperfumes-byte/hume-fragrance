import { db } from "@/db";
import { orders, products, type Order, type Product } from "@/db/schema";
import { asc, desc, gte } from "drizzle-orm";
import { OrdersTable } from "./OrdersTable";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { parseAdminMarket, isIndiaCheckoutSignal } from "@/lib/admin-market";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string; market?: string }> | { hours?: string; market?: string };
};

export default async function OrdersPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours);
  let allOrders: Order[] = [];
  let productOptions: Product[] = [];
  let tableExists = true;

  try {
    allOrders = await db
      .select()
      .from(orders)
      .where(gte(orders.createdAt, timeWindow.since))
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl">Order Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Master list of all checkout attempts and successful purchases.
          </p>
          <p className="mt-1 text-xs text-white/35">Showing orders from {timeWindow.label.toLowerCase()}.</p>
        </div>
        <AdminDateWindowControl />
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
