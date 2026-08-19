"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  RefreshCcw,
  Repeat2,
  ShoppingBag,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { parseAdminMarket } from "@/lib/admin-market";
import { parseAdminTimeWindow } from "@/lib/admin-time-window";
import { displayPhoneNumber } from "@/lib/phone";

type DashboardAnalytics = {
  ok: boolean;
  windowHours: number;
  market: "india" | "out_of_india" | "all";
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
  revenueTimeline: Array<{
    label: string;
    revenue: number;
    orders: number;
  }>;
  revenueByDate: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  productSalesTimeline: Array<{
    productId: string;
    name: string;
    totalUnits: number;
    totalRevenue: number;
    points: Array<{
      label: string;
      units: number;
      revenue: number;
    }>;
  }>;
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

type FinanceGranularity = "daily" | "weekly" | "monthly";

type FinanceTrends = {
  ok: boolean;
  granularity: FinanceGranularity;
  range: { from: string; to: string; label: string };
  points: Array<{
    key: string;
    label: string;
    start: string;
    end: string;
    revenue: number;
    orders: number;
    units: number;
    aov: number;
  }>;
  totals: { revenue: number; orders: number; units: number; aov: number };
  current: { revenue: number; orders: number; units: number; aov: number };
  previous: { revenue: number; orders: number; units: number; aov: number };
  change: { revenue: number; orders: number; units: number; aov: number };
  codOutstanding: number;
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

function dateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-sm text-white/35">
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
      ? "border-[#c9b3ff]/25 bg-[radial-gradient(circle_at_90%_10%,rgba(201,179,255,.14),transparent_38%),#19191c] text-[#c9b3ff]"
      : tone === "warning"
        ? "border-[#ffe37b]/20 bg-[radial-gradient(circle_at_90%_10%,rgba(255,227,123,.12),transparent_38%),#19191c] text-[#ffe37b]"
        : tone === "success"
          ? "border-[#80f0b2]/20 bg-[radial-gradient(circle_at_90%_10%,rgba(128,240,178,.12),transparent_38%),#19191c] text-[#80f0b2]"
          : "border-white/10 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,.06),transparent_38%),#19191c] text-white";

  return (
    <div className={`group relative min-w-0 overflow-hidden rounded-[22px] border p-5 shadow-[inset_0_1px_rgba(255,255,255,.035),0_18px_50px_rgba(0,0,0,.14)] transition duration-300 hover:-translate-y-0.5 hover:border-white/20 sm:p-6 ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-medium text-white/70">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-current/20 bg-black/15"><Icon className="h-4 w-4 opacity-80" /></span>
      </div>
      <p className="mt-6 text-3xl font-medium tracking-[-0.04em] text-white">{value}</p>
      <div className="mt-4 flex items-end justify-between gap-3"><p className="max-w-[75%] text-[11px] font-medium leading-5 text-white/38">{helper}</p><div className="flex h-8 items-end gap-1 opacity-55"><span className="h-2 w-1 rounded-full bg-current" /><span className="h-4 w-1 rounded-full bg-current" /><span className="h-3 w-1 rounded-full bg-current" /><span className="h-6 w-1 rounded-full bg-current" /><span className="h-5 w-1 rounded-full bg-current" /></div></div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const market = parseAdminMarket(searchParams.get("market"));
  const windowHoursParam = searchParams.get("hours");
  const windowFromParam = searchParams.get("from");
  const windowToParam = searchParams.get("to");
  const selectedWindow = parseAdminTimeWindow(windowHoursParam, windowFromParam, windowToParam);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [financeTrends, setFinanceTrends] = useState<FinanceTrends | null>(null);
  const [financeGranularity, setFinanceGranularity] = useState<FinanceGranularity>("monthly");
  const [financeLoading, setFinanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [selectedProductId, setSelectedProductId] = useState("revenue");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ market });
      if (selectedWindow.isCustom && windowFromParam && windowToParam) {
        params.set("from", windowFromParam);
        params.set("to", windowToParam);
      } else {
        params.set("hours", String(selectedWindow.hours));
      }
      const response = await fetch(`/api/admin/dashboard?${params.toString()}`, {
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
  }, [market, selectedWindow.hours, selectedWindow.isCustom, windowFromParam, windowToParam]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadFinanceData = useCallback(async () => {
    setFinanceLoading(true);
    try {
      const params = new URLSearchParams({ market, granularity: financeGranularity });
      const response = await fetch(`/api/admin/finance-trends?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load finance trends");
      setFinanceTrends(await response.json());
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to refresh finance trends", variant: "destructive" });
    } finally {
      setFinanceLoading(false);
    }
  }, [financeGranularity, market]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const dailyRunList = useMemo(() => {
    const overview = analytics?.overview;
    if (!overview) return [];
    const marketQuery =
      market === "out_of_india"
        ? "?market=out_of_india"
        : market === "all"
          ? "?market=all"
          : "?market=india";

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

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const start = new Date(year, month, 1 - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  const selectedRevenue = analytics?.revenueByDate.find((entry) => entry.date === selectedDate);
  const selectedProduct = analytics?.productSalesTimeline.find((product) => product.productId === selectedProductId);
  const chartPoints = selectedProduct
    ? selectedProduct.points.map((point) => ({ label: point.label, value: point.units, count: point.units }))
    : (financeTrends?.points.map((entry) => ({ label: entry.label, value: entry.revenue, count: entry.orders })) ?? []);
  const maxChartValue = Math.max(...chartPoints.map((entry) => entry.value), 1);
  const revenueTrend = financeTrends?.change.revenue ?? 0;
  const trendIsPositive = revenueTrend >= 0;
  const financePeriodLabel = financeGranularity === "daily" ? "day" : financeGranularity === "weekly" ? "week" : "month";

  return (
    <div className="mx-auto max-w-[1540px] space-y-4 sm:space-y-5">
      <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_82%_-20%,rgba(201,179,255,.13),transparent_38%),#151517] p-4 shadow-[inset_0_1px_rgba(255,255,255,.05),0_22px_80px_rgba(0,0,0,.2)] sm:p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c9b3ff]/75">Daily operating view</p>
            <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">Command Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/40">Revenue, funnel leakage, source quality, demand, and customer signals in one working view.</p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/20 p-1">
              <a href="#overview" className="shrink-0 rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">Overview</a>
              <a href="#funnel" className="shrink-0 rounded-full px-5 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white">Funnel</a>
              <a href="#demand" className="shrink-0 rounded-full px-5 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white">Demand</a>
              <a href="#customers" className="shrink-0 rounded-full px-5 py-2 text-xs font-medium text-white/45 transition hover:bg-white/5 hover:text-white">Customers</a>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden rounded-full border border-white/10 bg-black/20 px-4 py-2.5 text-[10px] font-semibold text-white/45 lg:block">{selectedWindow.label}</div>
              <Button variant="outline" size="icon" onClick={() => { void loadData(); void loadFinanceData(); }} disabled={loading || financeLoading} className="h-10 w-10 shrink-0 rounded-full border-white/10 bg-white/[0.035] text-white hover:bg-white hover:text-black"><RefreshCcw className={`h-4 w-4 ${loading || financeLoading ? "animate-spin" : ""}`} /></Button>
            </div>
          </div>
        </div>
      </div>

      {!analytics && loading ? (
        <div className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-40 rounded-[22px] border border-white/5 bg-white/[0.04]" />
          ))}
        </div>
      ) : null}

      {analytics ? (
        <>
          <div id="overview" className="grid scroll-mt-24 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Revenue"
              value={formatINR(analytics.overview.revenue)}
              helper={`${analytics.overview.orders} paid or fulfilled orders`}
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

          <section className="grid overflow-hidden rounded-[22px] border border-white/10 bg-[#19191c] shadow-[inset_0_1px_rgba(255,255,255,.035)] xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 border-b border-white/10 p-5 sm:p-6 xl:border-b-0 xl:border-r">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><p className="text-sm font-medium text-white/70">{selectedProduct ? "Product performance" : `${financePeriodLabel[0].toUpperCase()}${financePeriodLabel.slice(1)}-by-${financePeriodLabel} sales`}</p><div className="mt-3 flex flex-wrap items-center gap-2"><p className="text-3xl font-medium tracking-[-0.04em] text-white sm:text-4xl">{selectedProduct ? `${formatNumber(selectedProduct.totalUnits)} units` : formatINR(financeTrends?.totals.revenue ?? 0)}</p>{selectedProduct ? <span className="rounded-full bg-[#80f0b2] px-2.5 py-1 text-[10px] font-bold text-[#0c2518]">{formatINR(selectedProduct.totalRevenue)}</span> : <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${trendIsPositive ? "bg-[#80f0b2] text-[#0c2518]" : "bg-rose-400/15 text-rose-200"}`}>{trendIsPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{revenueTrend > 0 ? "+" : ""}{revenueTrend.toFixed(1)}%</span>}</div><p className="mt-2 max-w-xl text-xs text-white/35">{selectedProduct ? selectedProduct.name : `${financeTrends?.range.label ?? "Loading trend"} · current ${financePeriodLabel} compared with the same elapsed time in the previous ${financePeriodLabel}.`}</p></div>
                <div className="flex flex-col gap-2 sm:items-end"><div className="flex w-fit rounded-full border border-white/10 bg-black/20 p-1">
                    {([{ label: "Daily", value: "daily" }, { label: "Weekly", value: "weekly" }, { label: "Monthly", value: "monthly" }] as const).map((period) => <button key={period.value} type="button" onClick={() => setFinanceGranularity(period.value)} disabled={Boolean(selectedProduct)} className={`rounded-full px-3 py-2 text-[10px] font-semibold transition sm:px-4 ${financeGranularity === period.value ? "bg-white text-black" : "text-white/40 hover:text-white"} disabled:cursor-not-allowed disabled:opacity-35`}>{period.label}</button>)}
                  </div><label className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-[#c9b3ff]/15 bg-[#c9b3ff]/[0.05] px-3 py-2 sm:w-[260px]"><span className="shrink-0 text-[9px] font-bold uppercase tracking-[.14em] text-[#c9b3ff]/60">Chart</span><select value={selectedProduct?.productId ?? "revenue"} onChange={(event) => setSelectedProductId(event.target.value)} className="min-w-0 flex-1 cursor-pointer bg-transparent text-xs font-medium text-white outline-none"><option value="revenue">Total revenue</option>{analytics.productSalesTimeline.map((product) => <option key={product.productId} value={product.productId}>{product.name} · {product.totalUnits} units</option>)}</select></label>
                </div>
              </div>

              <div className="mt-7 grid h-64 grid-cols-12 items-end gap-1.5 border-b border-white/[0.08] sm:gap-2.5">
                {chartPoints.map((entry, index) => {
                  const height = entry.value > 0 ? Math.max(12, (entry.value / maxChartValue) * 100) : 7;
                  const highlighted = entry.value === maxChartValue && entry.value > 0;
                  return <div key={`${entry.label}-${index}`} className="group flex h-full min-w-0 flex-col justify-end"><div className="relative flex flex-1 items-end"><div className={`relative w-full rounded-t-xl border transition-all duration-500 group-hover:border-white/25 ${highlighted ? "border-[#8cb5ff]/45 bg-gradient-to-t from-[#5f91ef] to-[#8cb5ff] shadow-[0_0_28px_rgba(95,145,239,.22)]" : "border-white/[0.08] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,.055)_0px,rgba(255,255,255,.055)_2px,transparent_2px,transparent_6px)]"}`} style={{ height: `${height}%` }}><span className={`absolute left-1/2 top-2 h-1 w-5 max-w-[55%] -translate-x-1/2 rounded-full ${highlighted ? "bg-white/70" : "bg-white/35"}`} />{entry.count > 0 ? <span className={`absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-[9px] font-bold sm:block ${highlighted ? "bg-white text-[#315d9f]" : "bg-black/55 text-white/70"}`}>{entry.count}</span> : null}</div></div><p className="mt-2 truncate text-center text-[8px] text-white/28 sm:text-[9px]">{entry.label}</p></div>;
                })}
              </div>
              {!selectedProduct ? (
                <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-5">
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-3"><p className="text-[8px] font-bold uppercase tracking-[.15em] text-white/28">Current {financePeriodLabel}</p><p className="mt-2 text-sm font-semibold text-white">{formatINR(financeTrends?.current.revenue ?? 0)}</p><p className={`mt-1 text-[9px] ${trendIsPositive ? "text-emerald-300/75" : "text-rose-300/75"}`}>{revenueTrend > 0 ? "+" : ""}{revenueTrend.toFixed(1)}% vs previous</p></div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-3"><p className="text-[8px] font-bold uppercase tracking-[.15em] text-white/28">Order volume</p><p className="mt-2 text-sm font-semibold text-white">{formatNumber(financeTrends?.current.orders ?? 0)}</p><p className={`mt-1 text-[9px] ${(financeTrends?.change.orders ?? 0) >= 0 ? "text-emerald-300/75" : "text-rose-300/75"}`}>{(financeTrends?.change.orders ?? 0) > 0 ? "+" : ""}{(financeTrends?.change.orders ?? 0).toFixed(1)}%</p></div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-3"><p className="text-[8px] font-bold uppercase tracking-[.15em] text-white/28">Average order</p><p className="mt-2 text-sm font-semibold text-white">{formatINR(financeTrends?.current.aov ?? 0)}</p><p className={`mt-1 text-[9px] ${(financeTrends?.change.aov ?? 0) >= 0 ? "text-emerald-300/75" : "text-rose-300/75"}`}>{(financeTrends?.change.aov ?? 0) > 0 ? "+" : ""}{(financeTrends?.change.aov ?? 0).toFixed(1)}%</p></div>
                  <div className="rounded-2xl border border-white/[0.08] bg-black/15 p-3"><p className="text-[8px] font-bold uppercase tracking-[.15em] text-white/28">Units sold</p><p className="mt-2 text-sm font-semibold text-white">{formatNumber(financeTrends?.current.units ?? 0)}</p><p className={`mt-1 text-[9px] ${(financeTrends?.change.units ?? 0) >= 0 ? "text-emerald-300/75" : "text-rose-300/75"}`}>{(financeTrends?.change.units ?? 0) > 0 ? "+" : ""}{(financeTrends?.change.units ?? 0).toFixed(1)}%</p></div>
                  <div className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.025] p-3"><p className="text-[8px] font-bold uppercase tracking-[.15em] text-amber-200/40">COD outstanding</p><p className="mt-2 text-sm font-semibold text-amber-100">{formatINR(financeTrends?.codOutstanding ?? 0)}</p><p className="mt-1 text-[9px] text-white/28">Uncollected delivery balance</p></div>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between text-[10px] text-white/28"><span>{selectedProduct ? "Each bar shows units sold for this product" : "Each bar is a live revenue interval"}</span><span>{selectedProduct ? "Units shown inside active bars" : "Orders shown inside active bars"}</span></div>
            </div>

            <aside className="bg-black/[0.09] p-5 sm:p-6">
              <div className="flex items-center justify-between"><button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:bg-white hover:text-black" aria-label="Previous month"><ChevronLeft className="h-4 w-4" /></button><div className="flex items-center gap-2 text-sm font-medium text-white"><CalendarDays className="h-4 w-4 text-[#c9b3ff]" />{calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div><button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:bg-white hover:text-black" aria-label="Next month"><ChevronRight className="h-4 w-4" /></button></div>
              <div className="mt-5 grid grid-cols-7 gap-1 text-center">{["S", "M", "T", "W", "T", "F", "S"].map((day, index) => <span key={`${day}-${index}`} className="py-1 text-[9px] font-bold text-white/25">{day}</span>)}{calendarDays.map((date) => { const key = dateKey(date); const inMonth = date.getMonth() === calendarMonth.getMonth(); const daily = analytics.revenueByDate.find((entry) => entry.date === key); const selected = selectedDate === key; return <button key={key} type="button" onClick={() => setSelectedDate(key)} className={`relative aspect-square rounded-lg text-[10px] transition ${selected ? "bg-gradient-to-br from-[#6c98ed] to-[#9d80ee] font-bold text-white shadow-[0_5px_16px_rgba(108,152,237,.28)]" : inMonth ? "bg-white/[0.035] text-white/60 hover:bg-white/10 hover:text-white" : "text-white/12"}`}>{date.getDate()}{daily ? <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${selected ? "bg-white" : "bg-[#ffe37b]"}`} /> : null}</button>; })}</div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4"><div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Selected date</p><p className="mt-1 text-xs text-white/60">{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p></div><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c9b3ff]/10 text-[#d3c2ff]"><BarChart3 className="h-4 w-4" /></span></div><p className="mt-4 text-3xl font-medium tracking-[-0.04em] text-white">{formatINR(selectedRevenue?.revenue ?? 0)}</p><p className="mt-1 text-[10px] text-[#80f0b2]">{selectedRevenue?.orders ?? 0} confirmed order{selectedRevenue?.orders === 1 ? "" : "s"}</p></div>
            </aside>
          </section>

          <div id="funnel" className="grid scroll-mt-24 gap-4 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="min-w-0 rounded-[22px] border border-white/10 bg-[#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Morning Run List</h2>
                  <p className="mt-1 text-sm text-white/35">The jobs that move money today.</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ffe37b]/20 bg-[#ffe37b]/[0.07] text-[#ffe37b]"><PackageCheck className="h-4 w-4" /></span>
              </div>

              <div className="space-y-3">
                {dailyRunList.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
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

            <div className="min-w-0 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_95%_0%,rgba(201,179,255,.08),transparent_35%),#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Conversion Funnel</h2>
                  <p className="mt-1 text-sm text-white/35">Where demand turns into orders.</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c9b3ff]/20 bg-[#c9b3ff]/[0.07] text-[#c9b3ff]"><BarChart3 className="h-4 w-4" /></span>
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
                    <div className="h-2.5 overflow-hidden rounded-full border border-white/[0.04] bg-black/25">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#9c86d9] to-[#d3c2ff] shadow-[0_0_14px_rgba(201,179,255,.28)] transition-[width] duration-700"
                        style={{ width: `${Math.max(3, (Number(value) / maxFunnelValue) * 100)}%` }}
                      />
                    </div>
                    <span className="text-right text-sm font-semibold text-white">{formatNumber(Number(value))}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Visitor to Cart</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.visitorToCartRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Cart to Draft</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.cartToDraftRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Draft to Order</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.draftToOrderRate)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-4">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Visitor to Order</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatRate(analytics.conversionFunnel.visitorToOrderRate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="min-w-0 rounded-[22px] border border-white/10 bg-[#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">Source ROI Proxy</h2><p className="mt-1 text-sm text-white/35">Revenue and pipeline by acquisition source. Add ad spend later for true ROI.</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50"><ArrowUpRight className="h-4 w-4" /></span></div>

              <div className="-mx-5 mt-6 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {analytics.sourceRoi.length === 0 ? (
                  <EmptyState label="No source performance recorded yet." />
                ) : (
                  <table className="w-full min-w-[640px] text-sm sm:min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-[0.18em] text-white/30">
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
                        <tr key={`${source.source}-${source.category}`} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.025]">
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

            <div className="min-w-0 rounded-[22px] border border-white/10 bg-[#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">Recent Orders</h2><p className="mt-1 text-sm text-white/35">The latest customer commitments.</p></div><Link href={`/admin/orders?market=${market}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:bg-white hover:text-black"><ArrowUpRight className="h-4 w-4" /></Link></div>

              <div className="mt-6 space-y-3">
                {analytics.recentOrders.length === 0 ? (
                  <EmptyState label="No orders in this window." />
                ) : (
                  analytics.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders${
                        market === "out_of_india"
                          ? "?market=out_of_india"
                          : market === "all"
                            ? "?market=all"
                            : "?market=india"
                      }`}
                      className="block rounded-2xl border border-white/[0.07] bg-black/15 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]"
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

          <div id="demand" className="grid scroll-mt-24 gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="min-w-0 rounded-[22px] border border-white/10 bg-[#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">Product Demand</h2>
                  <p className="mt-1 text-sm text-white/35">
                    Demand score blends ordered units, draft units, and add-to-cart activity.
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ffe37b]/20 bg-[#ffe37b]/[0.07] text-[#ffe37b]"><ShoppingBag className="h-4 w-4" /></span>
              </div>

              <div className="space-y-4">
                {analytics.productDemand.length === 0 ? (
                  <EmptyState label="No product demand signals recorded yet." />
                ) : (
                  analytics.productDemand.map((product, index) => (
                    <div key={product.productId} className="rounded-2xl border border-white/[0.07] bg-black/15 p-4 transition-colors hover:border-white/15">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white/35">
                            #{index + 1} - {product.productId}
                          </p>
                          <p className="mt-1 font-medium text-white">{product.name}</p>
                        </div>
                        <p className="rounded-full border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 px-3 py-1 text-lg font-semibold text-[#d3c2ff]">{product.demandScore}</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
                          <p className="text-white/30">Cart</p>
                          <p className="mt-1 text-base font-semibold text-white">{product.addToCart}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
                          <p className="text-white/30">Draft Units</p>
                          <p className="mt-1 text-base font-semibold text-amber-300">{product.draftUnits}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
                          <p className="text-white/30">Sold Units</p>
                          <p className="mt-1 text-base font-semibold text-emerald-300">{product.orderedUnits}</p>
                        </div>
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.035] p-3">
                          <p className="text-white/30">Revenue</p>
                          <p className="mt-1 text-base font-semibold text-white">{formatINR(product.orderRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div id="customers" className="scroll-mt-24 space-y-4">
              <div className="min-w-0 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_100%_0%,rgba(128,240,178,.06),transparent_30%),#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-white">Repeat Customers</h2>
                    <p className="mt-1 text-sm text-white/35">People proving retention with more than one order.</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#80f0b2]/20 bg-[#80f0b2]/[0.07] text-[#80f0b2]"><Repeat2 className="h-4 w-4" /></span>
                </div>

                <div className="space-y-3">
                  {analytics.repeatCustomers.length === 0 ? (
                    <EmptyState label="Repeat customers will appear after second orders are captured." />
                  ) : (
                    analytics.repeatCustomers.map((customer) => (
                      <div
                        key={`${customer.phone || customer.email}-${customer.lastOrderAt}`}
                        className="rounded-2xl border border-white/[0.07] bg-black/15 p-4 transition-colors hover:border-white/15"
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

              <div className="min-w-0 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_100%_0%,rgba(201,179,255,.07),transparent_30%),#19191c] p-5 shadow-[inset_0_1px_rgba(255,255,255,.035)] sm:p-6">
                <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">Top Pages</h2><p className="mt-1 text-sm text-white/35">Useful for diagnosing SEO and navigation demand.</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50"><ArrowUpRight className="h-4 w-4" /></span></div>
                <div className="mt-6 space-y-3">
                  {analytics.topViewedPages.length === 0 ? (
                    <EmptyState label="No page-view source data recorded in this window." />
                  ) : (
                    analytics.topViewedPages.map((page) => (
                      <div
                        key={page.path}
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-black/15 p-4 transition-colors hover:border-[#c9b3ff]/20 hover:bg-[#c9b3ff]/[0.035]"
                      >
                        <p className="truncate text-sm text-white/75">{page.path}</p>
                        <p className="rounded-full bg-white/5 px-3 py-1 text-sm font-semibold text-white transition group-hover:bg-[#c9b3ff]/10 group-hover:text-[#d3c2ff]">{formatNumber(page.views)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </>
      ) : null}

    </div>
  );
}
