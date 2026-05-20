"use client";

import { useState, useMemo } from "react";
import { Mail, MessageCircle, Search, Filter, ExternalLink, ShoppingCart, Package, Zap, AlertTriangle } from "lucide-react";
import { buildAdminEmailHref, buildAdminWhatsAppHref, buildGmailComposeHref } from "@/lib/admin-message-templates";

type CrossRef = {
  hasCheckout: boolean;
  checkoutStatus: string | null;
  checkoutName: string | null;
  checkoutPhone: string | null;
  checkoutEmail: string | null;
  checkoutValue: number | null;
  leadStatus: string | null;
  hasOrder: boolean;
  orderNumber: string | null;
  orderStatus: string | null;
  orderValue: number | null;
  intentScore: number | null;
  abandonmentRisk: number | null;
  predictedAction: string | null;
  lastActiveAt: string | null;
};

type EnrichedCouponEvent = {
  id: string;
  sessionId: string | null;
  channel: string;
  eventType: string;
  couponCode: string | null;
  destination: string | null;
  path: string | null;
  referrer: string | null;
  country: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  payload: Record<string, unknown>;
  createdAt: Date;
  xref: CrossRef;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function timeAgo(dateStr: string | null): { text: string; recency: "live" | "recent" | "old" } {
  if (!dateStr) return { text: "—", recency: "old" };
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = ms / 60000;
  if (mins < 5) return { text: "Just now", recency: "live" };
  if (mins < 60) return { text: `${Math.round(mins)}m ago`, recency: "live" };
  const hrs = mins / 60;
  if (hrs < 24) return { text: `${Math.round(hrs)}h ago`, recency: "recent" };
  const days = hrs / 24;
  if (days < 7) return { text: `${Math.round(days)}d ago`, recency: "recent" };
  return { text: `${Math.round(days)}d ago`, recency: "old" };
}

function isEmail(destination: string): boolean {
  return destination.includes("@");
}

function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function buildWhatsAppUrl(phone: string, couponCode: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) cleaned = `91${cleaned}`;

  const message = encodeURIComponent(
    `Hi there! 👋\n\n` +
    `Thank you for claiming your HUME Fragrance coupon code: *${couponCode}*\n\n` +
    `We'd love to help you place your first order! As a welcome gift, we include complimentary fragrance samples with every purchase. 🎁\n\n` +
    `Would you like help choosing the perfect scent? We can guide you based on your preferences.\n\n` +
    `Shop now: https://humefragrance.com\n\n` +
    `— Team HUME`
  );

  return `https://wa.me/${cleaned}?text=${message}`;
}

export function buildWhatsAppUrlFromEmail(email: string, couponCode: string): string {
  const message = encodeURIComponent(
    `Hi! 👋\n\n` +
    `Thank you for registering at HUME Fragrance with ${email}.\n\n` +
    `Your exclusive coupon code is: *${couponCode}*\n\n` +
    `We'd love to help you place your first order! As a welcome gift, we include complimentary fragrance samples with every purchase. 🎁\n\n` +
    `Would you like help choosing the perfect scent?\n\n` +
    `Shop now: https://humefragrance.com\n\n` +
    `— Team HUME`
  );

  return `https://wa.me/?text=${message}`;
}

export function buildMailtoUrl(email: string, couponCode: string): string {
  const subject = `Your HUME Fragrance Coupon Code: ${couponCode}`;
  const body =
    `Hi there!\n\n` +
    `Thank you for claiming your HUME Fragrance coupon code!\n\n` +
    `Your exclusive code: ${couponCode}\n\n` +
    `We'd love to help you place your first order. As a welcome gift, we include complimentary fragrance samples with every purchase.\n\n` +
    `Would you like help choosing the perfect scent? Simply reply to this email and we'll guide you based on your preferences.\n\n` +
    `Shop now: https://humefragrance.com\n\n` +
    `Warm regards,\n` +
    `Team HUME Fragrance`;

  return buildGmailComposeHref(email, subject, body);
}

function JourneyBadges({ xref }: { xref: CrossRef }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {/* Order status */}
      {xref.hasOrder ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
          <Package className="h-2.5 w-2.5" />
          Ordered {xref.orderValue ? formatINR(xref.orderValue) : ""}
        </span>
      ) : xref.hasCheckout ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
          <ShoppingCart className="h-2.5 w-2.5" />
          {xref.checkoutStatus === "whatsapp_initiated" ? "WhatsApp Sent" : "Checkout Started"}
          {xref.checkoutValue ? ` ${formatINR(xref.checkoutValue)}` : ""}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/25">
          No checkout yet
        </span>
      )}

      {/* Intent score */}
      {xref.intentScore !== null && xref.intentScore > 0 && (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
          xref.intentScore >= 70
            ? "bg-primary/15 text-primary"
            : xref.intentScore >= 40
              ? "bg-blue-500/10 text-blue-300"
              : "bg-white/5 text-white/40"
        }`}>
          <Zap className="h-2.5 w-2.5" />
          Intent {xref.intentScore}%
        </span>
      )}

      {/* Abandonment risk */}
      {xref.abandonmentRisk !== null && xref.abandonmentRisk >= 40 && (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-300">
          <AlertTriangle className="h-2.5 w-2.5" />
          Risk {xref.abandonmentRisk}%
        </span>
      )}

      {/* Lead status */}
      {xref.leadStatus && xref.leadStatus !== "new" && (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
          xref.leadStatus === "converted" ? "bg-emerald-500/10 text-emerald-300" :
          xref.leadStatus === "contacted" ? "bg-blue-500/10 text-blue-300" :
          xref.leadStatus === "replied" ? "bg-purple-500/10 text-purple-300" :
          xref.leadStatus === "lost" ? "bg-red-500/10 text-red-300" :
          "bg-white/5 text-white/40"
        }`}>
          {xref.leadStatus}
        </span>
      )}
    </div>
  );
}

export function CouponLeadsTable({ events }: { events: EnrichedCouponEvent[] }) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | "email" | "whatsapp">("all");
  const [journeyFilter, setJourneyFilter] = useState<"all" | "no_checkout" | "checkout" | "ordered">("all");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (channelFilter !== "all" && event.channel !== channelFilter) return false;

      if (journeyFilter === "no_checkout" && event.xref.hasCheckout) return false;
      if (journeyFilter === "checkout" && !event.xref.hasCheckout) return false;
      if (journeyFilter === "ordered" && !event.xref.hasOrder) return false;

      if (search) {
        const q = search.toLowerCase();
        return (
          (event.destination?.toLowerCase().includes(q)) ||
          (event.couponCode?.toLowerCase().includes(q)) ||
          (event.xref.checkoutName?.toLowerCase().includes(q)) ||
          (event.xref.checkoutPhone?.toLowerCase().includes(q)) ||
          (event.xref.orderNumber?.toLowerCase().includes(q)) ||
          (event.country?.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, search, channelFilter, journeyFilter]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:min-w-[200px] sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search email, phone, name, code, order#..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-white/30" />
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as typeof channelFilter)}
            className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="email">Email Only</option>
            <option value="whatsapp">WhatsApp Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <ShoppingCart className="h-3.5 w-3.5 text-white/30" />
          <select
            value={journeyFilter}
            onChange={(e) => setJourneyFilter(e.target.value as typeof journeyFilter)}
            className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="all">All Journeys</option>
            <option value="no_checkout">No Checkout Yet</option>
            <option value="checkout">Started Checkout</option>
            <option value="ordered">Converted to Order</option>
          </select>
        </div>

        <span className="text-xs text-white/30 font-medium">
          {filteredEvents.length} lead{filteredEvents.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="hidden grid-cols-[1.2fr_0.5fr_0.5fr_0.5fr_0.4fr_auto] gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 xl:grid">
          <span>Contact & Journey</span>
          <span>Coupon Code</span>
          <span>Channel</span>
          <span>Claimed At</span>
          <span>Last Online</span>
          <span className="text-right">Actions</span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/30">
            {search || channelFilter !== "all" || journeyFilter !== "all"
              ? "No leads match your filters."
              : "No coupon claims yet. Leads will appear here when customers claim coupon codes."}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredEvents.map((event) => {
              const dest = event.destination || "Unknown";
              const code = event.couponCode || "N/A";
              const destIsEmail = isEmail(dest);
              // Use cross-referenced contact info if destination doesn't have it
              const contactPhone = !destIsEmail ? dest : event.xref.checkoutPhone;
              const contactEmail = destIsEmail ? dest : event.xref.checkoutEmail;

              return (
                <div
                  key={event.id}
                  className="grid gap-4 px-4 py-4 text-sm transition-colors hover:bg-white/[0.02] xl:grid-cols-[1.2fr_0.5fr_0.5fr_0.5fr_0.4fr_auto] xl:items-start xl:px-5"
                >
                  {/* Contact & Journey */}
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{dest}</p>
                    {event.xref.checkoutName && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        {event.xref.checkoutName}
                        {event.xref.checkoutPhone && ` • ${event.xref.checkoutPhone}`}
                      </p>
                    )}
                    <JourneyBadges xref={event.xref} />
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 xl:hidden">Coupon Code</p>
                    <span className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary tracking-wider">
                      {code}
                    </span>
                  </div>

                  {/* Channel */}
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 xl:hidden">Channel</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                        event.channel === "whatsapp"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : "bg-blue-500/10 text-blue-300"
                      }`}
                    >
                      {event.channel === "whatsapp" ? (
                        <MessageCircle className="h-3 w-3" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {event.channel}
                    </span>
                    {event.country && (
                      <p className="mt-1 text-[10px] text-white/25">{event.country}</p>
                    )}
                  </div>

                  {/* Date */}
                  <span className="text-xs text-white/40">
                    <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 xl:hidden">Claimed At</span>
                    {formatDate(event.createdAt)}
                  </span>

                  {/* Last Online */}
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30 xl:hidden">Last Online</p>
                    {(() => {
                      const la = timeAgo(event.xref.lastActiveAt);
                      return (
                        <div className="flex items-center gap-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            la.recency === "live" ? "bg-emerald-500 animate-pulse" :
                            la.recency === "recent" ? "bg-amber-500" : "bg-white/20"
                          }`} />
                          <span className={`text-xs ${
                            la.recency === "live" ? "text-emerald-300" :
                            la.recency === "recent" ? "text-amber-300" : "text-white/25"
                          }`}>
                            {la.text}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 sm:flex-row xl:flex-col xl:items-end">
                    {/* WhatsApp contact */}
                    {contactPhone ? (
                      <a
                        href={buildAdminWhatsAppHref(contactPhone, {
                          template: event.xref.hasCheckout ? "checkout_abandoned" : "coupon_no_cart",
                          name: event.xref.checkoutName,
                          couponCode: code,
                          value: event.xref.checkoutValue,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] w-full justify-center"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    ) : contactEmail ? (
                      <a
                        href={buildAdminWhatsAppHref(null, {
                          template: event.xref.hasCheckout ? "checkout_abandoned" : "coupon_no_cart",
                          name: event.xref.checkoutName,
                          couponCode: code,
                          value: event.xref.checkoutValue,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 transition-all hover:bg-white/[0.08] w-full justify-center"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WA (no phone)
                      </a>
                    ) : null}

                    {/* Email contact */}
                    {contactEmail && (
                      <a
                        href={buildAdminEmailHref(contactEmail, {
                          template: event.xref.hasCheckout ? "checkout_abandoned" : "coupon_no_cart",
                          name: event.xref.checkoutName,
                          couponCode: code,
                          value: event.xref.checkoutValue,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20 hover:scale-[1.02] active:scale-[0.98] w-full justify-center"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
