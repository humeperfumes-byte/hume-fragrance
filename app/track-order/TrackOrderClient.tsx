"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  PackageSearch,
  Phone,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import {
  TRACKING_CARRIERS,
  TRACKING_STATUS_META,
  type TrackingDestination,
  type TrackingResult,
} from "@/lib/tracking/carriers";
import { cn } from "@/lib/utils";
import { displayPhoneNumber } from "@/lib/phone";
import { motion, AnimatePresence } from "framer-motion";

type TrackingResponse = {
  ok?: boolean;
  result?: TrackingResult;
  error?: string;
};

function formatDateTime(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

function getProgress(status?: TrackingResult["status"]) {
  if (!status) return 0;
  if (status === "delivered") return 4;
  if (status === "out_for_delivery") return 3;
  if (status === "in_transit") return 2;
  if (status === "picked_up") return 1;
  return 0;
}

function getDestinationAddressLines(destination?: TrackingDestination | null) {
  if (!destination) return [];
  return [
    destination.addressLine1,
    destination.addressLine2,
    [destination.city, destination.state, destination.pincode]
      .filter(Boolean)
      .join(", "),
    destination.country,
  ].filter((line): line is string => Boolean(line));
}

function StatusIcon({ status }: { status?: TrackingResult["status"] }) {
  if (status === "delivered") return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
  if (status === "exception" || status === "returned") return <AlertCircle className="h-6 w-6 text-rose-600" />;
  if (status === "out_for_delivery" || status === "in_transit") return <Truck className="h-6 w-6 text-amber-600" />;
  return <PackageSearch className="h-6 w-6 text-stone-500" />;
}

type TrackOrderClientProps = {
  initialTrackingNumber?: string;
};

const STEPPER_STAGES = [
  { label: "Booked", icon: Package },
  { label: "Dispatched", icon: PackageCheck },
  { label: "In Transit", icon: Route },
  { label: "Out for Delivery", icon: Truck },
  { label: "Delivered", icon: CheckCircle2 },
] as const;

export default function TrackOrderClient({ initialTrackingNumber = "" }: TrackOrderClientProps) {
  const normalizedInitialTrackingNumber = initialTrackingNumber.trim().toUpperCase();
  const [trackingNumber, setTrackingNumber] = useState(normalizedInitialTrackingNumber);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoTracked, setHasAutoTracked] = useState(false);

  const progress = useMemo(() => getProgress(result?.status), [result]);
  const destinationAddressLines = useMemo(
    () => getDestinationAddressLines(result?.destination),
    [result?.destination],
  );

  const lookupTracking = useCallback(async (value: string) => {
    setError(null);
    setResult(null);

    const nextTrackingNumber = value.trim().toUpperCase();
    if (!nextTrackingNumber) {
      setError("Please enter your tracking ID or AWB number.");
      return;
    }

    setTrackingNumber(nextTrackingNumber);
    setIsLoading(true);
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: nextTrackingNumber }),
      });
      const data = (await response.json()) as TrackingResponse;

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Unable to find details for this tracking ID right now.");
      }

      setResult(data.result);
    } catch (lookupError) {
      setError(
        lookupError instanceof Error
          ? lookupError.message
          : "Unable to load shipment status. Please verify your tracking ID and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!normalizedInitialTrackingNumber || hasAutoTracked) return;
    setHasAutoTracked(true);
    void lookupTracking(normalizedInitialTrackingNumber);
  }, [hasAutoTracked, lookupTracking, normalizedInitialTrackingNumber]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookupTracking(trackingNumber);
  }

  const handleClearInput = () => {
    setTrackingNumber("");
    setResult(null);
    setError(null);
  };

  const whatsappSupportUrl = `https://wa.me/919559024822?text=${encodeURIComponent(
    `Hello HUME Support, I need help tracking my order (${trackingNumber || "AWB"}).`
  )}`;

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Background Subtle Luxury Radial Ambient Lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,hsl(42_35%_88%_/_0.35),transparent_70%)] blur-3xl" />
        <div className="absolute top-96 right-10 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle_at_center,hsl(30_20%_90%_/_0.25),transparent_70%)] blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 md:pt-32">
        {/* Header Section */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#e5ddd1] bg-[#f5efe6]/70 px-3.5 py-1.5 backdrop-blur-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.24em] text-amber-900">
              Shipment Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 font-serif text-4xl font-light tracking-wide text-stone-900 sm:text-5xl lg:text-6xl"
          >
            Track Your Order
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3.5 max-w-md text-sm font-sans leading-relaxed text-stone-600 sm:text-base"
          >
            Monitor real-time delivery status for your HUME package across our logistics partners.
          </motion.p>
        </div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mx-auto mt-8 max-w-2xl"
        >
          <div className="relative rounded-3xl border border-[#e8dfd4] bg-white/80 p-3 shadow-[0_20px_60px_rgba(24,18,14,0.06)] backdrop-blur-xl sm:p-4">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <div className="relative flex flex-1 items-center">
                <Search className="absolute left-4 h-5 w-5 text-stone-400" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="Enter Tracking ID / AWB Number..."
                  autoComplete="off"
                  className="h-14 w-full rounded-2xl border-0 bg-transparent pl-12 pr-10 text-base font-semibold uppercase tracking-wider text-stone-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10"
                />
                {trackingNumber && (
                  <button
                    type="button"
                    onClick={handleClearInput}
                    className="absolute right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                    aria-label="Clear input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !trackingNumber.trim()}
                className="ml-2 inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-2xl bg-stone-900 px-6 font-sans text-xs font-bold uppercase tracking-[0.18em] text-white shadow-md transition-all hover:bg-stone-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:px-8"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span className="hidden sm:inline">Tracking...</span>
                  </>
                ) : (
                  <>
                    <span>Track</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Carrier badges row */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 px-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 font-sans">
                <span className="font-semibold text-stone-700">Supported:</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-700">India Post Speed Post</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-700">Delhivery</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-700">Blue Dart</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-stone-700">Shiprocket</span>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm font-sans text-rose-700 backdrop-blur-md"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <p className="flex-1">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Area */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.trackingNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Main Overview Card */}
                <div className="overflow-hidden rounded-3xl border border-[#e8dfd4] bg-white p-6 shadow-[0_24px_70px_rgba(24,18,14,0.07)] sm:p-8">
                  {/* Status Banner Header */}
                  <div className="flex flex-col justify-between gap-4 border-b border-stone-100 pb-6 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-stone-200/80 bg-[#FAF8F5] shadow-sm">
                        <StatusIcon status={result.status} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-sans text-xl font-bold tracking-wider text-stone-900">
                            {result.trackingNumber}
                          </h2>
                          <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                            {TRACKING_CARRIERS[result.carrier]?.shortLabel || result.carrier}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-sans text-stone-600">{result.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span
                        className={cn(
                          "rounded-full border px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-wider shadow-sm",
                          result.status === "delivered"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : result.status === "out_for_delivery" || result.status === "in_transit"
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : result.status === "exception" || result.status === "returned"
                            ? "border-rose-200 bg-rose-50 text-rose-800"
                            : "border-stone-200 bg-stone-50 text-stone-800"
                        )}
                      >
                        {result.statusLabel}
                      </span>

                      {TRACKING_CARRIERS[result.carrier]?.officialUrl ? (
                        <a
                          href={TRACKING_CARRIERS[result.carrier].officialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {/* 5-Step Visual Stepper */}
                  <div className="py-8">
                    <p className="mb-6 font-serif text-sm font-semibold tracking-wide text-stone-900">
                      Shipment Progress
                    </p>

                    <div className="relative">
                      {/* Line Track Background */}
                      <div className="absolute top-5 left-[8%] right-[8%] h-1 bg-stone-100 rounded-full" />
                      {/* Active Progress Line */}
                      <motion.div
                        className="absolute top-5 left-[8%] h-1 bg-gradient-to-r from-amber-600 to-emerald-600 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${(progress / 4) * 84}%` }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                      />

                      {/* Stepper Nodes */}
                      <div className="relative z-10 grid grid-cols-5 text-center">
                        {STEPPER_STAGES.map((stage, index) => {
                          const Icon = stage.icon;
                          const isPassed = index <= progress;
                          const isCurrent = index === progress;

                          return (
                            <div key={stage.label} className="flex flex-col items-center group">
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                  "relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                                  isPassed
                                    ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                    : "border-stone-200 bg-white text-stone-400"
                                )}
                              >
                                {isCurrent && (
                                  <span className="absolute -inset-1 animate-ping rounded-full border-2 border-emerald-500 opacity-40" />
                                )}
                                <Icon className="h-4.5 w-4.5" />
                              </motion.div>

                              <p
                                className={cn(
                                  "mt-3 font-sans text-[11px] font-semibold tracking-tight transition-colors sm:text-xs",
                                  isPassed ? "text-stone-900" : "text-stone-400"
                                )}
                              >
                                {stage.label}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid gap-3 pt-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-150 bg-[#FAF9F6] p-4">
                      <div className="flex items-center gap-2 text-stone-400">
                        <Clock className="h-4 w-4 text-amber-700" />
                        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                          Last Scan Time
                        </span>
                      </div>
                      <p className="mt-2 font-sans text-sm font-semibold text-stone-900">
                        {formatDateTime(result.lastScan)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-150 bg-[#FAF9F6] p-4">
                      <div className="flex items-center gap-2 text-stone-400">
                        <MapPin className="h-4 w-4 text-amber-700" />
                        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                          Current Location
                        </span>
                      </div>
                      <p className="mt-2 font-sans text-sm font-semibold text-stone-900 truncate">
                        {result.location || "In Transit"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-stone-150 bg-[#FAF9F6] p-4">
                      <div className="flex items-center gap-2 text-stone-400">
                        <ShieldCheck className="h-4 w-4 text-amber-700" />
                        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
                          Status Check
                        </span>
                      </div>
                      <p className="mt-2 font-sans text-sm font-semibold text-stone-900">
                        {formatDateTime(result.checkedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid for Destination Address & Timeline History */}
                <div className="grid gap-8 lg:grid-cols-5">
                  {/* Timeline History (3 cols) */}
                  <div className="lg:col-span-3 rounded-3xl border border-[#e8dfd4] bg-white p-6 shadow-[0_20px_60px_rgba(24,18,14,0.05)] sm:p-8">
                    <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-2.5">
                        <Route className="h-5 w-5 text-amber-800" />
                        <h3 className="font-serif text-lg font-normal tracking-wide text-stone-900">
                          Tracking History
                        </h3>
                      </div>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-600 font-sans">
                        {result.timeline.length} updates
                      </span>
                    </div>

                    {result.timeline.length ? (
                      <div className="relative pl-3 space-y-6">
                        {/* Timeline vertical bar */}
                        <div className="absolute left-[1.1rem] top-3 bottom-3 w-0.5 bg-stone-200" />

                        {result.timeline.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="relative flex items-start gap-4 group">
                            <div
                              className={cn(
                                "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-all",
                                index === 0
                                  ? "border-amber-700 bg-amber-700 text-white shadow-md shadow-amber-700/20"
                                  : "border-stone-300 text-stone-400"
                              )}
                            >
                              {index === 0 ? (
                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-stone-300" />
                              )}
                            </div>

                            <div className="flex-1 rounded-2xl border border-stone-100 bg-[#FAF9F6] p-4 transition-colors group-hover:border-stone-200">
                              <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                                <p className="font-sans text-sm font-bold text-stone-900">{item.label}</p>
                                <span className="font-sans text-[11px] font-semibold text-stone-400">
                                  {item.time ? formatDateTime(item.time) : "Recent"}
                                </span>
                              </div>
                              {item.location && (
                                <p className="mt-1 flex items-center gap-1 font-sans text-xs font-semibold text-amber-900">
                                  <MapPin className="h-3 w-3" />
                                  <span>{item.location}</span>
                                </p>
                              )}
                              {item.description && (
                                <p className="mt-1.5 font-sans text-xs leading-relaxed text-stone-600">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center font-sans text-sm text-stone-500">
                        No scan history available for this tracking ID yet.
                      </div>
                    )}
                  </div>

                  {/* Destination Address Card (2 cols) */}
                  <div className="lg:col-span-2 space-y-6">
                    {result.destination ? (
                      <div className="rounded-3xl border border-[#e8dfd4] bg-[#FDFBF7] p-6 shadow-[0_20px_60px_rgba(24,18,14,0.05)] sm:p-8">
                        <div className="mb-4 flex items-center gap-2.5 border-b border-[#e8dfd4] pb-4">
                          <MapPin className="h-5 w-5 text-amber-800" />
                          <h3 className="font-serif text-lg font-normal tracking-wide text-stone-900">
                            Destination Address
                          </h3>
                        </div>

                        {result.destination.fullName ? (
                          <p className="font-sans text-base font-bold text-stone-900">
                            {result.destination.fullName}
                          </p>
                        ) : null}

                        {result.destination.phone ? (
                          <div className="mt-2 flex items-center gap-2 font-sans text-sm font-medium text-stone-700">
                            <Phone className="h-4 w-4 text-amber-800" />
                            <span>{displayPhoneNumber(result.destination.phone)}</span>
                          </div>
                        ) : null}

                        {destinationAddressLines.length ? (
                          <div className="mt-4 space-y-1 rounded-2xl border border-[#e8dfd4]/60 bg-white/70 p-4 font-sans text-xs leading-relaxed text-stone-700 backdrop-blur-sm">
                            {destinationAddressLines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Customer Support Banner */}
                    <div className="rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-md">
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-sans text-sm font-bold text-stone-900">Need Help With Delivery?</h4>
                          <p className="mt-1 font-sans text-xs leading-relaxed text-stone-600">
                            Have questions regarding your shipment or delivery schedule? Contact HUME Logistics support on WhatsApp.
                          </p>
                          <a
                            href={whatsappSupportUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#20ba59] transition-all active:scale-[0.98]"
                          >
                            <span>WhatsApp Support</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Empty State Placeholder */
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto max-w-2xl text-center"
              >
                <div className="rounded-3xl border border-[#e8dfd4] bg-white p-10 shadow-[0_20px_60px_rgba(24,18,14,0.05)] sm:p-14">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#e8dfd4] bg-[#FAF8F5] text-amber-800 shadow-sm">
                    <PackageSearch className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl font-light text-stone-900 sm:text-3xl">
                    Ready to track your shipment
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm font-sans text-xs leading-relaxed text-stone-500 sm:text-sm">
                    Enter the tracking ID or AWB consignment number sent in your dispatch confirmation SMS or email.
                  </p>

                  <div className="mt-8 border-t border-stone-100 pt-6">
                    <a
                      href={whatsappSupportUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Didn't receive your tracking ID? Contact HUME Support</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
