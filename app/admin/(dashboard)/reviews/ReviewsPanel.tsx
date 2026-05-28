"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ExternalLink,
  HelpCircle,
  MessageSquareText,
  PenLine,
  Search,
  Star,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getProductPath } from "@/lib/product-route";

export type AdminReviewRow = {
  id: string;
  productId: string;
  author: string;
  avatarUrl: string | null;
  reviewerCity: string | null;
  reviewerLanguage: string | null;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  createdAt: string;
  productName: string | null;
  productInspiration: string | null;
  productInspirationBrand: string | null;
};

type Filter = "all" | "review" | "question" | "response";

function getKind(row: Pick<AdminReviewRow, "title" | "reviewerLanguage">): Filter {
  const title = row.title.toLowerCase();
  if (row.reviewerLanguage === "question" || title === "question") return "question";
  if (row.reviewerLanguage === "response" || title === "response" || title.startsWith("response:")) return "response";
  return "review";
}

function getResponseParentId(row: AdminReviewRow) {
  return row.title.toLowerCase().startsWith("response:") ? row.title.slice("Response:".length) : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function productLink(row: AdminReviewRow) {
  if (!row.productName || !row.productInspiration) return `/product/${row.productId}`;
  return getProductPath({
    id: row.productId,
    name: row.productName,
    inspiration: row.productInspiration,
    inspirationBrand: row.productInspirationBrand ?? "",
  });
}

function KindBadge({ kind }: { kind: Filter }) {
  if (kind === "question") {
    return (
      <Badge className="border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10">
        <HelpCircle className="mr-1 h-3 w-3" />
        Question
      </Badge>
    );
  }
  if (kind === "response") {
    return (
      <Badge className="border-sky-300/20 bg-sky-300/10 text-sky-100 hover:bg-sky-300/10">
        <PenLine className="mr-1 h-3 w-3" />
        Response
      </Badge>
    );
  }
  return (
    <Badge className="border-emerald-300/20 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/10">
      <Star className="mr-1 h-3 w-3" />
      Review
    </Badge>
  );
}

function ReviewCard({
  row,
  responses,
  onReply,
  onDelete,
  deletingId,
  replyingId,
  replyText,
  setReplyText,
  savingReply,
}: {
  row: AdminReviewRow;
  responses: AdminReviewRow[];
  onReply: (question: AdminReviewRow) => void;
  onDelete: (row: AdminReviewRow) => void;
  deletingId: string | null;
  replyingId: string | null;
  replyText: string;
  setReplyText: (value: string) => void;
  savingReply: boolean;
}) {
  const kind = getKind(row);
  const productName = row.productName || row.productId;
  const productMeta = [row.productInspirationBrand, row.productInspiration].filter(Boolean).join(" ");

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <KindBadge kind={kind} />
            {row.verified ? (
              <Badge className="border-white/10 bg-white/10 text-white/70 hover:bg-white/10">Verified</Badge>
            ) : null}
            {kind === "review" ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-200">
                <Star className="h-3.5 w-3.5 fill-amber-200" />
                {row.rating}/5
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{row.author}</p>
            <p className="mt-1 text-xs text-white/35">
              {[row.reviewerCity, formatDate(row.createdAt)].filter(Boolean).join(" / ")}
            </p>
          </div>
          <p className="max-w-3xl whitespace-pre-wrap text-sm leading-6 text-white/70">{row.content}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="border-white/10 bg-white/[0.03] text-white hover:bg-white/10">
            <Link href={productLink(row)} target="_blank">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Product
            </Link>
          </Button>
          {kind === "question" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReply(row)}
              className="border-sky-300/20 bg-sky-300/10 text-sky-100 hover:bg-sky-300/15"
            >
              <PenLine className="mr-1.5 h-3.5 w-3.5" />
              Reply
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={deletingId === row.id}
            onClick={() => onDelete(row)}
            className="border-red-300/20 bg-red-300/10 text-red-100 hover:bg-red-300/15"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/30">Product</p>
        <p className="mt-1 font-serif text-2xl font-light text-white">{productName}</p>
        {productMeta ? <p className="mt-1 text-sm italic text-white/45">{productMeta}</p> : null}
      </div>

      {kind === "question" ? (
        <div className="mt-4 space-y-3">
          {responses.map((response) => (
            <div key={response.id} className="rounded-2xl border border-sky-300/10 bg-sky-300/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <KindBadge kind="response" />
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/70">{response.content}</p>
                  <p className="mt-2 text-xs text-white/35">
                    {response.author} / {formatDate(response.createdAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={deletingId === response.id}
                  onClick={() => onDelete(response)}
                  className="text-red-200 hover:bg-red-300/10 hover:text-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {replyingId === row.id ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
                Admin response
              </label>
              <textarea
                value={replyText}
                onChange={(event) => setReplyText(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-sky-300/40"
                placeholder="Write a response that will appear below this question."
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={savingReply}
                  onClick={() => onReply(row)}
                  className="bg-white text-black hover:bg-white/90"
                >
                  Save response
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setReplyText("")}
                  className="text-white/55 hover:bg-white/8 hover:text-white"
                >
                  Clear
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function ReviewsPanel({ initialReviews }: { initialReviews: AdminReviewRow[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [savingReply, setSavingReply] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const ratingRows = reviews.filter((row) => getKind(row) === "review");
    const ratingSum = ratingRows.reduce((sum, row) => sum + row.rating, 0);
    return {
      reviews: ratingRows.length,
      questions: reviews.filter((row) => getKind(row) === "question").length,
      responses: reviews.filter((row) => getKind(row) === "response").length,
      average: ratingRows.length ? (ratingSum / ratingRows.length).toFixed(1) : "0.0",
    };
  }, [reviews]);

  const responsesByQuestion = useMemo(() => {
    const map = new Map<string, AdminReviewRow[]>();
    reviews
      .filter((row) => getKind(row) === "response")
      .forEach((row) => {
        const parentId = getResponseParentId(row);
        if (!parentId) return;
        const existing = map.get(parentId) ?? [];
        existing.push(row);
        map.set(parentId, existing);
      });
    return map;
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reviews.filter((row) => {
      const kind = getKind(row);
      if (filter !== "all" && kind !== filter) return false;
      if (filter === "all" && kind === "response" && getResponseParentId(row)) return false;
      if (!normalizedQuery) return true;
      return [
        row.author,
        row.reviewerCity,
        row.content,
        row.productId,
        row.productName,
        row.productInspiration,
        row.productInspirationBrand,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [filter, query, reviews]);

  async function saveReply(question: AdminReviewRow) {
    if (replyingId !== question.id) {
      setReplyingId(question.id);
      setReplyText("");
      return;
    }
    if (replyText.trim().length < 2) {
      toast({ title: "Write a response first", variant: "destructive" });
      return;
    }
    setSavingReply(true);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, content: replyText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save response");
      const created = data.review as AdminReviewRow;
      setReviews((current) => [
        {
          ...created,
          productName: question.productName,
          productInspiration: question.productInspiration,
          productInspirationBrand: question.productInspirationBrand,
        },
        ...current,
      ]);
      setReplyingId(null);
      setReplyText("");
      toast({ title: "Response saved" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to save response",
        variant: "destructive",
      });
    } finally {
      setSavingReply(false);
    }
  }

  async function deleteReview(row: AdminReviewRow) {
    const kind = getKind(row);
    const confirmed = window.confirm(
      kind === "question"
        ? "Delete this question and its responses?"
        : "Delete this item?",
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      const response = await fetch(`/api/admin/reviews?id=${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete item");
      setReviews((current) =>
        current.filter((item) => item.id !== row.id && getResponseParentId(item) !== row.id),
      );
      toast({ title: "Deleted" });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const statCards = [
    { label: "Reviews", value: stats.reviews, icon: Star },
    { label: "Questions", value: stats.questions, icon: HelpCircle },
    { label: "Responses", value: stats.responses, icon: PenLine },
    { label: "Avg rating", value: stats.average, icon: MessageSquareText },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{card.label}</p>
              <card.icon className="h-4 w-4 text-white/35" />
            </div>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
              placeholder="Search author, product, city, or content"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "review", "question", "response"] as Filter[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`h-10 rounded-xl px-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                  filter === item
                    ? "bg-white text-black"
                    : "border border-white/10 bg-black/20 text-white/55 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item === "all" ? "All" : `${item}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {visibleReviews.length ? (
            visibleReviews.map((row) => (
              <ReviewCard
                key={row.id}
                row={row}
                responses={responsesByQuestion.get(row.id) ?? []}
                onReply={saveReply}
                onDelete={deleteReview}
                deletingId={deletingId}
                replyingId={replyingId}
                replyText={replyText}
                setReplyText={setReplyText}
                savingReply={savingReply}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 px-6 py-14 text-center">
              <MessageSquareText className="mx-auto h-8 w-8 text-white/25" />
              <h3 className="mt-4 text-lg font-semibold text-white">No matching items</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
                Reviews, questions, and responses will appear here as customers post them.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
