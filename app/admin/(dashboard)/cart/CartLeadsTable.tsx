"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ExternalLink,
  Globe2,
  Mail,
  MessageCircle,
  Package,
  ReceiptText,
  Search,
  ShoppingCart,
  Tag,
  Ticket,
  User,
  Zap,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import { buildAdminEmailHref, buildAdminWhatsAppHref, type AdminLeadTemplate } from "@/lib/admin-message-templates";
import type { CapturedDomainKind } from "@/lib/captured-domain";
import type { SavedPricingBreakdown } from "@/lib/saved-pricing-breakdown";
import { displayPhoneNumber } from "@/lib/phone";

export type CartLeadRow = {
  sessionId: string;
  sessionIds?: string[];
  anonymousJourneyKey?: string | null;
  name: string | null;
  phone: string | null;
  normalizedPhone: string | null;
  email: string | null;
  domainLabel: string;
  domainHost: string | null;
  domainKind: CapturedDomainKind;
  latestActivity: string;
  activityCount: number;
  cartOpens: number;
  addToCartCount: number;
  removeCount: number;
  quantityUpdates: number;
  rewardBannerClicks: number;
  cartSignalValue: number;
  originalCartSignalValue: number | null;
  discountAmount: number | null;
  rewardCode: string | null;
  rewardLabel: string | null;
  rewardPercent: number | null;
  rewardEvidence: boolean;
  products: Array<{ name: string; quantity: number; value: number }>;
  potentialScore: number;
  hasContact: boolean;
  hasCoupon: boolean;
  couponCode: string | null;
  couponChannel: string | null;
  couponDestination: string | null;
  hasCheckout: boolean;
  connectionSource: "session" | "inferred" | "contact" | null;
  checkoutId: string | null;
  checkoutStatus: string | null;
  checkoutValue: number | null;
  checkoutLeadStatus: string | null;
  checkoutLastEditedField: string | null;
  hasOrder: boolean;
  orderNumber: string | null;
  orderStatus: string | null;
  orderValue: number | null;
  intentScore: number | null;
  abandonmentRisk: number | null;
  predictedNextAction: string | null;
  pricingBreakdown: SavedPricingBreakdown | null;
};

type Filter = "all" | "connected" | "coupon" | "checkout" | "contactable" | "hot";

function getTemplate(row: CartLeadRow): AdminLeadTemplate {
  if (row.hasCheckout) return "checkout_abandoned";
  if (row.cartSignalValue >= 2000 || row.potentialScore >= 75) return "high_value_cart";
  return "cart_no_checkout";
}

function stageLabel(row: CartLeadRow): { label: string; className: string } {
  if (row.hasCheckout) return { label: "Checkout started", className: "border-amber-500/20 bg-amber-500/10 text-amber-200" };
  if (row.hasCoupon) return { label: "Coupon + cart", className: "border-blue-500/20 bg-blue-500/10 text-blue-200" };
  if (row.hasContact) return { label: "Contactable cart", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200" };
  return { label: "Anonymous cart", className: "border-white/10 bg-white/[0.04] text-white/45" };
}

function scoreClassName(score: number): string {
  if (score >= 75) return "text-red-300";
  if (score >= 55) return "text-amber-200";
  return "text-white";
}

function domainClassName(kind: CapturedDomainKind): string {
  switch (kind) {
    case "india":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
    case "global":
      return "border-sky-500/20 bg-sky-500/10 text-sky-200";
    case "preview":
      return "border-purple-500/20 bg-purple-500/10 text-purple-200";
    case "local":
      return "border-white/10 bg-white/[0.05] text-white/55";
    case "unknown":
      return "border-amber-500/20 bg-amber-500/10 text-amber-200";
    default:
      return "border-white/10 bg-white/[0.04] text-white/45";
  }
}

function CartLeadDetailSheet({
  row,
  onOpenChange,
}: {
  row: CartLeadRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!row) return null;

  const exact = row.pricingBreakdown;
  const fallbackDiscount = Math.max(
    0,
    (row.originalCartSignalValue || row.cartSignalValue) - row.cartSignalValue,
  );
  const hasAnyOffer =
    Boolean(row.couponCode) ||
    Boolean(row.rewardLabel) ||
    Boolean(row.discountAmount) ||
    Boolean(exact?.couponDiscount) ||
    Boolean(exact?.welcomeBackDiscount) ||
    Boolean(exact?.shippingSavings);

  return (
    <Sheet open={Boolean(row)} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-white/10 bg-[#0f0f0f] p-0 text-white sm:max-w-2xl">
        <div className="space-y-5 p-5 sm:p-6">
          <SheetHeader className="space-y-2 text-left">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <SheetTitle className="text-2xl font-semibold text-white">Cart lead details</SheetTitle>
                <SheetDescription className="mt-1 text-white/45">
                  Cart activity, offer evidence, checkout links, and saved price calculation.
                </SheetDescription>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${stageLabel(row).className}`}>
                {stageLabel(row).label}
              </span>
            </div>
          </SheetHeader>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/60">
                <ReceiptText className="h-3.5 w-3.5" />
                Cart value
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">
                {formatINR(exact?.grandTotal ?? row.checkoutValue ?? row.cartSignalValue)}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <Zap className="h-3.5 w-3.5" />
                Potential
              </div>
              <p className={`mt-2 text-2xl font-semibold ${scoreClassName(row.potentialScore)}`}>{row.potentialScore}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                <Globe2 className="h-3.5 w-3.5" />
                Site
              </div>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${domainClassName(row.domainKind)}`}>
                {row.domainLabel}
              </span>
            </div>
          </div>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Offer and price breakup</h3>
                <p className="mt-1 text-xs text-white/35">
                  {exact ? "Exact cart pricing captured from the live cart." : "Older cart rows may only have inferred offer evidence."}
                </p>
              </div>
              {hasAnyOffer ? (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                  Offer evidence
                </span>
              ) : null}
            </div>

            {exact ? (
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-4 text-white/55">
                  <dt>Subtotal</dt>
                  <dd>{formatINR(exact.subtotal)}</dd>
                </div>
                {exact.couponDiscount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="flex items-center gap-2 text-white/55">
                      <Tag className="h-3.5 w-3.5" />
                      Coupon {exact.couponCode ? `(${exact.couponCode})` : ""}
                    </dt>
                    <dd className="font-medium text-emerald-300">-{formatINR(exact.couponDiscount)}</dd>
                  </div>
                ) : null}
                {exact.welcomeBackDiscount > 0 ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/55">{exact.welcomeBackLabel || "Welcome back offer"}</dt>
                    <dd className="font-medium text-emerald-300">-{formatINR(exact.welcomeBackDiscount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4 text-white/55">
                  <dt>Delivery</dt>
                  <dd className={exact.shippingFee === 0 ? "font-medium text-emerald-300" : "font-medium text-white"}>
                    {exact.shippingFee === 0
                      ? `Free${exact.shippingSavings > 0 ? ` (${formatINR(exact.shippingSavings)} saved)` : ""}`
                      : formatINR(exact.shippingFee)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-white/10 pt-3 text-base font-semibold text-white">
                  <dt>Estimated total</dt>
                  <dd>{formatINR(exact.grandTotal)}</dd>
                </div>
              </dl>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between gap-4 text-sm text-white/55">
                  <span>Cart signal value</span>
                  <span>{formatINR(row.cartSignalValue)}</span>
                </div>
                {row.originalCartSignalValue && fallbackDiscount > 0 ? (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-white/55">Estimated welcome-back adjustment</span>
                    <span className="font-medium text-emerald-300">-{formatINR(fallbackDiscount)}</span>
                  </div>
                ) : null}
                {row.couponCode ? (
                  <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.05] px-3 py-2 text-sm text-blue-100/75">
                    Coupon connected: <span className="font-semibold">{row.couponCode}</span>
                    {row.couponChannel ? ` via ${row.couponChannel}` : ""}
                  </div>
                ) : null}
                {row.rewardLabel ? (
                  <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-2 text-sm text-emerald-100/75">
                    Welcome-back reward captured: <span className="font-semibold">{row.rewardLabel}</span>
                    {row.rewardPercent ? ` (${row.rewardPercent}%)` : ""}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <h3 className="text-sm font-semibold text-white">Products</h3>
            <div className="mt-3 divide-y divide-white/10 rounded-lg border border-white/10 bg-black/20">
              {row.products.length > 0 ? (
                row.products.map((product) => (
                  <div key={product.name} className="flex items-center justify-between gap-4 p-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="mt-0.5 text-xs text-white/35">Qty {product.quantity}</p>
                    </div>
                    <p className="font-medium text-white">{formatINR(product.value)}</p>
                  </div>
                ))
              ) : (
                <p className="p-3 text-sm text-white/35">No product snapshot stored.</p>
              )}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white">Lead</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Name</span>
                  <span className="text-right text-white">{row.name || "Unknown visitor"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Phone</span>
                  <span className="text-right text-white">{displayPhoneNumber(row.phone) || "Not captured"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Email</span>
                  <span className="break-all text-right text-white">{row.email || "Not captured"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Sessions</span>
                  <span className="text-right text-white">{row.sessionIds?.length || 1}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="text-sm font-semibold text-white">Journey</h3>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Latest activity</span>
                  <span className="text-right text-white">{formatDistanceToNow(new Date(row.latestActivity), { addSuffix: true })}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Add to cart</span>
                  <span className="text-right text-white">{row.addToCartCount}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Cart opens</span>
                  <span className="text-right text-white">{row.cartOpens}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-white/45">Checkout</span>
                  <span className="text-right text-white">
                    {row.hasCheckout ? `${row.checkoutStatus || "started"} ${row.checkoutValue ? `- ${formatINR(row.checkoutValue)}` : ""}` : "Not started"}
                  </span>
                </div>
                {row.domainHost ? (
                  <div className="flex justify-between gap-4">
                    <span className="text-white/45">Domain</span>
                    <span className="break-all text-right text-white">{row.domainHost}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CartLeadsTable({ rows }: { rows: CartLeadRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedRow, setSelectedRow] = useState<CartLeadRow | null>(null);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filter === "connected" && !(row.hasCoupon || row.hasCheckout || row.hasContact)) return false;
      if (filter === "coupon" && !row.hasCoupon) return false;
      if (filter === "checkout" && !row.hasCheckout) return false;
      if (filter === "contactable" && !row.hasContact) return false;
      if (filter === "hot" && row.potentialScore < 70) return false;

      if (!search) return true;
      const q = search.toLowerCase();
      return (
        row.sessionId.toLowerCase().includes(q) ||
        row.name?.toLowerCase().includes(q) ||
        row.phone?.toLowerCase().includes(q) ||
        row.email?.toLowerCase().includes(q) ||
        row.domainLabel.toLowerCase().includes(q) ||
        row.domainHost?.toLowerCase().includes(q) ||
        row.couponCode?.toLowerCase().includes(q) ||
        row.products.some((product) => product.name.toLowerCase().includes(q))
      );
    });
  }, [filter, rows, search]);

  return (
    <>
      <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, phone, email, coupon, product..."
            className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as Filter)}
          className="h-10 rounded-lg border border-white/10 bg-[#111111] px-3 text-sm font-medium text-white outline-none focus:border-white/25"
        >
          <option value="all">All cart sessions</option>
          <option value="connected">Connected leads</option>
          <option value="hot">Hot potential</option>
          <option value="contactable">Contactable</option>
          <option value="coupon">Coupon + cart</option>
          <option value="checkout">Checkout started</option>
        </select>
        <p className="text-xs font-medium text-white/35">{filteredRows.length} leads</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
        <div className="hidden grid-cols-[90px_minmax(220px,1fr)_minmax(260px,1.2fr)_minmax(240px,0.9fr)_190px] border-b border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 xl:grid">
          <div>Score</div>
          <div>Lead</div>
          <div>Cart Signal</div>
          <div>Connections</div>
          <div>Actions</div>
        </div>

        <div className="divide-y divide-white/10">
          {filteredRows.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm text-white/40">No cart leads match this view.</p>
            </div>
          ) : (
            filteredRows.map((row) => {
              const stage = stageLabel(row);
              return (
                <div
                  key={row.sessionId}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRow(row)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedRow(row);
                    }
                  }}
                  className="grid cursor-pointer gap-4 bg-[#111111] p-4 transition-colors hover:bg-[#151515] focus:outline-none focus:ring-1 focus:ring-white/20 xl:grid-cols-[90px_minmax(220px,1fr)_minmax(260px,1.2fr)_minmax(240px,0.9fr)_190px]"
                >
                  <div className="flex items-start justify-between gap-3 xl:block">
                    <div>
                      <p className={`text-2xl font-semibold ${scoreClassName(row.potentialScore)}`}>{row.potentialScore}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">Potential</p>
                    </div>
                    <span className={`rounded-full border px-2 py-1 text-xs font-semibold xl:mt-3 xl:inline-flex ${stage.className}`}>
                      {stage.label}
                    </span>
                  </div>

                  <div className="min-w-0 space-y-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <User className="h-4 w-4 shrink-0 text-white/30" />
                      <p className="truncate text-lg font-semibold text-white">{row.name || "Unknown visitor"}</p>
                    </div>
                    {row.phone ? (
                      <p className="truncate text-sm text-white/45">{displayPhoneNumber(row.phone)}</p>
                    ) : row.email ? (
                      <p className="truncate text-sm text-white/45">{row.email}</p>
                    ) : (
                      <p className="truncate text-sm text-white/25">No contact yet</p>
                    )}
                    <p className="text-xs text-white/35">
                      Active {formatDistanceToNow(new Date(row.latestActivity), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-white/35">
                      {row.activityCount} active signal{row.activityCount === 1 ? "" : "s"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${domainClassName(row.domainKind)}`}
                        title={row.domainHost ?? undefined}
                      >
                        {row.domainLabel}
                      </span>
                      {row.domainHost ? (
                        <span className="max-w-full truncate text-xs text-white/30">{row.domainHost}</span>
                      ) : null}
                    </div>
                    {row.sessionIds && row.sessionIds.length > 1 ? (
                      <p className="text-xs font-medium text-emerald-200/70">
                        Combined journey: {row.sessionIds.length} sessions
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {row.originalCartSignalValue && row.discountAmount ? (
                          <p className="text-xs font-medium text-white/30 line-through">
                            {formatINR(row.originalCartSignalValue)}
                          </p>
                        ) : null}
                        <p className="text-xl font-semibold text-white">{formatINR(row.cartSignalValue)}</p>
                        <p className="text-xs text-white/35">
                          Current value • {row.addToCartCount} add-to-cart, {row.cartOpens} opens
                        </p>
                        {row.rewardBannerClicks > 0 ? (
                          <p className="mt-1 text-xs font-medium text-amber-200/75">
                            Reward banner tapped {row.rewardBannerClicks}x
                          </p>
                        ) : null}
                        {row.pricingBreakdown?.couponDiscount ? (
                          <p className="mt-1 text-xs font-medium text-emerald-300/80">
                            Coupon {row.pricingBreakdown.couponCode || "offer"} applied -{formatINR(row.pricingBreakdown.couponDiscount)}
                          </p>
                        ) : row.rewardPercent && row.discountAmount ? (
                          <p className="mt-1 text-xs font-medium text-emerald-300/80">
                            {row.rewardLabel || `${row.rewardPercent}% reward`} applied • -{formatINR(row.discountAmount)}
                          </p>
                        ) : row.hasCheckout && !row.rewardEvidence ? (
                          <p className="mt-1 text-xs font-medium text-amber-200/75">
                            No welcome-back reward captured
                          </p>
                        ) : null}
                      </div>
                      {row.intentScore ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                          <Zap className="h-3 w-3" />
                          {row.intentScore}%
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.products.slice(0, 3).map((product) => (
                        <span
                          key={product.name}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/55"
                        >
                          {product.name}{product.quantity > 1 ? ` x${product.quantity}` : ""}
                        </span>
                      ))}
                      {row.products.length > 3 ? (
                        <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-white/35">
                          +{row.products.length - 3} more
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {row.hasCoupon ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
                          <Ticket className="h-3 w-3" />
                          {row.couponCode || "Coupon"}
                        </span>
                      ) : null}
                      {row.hasCheckout ? (
                        <Link
                          href="/admin/checkouts"
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/20"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Checkout {row.checkoutValue ? formatINR(row.checkoutValue) : ""}
                        </Link>
                      ) : null}
                      {row.connectionSource === "inferred" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-xs font-semibold text-purple-200">
                          Inferred match
                        </span>
                      ) : null}
                      {row.abandonmentRisk && row.abandonmentRisk >= 40 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-200">
                          <AlertTriangle className="h-3 w-3" />
                          Risk {row.abandonmentRisk}%
                        </span>
                      ) : null}
                      {row.predictedNextAction ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white/45">
                          <Package className="h-3 w-3" />
                          {row.predictedNextAction}
                        </span>
                      ) : null}
                    </div>
                    {row.checkoutLastEditedField ? (
                      <p className="text-xs text-white/35">Dropped at {row.checkoutLastEditedField}</p>
                    ) : null}
                  </div>

                  <div className="grid content-start gap-2" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedRow(row)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/65 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
                    >
                      Details
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </button>
                    <a
                      href={buildAdminWhatsAppHref(row.phone, {
                        template: getTemplate(row),
                        name: row.name,
                        products: row.products.map((product) => product.name),
                        couponCode: row.couponCode,
                        value: row.checkoutValue || row.cartSignalValue,
                        checkoutField: row.checkoutLastEditedField,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-all active:scale-[0.98] ${
                        row.phone
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          : "border-white/10 bg-white/[0.03] text-white/35 hover:bg-white/[0.06]"
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                    {row.email ? (
                      <a
                        href={buildAdminEmailHref(row.email, {
                          template: getTemplate(row),
                          name: row.name,
                          products: row.products.map((product) => product.name),
                          couponCode: row.couponCode,
                          value: row.checkoutValue || row.cartSignalValue,
                          checkoutField: row.checkoutLastEditedField,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20 active:scale-[0.98]"
                      >
                        <Mail className="h-4 w-4" />
                        Email
                        <ExternalLink className="h-3 w-3 opacity-60" />
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
                </div>
              );
            })
          )}
        </div>
      </div>
      </div>

      <CartLeadDetailSheet
        row={selectedRow}
        onOpenChange={(open) => {
          if (!open) setSelectedRow(null);
        }}
      />
    </>
  );
}
