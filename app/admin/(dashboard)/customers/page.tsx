import { db } from "@/db";
import { checkoutDrafts, orders, type CheckoutDraft, type Order } from "@/db/schema";
import { desc, gte } from "drizzle-orm";
import { formatINR } from "@/lib/currency";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { CustomersTable, type CustomerRecord } from "./CustomersTable";

export const dynamic = "force-dynamic";

type CustomerSource = Order | CheckoutDraft;

function getIdentityKeys(row: CustomerSource): string[] {
  const keys: string[] = [];
  const phone = row.phone?.replace(/\D/g, "");
  const email = row.email?.trim().toLowerCase();
  if (phone && phone.length >= 8) keys.push(`phone:${phone}`);
  if (email) keys.push(`email:${email}`);
  if (!keys.length && row.sessionId) keys.push(`session:${row.sessionId}`);
  return keys;
}

function getPrimaryCustomerKey(row: CustomerSource): string | null {
  return getIdentityKeys(row)[0] ?? null;
}

function parseMoney(value: string | null): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isCheckoutLead(draft: CheckoutDraft): boolean {
  const hasContact = Boolean(draft.phone || draft.email);
  const hasDeliveryDetails = Boolean(draft.fullName || draft.addressLine1 || draft.city || draft.state || draft.pincode);
  const hasCart = Boolean(draft.cartSnapshot?.length);

  return hasContact && (hasDeliveryDetails || hasCart || draft.status === "complete" || draft.status === "whatsapp_initiated");
}

function mergeIntoCustomerMap(
  customerMap: Map<string, CustomerRecord>,
  aliasMap: Map<string, string>,
  row: CustomerSource,
): string | null {
  const identityKeys = getIdentityKeys(row);
  if (!identityKeys.length) return null;

  const existingKey = identityKeys.map((key) => aliasMap.get(key)).find(Boolean);
  const primaryKey = existingKey || getPrimaryCustomerKey(row);
  if (!primaryKey) return null;

  identityKeys.forEach((key) => aliasMap.set(key, primaryKey));
  return primaryKey;
}

function latestName(existing: CustomerRecord | null, row: CustomerSource): string {
  return row.fullName || existing?.name || "Unknown customer";
}

function latestPhone(existing: CustomerRecord | null, row: CustomerSource): string | null {
  return row.phone || existing?.phone || null;
}

function latestEmail(existing: CustomerRecord | null, row: CustomerSource): string | null {
  return row.email || existing?.email || null;
}

function createCustomerFromOrder(key: string, order: Order): CustomerRecord {
  const orderValue = parseMoney(order.grandTotal);
  return {
    key,
    name: order.fullName || "Unknown customer",
    phone: order.phone,
    email: order.email,
    orders: [order],
    checkoutDrafts: [],
    revenue: orderValue,
    potentialValue: 0,
    firstSeenAt: order.createdAt,
    lastSeenAt: order.createdAt,
    firstOrderAt: order.createdAt,
    lastOrderAt: order.createdAt,
  };
}

function createCustomerFromDraft(key: string, draft: CheckoutDraft): CustomerRecord {
  const draftValue = parseMoney(draft.grandTotal);
  return {
    key,
    name: draft.fullName || "Unknown checkout lead",
    phone: draft.phone,
    email: draft.email,
    orders: [],
    checkoutDrafts: [draft],
    revenue: 0,
    potentialValue: draftValue,
    firstSeenAt: draft.createdAt,
    lastSeenAt: draft.updatedAt,
    firstOrderAt: null,
    lastOrderAt: null,
  };
}

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string }> | { hours?: string };
};

export default async function CustomersPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours);
  let allOrders: Order[] = [];
  let allDrafts: CheckoutDraft[] = [];
  let dbError = false;

  try {
    const [orderRows, draftRows] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, timeWindow.since))
        .orderBy(desc(orders.createdAt))
        .limit(1000),
      db
        .select()
        .from(checkoutDrafts)
        .where(gte(checkoutDrafts.updatedAt, timeWindow.since))
        .orderBy(desc(checkoutDrafts.updatedAt))
        .limit(1000),
    ]);
    const excludedSessionIds = collectExcludedSessionIds(orderRows, draftRows);
    allOrders = filterExcludedAdminRows(orderRows, excludedSessionIds);
    allDrafts = filterExcludedAdminRows(draftRows, excludedSessionIds).filter(isCheckoutLead);
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
              The customer tables are missing columns. Run <code className="bg-white/10 px-2 py-1 rounded text-xs">npm run db:push</code> in your terminal to sync the schema, then refresh this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const customerMap = new Map<string, CustomerRecord>();
  const aliasMap = new Map<string, string>();

  allOrders
    .filter((order) => order.status !== "cancelled")
    .forEach((order) => {
      const key = mergeIntoCustomerMap(customerMap, aliasMap, order);
      if (!key) return;

      const existing = customerMap.get(key);
      const orderValue = parseMoney(order.grandTotal);

      if (existing) {
        existing.orders.push(order);
        existing.revenue += orderValue;
        existing.name = latestName(existing, order);
        existing.phone = latestPhone(existing, order);
        existing.email = latestEmail(existing, order);
        if (order.createdAt < existing.firstSeenAt) existing.firstSeenAt = order.createdAt;
        if (order.createdAt > existing.lastSeenAt) existing.lastSeenAt = order.createdAt;
        if (!existing.firstOrderAt || order.createdAt < existing.firstOrderAt) existing.firstOrderAt = order.createdAt;
        if (!existing.lastOrderAt || order.createdAt > existing.lastOrderAt) existing.lastOrderAt = order.createdAt;
        return;
      }

      customerMap.set(key, createCustomerFromOrder(key, order));
    });

  allDrafts.forEach((draft) => {
    const key = mergeIntoCustomerMap(customerMap, aliasMap, draft);
    if (!key) return;

    const existing = customerMap.get(key);
    const draftValue = parseMoney(draft.grandTotal);

    if (existing) {
      const isAlreadyOrderedSession = existing.orders.some((order) => order.sessionId === draft.sessionId);
      existing.checkoutDrafts.push(draft);
      existing.potentialValue += isAlreadyOrderedSession ? 0 : draftValue;
      existing.name = latestName(existing, draft);
      existing.phone = latestPhone(existing, draft);
      existing.email = latestEmail(existing, draft);
      if (draft.createdAt < existing.firstSeenAt) existing.firstSeenAt = draft.createdAt;
      if (draft.updatedAt > existing.lastSeenAt) existing.lastSeenAt = draft.updatedAt;
      return;
    }

    customerMap.set(key, createCustomerFromDraft(key, draft));
  });

  customerMap.forEach((customer) => {
    customer.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    customer.checkoutDrafts.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    if (customer.name === "Unknown customer" && customer.checkoutDrafts[0]?.fullName) {
      customer.name = customer.checkoutDrafts[0].fullName;
    }
  });

  const customers = Array.from(customerMap.values()).sort(
    (a, b) =>
      b.revenue - a.revenue ||
      b.potentialValue - a.potentialValue ||
      b.lastSeenAt.getTime() - a.lastSeenAt.getTime(),
  );
  const repeatCustomers = customers.filter((customer) => customer.orders.length > 1);
  const checkoutLeadCustomers = customers.filter((customer) => customer.checkoutDrafts.length > 0);
  const payingCustomers = customers.filter((customer) => customer.orders.length > 0);
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.revenue, 0);
  const potentialLeadValue = customers.reduce((sum, customer) => sum + customer.potentialValue, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-white">Customer CRM</h1>
          <p className="mt-1 text-sm text-white/45">
            Paying buyers, fully captured checkout leads, saved addresses, and reorder details.
          </p>
          <p className="mt-1 text-xs text-white/35">Showing customers from {timeWindow.label.toLowerCase()}.</p>
        </div>
        <AdminDateWindowControl />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">People</p>
          <p className="mt-3 text-2xl font-semibold text-white">{customers.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Checkout Leads</p>
          <p className="mt-3 text-2xl font-semibold text-amber-200">{checkoutLeadCustomers.length}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Paying Buyers</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">
            {payingCustomers.length}
            <span className="ml-2 text-xs font-medium text-white/35">{repeatCustomers.length} repeat</span>
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-medium text-white/45">Revenue / Lead Value</p>
          <p className="mt-3 text-2xl font-semibold text-white">{formatINR(totalRevenue)}</p>
          <p className="mt-1 text-xs text-white/35">{formatINR(potentialLeadValue)} open lead value</p>
        </div>
      </div>

      <CustomersTable customers={customers} />
    </div>
  );
}
