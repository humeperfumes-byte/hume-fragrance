"use client";

import { useState, useCallback } from "react";
import {
  FileJson,
  FileSpreadsheet,
  Loader2,
  Database,
  RefreshCcw,
  Zap,
  Package,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TABLES = [
  { key: "customer_journeys", label: "Customer Journeys (Cross-Referenced)", icon: Zap, description: "Unified view: coupon claims + checkout drafts + orders + intent scores + cart activity per session", highlight: true },
  { key: "coupon_code_events", label: "Coupon Code Claims", icon: Package, description: "Every coupon code claimed via email or WhatsApp" },
  { key: "checkout_drafts", label: "Checkout Drafts", icon: Package, description: "Abandoned and active checkout sessions with lead status" },
  { key: "orders", label: "Orders", icon: Package, description: "All completed and pending orders" },
  { key: "cart_events", label: "Cart Events", icon: Package, description: "Add to cart, remove, quantity updates" },
  { key: "consent_events", label: "Page Views & Consent", icon: Package, description: "Page visits with source attribution data" },
  { key: "behavioral_events", label: "Behavioral Events", icon: Package, description: "Clicks, scrolls, section views, dwell time" },
  { key: "session_intelligence", label: "Session Intelligence", icon: Package, description: "Intent scores, abandonment risk, predictions" },
  { key: "section_attribution", label: "Section Attribution", icon: Package, description: "Which sections drive conversions" },
  { key: "products", label: "Products Catalog", icon: Package, description: "All product data including notes, longevity, badges" },
  { key: "reviews", label: "Reviews", icon: Package, description: "Customer reviews and ratings" },
];

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

export default function DataExportPage() {
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState<string | null>(null);
  const [rowCounts, setRowCounts] = useState<Record<string, number> | null>(null);
  const [loadingCounts, setLoadingCounts] = useState(false);

  const fetchCounts = useCallback(async () => {
    setLoadingCounts(true);
    try {
      const res = await fetch(`/api/admin/export?days=${days}&table=all&format=json`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRowCounts(data.rowCounts);
    } catch {
      toast({ title: "Failed to load row counts", variant: "destructive" });
    } finally {
      setLoadingCounts(false);
    }
  }, [days]);

  const downloadTable = async (tableKey: string, format: "json" | "csv") => {
    setLoading(`${tableKey}-${format}`);
    try {
      const url = `/api/admin/export?days=${days}&table=${tableKey}&format=${format}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Download failed");

      if (format === "csv") {
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `hume_${tableKey}_${days}d.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      } else {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `hume_${tableKey}_${days}d.json`;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      toast({ title: `Downloaded ${tableKey}.${format}` });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const downloadAll = async (format: "json" | "csv") => {
    setLoading(`all-${format}`);
    try {
      const url = `/api/admin/export?days=${days}&table=all&format=${format}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Download failed");

      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `hume_full_export_${days}d_${format}.json`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({ title: `Full ${format.toUpperCase()} export downloaded!` });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl text-white tracking-tight">Data Export</h1>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] ml-11">
          Download cross-referenced data for AI analysis
        </p>
        <p className="ml-11 text-xs text-white/35">Exports include all captured data.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
            Window
          </span>
          <select
            value={days}
            onChange={(e) => { setDays(e.target.value); setRowCounts(null); }}
            className="cursor-pointer bg-transparent text-sm font-medium text-white outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="15">Last 15 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="60">Last 60 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>

        <button
          onClick={fetchCounts}
          disabled={loadingCounts}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:opacity-50"
        >
          {loadingCounts ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Preview Row Counts
        </button>
      </div>

      {/* Download All Buttons */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 backdrop-blur-xl sm:rounded-3xl sm:p-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Download Everything</h2>
            <p className="mt-1 text-sm text-white/40">
              All {TABLES.length} tables + cross-referenced customer journeys in one file.
              Perfect for uploading to ChatGPT, Claude, or Gemini for analysis.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => downloadAll("json")}
              disabled={loading !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-primary/20 border border-primary/30 px-5 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading === "all-json" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
              Download All (JSON)
            </button>
            <button
              onClick={() => downloadAll("csv")}
              disabled={loading !== null}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 px-5 py-3 text-sm font-semibold text-emerald-300 transition-all hover:bg-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading === "all-csv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              Download All (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Individual Tables */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white px-1">Individual Tables</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {TABLES.map((t) => (
            <div
              key={t.key}
              className={`rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                t.highlight
                  ? "border-primary/20 bg-primary/[0.03]"
                  : "border-white/5 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">{t.label}</p>
                    {t.highlight && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary">
                        AI Ready
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-white/30">{t.description}</p>
                  {rowCounts && (
                    <p className="mt-2 text-xs font-semibold text-white/50">
                      {formatNumber(rowCounts[t.key] || 0)} rows
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => downloadTable(t.key, "csv")}
                    disabled={loading !== null}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-[11px] font-semibold text-white/60 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                    title="Download CSV"
                  >
                    {loading === `${t.key}-csv` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
                    CSV
                  </button>
                  <button
                    onClick={() => downloadTable(t.key, "json")}
                    disabled={loading !== null}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2 text-[11px] font-semibold text-white/60 transition-all hover:bg-white/[0.08] hover:text-white disabled:opacity-50"
                    title="Download JSON"
                  >
                    {loading === `${t.key}-json` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileJson className="h-3.5 w-3.5" />}
                    JSON
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Prompt Guide */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-xl sm:rounded-3xl sm:p-7">
        <h2 className="text-lg font-semibold text-white">AI Analysis Guide</h2>
        <p className="mt-1 text-sm text-white/40">
          Upload the exported files to ChatGPT, Claude, or Gemini and use these prompts:
        </p>
        <div className="mt-4 space-y-3">
          {[
            "Analyze my customer journeys data. Which acquisition sources bring the highest intent customers? Where in the funnel am I losing the most revenue?",
            "Look at my coupon code claims vs actual orders. What percentage of coupon claimers convert to paying customers? What can I do to increase this?",
            "Analyze my behavioral events and section attribution data. Which website sections are driving the most conversions? Which sections have high views but low engagement?",
            "Cross-reference my checkout drafts with orders. What is the average time from first visit to purchase? What fields do people fill in before abandoning?",
            "Look at my product demand data. Which products have high add-to-cart but low orders? This indicates pricing or trust issues.",
          ].map((prompt, i) => (
            <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-xs text-white/60 leading-relaxed">{prompt}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(prompt); toast({ title: "Copied to clipboard!" }); }}
                className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
              >
                Copy Prompt
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
