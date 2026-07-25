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
  Sparkles,
  MapPin,
  RefreshCw,
  ExternalLink,
  Check,
  Link as LinkIcon,
  QrCode,
  X,
  Download,
  Calendar,
  Layers,
  Trash2,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import CustomStarQRCode from "@/components/CustomStarQRCode";

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

interface RegisteredQRCampaign {
  id: string;
  name: string;
  city: string;
  targetPage: string;
  targetUrl: string;
  bodyType: string;
  eyeStyle: string;
  logoType: string;
  qrCodeSvg?: string;
  scanCount: number;
  lastScannedAt?: string;
  createdAt: string;
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

const BASE_PRODUCTION_DOMAIN = "https://www.humefragrance.com";

export default function FlyerAnalyticsView() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<CampaignTotals | null>(null);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [cityBreakdown, setCityBreakdown] = useState<CityBreakdown[]>([]);
  
  // Registered QR Campaigns State
  const [registeredCampaigns, setRegisteredCampaigns] = useState<RegisteredQRCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<RegisteredQRCampaign | null>(null);
  const [campaignEvents, setCampaignEvents] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Link Copy Helper State
  const [copiedPerfumesLink, setCopiedPerfumesLink] = useState(false);
  const [copiedDiscoveryLink, setCopiedDiscoveryLink] = useState(false);
  const [copiedModalUrl, setCopiedModalUrl] = useState(false);

  const activeCitySlug = selectedCity === "all" ? "ahmedabad" : selectedCity;
  const perfumesProductionUrl = `${BASE_PRODUCTION_DOMAIN}/flyers/${activeCitySlug}/perfumes`;
  const discoveryProductionUrl = `${BASE_PRODUCTION_DOMAIN}/flyers/${activeCitySlug}/discovery-set`;

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

      // Fetch registered QR campaigns
      const qrRes = await fetch("/api/admin/qr-campaigns");
      const qrData = await qrRes.json();
      if (qrData.success) {
        setRegisteredCampaigns(qrData.campaigns || []);
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

  const handleRenameCampaign = async (id: string, currentName: string) => {
    const newName = prompt("Enter new campaign name:", currentName);
    if (!newName || newName.trim() === "" || newName.trim() === currentName) return;

    try {
      const res = await fetch("/api/admin/qr-campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName.trim() }),
      });

      if (res.ok) {
        if (selectedCampaign && selectedCampaign.id === id) {
          setSelectedCampaign({ ...selectedCampaign, name: newName.trim() });
        }
        fetchAnalytics(selectedCity);
      }
    } catch (err) {
      console.error("Failed to rename campaign:", err);
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" and clear all associated scan/funnel events from the database?`)) return;
    try {
      const res = await fetch(`/api/admin/qr-campaigns?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSelectedCampaign(null);
        fetchAnalytics(selectedCity);
      }
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };
  const handleOpenCampaignDetails = async (campaign: RegisteredQRCampaign) => {
    setSelectedCampaign(campaign);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/admin/qr-campaigns?id=${campaign.id}`);
      const data = await res.json();
      if (data.success) {
        if (data.campaign) {
          setSelectedCampaign(data.campaign);
        }
        setCampaignEvents(data.events || []);
      }
    } catch (err) {
      console.error("Failed to load campaign events:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCopyLink = async (url: string, type: "perfumes" | "discovery" | "modal") => {
    try {
      await navigator.clipboard.writeText(url);
      if (type === "perfumes") {
        setCopiedPerfumesLink(true);
        setTimeout(() => setCopiedPerfumesLink(false), 2000);
      } else if (type === "discovery") {
        setCopiedDiscoveryLink(true);
        setTimeout(() => setCopiedDiscoveryLink(false), 2000);
      } else {
        setCopiedModalUrl(true);
        setTimeout(() => setCopiedModalUrl(false), 2000);
      }
    } catch {}
  };

  const handleDownloadSavedPng = (campaign: RegisteredQRCampaign) => {
    if (!campaign.qrCodeSvg) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 1200;
    canvas.height = 1200;

    const svgBlob = new Blob([campaign.qrCodeSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${campaign.name.replace(/\s+/g, "-")}-QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
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

      {/* Production Flyer Links Bar */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <LinkIcon className="h-4 w-4" />
            <span>Production Campaign Links (Map to Custom QR Codes)</span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">Domain: www.humefragrance.com</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {/* Perfumes Catalog Link */}
          <div className="flex items-center justify-between gap-3 bg-stone-950 border border-stone-800 rounded-xl p-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                Perfumes Catalog ({activeCitySlug.toUpperCase()})
              </span>
              <p className="text-xs font-mono text-stone-200 truncate">{perfumesProductionUrl}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(perfumesProductionUrl, "perfumes")}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedPerfumesLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedPerfumesLink ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={perfumesProductionUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-stone-400 hover:text-white transition-colors"
                title="Open link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Discovery Set Link */}
          <div className="flex items-center justify-between gap-3 bg-stone-950 border border-stone-800 rounded-xl p-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                Discovery Set Builder ({activeCitySlug.toUpperCase()})
              </span>
              <p className="text-xs font-mono text-stone-200 truncate">{discoveryProductionUrl}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => handleCopyLink(discoveryProductionUrl, "discovery")}
                className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {copiedDiscoveryLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedDiscoveryLink ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={discoveryProductionUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-stone-400 hover:text-white transition-colors"
                title="Open link"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Saved QR Campaigns Gallery */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-amber-400" />
              <span>Registered Active QR Campaigns (Click any campaign to inspect detailed analytics)</span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Click on any campaign card to view its saved QR vector image, scan timeline, and conversion ratio.
            </p>
          </div>
        </div>

        {registeredCampaigns.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-stone-800 rounded-xl">
            <QrCode className="h-8 w-8 text-stone-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-300">No registered QR codes saved yet.</p>
            <p className="text-xs text-stone-500 mt-1">Design and save QR codes in the QR Studio to see saved QR codes here.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {registeredCampaigns.map((camp) => (
              <div
                key={camp.id}
                onClick={() => handleOpenCampaignDetails(camp)}
                className="group relative cursor-pointer rounded-xl border border-stone-800 bg-stone-950 p-4 transition-all hover:border-amber-500/50 hover:bg-stone-900/90 shadow-lg"
              >
                {/* Saved QR Code Graphic Thumbnail */}
                <div className="flex justify-center p-3 bg-white rounded-lg mb-3">
                  {camp.qrCodeSvg ? (
                    <div
                      className="h-28 w-28 text-black"
                      dangerouslySetInnerHTML={{ __html: camp.qrCodeSvg }}
                    />
                  ) : (
                    <CustomStarQRCode value={camp.targetUrl} size={110} />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      {camp.city}
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">{camp.targetPage}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {camp.name}
                  </h3>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                    <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{camp.scanCount} Scans</span>
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              Step-by-step percentage drop-off analysis from custom QR Scan to Paid Order.
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

      {/* Full-Width City Performance Ranking Table */}
      <div className="rounded-2xl border border-white/10 bg-stone-900/80 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">City Performance Ranking</h2>
            <p className="text-xs text-stone-400">Compare conversion performance and total sales across flyer distribution cities.</p>
          </div>
          <span className="text-xs font-semibold text-stone-400">Sorted by Total Revenue</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">City</th>
                <th className="pb-3 text-right">QR Scans</th>
                <th className="pb-3 text-right">Copies</th>
                <th className="pb-3 text-right">Cart Adds</th>
                <th className="pb-3 text-right">Checkouts</th>
                <th className="pb-3 text-right">Paid Orders</th>
                <th className="pb-3 text-right">Conv. %</th>
                <th className="pb-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {cityBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    No flyer scan events logged yet. Once your custom QR code flyers are scanned in Ahmedabad, stats will appear here live.
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

      {/* DEDICATED SINGLE CAMPAIGN DRILL-DOWN INSPECTOR MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-6 text-white">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                    {selectedCampaign.city.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-stone-400">{selectedCampaign.targetPage}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="text-xl font-bold text-white font-serif">{selectedCampaign.name}</h2>
                  <button
                    type="button"
                    onClick={() => handleRenameCampaign(selectedCampaign.id, selectedCampaign.name)}
                    className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 hover:text-amber-300 hover:bg-stone-800"
                    title="Rename Campaign"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-[11px] font-mono text-stone-400 mt-0.5 inline-block bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                  Tracking Code: {selectedCampaign.id.replace(/^qr-[^-]+-[^-]+-/, "")}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-lg p-2 text-stone-400 hover:bg-stone-900 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Grid: Saved QR Code & Specific Campaign Metrics */}
            <div className="grid gap-6 md:grid-cols-12">
              {/* Saved QR Code Display (5 cols) */}
              <div className="md:col-span-5 rounded-xl border border-stone-800 bg-stone-900/90 p-5 flex flex-col items-center justify-center space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Exact Saved Vector QR Code
                </span>

                <div className="p-4 bg-white rounded-xl shadow-xl border border-stone-800 flex items-center justify-center">
                  {selectedCampaign.qrCodeSvg ? (
                    <div
                      className="h-48 w-48 text-black"
                      dangerouslySetInnerHTML={{ __html: selectedCampaign.qrCodeSvg }}
                    />
                  ) : (
                    <CustomStarQRCode value={selectedCampaign.targetUrl} size={180} />
                  )}
                </div>

                <div className="w-full space-y-2">
                  <Button
                    onClick={() => handleDownloadSavedPng(selectedCampaign)}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-2 text-xs py-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PNG Image</span>
                  </Button>

                  <Button
                    onClick={() => handleCopyLink(selectedCampaign.targetUrl, "modal")}
                    variant="outline"
                    className="w-full border-stone-800 bg-stone-950 text-white hover:bg-stone-800 font-semibold gap-2 text-xs py-2"
                  >
                    {copiedModalUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedModalUrl ? "Tracking Link Copied!" : "Copy Campaign Link"}</span>
                  </Button>

                  <Button
                    onClick={() => handleDeleteCampaign(selectedCampaign.id, selectedCampaign.name)}
                    variant="outline"
                    className="w-full border-red-900/50 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white font-semibold gap-2 text-xs py-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Campaign & Clear Scan Data</span>
                  </Button>
                </div>
              </div>

              {/* Single Campaign Metrics & Scans (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-3.5">
                    <span className="text-[11px] text-stone-400 font-medium">Real-Time QR Scans</span>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-1">{selectedCampaign.scanCount}</p>
                    <span className="text-[10px] text-stone-500">Physical Pamphlet Hits</span>
                  </div>

                  <div className="rounded-xl border border-stone-800 bg-stone-900 p-3.5">
                    <span className="text-[11px] text-stone-400 font-medium">Last Scanned Date</span>
                    <p className="text-xs font-mono font-bold text-white mt-2">
                      {selectedCampaign.lastScannedAt ? new Date(selectedCampaign.lastScannedAt).toLocaleString() : "Not scanned yet"}
                    </p>
                  </div>
                </div>

                {/* Target URL */}
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-3.5 space-y-1">
                  <span className="text-[11px] text-stone-400 font-semibold uppercase">Destination URL</span>
                  <p className="text-xs font-mono text-amber-300 break-all select-all">{selectedCampaign.targetUrl}</p>
                </div>

                {/* Specific Scan Timeline */}
                <div className="rounded-xl border border-stone-800 bg-stone-900 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-400" />
                    <span>Recent Activity Log for this QR</span>
                  </h4>

                  {loadingDetails ? (
                    <p className="text-xs text-stone-400 py-4 text-center">Loading scan activity...</p>
                  ) : campaignEvents.length === 0 ? (
                    <p className="text-xs text-stone-400 py-4 text-center">No specific scans logged for this campaign ID yet.</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {campaignEvents.map((ev, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] bg-stone-950 p-2 rounded-lg border border-stone-800">
                          <span className="font-semibold text-emerald-400 capitalize">{ev.eventType}</span>
                          <span className="font-mono text-stone-400">{new Date(ev.createdAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
