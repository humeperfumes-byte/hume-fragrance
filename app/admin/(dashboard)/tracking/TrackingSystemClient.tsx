"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCopy,
  ExternalLink,
  Loader2,
  MessageCircle,
  PackageCheck,
  PackageSearch,
  RadioTower,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  TRACKING_CARRIERS,
  TRACKING_STATUS_META,
  TrackingCarrier,
  TrackingResult,
  isTrackingCarrier,
} from "@/lib/tracking/carriers";
import { buildPublicTrackingUrl } from "@/lib/tracking-url";
import { displayPhoneNumber } from "@/lib/phone";

type LookupResponse = {
  ok: boolean;
  results: TrackingResult[];
  error?: string;
};

type RecentLookup = {
  carrier: TrackingCarrier;
  trackingNumber: string;
  statusLabel: string;
  checkedAt: string;
};

type TrackedOrder = {
  id: string;
  orderNumber: string;
  status: string;
  checkoutChannel: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  fulfillmentCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  trackingStatus: string | null;
  trackingLastCheckedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TrackingSystemClientProps = {
  initialTrackedOrders?: TrackedOrder[];
};

const carrierEntries = Object.entries(TRACKING_CARRIERS) as Array<
  [TrackingCarrier, (typeof TRACKING_CARRIERS)[TrackingCarrier]]
>;

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function splitTrackingNumbers(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTrackingUrl(result: TrackingResult) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return buildPublicTrackingUrl(result.trackingNumber, origin);
}

function buildOrderTrackingUrl(order: TrackedOrder) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return buildPublicTrackingUrl(order.trackingNumber, origin) || order.trackingUrl || "";
}

function buildOrderCustomerUpdate(order: TrackedOrder) {
  const name = order.fullName || "there";
  const trackingLink = buildOrderTrackingUrl(order);
  return [
    `Hi ${name}, your order tracking link is here`,
    "",
    `Track here: ${trackingLink}`,
    "",
    "Thank you for choosing HUME Fragrance.",
  ].join("\n");
}

function buildOrderWhatsAppUrl(order: TrackedOrder) {
  const digits = order.phone?.replace(/\D/g, "") || "";
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  if (normalized.length < 10) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(buildOrderCustomerUpdate(order))}`;
}

function normalizeOrderCarrier(value: string | null | undefined): TrackingCarrier {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (isTrackingCarrier(normalized)) return normalized;
  if (/shiprocket|ship_?rocket/.test(normalized)) return "shiprocket";
  if (/delhivery/.test(normalized)) return "delhivery";
  if (/blue_?dart|bluedart/.test(normalized)) return "bluedart";
  return "speed_post";
}

function titleStatus(value: string | null | undefined) {
  return String(value || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildCustomerUpdate(result: TrackingResult) {
  const carrier = TRACKING_CARRIERS[result.carrier].shortLabel;
  const location = result.location ? ` Current location: ${result.location}.` : "";
  const lastScan = result.lastScan ? ` Last update: ${formatDateTime(result.lastScan)}.` : "";
  return `Hi, your HUME order shipped via ${carrier}. Tracking number: ${result.trackingNumber}. Status: ${result.statusLabel}.${location}${lastScan} Track here: ${buildTrackingUrl(result)}`;
}

function StatusIcon({ status }: { status: TrackingResult["status"] }) {
  if (status === "delivered") return <CheckCircle2 className="h-4 w-4 text-emerald-300" />;
  if (status === "exception" || status === "returned") return <AlertCircle className="h-4 w-4 text-rose-300" />;
  if (status === "needs_setup" || status === "manual_check") return <RadioTower className="h-4 w-4 text-amber-200" />;
  return <Truck className="h-4 w-4 text-sky-200" />;
}

function CarrierMark({ carrier }: { carrier: TrackingCarrier }) {
  const config = TRACKING_CARRIERS[carrier];

  return (
    <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-black", config.accent)}>
      <PackageSearch className="h-5 w-5" />
    </span>
  );
}

export default function TrackingSystemClient({ initialTrackedOrders = [] }: TrackingSystemClientProps) {
  const [carrier, setCarrier] = useState<TrackingCarrier>("delhivery");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [results, setResults] = useState<TrackingResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TrackingResult | null>(null);
  const [recentLookups, setRecentLookups] = useState<RecentLookup[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCarrier = TRACKING_CARRIERS[carrier];
  const lookupCount = useMemo(() => {
    const bulkCount = splitTrackingNumbers(bulkText).length;
    return bulkCount || (trackingNumber.trim() ? 1 : 0);
  }, [bulkText, trackingNumber]);
  const deliveryStats = useMemo(() => {
    const active = initialTrackedOrders.filter((order) => !order.deliveredAt && order.status !== "delivered").length;
    const delivered = initialTrackedOrders.filter((order) => order.deliveredAt || order.status === "delivered").length;
    const needsCheck = initialTrackedOrders.filter((order) => !order.trackingLastCheckedAt).length;

    return { active, delivered, needsCheck };
  }, [initialTrackedOrders]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("hume_tracking_recent");
      if (stored) setRecentLookups(JSON.parse(stored) as RecentLookup[]);
    } catch {
      setRecentLookups([]);
    }
  }, []);

  useEffect(() => {
    if (!selectedResult && results.length) setSelectedResult(results[0]);
  }, [results, selectedResult]);

  function rememberResults(nextResults: TrackingResult[]) {
    const nextRecent = [
      ...nextResults.map((result) => ({
        carrier: result.carrier,
        trackingNumber: result.trackingNumber,
        statusLabel: result.statusLabel,
        checkedAt: result.checkedAt,
      })),
      ...recentLookups,
    ]
      .filter(
        (item, index, all) =>
          all.findIndex((other) => other.carrier === item.carrier && other.trackingNumber === item.trackingNumber) === index,
      )
      .slice(0, 8);

    setRecentLookups(nextRecent);
    window.localStorage.setItem("hume_tracking_recent", JSON.stringify(nextRecent));
  }

  async function lookupShipments(nextCarrier: TrackingCarrier, trackingNumbers: string[]) {
    setError(null);

    if (!trackingNumbers.length) {
      setError("Add at least one tracking number.");
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch("/api/admin/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carrier: nextCarrier, trackingNumbers }),
      });
      const data = (await response.json()) as LookupResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Tracking lookup failed");
      }

      setResults(data.results);
      setSelectedResult(data.results[0] ?? null);
      rememberResults(data.results);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Tracking lookup failed");
    } finally {
      setIsChecking(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupShipments(carrier, splitTrackingNumbers(bulkText || trackingNumber));
  }

  async function checkTrackedOrder(order: TrackedOrder) {
    if (!order.trackingNumber) return;

    const nextCarrier = normalizeOrderCarrier(order.fulfillmentCarrier);
    setCarrier(nextCarrier);
    setTrackingNumber(order.trackingNumber);
    setBulkText("");
    await lookupShipments(nextCarrier, [order.trackingNumber]);
  }

  async function copyCustomerUpdate(result: TrackingResult) {
    await navigator.clipboard.writeText(buildCustomerUpdate(result));
  }

  async function copyTrackingLink(result: TrackingResult) {
    await navigator.clipboard.writeText(buildTrackingUrl(result));
  }

  async function copyOrderTrackingLink(order: TrackedOrder) {
    await navigator.clipboard.writeText(buildOrderTrackingUrl(order));
  }

  async function copyOrderCustomerUpdate(order: TrackedOrder) {
    await navigator.clipboard.writeText(buildOrderCustomerUpdate(order));
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
              Admin tracking desk
            </Badge>
            <Badge className="border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.04]">
              Orders + carrier lookup
            </Badge>
          </div>
          <h1 className="text-2xl">Shipment Tracking System</h1>
          <p className="mt-2 text-sm text-white/45">
            Track Speed Post, Delhivery, and Blue Dart shipments from one admin desk.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          {carrierEntries.map(([key, config]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCarrier(key)}
              className={cn(
                "rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors",
                carrier === key ? "bg-white text-black" : "text-white/55 hover:bg-white/8 hover:text-white",
              )}
            >
              {config.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-end sm:p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Active Delivery Tracking</h2>
            <p className="mt-1 text-sm text-white/40">
              Orders where a tracking ID has been saved from the order panel.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl border border-white/10 bg-black/15 px-3 py-2">
              <p className="text-lg font-semibold text-white">{initialTrackedOrders.length}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/35">Tracked</p>
            </div>
            <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 px-3 py-2">
              <p className="text-lg font-semibold text-sky-100">{deliveryStats.active}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-sky-100/45">Active</p>
            </div>
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2">
              <p className="text-lg font-semibold text-emerald-100">{deliveryStats.delivered}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-100/45">Delivered</p>
            </div>
          </div>
        </div>

        {initialTrackedOrders.length ? (
          <div className="divide-y divide-white/8">
            {initialTrackedOrders.map((order) => {
              const orderCarrier = normalizeOrderCarrier(order.fulfillmentCarrier);
              const carrierConfig = TRACKING_CARRIERS[orderCarrier];

              return (
                <div key={order.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.1fr_0.9fr_1fr_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-white">{order.orderNumber}</p>
                      <Badge className="border-white/10 bg-black/20 text-[10px] text-white/55 hover:bg-black/20">
                        {titleStatus(order.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-white/45">
                      {order.fullName || "No customer name"}{order.phone ? ` / ${displayPhoneNumber(order.phone)}` : ""}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/30">
                      {[order.city, order.state].filter(Boolean).join(", ") || "No location added"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Carrier</p>
                    <p className="mt-1 text-sm font-medium text-white">{carrierConfig.shortLabel}</p>
                    <p className="mt-1 truncate text-xs text-white/35">{order.checkoutChannel}</p>
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">Tracking ID</p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">{order.trackingNumber}</p>
                    <p className="mt-1 text-xs text-white/35">
                      Last checked: {formatDateTime(order.trackingLastCheckedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <Button
                      type="button"
                      onClick={() => checkTrackedOrder(order)}
                      className="h-9 rounded-xl bg-white text-black hover:bg-white/90"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Check
                    </Button>
                    <Button
                      type="button"
                      onClick={() => copyOrderTrackingLink(order)}
                      className="h-9 rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button
                      type="button"
                      onClick={() => copyOrderCustomerUpdate(order)}
                      className="h-9 rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Update
                    </Button>
                    {buildOrderWhatsAppUrl(order) ? (
                      <Button
                        type="button"
                        onClick={() => window.open(buildOrderWhatsAppUrl(order) || "", "_blank", "noopener,noreferrer")}
                        className="h-9 rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => window.open(buildOrderTrackingUrl(order), "_blank", "noopener,noreferrer")}
                      className="h-9 rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Truck className="mx-auto h-8 w-8 text-white/25" />
            <h3 className="mt-4 text-lg font-semibold text-white">No tracked deliveries yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
              Add a tracking ID inside an order first. It will then appear here automatically.
            </p>
          </div>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="space-y-5">
          <form onSubmit={handleLookup} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <CarrierMark carrier={carrier} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{activeCarrier.label}</p>
                <p className="mt-1 text-xs text-white/40">{activeCarrier.hint}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/35">{activeCarrier.codeLabel}</label>
                <Input
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="AWB123456789IN"
                  className="h-12 border-white/10 bg-black/20 text-white placeholder:text-white/20 focus-visible:ring-white/30"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-[10px] font-bold uppercase text-white/35">Bulk tracking</label>
                  <span className="text-[11px] text-white/30">Comma or new line</span>
                </div>
                <Textarea
                  value={bulkText}
                  onChange={(event) => setBulkText(event.target.value)}
                  placeholder="Paste multiple tracking numbers"
                  className="min-h-24 resize-none border-white/10 bg-black/20 text-white placeholder:text-white/20 focus-visible:ring-white/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/35">Carrier</label>
                <Select value={carrier} onValueChange={(value) => setCarrier(value as TrackingCarrier)}>
                  <SelectTrigger className="h-11 border-white/10 bg-black/20 text-white focus:ring-white/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#151515] text-white">
                    {carrierEntries.map(([key, config]) => (
                      <SelectItem key={key} value={key} className="focus:bg-white/10 focus:text-white">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isChecking}
                className="h-12 w-full rounded-xl bg-white text-black hover:bg-white/90"
              >
                {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isChecking ? "Checking" : lookupCount > 1 ? `Track ${lookupCount} shipments` : "Track shipment"}
              </Button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm">Recent Lookups</h2>
                <p className="mt-1 text-xs text-white/35">Stored only in this browser for now.</p>
              </div>
              <RefreshCw className="h-4 w-4 text-white/30" />
            </div>
            {recentLookups.length ? (
              <div className="space-y-2">
                {recentLookups.map((item) => (
                  <button
                    key={`${item.carrier}-${item.trackingNumber}`}
                    type="button"
                    onClick={() => {
                      setCarrier(item.carrier);
                      setTrackingNumber(item.trackingNumber);
                      setBulkText("");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/8 bg-black/15 px-3 py-3 text-left text-sm transition-colors hover:bg-white/[0.05]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-white">{item.trackingNumber}</span>
                      <span className="text-xs text-white/35">{TRACKING_CARRIERS[item.carrier].shortLabel}</span>
                    </span>
                    <span className="shrink-0 text-xs text-white/45">{item.statusLabel}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
                No lookups yet
              </div>
            )}
          </div>
        </section>

        <section className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {carrierEntries.map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCarrier(key)}
                className={cn(
                  "group rounded-3xl border bg-white/[0.03] p-4 text-left transition-colors",
                  carrier === key ? "border-white/25" : "border-white/10 hover:border-white/20",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <CarrierMark carrier={key} />
                  <span className={cn("h-2 w-2 rounded-full", carrier === key ? "bg-emerald-300" : "bg-white/20")} />
                </div>
                <p className="mt-4 text-sm font-semibold text-white">{config.label}</p>
                <p className="mt-1 text-xs text-white/35">{config.codeLabel}</p>
              </button>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:p-5">
              <div>
                <h2 className="text-sm">Tracking Results</h2>
                <p className="mt-1 text-xs text-white/35">
                  {results.length ? `${results.length} shipment${results.length > 1 ? "s" : ""} checked` : "Ready for lookup"}
                </p>
              </div>
              <Badge className="w-fit border-white/10 bg-black/20 text-white/50 hover:bg-black/20">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Admin only
              </Badge>
            </div>

            {results.length ? (
              <div className="divide-y divide-white/8">
                {results.map((result) => {
                  const statusMeta = TRACKING_STATUS_META[result.status];
                  const isActive = selectedResult?.trackingNumber === result.trackingNumber && selectedResult.carrier === result.carrier;

                  return (
                    <button
                      key={`${result.carrier}-${result.trackingNumber}`}
                      type="button"
                      onClick={() => setSelectedResult(result)}
                      className={cn(
                        "grid w-full gap-4 px-4 py-4 text-left transition-colors sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5",
                        isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.025]",
                      )}
                    >
                      <div className="flex min-w-0 gap-3">
                        <StatusIcon status={result.status} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{result.trackingNumber}</p>
                          <p className="mt-1 text-xs text-white/40">
                            {TRACKING_CARRIERS[result.carrier].label} / {result.source.replace("_", " ")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <Badge className={cn("border text-xs hover:bg-transparent", statusMeta.className)}>
                          {result.statusLabel}
                        </Badge>
                        <span className="text-xs text-white/35">{formatDateTime(result.checkedAt)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                <div className="rounded-full border border-white/10 bg-white/[0.03] p-5">
                  <PackageSearch className="h-8 w-8 text-white/25" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">No shipment selected</h3>
                <p className="mt-2 max-w-sm text-sm text-white/40">
                  Enter a tracking number to see status, timeline, carrier source, and customer update text.
                </p>
              </div>
            )}
          </div>

          {selectedResult && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <CarrierMark carrier={selectedResult.carrier} />
                    <div>
                      <p className="text-sm font-semibold text-white">{selectedResult.trackingNumber}</p>
                      <p className="mt-1 text-xs text-white/40">{selectedResult.message}</p>
                    </div>
                  </div>
                  <Badge className={cn("w-fit border hover:bg-transparent", TRACKING_STATUS_META[selectedResult.status].className)}>
                    {selectedResult.statusLabel}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                    <p className="text-[10px] font-bold uppercase text-white/30">Last scan</p>
                    <p className="mt-2 text-sm text-white">{formatDateTime(selectedResult.lastScan)}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                    <p className="text-[10px] font-bold uppercase text-white/30">Location</p>
                    <p className="mt-2 text-sm text-white">{selectedResult.location || "Not available"}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-black/15 p-3">
                    <p className="text-[10px] font-bold uppercase text-white/30">Expected</p>
                    <p className="mt-2 text-sm text-white">{formatDateTime(selectedResult.expectedDelivery)}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-white/35" />
                    <h3 className="text-sm font-semibold text-white">Timeline</h3>
                  </div>
                  {selectedResult.timeline.length ? (
                    <div className="space-y-3">
                      {selectedResult.timeline.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                            {index < selectedResult.timeline.length - 1 && <span className="h-full w-px bg-white/10" />}
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium text-white">{item.label}</p>
                            <p className="mt-1 text-xs text-white/40">
                              {[item.location, item.time ? formatDateTime(item.time) : null].filter(Boolean).join(" / ") ||
                                "No scan time"}
                            </p>
                            {item.description && <p className="mt-1 text-xs text-white/30">{item.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
                      Timeline will appear when the carrier API returns scan history.
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-sm font-semibold text-white">Actions</h3>
                  <div className="mt-4 space-y-2">
                    <Button
                      type="button"
                      onClick={() => copyCustomerUpdate(selectedResult)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Copy customer update
                    </Button>
                    <Button
                      type="button"
                      onClick={() => copyTrackingLink(selectedResult)}
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    >
                      <ClipboardCopy className="h-4 w-4" />
                      Copy tracking link
                    </Button>
                    <Button
                      type="button"
                      onClick={() => window.open(selectedResult.officialUrl, "_blank", "noopener,noreferrer")}
                      className="h-10 w-full rounded-xl bg-white text-black hover:bg-white/90"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open official tracker
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-sm font-semibold text-white">Carrier Setup</h3>
                  <div className="mt-4 space-y-3">
                    {carrierEntries.map(([key, config]) => (
                      <div key={key} className="rounded-xl border border-white/8 bg-black/15 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{config.shortLabel}</p>
                          <PackageCheck className="h-4 w-4 text-white/25" />
                        </div>
                        <p className="mt-2 text-xs text-white/35">{config.envKeys.join(" + ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
