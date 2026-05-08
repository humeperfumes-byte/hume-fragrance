import { db } from "@/db";
import { orders, type Order } from "@/db/schema";
import { desc } from "drizzle-orm";
import { formatINR } from "@/lib/currency";
import { ExternalLink, Mail, MessageCircle } from "lucide-react";
import { buildAdminEmailHref, buildAdminWhatsAppHref } from "@/lib/admin-message-templates";

export const dynamic = "force-dynamic";

type CustomerRecord = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  orders: Order[];
  revenue: number;
  firstOrderAt: Date;
  lastOrderAt: Date;
};

function getCustomerKey(order: Order): string | null {
  const phone = order.phone?.replace(/\D/g, "");
  if (phone && phone.length >= 8) return `phone:${phone}`;
  const email = order.email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  return null;
}

function parseMoney(value: string | null): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function CustomersPage() {
  let allOrders: Order[] = [];
  let dbError = false;

  try {
    allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(1000);
  } catch (error) {
    console.error("Customers page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customer CRM</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              The orders table is missing columns. Run <code className="bg-white/10 px-2 py-1 rounded text-xs">npm run db:push</code> in your terminal to sync the schema, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const customerMap = new Map<string, CustomerRecord>();

  allOrders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      const key = getCustomerKey(order);
      if (!key) return;

      const existing = customerMap.get(key);
      const orderValue = parseMoney(order.grandTotal);

      if (existing) {
        existing.orders.push(order);
        existing.revenue += orderValue;
        if (order.createdAt < existing.firstOrderAt) existing.firstOrderAt = order.createdAt;
        if (order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
        return;
      }

      customerMap.set(key, {
        key,
        name: order.fullName || "Unknown customer",
        phone: order.phone,
        email: order.email,
        orders: [order],
        revenue: orderValue,
        firstOrderAt: order.createdAt,
        lastOrderAt: order.createdAt,
      });
    });

  const customers = Array.from(customerMap.values()).sort(
    (a, b) => b.revenue - a.revenue || b.orders.length - a.orders.length,
  );
  const repeatCustomers = customers.filter((customer) => customer.orders.length > 1);
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.revenue, 0);
  const averageClv = customers.length ? totalRevenue / customers.length : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Customer CRM</h1>
        <p className="mt-1 text-sm text-white/45">
          Repeat buyers, lifetime value, and customer order history.
        </p>
        <p className="mt-1 text-xs text-white/35">Showing all customers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Customers</p>
          <p className="mt-3 text-2xl font-semibold text-white">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Repeat Buyers</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">{repeatCustomers.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Customer Revenue</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatINR(totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Average CLV</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatINR(averageClv)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.55fr_0.65fr_1fr_170px] gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-medium text-white/45">
          <span>Customer</span>
          <span>Contact</span>
          <span className="text-right">Orders</span>
          <span className="text-right">CLV</span>
          <span>History</span>
          <span>Reconnect</span>
        </div>
        {customers.length === 0 ? (
          <div className="p-8 text-center text-sm text-white/35">No customer history yet.</div>
        ) : (
          customers.map((customer) => {
            const latestOrder = [...customer.orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
            const messageInput = {
              template: "repeat_customer" as const,
              name: customer.name,
              orderCount: customer.orders.length,
              lastOrderNumber: latestOrder?.orderNumber || null,
            };

            return (
              <div
                key={customer.key}
                className="grid grid-cols-[1.1fr_0.8fr_0.55fr_0.65fr_1fr_170px] gap-4 border-b border-white/5 px-5 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-medium text-white">{customer.name}</p>
                  <p className="mt-1 text-xs text-white/35">
                    First order {formatDate(customer.firstOrderAt)}
                  </p>
                </div>
                <div className="min-w-0 text-white/55">
                  <p className="truncate">{customer.phone || "No phone"}</p>
                  <p className="truncate text-xs">{customer.email || "No email"}</p>
                </div>
                <p className="text-right font-semibold text-white">{customer.orders.length}</p>
                <p className="text-right font-semibold text-white">{formatINR(customer.revenue)}</p>
                <div className="text-xs text-white/45">
                  <p>Last order {formatDate(customer.lastOrderAt)}</p>
                  <p className="mt-1">
                    {customer.orders
                      .slice(0, 3)
                      .map((order) => order.orderNumber)
                      .join(", ")}
                  </p>
                </div>
                <div className="grid gap-2">
                  <a
                    href={buildAdminWhatsAppHref(customer.phone, messageInput)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                  {customer.email ? (
                    <a
                      href={buildAdminEmailHref(customer.email, messageInput)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
