import { db } from "@/db";
import { orders, Order } from "@/db/schema";
import { desc } from "drizzle-orm";
import { OrdersTable } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let allOrders: Order[] = [];
  let tableExists = true;

  try {
    allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  } catch (error) {
    console.error("Orders table might be missing:", error);
    tableExists = false;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif">Order Management</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Master list of all checkout attempts and successful purchases.
        </p>
      </div>

      {!tableExists ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium">Database Sync Required</h3>
            <p className="text-sm text-muted-foreground">
              The new "Orders" table hasn't been created in your database yet. 
              Please run the migration or use the Neon console to add the table.
            </p>
          </div>
        </div>
      ) : (
        <OrdersTable initialOrders={allOrders} />
      )}
    </div>
  );
}
