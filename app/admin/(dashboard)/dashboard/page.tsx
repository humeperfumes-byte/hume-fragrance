"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type DashboardAnalytics = {
  ok: boolean;
  windowHours: number;
  overview: {
    uniqueViewers: number;
    uniqueCartVisitors: number;
    totalPageViews: number;
    totalCartOpens: number;
    totalAddToCart: number;
    totalQuantityUpdates: number;
    totalRemoveFromCart: number;
    activeDrafts: number;
    whatsappInitiatedDrafts: number;
    abandonedDraftValue: number;
  };
  productPerformance: Array<{
    productId: string;
    name: string;
    clicks: number;
    addToCart: number;
    lastInteractionAt: string;
  }>;
  sourceBreakdown: Array<{
    source: string;
    category: string;
    count: number;
  }>;
  highlightedSources: Array<{
    source: string;
    category: string;
    count: number;
  }>;
  topViewedPages: Array<{
    path: string;
    views: number;
  }>;
};

type CheckoutDraftRecord = {
  id: string;
  status: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  grandTotal: string | null;
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [drafts, setDrafts] = useState<CheckoutDraftRecord[]>([]);
  const [timeWindowHours, setTimeWindowHours] = useState("720");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [analyticsRes, draftsRes] = await Promise.all([
        fetch(`/api/admin/dashboard?hours=${timeWindowHours}`),
        fetch(`/api/admin/checkout-drafts?hours=${timeWindowHours}`)
      ]);

      if (!analyticsRes.ok || !draftsRes.ok) throw new Error("Failed to load data");

      const [analyticsData, draftsData] = await Promise.all([
        analyticsRes.json(),
        draftsRes.json()
      ]);

      setAnalytics(analyticsData);
      setDrafts(Array.isArray(draftsData) ? draftsData : []);
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to refresh dashboard", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [timeWindowHours]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const checkoutDraftStats = useMemo(() => {
    const active = drafts.filter((d) => d.status !== "started").length;
    const whatsappInitiated = drafts.filter((d) => d.status === "whatsapp_initiated").length;
    const recoverable = drafts.filter(
      (d) => d.status !== "whatsapp_initiated" && (d.phone || d.fullName || d.email)
    ).length;
    return { active, whatsappInitiated, recoverable };
  }, [drafts]);

  const meaningfulProductPerformance = useMemo(
    () => (analytics?.productPerformance ?? []).filter((p) => p.clicks > 0 || p.addToCart > 0),
    [analytics]
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">Command Center</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Live snapshot of traffic, cart intent, and recovery opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-1.5 shadow-sm">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
              Time Window
            </span>
            <select
              value={timeWindowHours}
              onChange={(e) => setTimeWindowHours(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              <option value="24">Last 24 Hours</option>
              <option value="168">Last 7 Days</option>
              <option value="360">Last 15 Days</option>
              <option value="720">Last 30 Days</option>
            </select>
          </div>
          <Button variant="outline" size="icon" onClick={loadData} disabled={loading} className="rounded-xl h-9 w-9">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {!analytics && loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-border/40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 shadow-2xl hover:shadow-primary/5 transition-all duration-500 backdrop-blur-xl group">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold group-hover:text-primary/50 transition-colors">Unique Viewers</p>
              <div className="flex items-baseline gap-2 mt-4">
                <p className="text-5xl font-serif text-white tracking-tight">{analytics?.overview.uniqueViewers ?? 0}</p>
                <div className="h-2 w-2 rounded-full bg-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              </div>
              <p className="mt-3 text-[10px] text-white/20 uppercase tracking-[0.15em] font-bold">Distinct Visitors</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 shadow-2xl hover:shadow-primary/5 transition-all duration-500 backdrop-blur-xl group">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold group-hover:text-primary/50 transition-colors">Cart Engagement</p>
              <div className="flex items-baseline gap-2 mt-4">
                <p className="text-5xl font-serif text-white tracking-tight">{analytics?.overview.uniqueCartVisitors ?? 0}</p>
              </div>
              <p className="mt-3 text-[10px] text-white/20 uppercase tracking-[0.15em] font-bold">Viewed Shopping Cart</p>
            </div>
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 shadow-2xl hover:shadow-primary/5 transition-all duration-500 backdrop-blur-xl group">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold group-hover:text-primary/50 transition-colors">Purchase Intent</p>
              <div className="flex items-baseline gap-2 mt-4">
                <p className="text-5xl font-serif text-white tracking-tight">{analytics?.overview.totalAddToCart ?? 0}</p>
              </div>
              <p className="mt-3 text-[10px] text-white/20 uppercase tracking-[0.15em] font-bold">Total Add To Carts</p>
            </div>
            <div className="rounded-3xl border border-primary/20 bg-primary/[0.03] p-7 shadow-2xl hover:shadow-primary/10 transition-all duration-500 backdrop-blur-xl group">
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold">Abandoned Pipeline</p>
              <div className="flex items-baseline gap-1 mt-4 text-primary">
                <span className="text-2xl font-serif opacity-60">₹</span>
                <p className="text-5xl font-serif tracking-tighter">{Math.round(analytics?.overview.abandonedDraftValue ?? 0).toLocaleString()}</p>
              </div>
              <p className="mt-3 text-[10px] text-primary/40 uppercase tracking-[0.15em] font-bold">Potential Revenue</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl p-8">
              <h3 className="text-xl font-serif text-white mb-6">Top Product Interest</h3>
              <div className="space-y-6">
                {meaningfulProductPerformance.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/30">
                    No product interactions recorded in this time window.
                  </div>
                ) : (
                  meaningfulProductPerformance.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0 group">
                      <div>
                        <p className="font-medium text-sm text-white group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-bold">{product.productId}</p>
                      </div>
                      <div className="flex gap-10 text-right">
                        <div>
                          <p className="text-[9px] uppercase text-white/30 mb-1 font-bold tracking-widest">Clicks</p>
                          <p className="font-serif text-lg text-white">{product.clicks}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase text-white/30 mb-1 font-bold tracking-widest">Add to Cart</p>
                          <p className="font-serif text-lg text-primary">{product.addToCart}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl p-8">
                <h3 className="text-xl font-serif text-white mb-6">Acquisition Sources</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {(analytics?.highlightedSources ?? []).map((source) => (
                    <div key={source.source} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-all duration-300">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-2">
                        {source.category}
                      </p>
                      <p className="text-sm font-medium text-white">{source.source}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-1 w-1 rounded-full bg-emerald-500/50" />
                        <p className="text-[11px] text-white/50 font-medium">{source.count} visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl p-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 px-1">Traffic Quality</h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center"><span className="text-white/40">Page Views</span><span className="font-serif text-white text-base">{analytics?.overview.totalPageViews ?? 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/40">Cart Opens</span><span className="font-serif text-white text-base">{analytics?.overview.totalCartOpens ?? 0}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/40">Updates</span><span className="font-serif text-white text-base">{analytics?.overview.totalQuantityUpdates ?? 0}</span></div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-xl p-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-6 px-1">Pipeline</h4>
                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between items-center"><span className="text-white/40">Active</span><span className="font-serif text-white text-base">{checkoutDraftStats.active}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/40">Recoverable</span><span className="font-serif text-amber-500 text-base">{checkoutDraftStats.recoverable}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/40">WhatsApp</span><span className="font-serif text-emerald-500 text-base">{checkoutDraftStats.whatsappInitiated}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
