"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  ShoppingCart,
  LogOut,
  TrendingUp,
  MessageCircle,
  Mail,
  ExternalLink,
  Ticket,
  Package,
  Phone,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { buildGmailComposeHref } from "@/lib/admin-message-templates";
import { displayPhoneNumber } from "@/lib/phone";

const POLL_INTERVAL = 60_000;

type CrossRef = {
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  journeyStage: "visitor" | "coupon_claimed" | "cart_active" | "checkout_started" | "contacted" | "ordered";
  couponClaimed: boolean;
  couponCode: string | null;
  couponChannel: string | null;
  couponDestination: string | null;
  addedProducts: string[];
  cartOpens: number;
  hasCheckout: boolean;
  checkoutStatus: string | null;
  checkoutValue: number | null;
  leadStatus: string | null;
  lastEditedField: string | null;
  cartItemCount: number;
  hasOrder: boolean;
  orderNumber: string | null;
  orderStatus: string | null;
  orderValue: number | null;
};

type EnrichedSession = {
  id: number;
  sessionId: string;
  intentScore: number;
  abandonmentRisk: number;
  predictedNextAction: string | null;
  topAbandonmentCause: string | null;
  totalInteractions: number;
  currentSection: string | null;
  lastActiveAt: string;
  updatedAt: string;
  createdAt: string;
  xref: CrossRef;
};

const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ordered: { label: "ORDERED", color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/20" },
  contacted: { label: "CONTACTED", color: "text-blue-300", bg: "bg-blue-500/10 border-blue-500/20" },
  checkout_started: { label: "CHECKOUT", color: "text-amber-300", bg: "bg-amber-500/10 border-amber-500/20" },
  cart_active: { label: "CART ACTIVE", color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  coupon_claimed: { label: "COUPON CLAIMED", color: "text-purple-300", bg: "bg-purple-500/10 border-purple-500/20" },
  visitor: { label: "BROWSING", color: "text-white/40", bg: "bg-white/5 border-white/10" },
};

function formatINR(v: number) {
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return "—";
  }
}

function buildWhatsAppUrl(phone: string, name: string | null): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) cleaned = `91${cleaned}`;
  const msg = encodeURIComponent(
    `Hi${name ? ` ${name}` : ""}! 👋\n\nThank you for your interest in HUME Fragrance. We noticed you've been exploring our collection and wanted to reach out personally.\n\nWould you like help choosing the perfect scent? We can recommend based on your preferences, occasion, or budget.\n\n🎁 As a welcome offer, we include complimentary samples with your first order.\n\nShop: https://humefragrance.com\n\n— Team HUME`
  );
  return `https://wa.me/${cleaned}?text=${msg}`;
}

function buildMailtoUrl(email: string, name: string | null): string {
  const subject = "Your HUME Fragrance Experience Awaits";
  const body =
    `Hi${name ? ` ${name}` : ""},\n\nThank you for exploring HUME Fragrance. We noticed you've been browsing our collection and wanted to reach out personally.\n\nWould you like help choosing the perfect scent? We can recommend based on your preferences.\n\nAs a welcome gift, we include complimentary fragrance samples with every first order.\n\nShop now: https://humefragrance.com\n\nWarm regards,\nTeam HUME Fragrance`;
  return buildGmailComposeHref(email, subject, body);
}

export function IntelligenceFeed({
  initialSessions,
  market = "india",
  hours = 720,
}: {
  initialSessions: EnrichedSession[];
  market?: "india" | "out_of_india" | "all";
  hours?: number;
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isLive] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLatest = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/intelligence?market=${market}&hours=${hours}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch {
      // Silently continue
    }
  }, [hours, market]);

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(fetchLatest, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [isLive, fetchLatest]);

  const filteredSessions = sessions.filter((s) => {
    if (stageFilter !== "all" && s.xref?.journeyStage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.sessionId.toLowerCase().includes(q) ||
        s.xref?.contactName?.toLowerCase().includes(q) ||
        s.xref?.contactPhone?.toLowerCase().includes(q) ||
        s.xref?.contactEmail?.toLowerCase().includes(q) ||
        s.xref?.couponCode?.toLowerCase().includes(q) ||
        s.xref?.orderNumber?.toLowerCase().includes(q) ||
        s.xref?.addedProducts?.some((p: string) => p.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search name, phone, email, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
          <Filter className="h-3.5 w-3.5 text-white/30" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="ordered">Ordered</option>
            <option value="contacted">Contacted</option>
            <option value="checkout_started">Checkout Started</option>
            <option value="cart_active">Cart Active</option>
            <option value="coupon_claimed">Coupon Claimed</option>
            <option value="visitor">Visitors Only</option>
          </select>
        </div>
        <span className="text-xs text-white/30">{filteredSessions.length} sessions</span>
      </div>

      {/* Session Cards */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <p className="text-sm text-white/20 italic">
              {search || stageFilter !== "all" ? "No sessions match your filters." : "Monitoring live behavioral streams..."}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const x = session.xref || {} as CrossRef;
            const stage = STAGE_CONFIG[x.journeyStage] || STAGE_CONFIG.visitor;
            const isExpanded = expandedId === session.id;

            return (
              <div
                key={session.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  isExpanded
                    ? "border-primary/20 bg-white/[0.04]"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.03]"
                }`}
              >
                {/* Header Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : session.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left"
                >
                  {/* Identity */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                      <User className="h-5 w-5 text-white/40" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-white truncate">
                        {x.contactName || `Session ${session.sessionId.substring(0, 8)}...`}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {x.contactPhone && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1">
                            <Phone className="h-2.5 w-2.5" /> {displayPhoneNumber(x.contactPhone)}
                          </span>
                        )}
                        {x.contactEmail && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1 truncate">
                            <Mail className="h-2.5 w-2.5" /> {x.contactEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Journey Stage Badge */}
                  <div className={`shrink-0 rounded-full border px-3 py-1 ${stage.bg}`}>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>

                  {/* Intent Score */}
                  <div className="shrink-0 w-20">
                    <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                      <span className={session.intentScore > 70 ? "text-amber-500" : session.intentScore > 40 ? "text-primary" : "text-white/40"}>
                        {session.intentScore}%
                      </span>
                      <span className="text-white/15">Intent</span>
                    </div>
                    <Progress
                      value={session.intentScore}
                      className="h-1 bg-white/10"
                      indicatorClassName={session.intentScore > 70 ? "bg-amber-500" : session.intentScore > 40 ? "bg-primary" : "bg-white/20"}
                    />
                  </div>

                  {/* Predicted Action */}
                  <div className="shrink-0 hidden md:block">
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
                      <Badge variant="secondary" className="bg-white/5 text-white/30 border-none shadow-none uppercase text-[9px] tracking-widest font-bold">
                        <Eye className="h-3 w-3 mr-1" /> Browsing
                      </Badge>
                    )}
                  </div>

                  {/* Last Active */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-[11px] text-white/40 italic">
                      {timeAgo(session.lastActiveAt)}
                    </p>
                    <p className="text-[9px] text-white/15 uppercase tracking-widest mt-0.5">
                      {session.currentSection || "landing"} • {session.totalInteractions} events
                    </p>
                  </div>
                </button>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className="border-t border-white/5 px-5 py-5 space-y-5">
                    {/* Journey Timeline */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Coupon */}
                      <div className={`rounded-xl border p-4 ${x.couponClaimed ? "border-purple-500/20 bg-purple-500/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket className={`h-3.5 w-3.5 ${x.couponClaimed ? "text-purple-300" : "text-white/20"}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Coupon</span>
                        </div>
                        {x.couponClaimed ? (
                          <div>
                            <p className="text-sm font-semibold text-purple-300">{x.couponCode}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                              via {x.couponChannel} • {x.couponDestination}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-white/15 italic">No coupon claimed</p>
                        )}
                      </div>

                      {/* Cart */}
                      <div className={`rounded-xl border p-4 ${x.addedProducts?.length > 0 ? "border-primary/20 bg-primary/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className={`h-3.5 w-3.5 ${x.addedProducts?.length > 0 ? "text-primary" : "text-white/20"}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Cart</span>
                        </div>
                        {x.addedProducts?.length > 0 ? (
                          <div>
                            <p className="text-xs text-white/60">{x.addedProducts.length} product{x.addedProducts.length !== 1 ? "s" : ""}</p>
                            <div className="mt-1 space-y-0.5">
                              {x.addedProducts.slice(0, 3).map((p: string) => (
                                <p key={p} className="text-[10px] text-primary/60 truncate">• {p}</p>
                              ))}
                              {x.addedProducts.length > 3 && (
                                <p className="text-[10px] text-white/20">+{x.addedProducts.length - 3} more</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-white/15 italic">
                            {x.cartOpens > 0 ? `Opened cart ${x.cartOpens}x` : "No cart activity"}
                          </p>
                        )}
                      </div>

                      {/* Checkout */}
                      <div className={`rounded-xl border p-4 ${x.hasCheckout ? "border-amber-500/20 bg-amber-500/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart className={`h-3.5 w-3.5 ${x.hasCheckout ? "text-amber-300" : "text-white/20"}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Checkout</span>
                        </div>
                        {x.hasCheckout ? (
                          <div>
                            <p className="text-sm font-semibold text-amber-300">
                              {x.checkoutValue ? formatINR(x.checkoutValue) : "Started"}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                              {x.cartItemCount} items • {x.checkoutStatus}
                            </p>
                            {x.lastEditedField && (
                              <p className="text-[10px] text-amber-500/50 mt-0.5">
                                Last field: {x.lastEditedField}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-white/15 italic">No checkout</p>
                        )}
                      </div>

                      {/* Order */}
                      <div className={`rounded-xl border p-4 ${x.hasOrder ? "border-emerald-500/20 bg-emerald-500/[0.04]" : "border-white/5 bg-white/[0.02]"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Package className={`h-3.5 w-3.5 ${x.hasOrder ? "text-emerald-300" : "text-white/20"}`} />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">Order</span>
                        </div>
                        {x.hasOrder ? (
                          <div>
                            <p className="text-sm font-semibold text-emerald-300">
                              {x.orderValue ? formatINR(x.orderValue) : "Placed"}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                              #{x.orderNumber} • {x.orderStatus}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-white/15 italic">No order yet</p>
                        )}
                      </div>
                    </div>

                    {/* Behavioral Details + Action Buttons */}
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      {/* Behavioral Analysis */}
                      <div className="flex flex-wrap gap-3">
                        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Risk</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`h-2 w-2 rounded-full ${
                              (session.abandonmentRisk ?? 0) > 60 ? "bg-red-500" :
                              (session.abandonmentRisk ?? 0) > 30 ? "bg-amber-500" : "bg-emerald-500"
                            }`} />
                            <span className="text-sm font-medium text-white/60">{session.abandonmentRisk ?? 0}%</span>
                          </div>
                        </div>
                        {session.topAbandonmentCause && (
                          <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                            <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Exit Cause</p>
                            <p className="text-xs text-red-400/70 mt-1 capitalize">
                              {session.topAbandonmentCause.replace(/_/g, " ")}
                            </p>
                          </div>
                        )}
                        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Section</p>
                          <p className="text-xs text-white/50 mt-1 capitalize">{session.currentSection || "Landing"}</p>
                        </div>
                        <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                          <p className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Last Active</p>
                          <p className="text-xs text-white/50 mt-1">{timeAgo(session.lastActiveAt)}</p>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2">
                        {x.contactPhone && (
                          <a
                            href={buildWhatsAppUrl(x.contactPhone, x.contactName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500/20 hover:scale-[1.02]"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            WhatsApp
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        )}
                        {x.contactEmail && (
                          <a
                            href={buildMailtoUrl(x.contactEmail, x.contactName)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 px-4 py-2.5 text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/20 hover:scale-[1.02]"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>
                        )}
                        {!x.contactPhone && !x.contactEmail && (
                          <span className="text-[10px] text-white/15 italic">No contact info available</span>
                        )}
                      </div>
                    </div>

                    {/* Smart Insight */}
                    {!x.hasOrder && (x.hasCheckout || x.couponClaimed || (x.addedProducts?.length > 0)) && (
                      <div className="rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-amber-400/50 mb-1">AI Insight</p>
                        <p className="text-xs text-white/50">
                          {x.hasCheckout && !x.hasOrder && session.abandonmentRisk > 50
                            ? `This customer started checkout${x.checkoutValue ? ` worth ${formatINR(x.checkoutValue)}` : ""} but shows high exit risk. ${x.lastEditedField ? `They dropped off at the "${x.lastEditedField}" field.` : ""} ${x.contactPhone ? "Send a WhatsApp with a nudge." : "No phone on file — try email."}`
                            : x.couponClaimed && !x.hasCheckout
                            ? `Claimed coupon "${x.couponCode}" but hasn't started checkout. ${x.addedProducts?.length > 0 ? `They added ${x.addedProducts.join(", ")} to cart but didn't proceed.` : "They haven't added any products yet."} Contact them with product recommendations.`
                            : x.addedProducts?.length > 0 && !x.hasCheckout
                            ? `Added ${x.addedProducts.slice(0, 2).join(" & ")} to cart but didn't proceed to checkout. They may need a push — consider offering assistance or a coupon code.`
                            : `This customer is engaged but hasn't converted yet. Look at what products they're viewing and reach out with a personalized recommendation.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
