import { db } from "@/db";
import { sessionIntelligence, sectionAttribution } from "@/db/schema";
import { desc, gt } from "drizzle-orm";
import { Suspense } from "react";
import { IntelligenceFeed } from "./IntelligenceFeed";
import { SectionPerformance } from "./SectionPerformance";
import { Brain, Zap, AlertTriangle, Target } from "lucide-react";

export const revalidate = 0; // Real-time feed

export default async function IntelligencePage() {
  const [sessions, sections] = await Promise.all([
    db.select().from(sessionIntelligence).orderBy(desc(sessionIntelligence.updatedAt)).limit(50),
    db.select().from(sectionAttribution).orderBy(desc(sectionAttribution.attributionScore)).limit(10),
  ]);

  const highIntentCount = sessions.filter(s => s.intentScore > 70).length;
  const highRiskCount = sessions.filter(s => s.abandonmentRisk > 60).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl font-serif text-white tracking-tight">Behavioral Intelligence</h1>
        </div>
        <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] ml-11">
          Real-time intent scoring & behavioral prediction
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 backdrop-blur-xl group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Active Hot Leads</p>
            <Zap className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <p className="text-5xl font-serif text-white tracking-tight">{highIntentCount}</p>
          <p className="mt-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">Users with Intent &gt; 70%</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 backdrop-blur-xl group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">Abandonment Risk</p>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-5xl font-serif text-white tracking-tight">{highRiskCount}</p>
          <p className="mt-2 text-[10px] text-white/20 uppercase tracking-widest font-bold">Users flagging Exit Intent</p>
        </div>

        <div className="rounded-3xl border border-primary/20 bg-primary/[0.03] p-7 backdrop-blur-xl group">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/60 font-bold">Top Section</p>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <p className="text-3xl font-serif text-white truncate tracking-tight">{sections[0]?.sectionName || "Hero"}</p>
          <p className="mt-2 text-[10px] text-primary/40 uppercase tracking-widest font-bold">Highest Conversion Credit</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-white px-2">Live Intelligence Feed</h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live Syncing</span>
            </div>
          </div>
          <IntelligenceFeed initialSessions={sessions} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white px-2">Section Attribution</h2>
          <SectionPerformance sections={sections} />
        </div>
      </div>
    </div>
  );
}
