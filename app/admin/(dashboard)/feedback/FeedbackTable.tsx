"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, MessageSquare, Star } from "lucide-react";

type FeedbackRow = {
  id: string;
  source: string;
  sourceDetails: string | null;
  rating: number;
  feedbackText: string | null;
  createdAt: string;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function FeedbackTable({ feedback }: { feedback: FeedbackRow[] }) {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const filteredFeedback = useMemo(() => {
    return feedback.filter((item) => {
      // Source filter
      if (sourceFilter !== "all" && item.source !== sourceFilter) return false;

      // Rating filter
      if (ratingFilter !== "all" && item.rating.toString() !== ratingFilter) return false;

      // Search keyword filter
      if (search) {
        const q = search.toLowerCase();
        return (
          item.source.toLowerCase().includes(q) ||
          (item.sourceDetails?.toLowerCase() || "").includes(q) ||
          (item.feedbackText?.toLowerCase() || "").includes(q)
        );
      }
      return true;
    });
  }, [feedback, search, sourceFilter, ratingFilter]);

  // Source mapping helper to display pretty source labels
  const getSourceLabel = (src: string) => {
    switch (src) {
      case "ai":
        return "AI Models";
      case "google":
        return "Google Search";
      case "social":
        return "Instagram / Socials";
      case "friend":
        return "Word of mouth";
      case "youtube":
        return "YouTube / Twitter";
      case "other":
        return "Other Source";
      default:
        return src;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1 sm:min-w-[240px] sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search details, feedback text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Source Filter */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-white/30" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-neutral-900">All Sources</option>
            <option value="ai" className="bg-neutral-900">AI Models</option>
            <option value="google" className="bg-neutral-900">Google Search</option>
            <option value="social" className="bg-neutral-900">Instagram / Socials</option>
            <option value="friend" className="bg-neutral-900">Word of mouth</option>
            <option value="youtube" className="bg-neutral-900">YouTube / Twitter</option>
            <option value="other" className="bg-neutral-900">Other Source</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Star className="h-3.5 w-3.5 text-white/30" />
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-neutral-900">All Ratings</option>
            <option value="5" className="bg-neutral-900">5 Stars</option>
            <option value="4" className="bg-neutral-900">4 Stars</option>
            <option value="3" className="bg-neutral-900">3 Stars</option>
            <option value="2" className="bg-neutral-900">2 Stars</option>
            <option value="1" className="bg-neutral-900">1 Star</option>
          </select>
        </div>

        <span className="text-xs text-white/30 font-medium ml-auto">
          {filteredFeedback.length} response{filteredFeedback.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/15 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/40">
              <th className="px-6 py-4">Submission Date</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Keywords / Details</th>
              <th className="px-6 py-4">Rating</th>
              <th className="px-6 py-4">Feedback / Comments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm text-white/80">
            {filteredFeedback.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                  No feedback matching active filters.
                </td>
              </tr>
            ) : (
              filteredFeedback.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                  {/* Submission date */}
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-mono text-white/40">
                    {formatDate(item.createdAt)}
                  </td>

                  {/* Source Badge */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.source === "ai" ? "bg-cyan-500/10 text-cyan-300" :
                      item.source === "google" ? "bg-blue-500/10 text-blue-300" :
                      item.source === "social" ? "bg-purple-500/10 text-purple-300" :
                      item.source === "friend" ? "bg-amber-500/10 text-amber-300" :
                      item.source === "youtube" ? "bg-red-500/10 text-red-300" :
                      "bg-white/5 text-white/40"
                    }`}>
                      {getSourceLabel(item.source)}
                    </span>
                  </td>

                  {/* Keywords/Details */}
                  <td className="px-6 py-4 font-mono text-xs max-w-[200px] truncate" title={item.sourceDetails || ""}>
                    {item.sourceDetails ? (
                      <span className="text-white">{item.sourceDetails}</span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>

                  {/* Rating Stars */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= item.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Feedback text */}
                  <td className="px-6 py-4 max-w-[320px]">
                    {item.feedbackText ? (
                      <div className="text-white/70 line-clamp-2 text-xs leading-relaxed" title={item.feedbackText}>
                        {item.feedbackText}
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs italic">No comments provided</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
