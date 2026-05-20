"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckoutDraft } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Copy,
  ExternalLink,
  Mail,
  MessageCircle,
  Phone,
  Save,
  ShoppingCart,
  User,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { buildAdminEmailHref, buildAdminLeadMessage, buildAdminWhatsAppHref } from "@/lib/admin-message-templates";
import { getCapturedDomainInfo, type CapturedDomainKind } from "@/lib/captured-domain";

function getDraftValue(draft: CheckoutDraft): number {
  return Number.parseFloat(String(draft.grandTotal ?? "0") || "0");
}

function getDraftHost(draft: CheckoutDraft) {
  if (!draft.path) return "Unknown";
  try {
    return new URL(draft.path).hostname.replace(/^www\./, "");
  } catch {
    return draft.path.startsWith("/") ? "Legacy / unknown" : draft.path;
  }
}

function getDomainClassName(kind: CapturedDomainKind) {
  switch (kind) {
    case "india":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/10";
    case "global":
      return "border-sky-500/20 bg-sky-500/10 text-sky-200 hover:bg-sky-500/10";
    case "preview":
      return "border-purple-500/20 bg-purple-500/10 text-purple-200 hover:bg-purple-500/10";
    case "local":
      return "border-white/10 bg-white/[0.05] text-white/55 hover:bg-white/[0.05]";
    case "unknown":
      return "border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/10";
    default:
      return "border-white/10 bg-white/[0.04] text-white/45 hover:bg-white/[0.04]";
  }
}

function scoreCheckoutDraft(draft: CheckoutDraft): number {
  let score = 0;
  const value = getDraftValue(draft);

  if (value >= 2500) score += 40;
  else if (value >= 1500) score += 30;
  else if (value >= 1000) score += 20;
  else if (value >= 500) score += 10;

  if (draft.phone) score += 25;
  if (draft.fullName) score += 10;
  if (draft.email) score += 5;
  if (draft.city && draft.state) score += 10;
  if (draft.addressLine1) score += 10;
  if (draft.pincode) score += 5;
  if ((draft.cartSnapshot?.length || 0) >= 2) score += 5;
  if (draft.status === "complete") score += 10;
  if (draft.status === "whatsapp_initiated") score -= 20;

  const hoursSinceUpdate = (Date.now() - new Date(draft.updatedAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceUpdate <= 1) score += 15;
  else if (hoursSinceUpdate <= 24) score += 8;
  else if (hoursSinceUpdate <= 72) score += 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getLeadTemperature(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

const leadStatusOptions = ["new", "contacted", "replied", "converted", "lost"] as const;
type LeadStatus = (typeof leadStatusOptions)[number];

function formatDateTimeLocal(value: Date | string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getTemperatureClassName(temp: string) {
  switch (temp) {
    case "Hot":
      return "border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/10";
    case "Warm":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10";
    default:
      return "border-sky-500/25 bg-sky-500/10 text-sky-300 hover:bg-sky-500/10";
  }
}

function getStatusClassName(status: string) {
  switch (status) {
    case "contacted":
      return "border-blue-500/20 bg-blue-500/10 text-blue-200 hover:bg-blue-500/10";
    case "replied":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/10";
    case "converted":
      return "border-green-500/20 bg-green-500/10 text-green-200 hover:bg-green-500/10";
    case "lost":
      return "border-white/10 bg-white/[0.04] text-white/45 hover:bg-white/[0.04]";
    default:
      return "border-white/10 bg-white/[0.05] text-white/70 hover:bg-white/[0.05]";
  }
}

export function CheckoutsTable({ initialDrafts }: { initialDrafts: CheckoutDraft[] }) {
  const [workflowById, setWorkflowById] = useState<
    Record<string, { leadStatus: LeadStatus; leadNotes: string; nextFollowUpAt: string }>
  >({});
  const [savingDraftId, setSavingDraftId] = useState<string | null>(null);

  const scoredDrafts = useMemo(() => {
    return initialDrafts
      .filter((d) => d.status !== "promoted")
      .map((draft) => {
        const leadScore = scoreCheckoutDraft(draft);
        return {
          ...draft,
          leadScore,
          leadTemperature: getLeadTemperature(leadScore),
        };
      })
      .sort((a, b) => b.leadScore - a.leadScore || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [initialDrafts]);

  const getWorkflow = (draft: CheckoutDraft) =>
    workflowById[draft.id] ?? {
      leadStatus: ((draft.leadStatus as LeadStatus | null) || "new") as LeadStatus,
      leadNotes: draft.leadNotes || "",
      nextFollowUpAt: formatDateTimeLocal(draft.nextFollowUpAt),
    };

  const updateWorkflow = (
    draft: CheckoutDraft,
    patch: Partial<{ leadStatus: LeadStatus; leadNotes: string; nextFollowUpAt: string }>,
  ) => {
    setWorkflowById((prev) => ({
      ...prev,
      [draft.id]: {
        ...getWorkflow(draft),
        ...patch,
      },
    }));
  };

  const saveWorkflow = async (draft: CheckoutDraft, markContacted = false) => {
    const workflow = getWorkflow(draft);
    setSavingDraftId(draft.id);
    try {
      const response = await fetch("/api/admin/checkout-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draft.id,
          leadStatus: workflow.leadStatus,
          leadNotes: workflow.leadNotes,
          markContacted,
          nextFollowUpAt: workflow.nextFollowUpAt
            ? new Date(workflow.nextFollowUpAt).toISOString()
            : null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update lead");
      toast({
        title: markContacted ? "Lead marked contacted" : "Lead updated",
        description: "Recovery workflow has been saved.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingDraftId(null);
    }
  };

  const handleCopyRecoveryMessage = async (draft: CheckoutDraft) => {
    try {
      const products = (draft.cartSnapshot || []).map((item) => item.name);
      await navigator.clipboard.writeText(
        buildAdminLeadMessage({
          template: "checkout_abandoned",
          name: draft.fullName,
          products,
          value: getDraftValue(draft),
          checkoutField: draft.lastEditedField,
        }).body,
      );
      toast({ title: "Message copied", description: "Recovery message is ready to paste." });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleWhatsAppRecovery = (draft: CheckoutDraft) => {
    const url = buildAdminWhatsAppHref(draft.phone, {
      template: "checkout_abandoned",
      name: draft.fullName,
      products: (draft.cartSnapshot || []).map((item) => item.name),
      value: getDraftValue(draft),
      checkoutField: draft.lastEditedField,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handlePromoteToOrder = async (draft: CheckoutDraft) => {
    if (!confirm(`Convert this checkout from ${draft.fullName || "Unknown"} into an official order?`)) return;

    try {
      const res = await fetch("/api/admin/convert-to-order", {
        method: "POST",
        body: JSON.stringify({ draftId: draft.id }),
      });
      const data = await res.json();
      if (data.ok) {
        toast({ title: "Order created", description: `Order ${data.orderNumber} has been generated.` });
        window.location.reload();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({ title: "Promotion failed", description: String(error), variant: "destructive" });
    }
  };

  if (scoredDrafts.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-12 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
          <div className="rounded-full border border-white/10 bg-white/[0.04] p-4">
            <ShoppingCart className="h-7 w-7 text-white/35" />
          </div>
          <p className="text-lg font-medium text-white/65">No abandoned checkouts</p>
          <p className="text-sm text-white/35">New checkout leads will appear here as customers start entering details.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
      <div className="hidden grid-cols-[90px_minmax(190px,0.8fr)_minmax(220px,1fr)_320px] border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 xl:grid">
        <div>Priority</div>
        <div>Customer</div>
        <div>Cart</div>
        <div>Recovery Workflow</div>
      </div>

      <div className="divide-y divide-white/10">
        {scoredDrafts.map((draft) => {
          const workflow = getWorkflow(draft);
          const isRecoverable = !!draft.phone;
          const value = getDraftValue(draft);
          const items = draft.cartSnapshot || [];
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          const domain = getCapturedDomainInfo(draft.path);

          return (
            <div
              key={draft.id}
              className="grid gap-4 bg-[#111111] p-4 transition-colors hover:bg-[#151515] xl:grid-cols-[90px_minmax(190px,0.8fr)_minmax(220px,1fr)_320px]"
            >
              <div className="flex items-start justify-between gap-3 xl:block">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getTemperatureClassName(draft.leadTemperature)} shadow-none`}>
                      {draft.leadTemperature}
                    </Badge>
                    <Badge className="border-white/10 bg-white/[0.04] text-white/45 shadow-none hover:bg-white/[0.04] xl:hidden">
                      Score {draft.leadScore}
                    </Badge>
                  </div>
                  <div className="hidden xl:block">
                    <p className="text-2xl font-semibold text-white">{draft.leadScore}</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Score</p>
                  </div>
                  <Badge className={`${getStatusClassName(workflow.leadStatus)} capitalize shadow-none`}>
                    {workflow.leadStatus}
                  </Badge>
                </div>
                <p className="text-right text-sm font-semibold text-white xl:hidden">{formatINR(value)}</p>
              </div>

              <div className="min-w-0 space-y-2">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-white/30" />
                    <p className="truncate text-lg font-semibold text-white">
                      {draft.fullName || "Unknown guest"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-1 text-xs text-white/45 sm:grid-cols-2 xl:grid-cols-1">
                  {draft.phone ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-white/25" />
                      <span className="truncate">{draft.phone}</span>
                    </div>
                  ) : null}
                  {draft.email ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-white/25" />
                      <span className="truncate">{draft.email}</span>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-white/35">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDistanceToNow(new Date(draft.updatedAt), { addSuffix: true })}</span>
                  <span className="text-white/15">/</span>
                  <span>{format(new Date(draft.updatedAt), "MMM d, h:mm a")}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getDomainClassName(domain.kind)} shadow-none`} title={domain.host ?? getDraftHost(draft)}>
                    {domain.label}
                  </Badge>
                  <span className="max-w-full truncate text-xs text-white/30">
                    {domain.host ?? getDraftHost(draft)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-white">{formatINR(value)}</p>
                    <p className="mt-1 text-xs text-white/35">{itemCount} item{itemCount === 1 ? "" : "s"} in abandoned cart</p>
                  </div>
                  <Badge className="border-white/10 bg-white/[0.04] text-white/45 shadow-none hover:bg-white/[0.04]">
                    {draft.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {items.length > 0 ? (
                    items.slice(0, 3).map((item, index) => (
                      <span
                        key={`${item.id}-${index}`}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/55"
                      >
                        {item.name}{item.quantity > 1 ? ` x${item.quantity}` : ""}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/35">
                      No cart snapshot
                    </span>
                  )}
                  {items.length > 3 ? (
                    <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/35">
                      +{items.length - 3} more
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-2.5">
                <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
                  <select
                    value={workflow.leadStatus}
                    onChange={(event) =>
                      updateWorkflow(draft, { leadStatus: event.target.value as LeadStatus })
                    }
                    className="h-9 rounded-md border border-white/10 bg-[#101010] px-3 text-xs font-medium capitalize text-white outline-none focus:border-white/30"
                  >
                    {leadStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                    <input
                      type="datetime-local"
                      value={workflow.nextFollowUpAt}
                      onChange={(event) =>
                        updateWorkflow(draft, { nextFollowUpAt: event.target.value })
                      }
                      className="h-9 w-full rounded-md border border-white/10 bg-[#101010] pl-9 pr-3 text-xs text-white outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <details className="group rounded-md border border-white/10 bg-[#101010]">
                  <summary className="flex h-9 cursor-pointer list-none items-center justify-between px-3 text-xs font-medium text-white/55 transition-colors hover:text-white">
                    <span>{workflow.leadNotes ? "Edit notes" : "Add notes"}</span>
                    <span className="text-white/25 transition-transform group-open:rotate-180">v</span>
                  </summary>
                  <textarea
                    value={workflow.leadNotes}
                    onChange={(event) => updateWorkflow(draft, { leadNotes: event.target.value })}
                    placeholder="Lead notes, objection, promised follow-up..."
                    className="min-h-16 w-full resize-y border-t border-white/10 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-white/25"
                  />
                </details>

                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppRecovery(draft)}
                    disabled={!isRecoverable}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:grayscale"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </button>
                  {draft.email ? (
                    <a
                      href={buildAdminEmailHref(draft.email, {
                        template: "checkout_abandoned",
                        name: draft.fullName,
                        products: (draft.cartSnapshot || []).map((item) => item.name),
                        value: getDraftValue(draft),
                        checkoutField: draft.lastEditedField,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20 active:scale-[0.98]"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                      <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-xs font-semibold text-white/25"
                    >
                      <Mail className="h-4 w-4" />
                      No Email
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 rounded-lg border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/8 hover:text-white"
                    onClick={() => handleCopyRecoveryMessage(draft)}
                    aria-label="Copy recovery message"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={savingDraftId === draft.id}
                    onClick={() => saveWorkflow(draft, true)}
                    className="h-9 rounded-lg border-white/10 bg-white/[0.03] text-xs font-semibold text-white/75 hover:bg-white/8 hover:text-white"
                  >
                    Contacted
                  </Button>
                  <Button
                    onClick={() => handlePromoteToOrder(draft)}
                    variant="secondary"
                    className="h-9 rounded-lg border border-white/10 bg-white/[0.06] text-xs font-semibold text-white hover:bg-white/10"
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Order
                  </Button>
                  <Button
                    type="button"
                    disabled={savingDraftId === draft.id}
                    onClick={() => saveWorkflow(draft)}
                    className="h-9 rounded-lg px-0 text-xs font-semibold"
                    aria-label="Save lead workflow"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
