"use client";

import { SessionIntelligence } from "@/db/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { User, Zap, AlertCircle, ShoppingCart, LogOut } from "lucide-react";

export function IntelligenceFeed({ initialSessions }: { initialSessions: SessionIntelligence[] }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-2xl backdrop-blur-md overflow-hidden">
      <Table>
        <TableHeader className="bg-white/[0.03]">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5 px-6 w-[250px]">Session / User</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Intent Score</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Predicted Move</TableHead>
            <TableHead className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/30 py-5">Activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialSessions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-64 text-center">
                <p className="text-white/20 font-serif italic">Monitoring live behavioral streams...</p>
              </TableCell>
            </TableRow>
          ) : (
            initialSessions.map((session) => (
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
                      <span className={session.intentScore > 70 ? "text-amber-500" : "text-white/40"}>
                        {session.intentScore}% Intent
                      </span>
                    </div>
                    <Progress value={session.intentScore} className="h-1 bg-white/10" indicatorClassName={session.intentScore > 70 ? "bg-amber-500" : "bg-primary"} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {session.predictedNextAction === "checkout" ? (
                      <Badge className="bg-amber-500/10 text-amber-500 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <ShoppingCart className="h-3 w-3 mr-1" /> Will Checkout
                      </Badge>
                    ) : session.predictedNextAction === "exit" || (session.abandonmentRisk ?? 0) > 60 ? (
                      <Badge className="bg-red-500/10 text-red-500 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <LogOut className="h-3 w-3 mr-1" /> High Exit Risk
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-white/5 text-white/40 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        Browsing
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-white/40 font-medium italic">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </span>
                    <span className="text-[9px] text-white/10 font-bold uppercase tracking-[0.1em] mt-1">
                      {session.totalInteractions} Interactions
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
