import { desc, gte } from "drizzle-orm";
import { Bot, ExternalLink, Globe2, Sparkles, TrendingUp } from "lucide-react";
import { db } from "@/db";
import { behavioralEvents, cartEvents, checkoutDrafts, orders } from "@/db/schema";
import { AdminDateWindowControl } from "@/components/admin/AdminDateWindowControl";
import { Badge } from "@/components/ui/badge";
import {
  classifyAdminSource,
  getAttributionDomain,
  type AdminSourceGroup,
  type AdminSourceKey,
} from "@/lib/admin-ai-sources";
import { collectExcludedSessionIds, filterExcludedAdminRows } from "@/lib/admin-data-filters";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams?: Promise<{ hours?: string }> | { hours?: string };
};

type CartItem = {
  id?: string;
  name?: string;
  quantity?: number;
  price?: number;
  isGift?: boolean;
};

type SourceStats = {
  group: AdminSourceGroup;
  sessions: Set<string>;
  draftCount: number;
  pageViews: number;
  addToCartCount: number;
  orderCount: number;
  revenue: number;
  domains: Map<string, number>;
  pages: Map<string, number>;
  products: Map<string, number>;
  lastSeen: Date | null;
};

function money(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0") || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function percent(numerator: number, denominator: number) {
  if (denominator <= 0) return "0.0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

function formatDateTime(value: Date | null) {
  if (!value) return "No signal yet";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getStatsBucket(stats: Map<AdminSourceKey, SourceStats>, group: AdminSourceGroup) {
  const existing = stats.get(group.key);
  if (existing) return existing;

  const bucket: SourceStats = {
    group,
    sessions: new Set(),
    draftCount: 0,
    pageViews: 0,
    addToCartCount: 0,
    orderCount: 0,
    revenue: 0,
    domains: new Map(),
    pages: new Map(),
    products: new Map(),
    lastSeen: null,
  };
  stats.set(group.key, bucket);
  return bucket;
}

function incrementMap(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

function addProducts(bucket: SourceStats, items: CartItem[] | null | undefined) {
  for (const item of items ?? []) {
    if (!item?.name || item.isGift) continue;
    incrementMap(bucket.products, item.name, item.quantity || 1);
  }
}

function touch(bucket: SourceStats, date: Date) {
  if (!bucket.lastSeen || date > bucket.lastSeen) bucket.lastSeen = date;
}

function sortedEntries(map: Map<string, number>, limit = 4) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function pageLabel(path?: string | null) {
  if (!path) return "unknown page";
  try {
    const url = new URL(path);
    return url.pathname || "/";
  } catch {
    return path.split("?")[0] || "unknown page";
  }
}

export default async function AiVisibilityPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const timeWindow = parseAdminTimeWindow(params?.hours);

  const [draftRows, orderRows, cartRows, behaviorRows] = await Promise.all([
    db
      .select({
        sessionId: checkoutDrafts.sessionId,
        status: checkoutDrafts.status,
        path: checkoutDrafts.path,
        acquisitionSource: checkoutDrafts.acquisitionSource,
        acquisitionCategory: checkoutDrafts.acquisitionCategory,
        acquisitionReferrerHost: checkoutDrafts.acquisitionReferrerHost,
        utmSource: checkoutDrafts.utmSource,
        utmMedium: checkoutDrafts.utmMedium,
        utmCampaign: checkoutDrafts.utmCampaign,
        phone: checkoutDrafts.phone,
        email: checkoutDrafts.email,
        fullName: checkoutDrafts.fullName,
        cartSnapshot: checkoutDrafts.cartSnapshot,
        ipAddress: checkoutDrafts.ipAddress,
        userAgent: checkoutDrafts.userAgent,
        updatedAt: checkoutDrafts.updatedAt,
      })
      .from(checkoutDrafts)
      .where(gte(checkoutDrafts.updatedAt, timeWindow.since))
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(3000),
    db
      .select({
        orderNumber: orders.orderNumber,
        sessionId: orders.sessionId,
        status: orders.status,
        checkoutChannel: orders.checkoutChannel,
        path: orders.path,
        acquisitionSource: orders.acquisitionSource,
        acquisitionCategory: orders.acquisitionCategory,
        acquisitionReferrerHost: orders.acquisitionReferrerHost,
        utmSource: orders.utmSource,
        utmMedium: orders.utmMedium,
        utmCampaign: orders.utmCampaign,
        fullName: orders.fullName,
        phone: orders.phone,
        email: orders.email,
        grandTotal: orders.grandTotal,
        cartSnapshot: orders.cartSnapshot,
        ipAddress: orders.ipAddress,
        userAgent: orders.userAgent,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(gte(orders.createdAt, timeWindow.since))
      .orderBy(desc(orders.createdAt))
      .limit(3000),
    db
      .select({
        sessionId: cartEvents.sessionId,
        eventType: cartEvents.eventType,
        path: cartEvents.path,
        productName: cartEvents.productName,
        quantity: cartEvents.quantity,
        userAgent: cartEvents.userAgent,
        createdAt: cartEvents.createdAt,
      })
      .from(cartEvents)
      .where(gte(cartEvents.createdAt, timeWindow.since))
      .orderBy(desc(cartEvents.createdAt))
      .limit(3000),
    db
      .select({
        sessionId: behavioralEvents.sessionId,
        eventType: behavioralEvents.eventType,
        path: behavioralEvents.path,
        userAgent: behavioralEvents.userAgent,
        createdAt: behavioralEvents.createdAt,
      })
      .from(behavioralEvents)
      .where(gte(behavioralEvents.createdAt, timeWindow.since))
      .orderBy(desc(behavioralEvents.createdAt))
      .limit(3000),
  ]);

  const excludedSessionIds = collectExcludedSessionIds(draftRows, orderRows);
  const drafts = filterExcludedAdminRows(draftRows, excludedSessionIds);
  const orderSignals = filterExcludedAdminRows(orderRows, excludedSessionIds);
  const stats = new Map<AdminSourceKey, SourceStats>();
  const sessionGroups = new Map<string, AdminSourceGroup>();

  for (const draft of drafts) {
    const group = classifyAdminSource(draft);
    const bucket = getStatsBucket(stats, group);
    sessionGroups.set(draft.sessionId, group);
    bucket.sessions.add(draft.sessionId);
    bucket.draftCount += 1;
    incrementMap(bucket.domains, getAttributionDomain(draft));
    incrementMap(bucket.pages, pageLabel(draft.path));
    addProducts(bucket, draft.cartSnapshot as CartItem[]);
    touch(bucket, draft.updatedAt);
  }

  for (const order of orderSignals) {
    const group = classifyAdminSource(order);
    const bucket = getStatsBucket(stats, group);
    sessionGroups.set(order.sessionId, group);
    bucket.sessions.add(order.sessionId);
    bucket.orderCount += 1;
    bucket.revenue += money(order.grandTotal);
    incrementMap(bucket.domains, getAttributionDomain(order));
    incrementMap(bucket.pages, pageLabel(order.path));
    addProducts(bucket, order.cartSnapshot as CartItem[]);
    touch(bucket, order.createdAt);
  }

  for (const row of filterExcludedAdminRows(cartRows, excludedSessionIds)) {
    const group = sessionGroups.get(row.sessionId) ?? classifyAdminSource(row);
    const bucket = getStatsBucket(stats, group);
    bucket.sessions.add(row.sessionId);
    if (row.eventType === "add_to_cart") {
      bucket.addToCartCount += 1;
      if (row.productName) incrementMap(bucket.products, row.productName, row.quantity || 1);
    }
    incrementMap(bucket.pages, pageLabel(row.path));
    touch(bucket, row.createdAt);
  }

  for (const row of filterExcludedAdminRows(behaviorRows, excludedSessionIds)) {
    const group = sessionGroups.get(row.sessionId) ?? classifyAdminSource(row);
    const bucket = getStatsBucket(stats, group);
    bucket.sessions.add(row.sessionId);
    if (row.eventType === "page_view") bucket.pageViews += 1;
    incrementMap(bucket.pages, pageLabel(row.path));
    touch(bucket, row.createdAt);
  }

  const sourceRows = Array.from(stats.values()).sort((a, b) => {
    if (a.group.isAi !== b.group.isAi) return a.group.isAi ? -1 : 1;
    if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
    if (b.revenue !== a.revenue) return b.revenue - a.revenue;
    return b.draftCount - a.draftCount;
  });

  const aiRows = sourceRows.filter((row) => row.group.isAi);
  const aiOrders = aiRows.reduce((sum, row) => sum + row.orderCount, 0);
  const aiDrafts = aiRows.reduce((sum, row) => sum + row.draftCount, 0);
  const aiPageViews = aiRows.reduce((sum, row) => sum + row.pageViews, 0);
  const aiAddToCart = aiRows.reduce((sum, row) => sum + row.addToCartCount, 0);
  const aiRevenue = aiRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalRevenue = sourceRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalOrders = sourceRows.reduce((sum, row) => sum + row.orderCount, 0);
  const totalDrafts = sourceRows.reduce((sum, row) => sum + row.draftCount, 0);
  const chatgpt = stats.get("chatgpt");
  const domainStats = new Map<string, number>();
  sourceRows.forEach((row) => row.domains.forEach((count, domain) => incrementMap(domainStats, domain, count)));
  const topAiProducts = new Map<string, number>();
  aiRows.forEach((row) => row.products.forEach((count, product) => incrementMap(topAiProducts, product, count)));
  const topAiPages = new Map<string, number>();
  aiRows.forEach((row) => row.pages.forEach((count, page) => incrementMap(topAiPages, page, count)));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              AI Growth
            </Badge>
            <Badge className="border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.04]">
              {timeWindow.label}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold text-white">AI Visibility</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            Track how ChatGPT, Perplexity, Gemini, Copilot, Google, Bing, and direct traffic move from checkout intent to paid or WhatsApp orders.
          </p>
        </div>
        <AdminDateWindowControl />
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/45">AI Orders</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-100">{aiOrders}</p>
          <p className="mt-2 text-xs text-emerald-100/55">{percent(aiOrders, totalOrders)} of all orders</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">AI Revenue</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatMoney(aiRevenue)}</p>
          <p className="mt-2 text-xs text-white/40">{percent(aiRevenue, totalRevenue)} of tracked revenue</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">ChatGPT Orders</p>
          <p className="mt-3 text-3xl font-semibold text-white">{chatgpt?.orderCount ?? 0}</p>
          <p className="mt-2 text-xs text-white/40">{chatgpt?.draftCount ?? 0} checkout signals</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Checkout Signals</p>
          <p className="mt-3 text-3xl font-semibold text-white">{totalDrafts}</p>
          <p className="mt-2 text-xs text-white/40">{aiDrafts} from AI sources</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">AI Add To Cart</p>
          <p className="mt-3 text-3xl font-semibold text-white">{aiAddToCart}</p>
          <p className="mt-2 text-xs text-white/40">{aiPageViews} AI page views</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-lg font-semibold text-white">Source To Order Funnel</h2>
            <p className="mt-1 text-sm text-white/40">Grouped from attribution fields, referrer host, UTM, path, and user agent.</p>
          </div>
          {sourceRows.length ? (
            <div className="divide-y divide-white/8">
              {sourceRows.map((row) => (
                <div key={row.group.key} className="grid gap-4 p-5 lg:grid-cols-[1fr_100px_110px_110px_100px_130px] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={cn("border hover:bg-transparent", row.group.tone)}>
                        {row.group.isAi ? <Bot className="mr-1 h-3.5 w-3.5" /> : <Globe2 className="mr-1 h-3.5 w-3.5" />}
                        {row.group.label}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate text-xs text-white/35">
                      Top domains: {sortedEntries(row.domains, 3).map(([domain, count]) => `${domain} (${count})`).join(", ") || "none"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Sessions</p>
                    <p className="mt-1 text-lg font-semibold text-white">{row.sessions.size}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Views</p>
                    <p className="mt-1 text-lg font-semibold text-white">{row.pageViews}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Checkouts</p>
                    <p className="mt-1 text-lg font-semibold text-white">{row.draftCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Cart</p>
                    <p className="mt-1 text-lg font-semibold text-white">{row.addToCartCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Orders</p>
                    <p className="mt-1 text-lg font-semibold text-white">{row.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Revenue</p>
                    <p className="mt-1 text-lg font-semibold text-white">{formatMoney(row.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bot className="mx-auto h-8 w-8 text-white/25" />
              <h3 className="mt-4 text-lg font-semibold text-white">No source signals yet</h3>
              <p className="mt-2 text-sm text-white/40">When checkout or order attribution is captured, it will appear here.</p>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Globe2 className="h-4 w-4 text-white/35" />
              Domain Split
            </h2>
            <div className="mt-4 space-y-3">
              {sortedEntries(domainStats, 6).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-3 py-3">
                  <span className="truncate text-sm text-white/75">{domain}</span>
                  <span className="text-sm font-semibold text-white">{count}</span>
                </div>
              ))}
              {domainStats.size === 0 ? <p className="text-sm text-white/35">No domain data yet.</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <TrendingUp className="h-4 w-4 text-white/35" />
              AI Product Demand
            </h2>
            <div className="mt-4 space-y-3">
              {sortedEntries(topAiProducts, 6).map(([product, count]) => (
                <div key={product} className="rounded-2xl border border-white/8 bg-black/15 px-3 py-3">
                  <p className="truncate text-sm font-medium text-white">{product}</p>
                  <p className="mt-1 text-xs text-white/35">{count} AI-attributed cart/order item signals</p>
                </div>
              ))}
              {topAiProducts.size === 0 ? <p className="text-sm text-white/35">No AI product signals yet.</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="h-4 w-4 text-white/35" />
              AI Landing Pages
            </h2>
            <div className="mt-4 space-y-3">
              {sortedEntries(topAiPages, 6).map(([page, count]) => (
                <div key={page} className="rounded-2xl border border-white/8 bg-black/15 px-3 py-3">
                  <p className="truncate text-sm font-medium text-white">{page}</p>
                  <p className="mt-1 text-xs text-white/35">{count} AI-attributed signals</p>
                </div>
              ))}
              {topAiPages.size === 0 ? <p className="text-sm text-white/35">No AI page signals yet.</p> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold text-white">Last Seen</h2>
            <div className="mt-4 space-y-3">
              {sourceRows.slice(0, 5).map((row) => (
                <div key={row.group.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/65">{row.group.label}</span>
                  <span className="text-right text-white/35">{formatDateTime(row.lastSeen)}</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-5 text-sm font-semibold text-emerald-100 transition-colors hover:bg-emerald-400/15"
          >
            Open AI summary file
            <ExternalLink className="h-4 w-4" />
          </a>
        </aside>
      </div>
    </div>
  );
}
