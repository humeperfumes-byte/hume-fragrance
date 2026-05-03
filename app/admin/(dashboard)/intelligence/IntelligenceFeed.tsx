"use client";

import { useState, useEffect, useCallback } from "react";
import { SessionIntelligence } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { User, ShoppingCart, LogOut, TrendingUp } from "lucide-react";

const POLL_INTERVAL = 10_000; // 10 seconds

export function IntelligenceFeed({ initialSessions }: { initialSessions: SessionIntelligence[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isLive, setIsLive] = useState(true);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/intelligence");
      if (!res.ok) return;
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch {
      // Silently continue
    }
  }, []);

  // Auto-poll
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [isLive, fetchLatest]);

  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
          {sessions.length} Sessions Tracked
        </span>
        <button
          onClick={() => setIsLive((v) => !v)}
          className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 hover:text-white/60 transition-colors"
        >
          <div className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
          {isLive ? "Live" : "Paused"}
        </button>
      </div>
      <Table>
        <TableHeader className="bg-white/[0.03]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 px-6 w-[250px]">Session / User</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Intent Score</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Predicted Move</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Risk / Cause</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                <p className="text-white/20 font-serif italic">Monitoring live behavioral streams...</p>
              </TableCell>
            </TableRow>
          ) : (
            sessions.map((session) => (
              <TableRow key={session.id} className="border-white/5 hover:bg-white/[0.02] transition-all duration-300 group">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <User className="h-5 w-5 text-white/40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                        Session {session.sessionId.substring(0, 8)}...
                      </span>
                      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5 italic">
                        {session.currentSection || "Landing"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2 max-w-[150px]">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                      <span className={session.intentScore > 70 ? "text-amber-500" : session.intentScore > 40 ? "text-primary" : "text-white/40"}>
                        {session.intentScore}%
                      </span>
                    </div>
                    <Progress
                      value={session.intentScore}
                      className="h-1 bg-white/10"
                      indicatorClassName={
                        session.intentScore > 70
                          ? "bg-amber-500"
                          : session.intentScore > 40
                          ? "bg-primary"
                          : "bg-white/20"
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {session.predictedNextAction === "checkout" ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <ShoppingCart className="h-3 w-3 mr-1" /> Checkout
                      </Badge>
                    ) : session.predictedNextAction === "add_to_cart" ? (
                      <Badge className="bg-primary/10 text-primary border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <TrendingUp className="h-3 w-3 mr-1" /> Add to Cart
                      </Badge>
                    ) : session.predictedNextAction === "exit" ? (
                      <Badge className="bg-red-500/10 text-red-500 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <LogOut className="h-3 w-3 mr-1" /> Exit Risk
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/5 text-white/40 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        Browsing
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        (session.abandonmentRisk ?? 0) > 60 ? "bg-red-500" :
                        (session.abandonmentRisk ?? 0) > 30 ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                      <span className="text-[10px] font-bold text-white/40">{session.abandonmentRisk ?? 0}%</span>
                    </div>
                    {session.topAbandonmentCause && (
                      <span className="text-[9px] text-white/20 uppercase tracking-widest font-bold">
                        {session.topAbandonmentCause.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/40 font-medium italic">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </span>
                    <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.1em] mt-1">
                      {session.totalInteractions} events
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
