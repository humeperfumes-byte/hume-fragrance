import React from "react";
import { desc } from "drizzle-orm";
import { MessageSquare, HelpCircle } from "lucide-react";
import { db } from "@/db";
import { customerFeedback } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { FeedbackTable } from "./FeedbackTable";

export const dynamic = "force-dynamic";

async function getFeedback() {
  const rows = await db
    .select({
      id: customerFeedback.id,
      source: customerFeedback.source,
      sourceDetails: customerFeedback.sourceDetails,
      rating: customerFeedback.rating,
      feedbackText: customerFeedback.feedbackText,
      createdAt: customerFeedback.createdAt,
    })
    .from(customerFeedback)
    .orderBy(desc(customerFeedback.createdAt))
    .limit(1000);

  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
  }));
}

export default async function AdminFeedbackPage() {
  let feedbackData: any[] = [];
  let dbError = false;

  try {
    feedbackData = await getFeedback();
  } catch (error) {
    console.error("Admin feedback page DB error:", error);
    dbError = true;
  }

  if (dbError) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Feedback</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/[0.04] p-12 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <h3 className="text-lg font-medium text-amber-300">Database Sync Required</h3>
            <p className="text-sm text-white/50">
              The feedback table could not be loaded. Please ensure the database schema is synced and you've run db:push.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 border-sky-400/20 bg-sky-400/10 text-sky-100 hover:bg-sky-400/10">
            <MessageSquare className="mr-1 h-3.5 w-3.5" />
            Feedback center
          </Badge>
          <h1 className="text-2xl font-semibold text-white">Customer Feedback</h1>
          <p className="mt-1 max-w-2xl text-sm text-white/45">
            View acquisition source metrics, user prompts, website rating score, and detailed comments.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">Total Responses</p>
          <p className="mt-1 flex items-center justify-end gap-2 text-2xl font-semibold text-white">
            <HelpCircle className="h-5 w-5 text-white/35" />
            {feedbackData.length}
          </p>
        </div>
      </div>

      <FeedbackTable feedback={feedbackData} />
    </div>
  );
}
