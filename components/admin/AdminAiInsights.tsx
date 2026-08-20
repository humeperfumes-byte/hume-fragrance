"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import type { AiSectionKey } from "@/lib/ai/report-schema";

type Insight = {
  title: string;
  evidence: string[];
  reason: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
};

type ReportSection = {
  headline: string;
  summary: string;
  reasons: string[];
  actions: string[];
  metricRefs: string[];
  confidence: "high" | "medium" | "low";
};

type ReportContent = {
  executiveSummary: string[];
  risks: Insight[];
  opportunities: Insight[];
  recommendedActions: Insight[];
  sections: Record<AiSectionKey, ReportSection>;
};

type StoredReport = {
  id: string;
  periodStart: string;
  periodEnd: string;
  trigger: string;
  status: string;
  provider: string | null;
  model: string | null;
  report: ReportContent | null;
  attempts: Array<{ provider: string; model: string; error?: string }>;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
};

type ReportState = {
  ai: {
    analyticsEnabled: boolean;
    ready: boolean;
    geminiConfigured: boolean;
    openRouterConfigured: boolean;
  };
  current: StoredReport | null;
  generating: boolean;
  latest: StoredReport | null;
  latestFailure: StoredReport | null;
  history: Array<StoredReport | null>;
  stale: boolean;
  nextScheduledFor: string;
};

function sectionForPath(pathname: string): AiSectionKey {
  if (pathname === "/admin/dashboard" || pathname.startsWith("/admin/intelligence")) return "executive";
  if (["/admin/orders", "/admin/tracking"].some((path) => pathname.startsWith(path))) return "sales";
  if (["/admin/checkouts", "/admin/cart", "/admin/coupon-leads"].some((path) => pathname.startsWith(path))) return "conversion";
  if (["/admin/products", "/admin/images", "/admin/reviews"].some((path) => pathname.startsWith(path))) return "catalog";
  if (["/admin/stock", "/admin/stock-notify"].some((path) => pathname.startsWith(path))) return "stock";
  if (["/admin/customers", "/admin/feedback", "/admin/login-activity"].some((path) => pathname.startsWith(path))) return "customers";
  if (["/admin/blogs", "/admin/templates", "/admin/partnerships", "/admin/flyer-campaigns", "/admin/qr-generator", "/admin/ai-visibility"].some((path) => pathname.startsWith(path))) return "marketing";
  return "system";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not generated";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function useAiReport(history = 0) {
  const [state, setState] = useState<ReportState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/intelligence?history=${history}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load AI insights");
      setState(data as ReportState);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load AI insights");
    } finally {
      setLoading(false);
    }
  }, [history]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { state, loading, error, reload };
}

function StatusPill({ state }: { state: ReportState }) {
  if (state.generating) {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-[#e2d8ff]"><Loader2 className="h-2.5 w-2.5 animate-spin" />Generating</span>;
  }
  if (!state.ai.ready) {
    return <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-amber-100">Setup required</span>;
  }
  if (state.stale) {
    return <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-amber-100">Report due</span>;
  }
  return <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.14em] text-emerald-100">Current</span>;
}

export function AdminAiInsightDock() {
  const pathname = usePathname();
  const sectionKey = sectionForPath(pathname);
  const { state, loading, error, reload } = useAiReport();
  const section = state?.latest?.report?.sections?.[sectionKey];
  const usedFallback = state?.latest?.attempts?.some((attempt) => Boolean(attempt.error));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex h-9 shrink-0 items-center gap-2 rounded-xl border border-[#c9b3ff]/20 bg-[#c9b3ff]/[0.075] px-2.5 text-[#ddcffd] transition hover:border-[#c9b3ff]/35 hover:bg-[#c9b3ff]/[0.12] sm:px-3"
          aria-label="Open AI business brief"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden text-xs font-semibold xl:inline">AI brief</span>
          {state?.stale || !state?.ai.ready ? <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-[#111113] bg-amber-300" /> : null}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="custom-scrollbar w-full overflow-y-auto border-white/10 bg-[#111113] p-0 text-white sm:max-w-[470px]">
        <SheetTitle className="sr-only">AI business brief</SheetTitle>
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_85%_0%,rgba(201,179,255,.16),transparent_34%),#17171a] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#c9b3ff]/65">Contextual intelligence</p>
              <h2 className="mt-3 text-2xl font-medium tracking-[-.03em]">{section?.headline || "Weekly AI brief"}</h2>
            </div>
            {state ? <StatusPill state={state} /> : null}
          </div>
          <p className="mt-4 text-sm leading-6 text-white/48">{section?.summary || "The latest privacy-safe business analysis appears here after generation."}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-white/32">
            <span>{formatDate(state?.latest?.completedAt)}</span>
            {state?.latest?.model ? <span className="rounded-full border border-white/8 bg-white/[0.035] px-2 py-1">{state.latest.model}</span> : null}
            {usedFallback ? <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.055] px-2 py-1 text-amber-100/70">Fallback used</span> : null}
            <span className="capitalize">{sectionKey}</span>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {loading ? <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] p-5 text-sm text-white/45"><Loader2 className="h-4 w-4 animate-spin" />Loading latest report…</div> : null}
          {error ? <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.055] p-5"><p className="text-sm text-rose-100">{error}</p><button type="button" onClick={() => void reload()} className="mt-3 text-xs font-semibold text-white">Try again</button></div> : null}
          {!loading && state && !state.ai.ready ? <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.055] p-5"><AlertTriangle className="h-5 w-5 text-amber-200" /><p className="mt-3 text-sm font-semibold text-white">AI credentials are incomplete</p><p className="mt-2 text-xs leading-5 text-white/42">Add Gemini or OpenRouter credentials in Vercel, then generate the first report from the dashboard.</p></div> : null}
          {!loading && state?.ai.ready && !section ? <div className="rounded-2xl border border-dashed border-white/10 p-7 text-center"><BrainCircuit className="mx-auto h-6 w-6 text-white/25" /><p className="mt-3 text-sm text-white/50">No successful report yet.</p><p className="mt-1 text-xs text-white/28">Generate the first report from the dashboard.</p></div> : null}

          {section ? (
            <>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/28">Why this is happening</p>
                <div className="mt-3 space-y-2">
                  {section.reasons.map((reason) => <div key={reason} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9b3ff]" /><p className="text-sm leading-6 text-white/58">{reason}</p></div>)}
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/28">Recommended next moves</p>
                <div className="mt-3 space-y-2">
                  {section.actions.map((action, index) => <div key={action} className="flex gap-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.035] p-4"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-300/10 text-[10px] font-bold text-emerald-200">{index + 1}</span><p className="text-sm leading-6 text-white/62">{action}</p></div>)}
                </div>
              </div>
              {section.metricRefs.length ? <div className="flex flex-wrap gap-2">{section.metricRefs.map((metric) => <span key={metric} className="rounded-full border border-white/8 bg-black/20 px-3 py-1.5 text-[10px] text-white/38">{metric}</span>)}</div> : null}
            </>
          ) : null}
          <div className="rounded-2xl border border-white/[0.065] bg-black/15 p-4 text-[10px] leading-5 text-white/28">AI receives aggregate metrics only. Customer names, phone numbers, email addresses, addresses, IPs and session IDs are excluded.</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdminAiExecutiveBrief() {
  const { state, loading, error, reload } = useAiReport(12);
  const [generating, setGenerating] = useState(false);
  const latest = state?.latest;
  const content = latest?.report;
  const usedFallback = latest?.attempts?.some((attempt) => Boolean(attempt.error));
  const topActions = useMemo(() => content?.recommendedActions.slice(0, 3) || [], [content]);

  const generate = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/admin/intelligence", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not generate the AI report");
      toast({ title: "Fresh AI business report generated" });
      await reload();
    } catch (caught) {
      toast({ title: caught instanceof Error ? caught.message : "AI generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-[24px] border border-[#c9b3ff]/16 bg-[radial-gradient(circle_at_90%_0%,rgba(201,179,255,.15),transparent_35%),#19191c] shadow-[inset_0_1px_rgba(255,255,255,.045),0_20px_70px_rgba(0,0,0,.2)]">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#c9b3ff]/20 bg-[#c9b3ff]/10 text-[#dacaff]"><BrainCircuit className="h-5 w-5" /></span>
          <div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-bold uppercase tracking-[.19em] text-[#c9b3ff]/65">Weekly executive intelligence</p>{state ? <StatusPill state={state} /> : null}{usedFallback ? <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.055] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-amber-100/75">Fallback used</span> : null}</div><h2 className="mt-2 text-xl font-medium text-white">{content?.sections.executive.headline || "Your AI business brief"}</h2><p className="mt-1 text-xs text-white/35">{latest ? `${formatDate(latest.completedAt)} · ${latest.provider} / ${latest.model}` : "Runs Monday at 8:00 AM IST"}</p></div>
        </div>
        <button type="button" onClick={() => void generate()} disabled={generating || loading || !state?.ai.ready} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white px-4 text-xs font-bold text-black transition hover:bg-[#ddd2ff] disabled:cursor-not-allowed disabled:opacity-40">{generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}{generating ? "Analyzing business…" : "Generate fresh report"}</button>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? <div className="h-36 animate-pulse rounded-2xl bg-white/[0.035]" /> : null}
        {error ? <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-5 text-sm text-rose-100">{error}</div> : null}
        {!loading && state && !state.ai.ready ? <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5"><p className="text-sm font-semibold text-amber-100">Add Gemini or OpenRouter credentials in Vercel to generate reports.</p></div> : null}
        {!loading && state?.ai.ready && !content ? <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center"><Sparkles className="mx-auto h-6 w-6 text-[#c9b3ff]/55" /><p className="mt-3 text-sm text-white/50">Ready for the first privacy-safe analysis.</p></div> : null}
        {content ? <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]"><div className="space-y-3">{content.executiveSummary.map((summary) => <div key={summary} className="flex gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#80f0b2]" /><p className="text-sm leading-6 text-white/60">{summary}</p></div>)}</div><div className="grid gap-3 md:grid-cols-3">{topActions.map((action) => <div key={action.title} className="flex min-h-40 flex-col rounded-2xl border border-[#c9b3ff]/10 bg-[#c9b3ff]/[0.035] p-4"><div className="flex items-center justify-between"><span className="rounded-full border border-white/8 px-2 py-1 text-[8px] font-bold uppercase tracking-[.13em] text-white/35">{action.priority}</span><ArrowUpRight className="h-4 w-4 text-white/25" /></div><p className="mt-4 text-sm font-semibold text-white">{action.title}</p><p className="mt-2 text-xs leading-5 text-white/40">{action.action}</p></div>)}</div></div> : null}
        {state?.latestFailure ? <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] px-4 py-3 text-xs text-amber-100/65"><AlertTriangle className="h-4 w-4" />The latest attempt failed, so the last successful report is still displayed.</div> : null}
        {state?.history?.length ? <div className="mt-5 flex items-center gap-2 overflow-x-auto border-t border-white/[0.07] pt-4"><Clock3 className="h-4 w-4 shrink-0 text-white/25" />{state.history.filter(Boolean).map((entry) => <span key={entry!.id} className="shrink-0 rounded-full border border-white/8 bg-black/15 px-3 py-1.5 text-[10px] text-white/35">{formatDate(entry!.completedAt)}</span>)}</div> : null}
      </div>
    </section>
  );
}
