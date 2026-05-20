"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ExternalLink,
  Mail,
  MessageCircle,
  Package,
  Search,
  ShoppingCart,
  Ticket,
  User,
  Zap,
} from "lucide-react";
import { formatINR } from "@/lib/currency";
import { buildAdminEmailHref, buildAdminWhatsAppHref, type AdminLeadTemplate } from "@/lib/admin-message-templates";
import type { CapturedDomainKind } from "@/lib/captured-domain";

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

export function CartLeadsTable({ rows }: { rows: CartLeadRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("connected");

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
          <option value="connected">Connected leads</option>
          <option value="hot">Hot potential</option>
          <option value="contactable">Contactable</option>
          <option value="coupon">Coupon + cart</option>
          <option value="checkout">Checkout started</option>
          <option value="all">All cart sessions</option>
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
                  className="grid gap-4 bg-[#111111] p-4 transition-colors hover:bg-[#151515] xl:grid-cols-[90px_minmax(220px,1fr)_minmax(260px,1.2fr)_minmax(240px,0.9fr)_190px]"
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
                      <p className="truncate text-sm text-white/45">{row.phone}</p>
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

                  <div className="space-y-2">
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
                        {row.rewardPercent && row.discountAmount ? (
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

                  <div className="grid content-start gap-2">
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
  );
}
