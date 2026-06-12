"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PackageCheck,
  RefreshCcw,
  Repeat2,
  ShoppingBag,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplateMessagesPanel } from "@/components/admin/TemplateMessagesPanel";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { parseAdminMarket } from "@/lib/admin-market";
import { ADMIN_TIME_WINDOW_OPTIONS } from "@/lib/admin-time-window";
import { displayPhoneNumber } from "@/lib/phone";

type DashboardAnalytics = {
  ok: boolean;
  windowHours: number;
  market: "india" | "all";
  overview: {
    uniqueViewers: number;
    uniqueCartVisitors: number;
    totalPageViews: number;
    totalCartOpens: number;
    totalAddToCart: number;
    totalQuantityUpdates: number;
    totalRemoveFromCart: number;
    activeDrafts: number;
    recoverableDrafts: number;
    whatsappInitiatedDrafts: number;
    abandonedDraftValue: number;
    recoverableDraftValue: number;
    orders: number;
    openOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    revenue: number;
    deliveredRevenue: number;
    averageOrderValue: number;
  };
  conversionFunnel: {
    visitors: number;
    cartVisitors: number;
    addToCart: number;
    checkoutDrafts: number;
    whatsappInitiated: number;
    orders: number;
    visitorToCartRate: number;
    cartToDraftRate: number;
    draftToOrderRate: number;
    visitorToOrderRate: number;
  };
  sourceRoi: Array<{
    source: string;
    category: string;
    visits: number;
    addToCart: number;
    drafts: number;
    draftValue: number;
    orders: number;
    revenue: number;
    visitToOrderRate: number;
    revenuePerVisit: number;
  }>;
  productDemand: Array<{
    productId: string;
    name: string;
    addToCart: number;
    orderedUnits: number;
    orderRevenue: number;
    draftUnits: number;
    draftValue: number;
    demandScore: number;
  }>;
  repeatCustomers: Array<{
    name: string;
    phone: string | null;
    email: string | null;
    orders: number;
    revenue: number;
    lastOrderAt: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    fullName: string | null;
    phone: string | null;
    grandTotal: number;
    createdAt: string;
  }>;
  topViewedPages: Array<{
    path: string;
    views: number;
  }>;
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

function formatRate(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClassName(status: string): string {
  switch (status) {
    case "delivered":
      return "bg-emerald-500/10 text-emerald-300";
    case "shipped":
      return "bg-blue-500/10 text-blue-300";
    case "processing":
      return "bg-indigo-500/10 text-indigo-300";
    case "cancelled":
      return "bg-red-500/10 text-red-300";
    default:
      return "bg-amber-500/10 text-amber-300";
  }
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
      {label}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof TrendingUp;
  tone?: "neutral" | "money" | "warning" | "success";
}) {
  const toneClass =
    tone === "money"
      ? "border-primary/25 bg-primary/[0.04] text-primary"
      : tone === "warning"
        ? "border-amber-500/20 bg-amber-500/[0.04] text-amber-300"
        : tone === "success"
          ? "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300"
          : "border-white/5 bg-white/[0.03] text-white";

  return (
    <div className={`min-w-0 rounded-2xl border p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium text-white/45">{label}</p>
        <Icon className="h-4 w-4 opacity-70" />
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-[11px] font-medium text-white/35">{helper}</p>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const market = parseAdminMarket(searchParams.get("market"));
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [timeWindowHours, setTimeWindowHours] = useState("720");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/dashboard?hours=${timeWindowHours}&market=${market}`, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to load dashboard");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to refresh dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [market, timeWindowHours]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const dailyRunList = useMemo(() => {
    const overview = analytics?.overview;
    if (!overview) return [];
    const marketQuery = market === "all" ? "?market=all" : "?market=india";

    return [
      {
        label: "Recover checkout leads",
        value: overview.recoverableDrafts,
        helper: `${formatINR(overview.recoverableDraftValue)} recoverable value`,
        href: `/admin/checkouts${marketQuery}`,
        tone: "warning",
      },
      {
        label: "Move open orders",
        value: overview.openOrders,
        helper: "WhatsApp, processing, or shipped orders still active",
        href: `/admin/orders${marketQuery}`,
        tone: "success",
      },
      {
        label: "Fix funnel leaks",
        value: formatRate(analytics.conversionFunnel.draftToOrderRate),
        helper: "Checkout draft to order conversion",
        href: `/admin/checkouts${marketQuery}`,
        tone: "neutral",
      },
    ];
  }, [analytics, market]);

  const maxFunnelValue = Math.max(
    analytics?.conversionFunnel.visitors ?? 0,
    analytics?.conversionFunnel.cartVisitors ?? 0,
    analytics?.conversionFunnel.addToCart ?? 0,
    analytics?.conversionFunnel.checkoutDrafts ?? 0,
    analytics?.conversionFunnel.orders ?? 0,
    1,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/45">
            Daily Operating View
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Command Center</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Revenue, funnel leakage, source quality, demand, and customer signals in one working
            view.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 sm:flex-none">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
              Window
            </span>
            <select
              value={timeWindowHours}
              onChange={(event) => setTimeWindowHours(event.target.value)}
              className="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-white outline-none sm:flex-none"
            >
              {ADMIN_TIME_WINDOW_OPTIONS.map((option) => (
                <option key={option.hours} value={option.hours}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
            disabled={loading}
            className="h-10 w-10 rounded-xl border-white/10 bg-white/[0.03]"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {!analytics && loading ? (
        <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-32 rounded-3xl bg-white/[0.04]" />
          ))}
        </div>
      ) : null}

      {analytics ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Revenue"
              value={formatINR(analytics.overview.revenue)}
              helper={`${analytics.overview.orders} non-cancelled orders`}
              icon={TrendingUp}
              tone="money"
            />
            <MetricCard
              label="Average Order"
              value={formatINR(analytics.overview.averageOrderValue)}
              helper={`${analytics.overview.deliveredOrders} delivered orders`}
              icon={ShoppingBag}
            />
            <MetricCard
              label="Abandoned Value"
              value={formatINR(analytics.overview.abandonedDraftValue)}
              helper={`${analytics.overview.recoverableDrafts} recoverable leads`}
              icon={AlertTriangle}
              tone="warning"
            />
            <MetricCard
              label="Conversion"
              value={formatRate(analytics.conversionFunnel.visitorToOrderRate)}
              helper={`${formatNumber(analytics.conversionFunnel.visitors)} visitors to orders`}
              icon={Target}
              tone="success"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Morning Run List</h2>
                  <p className="mt-1 text-sm text-white/35">The jobs that move money today.</p>
                </div>
                <PackageCheck className="h-5 w-5 text-primary/70" />
              </div>

              <div className="space-y-3">
                {dailyRunList.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-white/35">{item.helper}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                      <span
                        className={`text-xl font-semibold ${
                          item.tone === "warning"
                            ? "text-amber-300"
                            : item.tone === "success"
                              ? "text-emerald-300"
                              : "text-white"
                        }`}
                      >
                        {item.value}
                      </span>
                      <ArrowRight className="h-4 w-4 text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Conversion Funnel</h2>
                  <p className="mt-1 text-sm text-white/35">Where demand turns into orders.</p>
                </div>
                <BarChart3 className="h-5 w-5 text-primary/70" />
              </div>

              <div className="space-y-4">
                {[
                  ["Visitors", analytics.conversionFunnel.visitors],
                  ["Cart visitors", analytics.conversionFunnel.cartVisitors],
                  ["Add to carts", analytics.conversionFunnel.addToCart],
                  ["Checkout drafts", analytics.conversionFunnel.checkoutDrafts],
                  ["WhatsApp started", analytics.conversionFunnel.whatsappInitiated],
                  ["Orders", analytics.conversionFunnel.orders],
                ].map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[minmax(84px,0.85fr)_minmax(70px,1fr)_52px] items-center gap-3 sm:grid-cols-[130px_1fr_70px] sm:gap-4">
                    <span className="min-w-0 truncate text-xs font-medium text-white/45">{label}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${Math.max(3, (Number(value) / maxFunnelValue) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right text-sm font-semibold text-white">{formatNumber(Number(value))}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Visitor to Cart</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.visitorToCartRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Cart to Draft</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.cartToDraftRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Draft to Order</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.draftToOrderRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Visitor to Order</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.visitorToOrderRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
              <h2 className="text-lg font-semibold text-white">Source ROI Proxy</h2>
              <p className="mt-1 text-sm text-white/35">
                Revenue and pipeline by acquisition source. Add ad spend later for true ROI.
              </p>

              <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {analytics.sourceRoi.length === 0 ? (
                  <EmptyState label="No source performance recorded yet." />
                ) : (
                  <table className="w-full min-w-[640px] text-sm sm:min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-[0.18em] text-white/30">
                        <th className="py-3 font-bold">Source</th>
                        <th className="py-3 text-right font-bold">Visits</th>
                        <th className="py-3 text-right font-bold">Drafts</th>
                        <th className="py-3 text-right font-bold">Orders</th>
                        <th className="py-3 text-right font-bold">Revenue</th>
                        <th className="py-3 text-right font-bold">Rev / Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.sourceRoi.map((source) => (
                        <tr key={`${source.source}-${source.category}`} className="border-b border-white/5">
                          <td className="py-4">
                            <p className="font-medium text-white">{source.source}</p>
                            <p className="mt-1 text-xs text-white/30">{source.category}</p>
                          </td>
                          <td className="py-4 text-right text-white/60">{formatNumber(source.visits)}</td>
                          <td className="py-4 text-right text-amber-300">{source.drafts}</td>
                          <td className="py-4 text-right text-emerald-300">{source.orders}</td>
                          <td className="py-4 text-right font-medium text-white">{formatINR(source.revenue)}</td>
                          <td className="py-4 text-right text-white/60">{formatINR(source.revenuePerVisit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
              <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
              <p className="mt-1 text-sm text-white/35">The latest customer commitments.</p>

              <div className="mt-6 space-y-3">
                {analytics.recentOrders.length === 0 ? (
                  <EmptyState label="No orders in this window." />
                ) : (
                  analytics.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders${market === "all" ? "?market=all" : "?market=india"}`}
                      className="block rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-white">{order.orderNumber}</p>
                          <p className="mt-1 text-xs text-white/35">
                            {order.fullName || displayPhoneNumber(order.phone) || "Guest"} - {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-white">{formatINR(order.grandTotal)}</p>
                          <span
                            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusClassName(order.status)}`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Product Demand</h2>
                  <p className="mt-1 text-sm text-white/35">
                    Demand score blends ordered units, draft units, and add-to-cart activity.
                  </p>
                </div>
                <ShoppingBag className="h-5 w-5 text-primary/70" />
              </div>

              <div className="space-y-4">
                {analytics.productDemand.length === 0 ? (
                  <EmptyState label="No product demand signals recorded yet." />
                ) : (
                  analytics.productDemand.map((product, index) => (
                    <div key={product.productId} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/35">
                            #{index + 1} - {product.productId}
                          </p>
                          <p className="mt-1 font-medium text-white">{product.name}</p>
                        </div>
                        <p className="text-xl font-semibold text-primary">{product.demandScore}</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-white/30">Cart</p>
                          <p className="mt-1 text-base font-semibold text-white">{product.addToCart}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-white/30">Draft Units</p>
                          <p className="mt-1 text-base font-semibold text-amber-300">{product.draftUnits}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-white/30">Sold Units</p>
                          <p className="mt-1 text-base font-semibold text-emerald-300">{product.orderedUnits}</p>
                        </div>
                        <div className="rounded-xl bg-white/[0.04] p-3">
                          <p className="text-white/30">Revenue</p>
                          <p className="mt-1 text-base font-semibold text-white">{formatINR(product.orderRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">Repeat Customers</h2>
                    <p className="mt-1 text-sm text-white/35">People proving retention with more than one order.</p>
                  </div>
                  <Repeat2 className="h-5 w-5 text-primary/70" />
                </div>

                <div className="space-y-3">
                  {analytics.repeatCustomers.length === 0 ? (
                    <EmptyState label="Repeat customers will appear after second orders are captured." />
                  ) : (
                    analytics.repeatCustomers.map((customer) => (
                      <div
                        key={`${customer.phone || customer.email}-${customer.lastOrderAt}`}
                        className="rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-white">{customer.name}</p>
                            <p className="mt-1 text-xs text-white/35">
                              {displayPhoneNumber(customer.phone) || customer.email || "No contact"} - Last {formatDate(customer.lastOrderAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">{formatINR(customer.revenue)}</p>
                            <p className="mt-1 text-xs text-white/35">{customer.orders} orders</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="min-w-0 rounded-2xl border border-white/5 bg-white/[0.02] p-5 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-7">
                <h2 className="text-lg font-semibold text-white">Top Pages</h2>
                <p className="mt-1 text-sm text-white/35">Useful for diagnosing SEO and navigation demand.</p>
                <div className="mt-6 space-y-3">
                  {analytics.topViewedPages.length === 0 ? (
                    <EmptyState label="No page-view source data recorded in this window." />
                  ) : (
                    analytics.topViewedPages.map((page) => (
                      <div
                        key={page.path}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4"
                      >
                        <p className="truncate text-sm text-white/75">{page.path}</p>
                        <p className="text-sm font-semibold text-white">{formatNumber(page.views)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </>
      ) : null}

      <TemplateMessagesPanel />
    </div>
  );
}
