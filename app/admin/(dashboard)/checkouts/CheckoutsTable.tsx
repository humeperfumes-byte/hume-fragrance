"use client";
import {customerKey as growthCustomerKey} from "@/lib/growth/rules";
import CheckoutActivityTimeline from "@/components/admin/CheckoutActivityTimeline";
import CheckoutRecoveryMessage, { type PreparedRecovery } from "@/components/admin/CheckoutRecoveryMessage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSiteUrlFromHost } from "@/lib/site";
import { checkoutValue, customerActivityAt, matchesRecoveryQueue, recoveryPriority, recoveryState, RECOVERY_QUEUES, formatRecoveryDue, type RecoveryDraft, type RecoveryQueue } from "@/lib/checkout-recovery";


import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { CheckoutDraft } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Copy,
  Globe2,
  MessageCircle,
  Package,
  ReceiptText,
  Save,
  Tag,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { getCapturedDomainInfo, type CapturedDomainKind } from "@/lib/captured-domain";
import { normalizeSavedPricingBreakdown, type SavedPricingBreakdown } from "@/lib/saved-pricing-breakdown";
import { displayPhoneNumber } from "@/lib/phone";

type CheckoutDraftWithOrder = RecoveryDraft;

type ScoredCheckoutDraft = CheckoutDraftWithOrder & {
  leadScore: number;
  leadTemperature: "Hot" | "Warm" | "Cold";
};

type CheckoutCartItem = CheckoutDraft["cartSnapshot"][number];

function toMoney(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function getItemQuantity(item: CheckoutCartItem): number {
  const quantity = Number(item.quantity ?? 0);
  return Number.isFinite(quantity) ? quantity : 0;
}

function getItemLineTotal(item: CheckoutCartItem): number {
  return toMoney(item.price) * getItemQuantity(item);
}

function getCheckoutBreakdown(draft: CheckoutDraft) {
  const items = draft.cartSnapshot || [];
  const paidItems = items.filter((item) => !item.isGift);
  const giftItems = items.filter((item) => item.isGift);
  const itemTotal = paidItems.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  const storedSubtotal = toMoney(draft.subtotal);
  const subtotal = storedSubtotal > 0 ? storedSubtotal : itemTotal;
  const shippingFee = toMoney(draft.shippingFee);
  const grandTotal = toMoney(draft.grandTotal);
  const inferredDiscount = Math.max(0, subtotal + shippingFee - grandTotal);

  return {
    items,
    paidItems,
    giftItems,
    itemTotal,
    subtotal,
    shippingFee,
    grandTotal,
    inferredDiscount,
  };
}

function getCheckoutPricingRows(
  savedBreakdown: SavedPricingBreakdown | null,
  fallback: ReturnType<typeof getCheckoutBreakdown>,
) {
  if (savedBreakdown && Math.abs(savedBreakdown.subtotal + savedBreakdown.shippingFee - savedBreakdown.couponDiscount - savedBreakdown.welcomeBackDiscount - savedBreakdown.grandTotal) < 0.02) {
    return {
      subtotal: savedBreakdown.subtotal,
      shippingFee: savedBreakdown.shippingFee,
      couponCode: savedBreakdown.couponCode,
      couponDiscount: savedBreakdown.couponDiscount,
      welcomeBackLabel: savedBreakdown.welcomeBackLabel,
      welcomeBackDiscount: savedBreakdown.welcomeBackDiscount,
      shippingSavings: savedBreakdown.shippingSavings,
      grandTotal: savedBreakdown.grandTotal,
      inferredDiscount: 0,
      isExact: true,
    };
  }

  return {
    subtotal: fallback.subtotal,
    shippingFee: fallback.shippingFee,
    couponCode: null,
    couponDiscount: 0,
    welcomeBackLabel: null,
    welcomeBackDiscount: 0,
    shippingSavings: 0,
    grandTotal: fallback.grandTotal,
    inferredDiscount: fallback.inferredDiscount,
    isExact: false,
  };
}

function formatMaybeDate(value: Date | string | null | undefined) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return format(date, "dd MMM yyyy, h:mm a");
}

function getAddressLines(draft: CheckoutDraft) {
  return [
    draft.addressLine1,
    draft.addressLine2,
    [draft.city, draft.state, draft.pincode].filter(Boolean).join(", "),
    draft.country,
  ].filter(Boolean);
}

function getAttributionRows(draft: CheckoutDraft) {
  return [
    ["Source", draft.acquisitionSource],
    ["Category", draft.acquisitionCategory],
    ["Referrer", draft.acquisitionReferrerHost],
    ["UTM source", draft.utmSource],
    ["UTM medium", draft.utmMedium],
    ["UTM campaign", draft.utmCampaign],
    ["UTM term", draft.utmTerm],
    ["UTM content", draft.utmContent],
    ["Path", draft.path],
    ["Country", draft.country],
    ["IP address", draft.ipAddress],
    ["User agent", draft.userAgent],
  ].filter(([, value]) => Boolean(value));
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

function getLeadTemperature(score: number): "Hot" | "Warm" | "Cold" {
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

const leadStatusOptions = ["new", "contacted", "replied", "lost"] as const;
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

type CheckoutDetailSheetProps = {
  draft: ScoredCheckoutDraft | null;
  onOpenChange: (open: boolean) => void;
  workflowEditor?: React.ReactNode;
  onCopyRecoveryMessage: (draft: ScoredCheckoutDraft) => void;
  onPromoteToOrder: (draft: ScoredCheckoutDraft) => void;
  onWhatsAppRecovery: (draft: ScoredCheckoutDraft) => void;
};

function CheckoutDetailSheet({
  draft,
  onOpenChange,
  onCopyRecoveryMessage,
  onPromoteToOrder,
  onWhatsAppRecovery,
  workflowEditor,
}: CheckoutDetailSheetProps) {
  if (!draft) {
    return null;
  }

  const breakdown = getCheckoutBreakdown(draft);
  const savedBreakdown = normalizeSavedPricingBreakdown(draft.pricingBreakdown);
  const savedRows = getCheckoutPricingRows(savedBreakdown, breakdown);
  const approvedAdjustment = checkoutValue(draft) - savedRows.grandTotal;
  const pricingRows = { ...savedRows, grandTotal: checkoutValue(draft) };
  const domain = getCapturedDomainInfo(draft.path);
  const itemCount = breakdown.items.reduce((sum, item) => sum + getItemQuantity(item), 0);
  const addressLines = getAddressLines(draft);
  const attributionRows = getAttributionRows(draft);

  return (
    <Sheet open={Boolean(draft)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#151517] p-0 text-white shadow-[-28px_0_80px_rgba(0,0,0,.45)] sm:max-w-2xl">
        <div className="space-y-5 p-5 sm:p-6">
          {growthCustomerKey(draft.phone,draft.email) && <Link className="inline-flex rounded-xl border border-white/15 px-4 py-2 text-sm text-white" href={"/admin/growth?customer="+encodeURIComponent(growthCustomerKey(draft.phone,draft.email)!)}>Create offer</Link>}
          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <SheetTitle className="text-2xl font-semibold text-white">Checkout details</SheetTitle>
                <SheetDescription className="mt-1 text-white/45">
                  Full cart, customer, pricing, and source trail for this checkout lead.
                </SheetDescription>
              </div>
              <Badge className={`${getTemperatureClassName(draft.leadTemperature)} shadow-none`}>
                {draft.leadTemperature} {draft.leadScore}
              </Badge>
            </div>
          </SheetHeader>

          <CheckoutActivityTimeline sessionId={draft.sessionId} />
          {workflowEditor}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/60">
                <ReceiptText className="h-3.5 w-3.5" />
                Bill
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{formatINR(pricingRows.grandTotal)}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <Package className="h-3.5 w-3.5" />
                Items
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{itemCount}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <Globe2 className="h-3.5 w-3.5" />
                Site
              </div>
              <Badge className={`${getDomainClassName(domain.kind)} mt-2 shadow-none`} title={domain.host ?? getDraftHost(draft)}>
                {domain.label}
              </Badge>
            </div>
          </div>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Billing calculation</h3>
                <p className="mt-1 text-xs text-white/35">This explains how the checkout total was formed.</p>
              </div>
              {pricingRows.couponDiscount > 0 || pricingRows.welcomeBackDiscount > 0 || pricingRows.inferredDiscount > 0 ? (
                <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/10">
                  {pricingRows.isExact ? "Exact offer data" : "Offer inferred"}
                </Badge>
              ) : null}
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/50">Products subtotal</dt>
                <dd className="font-medium text-white">{formatINR(pricingRows.subtotal)}</dd>
              </div>
              {pricingRows.couponDiscount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-white/50">
                    <Tag className="h-3.5 w-3.5" />
                    Coupon {pricingRows.couponCode ? `(${pricingRows.couponCode})` : ""}
                  </dt>
                  <dd className="font-medium text-emerald-300">-{formatINR(pricingRows.couponDiscount)}</dd>
                </div>
              ) : null}
              {pricingRows.welcomeBackDiscount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{pricingRows.welcomeBackLabel || "Welcome back offer"}</dt>
                  <dd className="font-medium text-emerald-300">-{formatINR(pricingRows.welcomeBackDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-white/50">Delivery</dt>
                <dd className={pricingRows.shippingFee > 0 ? "font-medium text-white" : "font-medium text-emerald-300"}>
                  {pricingRows.shippingFee > 0
                    ? formatINR(pricingRows.shippingFee)
                    : `FREE${pricingRows.shippingSavings > 0 ? ` (${formatINR(pricingRows.shippingSavings)} saved)` : ""}`}
                </dd>
              </div>
              {pricingRows.inferredDiscount > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-white/50">
                    <Tag className="h-3.5 w-3.5" />
                    Discount / offer adjustment
                  </dt>
                  <dd className="font-medium text-emerald-300">-{formatINR(pricingRows.inferredDiscount)}</dd>
                </div>
              ) : null}
              {Math.abs(approvedAdjustment) >= 0.01 && <div className="flex items-center justify-between gap-4"><dt className="text-white/50">Approved total adjustment</dt><dd className="font-medium text-white">{approvedAdjustment < 0 ? '−' : '+'}{formatINR(Math.abs(approvedAdjustment))}</dd></div>}
              <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-base font-semibold text-white">Grand total</dt>
                <dd className="text-xl font-semibold text-white">{formatINR(pricingRows.grandTotal)}</dd>
              </div>
            </dl>

            {!pricingRows.isExact && pricingRows.inferredDiscount > 0 ? (
              <p className="mt-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] px-3 py-2 text-xs leading-relaxed text-amber-100/65">
                Older checkout draft rows store the final subtotal and payable total, not every separate coupon line.
                This discount is inferred from subtotal + delivery - grand total.
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-white">Cart snapshot</h3>
            <div className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10 bg-black/20">
              {breakdown.items.length > 0 ? (
                breakdown.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-white">{item.isGift ? `Gift ${index + 1}` : item.name}</p>
                          {item.isGift ? (
                            <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200 shadow-none hover:bg-emerald-500/10">
                              Free
                            </Badge>
                          ) : null}
                        </div>
                        {item.inspiration && !item.isGift ? (
                          <p className="mt-1 text-xs italic text-white/45">Inspired by {item.inspiration}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-white/40">
                          Qty {getItemQuantity(item)}
                          {item.size ? ` · ${item.size}` : ""}
                          {!item.isGift ? ` · ${formatINR(toMoney(item.price))} each` : ""}
                        </p>
                      </div>
                      <p className={item.isGift ? "shrink-0 text-sm font-semibold text-emerald-300" : "shrink-0 text-sm font-semibold text-white"}>
                        {item.isGift ? "FREE" : formatINR(getItemLineTotal(item))}
                      </p>
                    </div>
                    {item.kitSelections?.length ? (
                      <div className="mt-2 rounded-md border border-white/10 bg-white/[0.03] p-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Kit selections</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.kitSelections.map((selection) => (
                            <span key={selection.id} className="rounded bg-white/[0.05] px-2 py-1 text-xs text-white/55">
                              {selection.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {item.sampleSelections?.length ? (
                      <div className="mt-2 rounded-md border border-emerald-400/10 bg-emerald-400/[0.04] p-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/45">Discovery samples</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {item.sampleSelections.map((selection) => (
                            <span key={selection.id} className="rounded bg-emerald-400/[0.08] px-2 py-1 text-xs text-emerald-100/65">
                              {selection.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-white/35">No cart snapshot stored for this checkout.</p>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white">Customer</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Name</p>
                  <p className="mt-1 text-white">{draft.fullName || "Not added"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Phone</p>
                  <p className="mt-1 text-white">{displayPhoneNumber(draft.phone) || "Not added"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Email</p>
                  <p className="mt-1 break-all text-white">{draft.email || "Not added"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Address</p>
                  {addressLines.length > 0 ? (
                    <div className="mt-1 space-y-1 text-white/70">
                      {addressLines.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-white/40">Not added</p>
                  )}
                </div>
                {draft.notes ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Order notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-white/70">{draft.notes}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mt-4 text-sm font-semibold text-white">Checkout trail</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Status</span>
                  <Badge className={`${getStatusClassName(draft.status)} capitalize shadow-none`}>
                    {draft.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Last edited field</span>
                  <span className="text-right text-white">{draft.lastEditedField || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Created</span>
                  <span className="text-right text-white">{formatMaybeDate(draft.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Updated</span>
                  <span className="text-right text-white">{formatMaybeDate(draft.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">WhatsApp opened</span>
                  <span className="text-right text-white">{formatMaybeDate(draft.whatsappInitiatedAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-white/45">Follow-up</span>
                  <span className="text-right text-white">{formatMaybeDate(draft.nextFollowUpAt)}</span>
                </div>
                {draft.leadNotes ? (
                  <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Lead notes</p>
                    <p className="mt-1 whitespace-pre-wrap text-white/70">{draft.leadNotes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-white">Source and device</h3>
            {attributionRows.length > 0 ? (
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {attributionRows.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-black/20 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">{label}</p>
                    <p className="mt-1 break-words text-white/65">{value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-white/35">No attribution data stored.</p>
            )}
          </section>

          <div className="grid gap-2 sm:grid-cols-3">
            <Button type="button" onClick={() => onWhatsAppRecovery(draft)} disabled={draft.hasConfirmedOrder || draft.linkedOrderNeedsReview} className="gap-2"><MessageCircle className="h-4 w-4"/>Recovery message</Button>
            <Button type="button" variant="outline" onClick={() => onCopyRecoveryMessage(draft)} className="gap-2 border-white/15 bg-white/5 text-white"><Copy className="h-4 w-4"/>Prepare to copy</Button>
            <Button type="button" variant="outline" disabled={draft.hasOrderRecord} onClick={() => onPromoteToOrder(draft)} className="border-white/15 bg-white/5 text-white">Create unpaid order</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type Workflow={leadStatus:LeadStatus;leadNotes:string;nextFollowUpAt:string;overrideTotal:string;overrideReason:string};
export function CheckoutsTable({initialDrafts}:{initialDrafts:CheckoutDraftWithOrder[]}){
 const router=useRouter();
 const [drafts,setDrafts]=useState(initialDrafts);
 useEffect(()=>setDrafts(initialDrafts),[initialDrafts]);
 const [query,setQuery]=useState('');const [queue,setQueue]=useState<RecoveryQueue>('open');
 const [sort,setSort]=useState('recent');const [page,setPage]=useState(1);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [workflowById,setWorkflowById]=useState<Record<string,Workflow>>({});
 const [busyId,setBusyId]=useState<string|null>(null);
 const [prepared,setPrepared]=useState<PreparedRecovery|null>(null);
 const [now,setNow]=useState(()=>Date.now());
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),60000);return()=>window.clearInterval(timer);},[]);
 const scored=useMemo<ScoredCheckoutDraft[]>(()=>drafts.map(draft=>{const leadScore=recoveryPriority(draft,now);return {...draft,leadScore,leadTemperature:getLeadTemperature(leadScore)};}),[drafts,now]);
 const selected=scored.find(draft=>draft.id===selectedId)||null;
 const filtered=useMemo(()=>{
  const needle=query.trim().toLowerCase();const digits=needle.replace(/\D/g,'');
  return scored.filter(draft=>matchesRecoveryQueue(draft,queue,now)).filter(draft=>!needle||[draft.fullName,draft.phone,draft.email,draft.linkedOrderNumber,...draft.cartSnapshot.map(item=>item.name)].some(value=>value?.toLowerCase().includes(needle))||(digits.length>=4&&(draft.phone||'').replace(/\D/g,'').includes(digits))).sort((a,b)=>sort==='recent'?new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime():sort==='activity'?customerActivityAt(b).getTime()-customerActivityAt(a).getTime():sort==='value'?checkoutValue(b)-checkoutValue(a):sort==='follow_up'?(a.nextFollowUpAt?new Date(a.nextFollowUpAt).getTime():Infinity)-(b.nextFollowUpAt?new Date(b.nextFollowUpAt).getTime():Infinity):b.leadScore-a.leadScore||customerActivityAt(b).getTime()-customerActivityAt(a).getTime());
 },[scored,queue,query,sort,now]);
 const pages=Math.max(1,Math.ceil(filtered.length/25));const currentPage=Math.min(page,pages);const visible=filtered.slice((currentPage-1)*25,currentPage*25);
 const getWorkflow=(draft:CheckoutDraft):Workflow=>workflowById[draft.id]||{leadStatus:(leadStatusOptions.includes(draft.leadStatus as LeadStatus)?draft.leadStatus:'new') as LeadStatus,leadNotes:draft.leadNotes||'',nextFollowUpAt:formatDateTimeLocal(draft.nextFollowUpAt),overrideTotal:String(draft.pricingBreakdown.overrideTotal??''),overrideReason:String(draft.pricingBreakdown.overrideReason||'')};
 const updateWorkflow=(draft:CheckoutDraft,patch:Partial<Workflow>)=>setWorkflowById(previous=>({...previous,[draft.id]:{...getWorkflow(draft),...patch}}));
 async function saveWorkflow(draft:CheckoutDraft,markContacted=false){
  if(busyId)return;const workflow=getWorkflow(draft);setBusyId(draft.id);
  try{
   const response=await fetch('/api/admin/checkout-drafts',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:draft.id,leadStatus:workflow.leadStatus,leadNotes:workflow.leadNotes,markContacted,nextFollowUpAt:workflow.nextFollowUpAt?new Date(workflow.nextFollowUpAt).toISOString():null,overrideTotal:workflow.overrideTotal.trim()?Number(workflow.overrideTotal):null,overrideReason:workflow.overrideReason,expectedWorkflowUpdatedAt:typeof draft.pricingBreakdown.workflowUpdatedAt==='string'?draft.pricingBreakdown.workflowUpdatedAt:null}),signal:AbortSignal.timeout(20000)});
   const data=await response.json();if(!response.ok||!data.draft)throw Error(data.error||'Could not save this lead.');
   setDrafts(previous=>previous.map(row=>row.id===draft.id?{...row,...data.draft}:row));
   setWorkflowById(previous=>{const next={...previous};delete next[draft.id];return next;});
   toast({title:markContacted?'Contact recorded':'Lead saved',description:markContacted?'The contact time and lead status were updated.':'Customer activity time was preserved.'});router.refresh();
  }catch(error){toast({title:'Could not save',description:error instanceof Error?error.message:'Please retry.',variant:'destructive'});}finally{setBusyId(null);}
 }
 async function prepareRecovery(draft:ScoredCheckoutDraft){
  if(busyId)return;const state=recoveryState(draft,now);
  if(state.recovered||state.review||state.lost||!state.hasContact){toast({title:state.review?'Check this payment in Orders first':'This checkout is not ready for a reminder',description:'Review its status and contact details before preparing a recovery message.'});return;}
  if(state.active){toast({title:'The customer was recently active',description:'Allow them time to finish checkout before following up.'});return;}
  setBusyId(draft.id);
  try{
   const response=await fetch('/api/admin/customer-links',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scope:'checkout',resourceId:draft.id}),signal:AbortSignal.timeout(20000)});
   const data=await response.json();if(!response.ok)throw Error(data.error||'Could not create a secure recovery link.');
   if(typeof data.path!=='string'||!/^\/checkout\/[A-Za-z0-9_-]{43}(\?resume=1)?$/.test(data.path)||!Number.isFinite(Date.parse(data.expiresAt)))throw Error('The recovery link could not be verified.');
   const recovery={draft,id:String(data.id),url:new URL(data.path,getSiteUrlFromHost(draft.path)).href,expiresAt:data.expiresAt};
   setPrepared(recovery);
  }catch(error){toast({title:'Message not prepared',description:error instanceof Error?error.message:'Please retry.',variant:'destructive'});}finally{setBusyId(null);}
 }
 async function promote(draft:ScoredCheckoutDraft){
  if(busyId||draft.hasOrderRecord)return;
  if(!window.confirm(`Create an unpaid order for ${formatINR(checkoutValue(draft))}? Prices and delivery details will be checked. This does not record a payment.`))return;
  setBusyId(draft.id);
  try{
   const response=await fetch('/api/admin/convert-to-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({draftId:draft.id,expectedUpdatedAt:new Date(draft.updatedAt).toISOString()}),signal:AbortSignal.timeout(30000)});
   const data=await response.json();if(!response.ok||!data.ok)throw Error(data.error||'Could not create an order.');
   setDrafts(previous=>previous.map(row=>row.id===draft.id?{...row,hasOrderRecord:true,linkedOrderId:data.orderId,linkedOrderNumber:data.orderNumber,linkedOrderStatus:'payment_pending'}:row));
   toast({title:data.existing?'An order already exists':'Unpaid order created',description:`${data.orderNumber} · Review payment in Orders.`});router.refresh();
  }catch(error){toast({title:'Order not created',description:error instanceof Error?error.message:'Refresh before retrying.',variant:'destructive'});}finally{setBusyId(null);}
 }
 function workflowEditor(draft:ScoredCheckoutDraft){const workflow=getWorkflow(draft);const history=Array.isArray(draft.pricingBreakdown.recoveryHistory)?draft.pricingBreakdown.recoveryHistory.slice(-5).reverse():[];
  return <section className="space-y-3 rounded-2xl border border-[#c5a9ff]/15 bg-[#c5a9ff]/5 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-white">Follow-up plan</h3><span className="text-xs text-white/40">Last contacted: {formatRecoveryDue(draft.lastContactedAt)}</span></div>
   {draft.linkedOrderNumber&&<Link href="/admin/orders?hours=2160" className="block text-sm text-[#d9c8ff] underline underline-offset-4">Open Orders · {draft.linkedOrderNumber} ({draft.linkedOrderStatus})</Link>}
   <div className="grid gap-3 sm:grid-cols-2"><label className="space-y-1 text-xs text-white/50">Lead status<select aria-label="Lead status" value={workflow.leadStatus} onChange={event=>updateWorkflow(draft,{leadStatus:event.target.value as LeadStatus})} className="h-10 w-full rounded-lg border border-white/10 bg-[#111113] px-3 text-sm text-white">{leadStatusOptions.map(status=><option key={status} value={status}>{status[0].toUpperCase()+status.slice(1)}</option>)}</select></label><label className="space-y-1 text-xs text-white/50">Next follow-up (your local time)<input aria-label="Next follow-up" type="datetime-local" value={workflow.nextFollowUpAt} onChange={event=>updateWorkflow(draft,{nextFollowUpAt:event.target.value})} className="h-10 w-full rounded-lg border border-white/10 bg-[#111113] px-3 text-sm text-white"/></label></div>
   <label className="block space-y-1 text-xs text-white/50">Notes<textarea aria-label="Lead notes" value={workflow.leadNotes} onChange={event=>updateWorkflow(draft,{leadNotes:event.target.value})} placeholder="What did the customer say? What happens next?" className="min-h-20 w-full rounded-lg border border-white/10 bg-[#111113] p-3 text-sm text-white outline-none"/></label>
   {!draft.hasOrderRecord&&<details className="rounded-lg border border-white/10 p-3"><summary className="cursor-pointer text-xs text-white/50">Approved total adjustment</summary><div className="mt-3 grid gap-2"><label className="text-xs text-white/45">Final total (leave blank for standard pricing)<input aria-label="Approved final total" type="number" min="0.01" step="0.01" value={workflow.overrideTotal} onChange={event=>updateWorkflow(draft,{overrideTotal:event.target.value})} className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white"/></label><input aria-label="Total adjustment reason" value={workflow.overrideReason} onChange={event=>updateWorkflow(draft,{overrideReason:event.target.value})} placeholder="Reason for changing or clearing the total" className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white"/></div></details>}
   <div className="flex flex-wrap gap-2"><Button type="button" disabled={!!busyId} onClick={()=>saveWorkflow(draft)} className="gap-2"><Save className="h-4 w-4"/>Save follow-up</Button><Button type="button" disabled={!!busyId} variant="outline" onClick={()=>saveWorkflow(draft,true)} className="border-white/15 bg-white/5 text-white">Mark contacted</Button></div>
   {history.length>0&&<div className="border-t border-white/10 pt-3"><p className="text-[10px] uppercase tracking-widest text-white/35">Recent follow-up history</p><ul className="mt-2 space-y-1">{history.map((event,index)=><li key={index} className="text-xs text-white/50">{event.action==='contacted'?'Contact recorded':event.action==='price_adjusted'?'Total adjusted':event.action==='order_created'?'Unpaid order created':'Follow-up saved'} · {typeof event.at==='string'?formatRecoveryDue(event.at):''}</li>)}</ul></div>}
  </section>;
 }
 return <>
  <section className="space-y-3 rounded-2xl border border-white/10 bg-[#19191c] p-3 sm:p-4" aria-label="Checkout recovery filters"><div className="flex flex-col gap-3 sm:flex-row"><input aria-label="Search checkouts" placeholder="Search name, mobile, email, product or order…" value={query} onChange={event=>{setQuery(event.target.value);setPage(1);}} className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-[#c5a9ff]/40"/><select aria-label="Sort checkouts" value={sort} onChange={event=>{setSort(event.target.value);setPage(1);}} className="h-11 rounded-xl border border-white/10 bg-[#111113] px-3 text-sm text-white"><option value="priority">Priority first</option><option value="recent">Newest first</option><option value="activity">Recent customer activity</option><option value="follow_up">Next follow-up</option><option value="value">Highest value</option></select><Button type="button" variant="outline" onClick={()=>router.refresh()} className="h-11 border-white/15 bg-white/5 text-white">Refresh</Button></div><nav aria-label="Recovery queues" className="flex flex-wrap gap-2">{RECOVERY_QUEUES.map(item=><button key={item.key} type="button" aria-pressed={queue===item.key} onClick={()=>{setQueue(item.key);setPage(1);}} className={`rounded-full border px-3 py-2 text-xs transition ${queue===item.key?'border-[#c5a9ff]/40 bg-[#c5a9ff]/15 text-[#e3d5ff]':'border-white/10 text-white/45 hover:bg-white/5'}`}>{item.label}<span className="ml-2 text-[10px] opacity-60">{scored.filter(draft=>matchesRecoveryQueue(draft,item.key,now)).length}</span></button>)}</nav></section>
  <section aria-label="Checkout recovery queue" className="overflow-hidden rounded-2xl border border-white/10 bg-[#19191c]"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-white/40"><span>{filtered.length} checkout{filtered.length===1?'':'s'} · {RECOVERY_QUEUES.find(item=>item.key===queue)?.label}</span><span>Customer activity · IST</span></div>
   {visible.length===0?<div className="p-10 text-center text-sm text-white/40">No checkouts match this view. Try another queue or search.</div>:visible.map(draft=>{const state=recoveryState(draft,now);const units=draft.cartSnapshot.filter(item=>!item.isGift).reduce((sum,item)=>sum+item.quantity,0);const canRemind=state.hasContact&&!state.recovered&&!state.lost&&!state.review&&!state.active;return <article key={draft.id} className={`grid items-center gap-3 border-b border-white/[.06] p-4 last:border-0 xl:grid-cols-[minmax(170px,1fr)_minmax(160px,1fr)_100px_160px_190px] ${state.review?'bg-amber-500/[.04]':state.recovered?'bg-emerald-500/[.03]':''}`}>
    <div className="min-w-0"><button type="button" onClick={()=>setSelectedId(draft.id)} className="max-w-full truncate text-left text-sm font-semibold text-white hover:text-[#d9c8ff]">{draft.fullName||'Guest checkout'}</button><p className="mt-1 truncate text-xs text-white/40">{displayPhoneNumber(draft.phone)||draft.email||'No contact details'}</p><p className={`mt-1 text-[11px] ${state.review?'text-amber-200':state.recovered?'text-emerald-300':'text-white/40'}`}>{state.label}</p></div>
    <div className="min-w-0"><p className="truncate text-xs text-white/65">{draft.cartSnapshot.filter(item=>!item.isGift).map(item=>item.name).join(', ')||'No products saved'}</p><p className="mt-1 text-[11px] text-white/35">{units} item{units===1?'':'s'} · {getDraftHost(draft)}</p>{draft.linkedOrderNumber&&<Link href="/admin/orders?hours=2160" className="mt-1 block text-[11px] text-[#c5a9ff]">{draft.linkedOrderNumber} ↗</Link>}</div>
    <div><p className="text-sm font-semibold text-white">{formatINR(checkoutValue(draft))}</p><p className="mt-1 text-[10px] text-white/35">{draft.leadScore>=90?'Review first':state.active?'Still shopping':draft.leadStatus||'New'}</p></div>
    <div className="space-y-1 text-[11px] text-white/40"><p title={formatRecoveryDue(customerActivityAt(draft))}>{formatDistanceToNow(customerActivityAt(draft),{addSuffix:true})}</p><p className={state.due?'text-amber-200':''}>{draft.nextFollowUpAt?`Follow up: ${formatRecoveryDue(draft.nextFollowUpAt)}`:'No follow-up scheduled'}</p></div>
    <div className="flex gap-2"><Button type="button" disabled={!!busyId||!canRemind} onClick={()=>prepareRecovery(draft)} className="h-9 flex-1 gap-1.5 text-xs" title={state.review?'Check payment in Orders before requesting another payment':state.active?'Customer was active within the last 15 minutes':!state.hasContact?'No valid contact details':undefined}><MessageCircle className="h-3.5 w-3.5"/>{busyId===draft.id?'Working…':'Recovery'}</Button><Button type="button" variant="outline" onClick={()=>setSelectedId(draft.id)} className="h-9 border-white/15 bg-white/5 px-3 text-xs text-white/70">Details</Button></div>
   </article>;})}
   <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-white/40"><span>Page {currentPage} of {pages}</span><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled={currentPage===1} onClick={()=>setPage(currentPage-1)} className="border-white/10 bg-white/5 text-white/65">Previous</Button><Button type="button" size="sm" variant="outline" disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)} className="border-white/10 bg-white/5 text-white/65">Next</Button></div></div>
  </section>
  <CheckoutDetailSheet draft={selected} onOpenChange={open=>{if(!open)setSelectedId(null);}} onCopyRecoveryMessage={prepareRecovery} onWhatsAppRecovery={prepareRecovery} onPromoteToOrder={promote} workflowEditor={selected?workflowEditor(selected):null}/>
  <CheckoutRecoveryMessage recovery={prepared} onClose={()=>setPrepared(null)}/>
 </>;
}
