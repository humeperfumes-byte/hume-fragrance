"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  PackageCheck,
  PackageSearch,
  Route,
  Search,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TRACKING_STATUS_META, TrackingResult } from "@/lib/tracking/carriers";
import { cn } from "@/lib/utils";

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
    dateStyle: "medium",
    timeStyle: "short",
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

function StatusIcon({ status }: { status?: TrackingResult["status"] }) {
  if (status === "delivered") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === "exception" || status === "returned") return <AlertCircle className="h-5 w-5 text-rose-600" />;
  if (status === "out_for_delivery" || status === "in_transit") return <Truck className="h-5 w-5 text-blue-600" />;
  return <PackageSearch className="h-5 w-5 text-zinc-500" />;
}

type TrackOrderClientProps = {
  initialTrackingNumber?: string;
};

export default function TrackOrderClient({ initialTrackingNumber = "" }: TrackOrderClientProps) {
  const normalizedInitialTrackingNumber = initialTrackingNumber.trim().toUpperCase();
  const [trackingNumber, setTrackingNumber] = useState(normalizedInitialTrackingNumber);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoTracked, setHasAutoTracked] = useState(false);
  const progress = useMemo(() => getProgress(result?.status), [result]);

  const lookupTracking = useCallback(async (value: string) => {
    setError(null);
    setResult(null);

    const nextTrackingNumber = value.trim().toUpperCase();
    if (!nextTrackingNumber) {
      setError("Enter your Speed Post tracking ID.");
      return;
    }

    setTrackingNumber(nextTrackingNumber);
    setIsLoading(true);
    try {
      const response = await fetch("/api/tracking/speed-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingNumber: nextTrackingNumber }),
      });
      const data = (await response.json()) as TrackingResponse;

      if (!response.ok || !data.result) {
        throw new Error(data.error || "Unable to track this order right now.");
      }

      setResult(data.result);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Unable to track this order right now.");
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

  return (
    <section className="px-4 pb-16 pt-24 sm:px-6 md:pt-28">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1fr)] lg:items-start">
          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">Speed Post Tracking</p>
            <h1 className="mt-4 font-serif text-4xl font-light leading-none tracking-wide text-zinc-950 sm:text-5xl">
              Track your order
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-600">
              Enter the India Post Speed Post tracking ID shared by HUME to see the latest shipment status.
            </p>
            {normalizedInitialTrackingNumber ? (
              <p className="mt-3 max-w-md text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                Tracking {normalizedInitialTrackingNumber}
              </p>
            ) : null}

            <div className="mt-8 grid max-w-md grid-cols-3 gap-2 text-xs text-zinc-500">
              <div className="border border-zinc-200 bg-white/70 p-3">
                <PackageCheck className="mb-2 h-4 w-4 text-zinc-700" />
                Speed Post
              </div>
              <div className="border border-zinc-200 bg-white/70 p-3">
                <ShieldCheck className="mb-2 h-4 w-4 text-zinc-700" />
                Official source
              </div>
              <div className="border border-zinc-200 bg-white/70 p-3">
                <Clock3 className="mb-2 h-4 w-4 text-zinc-700" />
                Live lookup
              </div>
            </div>
          </div>

          <div className="border border-zinc-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,15,15,0.08)] sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Tracking ID
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value.toUpperCase())}
                    placeholder="EA123456789IN"
                    autoComplete="off"
                    className="h-12 flex-1 rounded-none border-zinc-300 bg-zinc-50 text-base uppercase text-zinc-950 placeholder:text-zinc-400 focus-visible:ring-zinc-950/20"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 rounded-none bg-zinc-950 px-6 text-white hover:bg-zinc-800 sm:min-w-32"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {isLoading ? "Tracking" : "Track"}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </form>

            <div className="mt-6 border-t border-zinc-200 pt-6">
              {result ? (
                <div className="space-y-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center border border-zinc-200 bg-zinc-50">
                        <StatusIcon status={result.status} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-zinc-950">{result.trackingNumber}</p>
                        <p className="mt-1 text-sm text-zinc-500">{result.message}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "w-fit border px-3 py-1 text-xs font-semibold",
                        TRACKING_STATUS_META[result.status].className
                          .replace("text-emerald-200", "text-emerald-700")
                          .replace("text-cyan-200", "text-cyan-700")
                          .replace("text-blue-200", "text-blue-700")
                          .replace("text-violet-200", "text-violet-700")
                          .replace("text-white/70", "text-zinc-700")
                          .replace("text-rose-200", "text-rose-700")
                          .replace("text-orange-200", "text-orange-700")
                          .replace("text-amber-200", "text-amber-700")
                          .replace("text-white/65", "text-zinc-600")
                          .replace("text-white/55", "text-zinc-500"),
                      )}
                    >
                      {result.statusLabel}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Last scan</p>
                      <p className="mt-2 text-sm text-zinc-900">{formatDateTime(result.lastScan)}</p>
                    </div>
                    <div className="border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Location</p>
                      <p className="mt-2 text-sm text-zinc-900">{result.location || "Not available"}</p>
                    </div>
                    <div className="border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Updated</p>
                      <p className="mt-2 text-sm text-zinc-900">{formatDateTime(result.checkedAt)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <Route className="h-4 w-4 text-zinc-500" />
                      <h2 className="text-sm font-semibold text-zinc-950">Shipment progress</h2>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {["Booked", "Dispatched", "In transit", "Out", "Delivered"].map((step, index) => (
                        <div key={step} className="space-y-2">
                          <div
                            className={cn(
                              "h-1.5",
                              index <= progress ? "bg-emerald-500" : "bg-zinc-200",
                            )}
                          />
                          <p className={cn("text-[10px] sm:text-xs", index <= progress ? "text-zinc-950" : "text-zinc-400")}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-500" />
                      <h2 className="text-sm font-semibold text-zinc-950">Tracking history</h2>
                    </div>
                    {result.timeline.length ? (
                      <div className="space-y-4">
                        {result.timeline.map((item, index) => (
                          <div key={`${item.label}-${index}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-zinc-950" />
                              {index < result.timeline.length - 1 && <span className="h-full w-px bg-zinc-200" />}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-medium text-zinc-950">{item.label}</p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {[item.location, item.time ? formatDateTime(item.time) : null].filter(Boolean).join(" / ") ||
                                  "No scan time"}
                              </p>
                              {item.description && <p className="mt-1 text-xs text-zinc-500">{item.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
                        No scan history is available for this tracking ID yet.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center border border-dashed border-zinc-300 bg-zinc-50 px-6 text-center">
                  <PackageSearch className="h-9 w-9 text-zinc-300" />
                  <p className="mt-4 text-sm font-medium text-zinc-900">Your tracking result will appear here</p>
                  <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500">
                    Use the tracking ID sent after dispatch. Speed Post updates can take a little time after booking.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
