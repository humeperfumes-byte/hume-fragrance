"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  Eye, 
  Copy, 
  ShoppingCart, 
  CreditCard, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  Download, 
  QrCode, 
  Sparkles,
  MapPin,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

interface CityBreakdown {
  city: string;
  scans: number;
  copies: number;
  cartAdds: number;
  checkouts: number;
  orders: number;
  conversionRate: number;
  revenue: number;
}

interface CampaignTotals {
  totalScans: number;
  couponCopies: number;
  cartAdds: number;
  checkouts: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  averageOrderValue: number;
}

const CITIES = [
  { slug: "all", name: "All Cities" },
  { slug: "ahmedabad", name: "Ahmedabad" },
  { slug: "mumbai", name: "Mumbai" },
  { slug: "delhi", name: "Delhi NCR" },
  { slug: "bengaluru", name: "Bengaluru" },
  { slug: "surat", name: "Surat" },
  { slug: "vadodara", name: "Vadodara" },
  { slug: "jaipur", name: "Jaipur" },
];

export default function FlyerAnalyticsView() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<CampaignTotals | null>(null);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [cityBreakdown, setCityBreakdown] = useState<CityBreakdown[]>([]);

  // Generator State
  const [qrCity, setQrCity] = useState("ahmedabad");
  const [qrTarget, setQrTarget] = useState<"perfumes" | "discovery-set">("perfumes");

  const fetchAnalytics = async (city: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/flyer-campaigns?city=${city}`);
      const data = await res.json();
      if (data.success) {
        setTotals(data.totals);
        setFunnelStages(data.funnelStages || []);
        setCityBreakdown(data.cityBreakdown || []);
      }
    } catch (err) {
      console.error("Failed to load flyer analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedCity);
  }, [selectedCity]);

  const targetUrl = typeof window !== "undefined"
    ? `${window.location.origin}/flyers/${qrCity}/${qrTarget}`
    : `https://www.humefragrance.com/flyers/${qrCity}/${qrTarget}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}&margin=15`;

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HUME-QR-${qrCity.toUpperCase()}-${qrTarget.toUpperCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* Top Header & City Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="h-4 w-4" />
            <span>Campaign Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white">
            Blinkit & Zepto Flyer Analytics
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Real-time scan-to-purchase conversion ratio analysis across flyer distribution cities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2">
            <MapPin className="h-4 w-4 text-amber-400" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c.slug} value={c.slug} className="bg-stone-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalytics(selectedCity)}
            disabled={loading}
            className="border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <Eye className="h-3.5 w-3.5 text-blue-400" />
            <span>Total Scans</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totals?.totalScans ?? 0}</p>
          <span className="text-[10px] text-stone-400">QR Hits</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <Copy className="h-3.5 w-3.5 text-amber-400" />
            <span>Copies</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totals?.couponCopies ?? 0}</p>
          <span className="text-[10px] text-stone-400">Voucher Copied</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <ShoppingCart className="h-3.5 w-3.5 text-purple-400" />
            <span>Cart Adds</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totals?.cartAdds ?? 0}</p>
          <span className="text-[10px] text-stone-400">Item Selected</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <CreditCard className="h-3.5 w-3.5 text-indigo-400" />
            <span>Checkouts</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{totals?.checkouts ?? 0}</p>
          <span className="text-[10px] text-stone-400">Checkout Started</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Paid Orders</span>
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400">{totals?.totalOrders ?? 0}</p>
          <span className="text-[10px] text-stone-400">Converted</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>Revenue</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{formatINR(totals?.totalRevenue ?? 0)}</p>
          <span className="text-[10px] text-stone-400">Total Sales</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>Conv. Rate</span>
          </div>
          <p className="mt-2 text-xl font-bold text-amber-400">{totals?.conversionRate ?? 0}%</p>
          <span className="text-[10px] text-stone-400">Scan to Order</span>
        </div>

        <div className="rounded-xl border border-white/10 bg-stone-900/60 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-stone-300" />
            <span>AOV</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{formatINR(totals?.averageOrderValue ?? 0)}</p>
          <span className="text-[10px] text-stone-400">Avg Spend</span>
        </div>
      </div>

      {/* Visual Step-by-Step Conversion Funnel Ratio Flow */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/80 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Full-Funnel Conversion Ratio Flow</h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Step-by-step percentage drop-off analysis from QR Scan to Paid Order.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
            City: {selectedCity.toUpperCase()}
          </span>
        </div>

        <div className="space-y-5">
          {funnelStages.map((stage, idx) => (
            <div key={stage.stage} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-stone-300">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-stone-800 text-[10px] font-bold text-amber-400">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-white">{stage.stage}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-stone-400">{stage.count} events</span>
                  <span className="font-mono font-bold text-amber-400">{stage.percentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="h-3.5 w-full rounded-full bg-stone-950 p-0.5 border border-stone-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                  style={{ width: `${Math.max(2, stage.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: City Performance Table & Admin QR Code Generator */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* City Breakdown Comparison Table (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-stone-900/80 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-white mb-4">City Performance Ranking</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">City</th>
                  <th className="pb-3 text-right">Scans</th>
                  <th className="pb-3 text-right">Copies</th>
                  <th className="pb-3 text-right">Cart Adds</th>
                  <th className="pb-3 text-right">Checkouts</th>
                  <th className="pb-3 text-right">Orders</th>
                  <th className="pb-3 text-right">Conv. %</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {cityBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">
                      No city flyer scan events logged yet. Scan a QR code on a flyer page to see live events.
                    </td>
                  </tr>
                ) : (
                  cityBreakdown.map((row) => (
                    <tr key={row.city} className="hover:bg-stone-800/40">
                      <td className="py-3 font-bold text-white capitalize">{row.city}</td>
                      <td className="py-3 text-right font-mono text-stone-300">{row.scans}</td>
                      <td className="py-3 text-right font-mono text-stone-300">{row.copies}</td>
                      <td className="py-3 text-right font-mono text-stone-300">{row.cartAdds}</td>
                      <td className="py-3 text-right font-mono text-stone-300">{row.checkouts}</td>
                      <td className="py-3 text-right font-mono text-emerald-400 font-bold">{row.orders}</td>
                      <td className="py-3 text-right font-mono text-amber-400 font-bold">{row.conversionRate}%</td>
                      <td className="py-3 text-right font-mono text-white font-bold">{formatINR(row.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Built-in Admin QR Generator (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-stone-900/80 p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <QrCode className="h-4 w-4" />
            <span>Flyer QR Code Generator</span>
          </div>

          <p className="text-xs text-stone-400">
            Generate printable campaign URLs and high-resolution QR codes for flyer printing.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Select City</label>
              <select
                value={qrCity}
                onChange={(e) => setQrCity(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
              >
                {CITIES.filter((c) => c.slug !== "all").map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">Select Target Page</label>
              <select
                value={qrTarget}
                onChange={(e) => setQrTarget(e.target.value as "perfumes" | "discovery-set")}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
              >
                <option value="perfumes">Perfumes Catalog (/perfumes)</option>
                <option value="discovery-set">Discovery Set Builder (/discovery-set)</option>
              </select>
            </div>

            {/* Target URL Preview */}
            <div>
              <label className="text-[11px] text-stone-400 block mb-1">Generated URL</label>
              <div className="bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-[11px] font-mono text-stone-300 break-all select-all">
                {targetUrl}
              </div>
            </div>

            {/* QR Code Display & Download */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-stone-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="Flyer Campaign QR Code"
                className="h-44 w-44 object-contain"
              />
            </div>

            <Button
              onClick={handleDownloadQr}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download High-Res QR (PNG)</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
