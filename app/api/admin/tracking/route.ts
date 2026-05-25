import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
import { trackDelhiveryWaybill } from "@/lib/tracking/delhivery";
import { trackSpeedPostConsignment } from "@/lib/tracking/india-post";
import { trackShiprocketAwb } from "@/lib/tracking/shiprocket";
import {
  TRACKING_CARRIERS,
  TRACKING_STATUS_META,
  TrackingCarrier,
  TrackingResult,
  TrackingTimelineItem,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  isTrackingCarrier,
  normalizeTrackingStatus,
} from "@/lib/tracking/carriers";

export const dynamic = "force-dynamic";

type TrackingRequestBody = {
  carrier?: unknown;
  trackingNumber?: unknown;
  trackingNumbers?: unknown;
};

type UnknownRecord = Record<string, unknown>;

const MAX_TRACKING_NUMBERS = 20;

function getProviderEndpoint(carrier: TrackingCarrier): string | undefined {
  switch (carrier) {
    case "speed_post":
      return process.env.SPEED_POST_TRACKING_ENDPOINT;
    case "delhivery":
      return process.env.DELHIVERY_TRACKING_ENDPOINT ?? "https://track.delhivery.com/api/v1/packages/json/";
    case "shiprocket":
      return undefined;
    case "bluedart":
      return process.env.BLUEDART_TRACKING_ENDPOINT;
    default:
      return undefined;
  }
}

function getProviderHeaders(carrier: TrackingCarrier): HeadersInit {
  const headers: Record<string, string> = {
    accept: "application/json, text/plain;q=0.8, */*;q=0.5",
  };

  if (carrier === "delhivery" && process.env.DELHIVERY_API_TOKEN) {
    headers.Authorization = `Token ${process.env.DELHIVERY_API_TOKEN}`;
  }

  if (carrier === "bluedart" && process.env.BLUEDART_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLUEDART_API_TOKEN}`;
  }

  if (carrier === "speed_post" && process.env.SPEED_POST_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.SPEED_POST_API_TOKEN}`;
  }

  return headers;
}

function buildEndpoint(template: string, carrier: TrackingCarrier, trackingNumber: string): string {
  const replacements: Record<string, string> = {
    trackingNumber,
    consignment: trackingNumber,
    waybill: trackingNumber,
    awb: trackingNumber,
    delhiveryToken: process.env.DELHIVERY_API_TOKEN ?? "",
    bluedartToken: process.env.BLUEDART_API_TOKEN ?? "",
    bluedartLoginId: process.env.BLUEDART_LOGIN_ID ?? "",
    bluedartLicenseKey: process.env.BLUEDART_LICENSE_KEY ?? "",
    speedPostToken: process.env.SPEED_POST_API_TOKEN ?? "",
    carrier,
  };

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_match, key: string) => {
    return encodeURIComponent(replacements[key] ?? "");
  });
}

function parseTrackingNumbers(body: TrackingRequestBody): string[] {
  const values = Array.isArray(body.trackingNumbers)
    ? body.trackingNumbers
    : typeof body.trackingNumber === "string"
      ? [body.trackingNumber]
      : [];

  return values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(/[\n,]+/))
    .map(cleanTrackingNumber)
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, MAX_TRACKING_NUMBERS);
}

function fallbackResult(
  carrier: TrackingCarrier,
  trackingNumber: string,
  checkedAt: string,
  source: TrackingResult["source"],
  status: TrackingResult["status"],
  message: string,
  nextAction?: string,
): TrackingResult {
  return {
    carrier,
    trackingNumber,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source,
    officialUrl: getOfficialTrackingUrl(carrier),
    checkedAt,
    timeline: [],
    message,
    nextAction,
  };
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function deepPickString(value: unknown, keyHints: string[]): string | null {
  const stack: unknown[] = [value];
  const normalizedHints = keyHints.map(normalizeKey);

  while (stack.length) {
    const current = stack.shift();
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    if (!isRecord(current)) continue;

    for (const [key, childValue] of Object.entries(current)) {
      const normalizedKey = normalizeKey(key);
      if (
        normalizedHints.some((hint) => normalizedKey === hint || normalizedKey.includes(hint)) &&
        (typeof childValue === "string" || typeof childValue === "number")
      ) {
        return String(childValue);
      }
      if (childValue && typeof childValue === "object") stack.push(childValue);
    }
  }

  return null;
}

function findTimelineArrays(value: unknown): unknown[] {
  const arrays: unknown[] = [];
  const stack: Array<{ value: unknown; key: string }> = [{ value, key: "" }];

  while (stack.length) {
    const current = stack.shift();
    if (!current) continue;

    if (Array.isArray(current.value)) {
      const key = normalizeKey(current.key);
      if (/(scan|track|history|timeline|event|shipmentdata|status)/.test(key)) {
        arrays.push(current.value);
      }
      current.value.forEach((item) => stack.push({ value: item, key: current.key }));
      continue;
    }

    if (!isRecord(current.value)) continue;
    for (const [key, childValue] of Object.entries(current.value)) {
      stack.push({ value: childValue, key });
    }
  }

  return arrays;
}

function parseTimeline(payload: unknown): TrackingTimelineItem[] {
  const items = findTimelineArrays(payload)
    .flat()
    .filter(isRecord)
    .map((row) => {
      const label =
        deepPickString(row, ["status", "scan", "event", "activity", "instructions", "description"]) ??
        "Tracking update";
      const location = deepPickString(row, ["location", "city", "scanlocation", "statuslocation"]);
      const time = deepPickString(row, ["date", "time", "datetime", "statusdatetime", "scandatetime"]);

      return { label, location, time, description: deepPickString(row, ["remark", "remarks", "message"]) };
    })
    .filter((item) => item.label || item.location || item.time);

  return items.slice(0, 12);
}

function normalizeApiPayload(
  carrier: TrackingCarrier,
  trackingNumber: string,
  payload: unknown,
  checkedAt: string,
): TrackingResult {
  const statusText =
    deepPickString(payload, ["currentstatus", "lateststatus", "shipmentstatus", "status", "event"]) ?? "Unknown";
  const status = normalizeTrackingStatus(statusText);
  const timeline = parseTimeline(payload);
  const lastScan =
    deepPickString(payload, ["statusdatetime", "scandatetime", "lastupdated", "updatedat", "timestamp"]) ??
    timeline[0]?.time ??
    null;

  return {
    carrier,
    trackingNumber,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source: "api",
    officialUrl: getOfficialTrackingUrl(carrier),
    checkedAt,
    lastScan,
    location:
      deepPickString(payload, ["statuslocation", "scanlocation", "currentlocation", "location", "city"]) ??
      timeline[0]?.location ??
      null,
    expectedDelivery: deepPickString(payload, ["edd", "expecteddelivery", "promiseddelivery", "deliverydate"]),
    timeline,
    message: `${TRACKING_CARRIERS[carrier].label} returned a live tracking response.`,
    rawSummary: JSON.stringify(payload).slice(0, 300),
  };
}

function normalizeTextResponse(
  carrier: TrackingCarrier,
  trackingNumber: string,
  text: string,
  checkedAt: string,
): TrackingResult {
  const plainText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const status = normalizeTrackingStatus(plainText);

  return {
    carrier,
    trackingNumber,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source: "api",
    officialUrl: getOfficialTrackingUrl(carrier),
    checkedAt,
    timeline: [],
    message: `${TRACKING_CARRIERS[carrier].label} returned a tracking response.`,
    rawSummary: plainText.slice(0, 300),
  };
}

async function trackWithConfiguredEndpoint(
  carrier: TrackingCarrier,
  trackingNumber: string,
  checkedAt: string,
): Promise<TrackingResult> {
  if (carrier === "speed_post") {
    try {
      return await trackSpeedPostConsignment(trackingNumber);
    } catch (error) {
      return fallbackResult(
        carrier,
        trackingNumber,
        checkedAt,
        "api",
        "exception",
        error instanceof Error ? error.message : "India Post tracking request failed.",
        "Retry once. If India Post is slow, check again after a few minutes.",
      );
    }
  }

  if (carrier === "delhivery") {
    return trackDelhiveryWaybill(trackingNumber);
  }

  if (carrier === "shiprocket") {
    return trackShiprocketAwb(trackingNumber);
  }

  const endpointTemplate = getProviderEndpoint(carrier);

  if (!endpointTemplate) {
    return fallbackResult(
      carrier,
      trackingNumber,
      checkedAt,
      "setup",
      "needs_setup",
      `${TRACKING_CARRIERS[carrier].label} API endpoint is not configured yet.`,
      `Add ${TRACKING_CARRIERS[carrier].envKeys.join(" + ")} after the carrier account is ready.`,
    );
  }

  const endpoint = buildEndpoint(endpointTemplate, carrier, trackingNumber);

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: getProviderHeaders(carrier),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const text = await response.text();

    if (!response.ok) {
      return fallbackResult(
        carrier,
        trackingNumber,
        checkedAt,
        "api",
        response.status === 401 || response.status === 403 ? "needs_setup" : "exception",
        `${TRACKING_CARRIERS[carrier].label} tracking returned HTTP ${response.status}.`,
        "Check the carrier credentials or open the official tracker.",
      );
    }

    try {
      return normalizeApiPayload(carrier, trackingNumber, JSON.parse(text), checkedAt);
    } catch {
      return normalizeTextResponse(carrier, trackingNumber, text, checkedAt);
    }
  } catch (error) {
    return fallbackResult(
      carrier,
      trackingNumber,
      checkedAt,
      "api",
      "exception",
      error instanceof Error ? error.message : "Carrier tracking request failed.",
      "Retry once, then open the official tracker if the carrier API is still slow.",
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as TrackingRequestBody;
    if (!isTrackingCarrier(body.carrier)) {
      return NextResponse.json({ error: "Supported carrier is required" }, { status: 400 });
    }

    const trackingNumbers = parseTrackingNumbers(body);
    if (!trackingNumbers.length) {
      return NextResponse.json({ error: "Tracking number is required" }, { status: 400 });
    }

    const checkedAt = new Date().toISOString();
    const carrier = body.carrier as TrackingCarrier;
    const settledResults = await Promise.allSettled(
      trackingNumbers.map((trackingNumber) => trackWithConfiguredEndpoint(carrier, trackingNumber, checkedAt)),
    );
    const results = settledResults.map((result, index) =>
      result.status === "fulfilled"
        ? result.value
        : fallbackResult(
            carrier,
            trackingNumbers[index] ?? "",
            checkedAt,
            "api",
            "exception",
            result.reason instanceof Error ? result.reason.message : "Carrier tracking request failed.",
            "Retry once. If it still fails, check the carrier API credentials.",
          ),
    );
    const setupFailure = results.find((result) => result.status === "needs_setup");
    const requestFailure = results.find((result) => result.status === "exception");

    return NextResponse.json({
      ok: !setupFailure && !requestFailure,
      error: setupFailure?.message ?? requestFailure?.message,
      checkedAt,
      carrier,
      results,
      providerSetup: Object.fromEntries(
        Object.keys(TRACKING_CARRIERS).map((carrierKey) => {
          const carrier = carrierKey as TrackingCarrier;
          return [
            carrier,
            carrier === "speed_post"
              ? true
              : carrier === "delhivery"
                ? Boolean(process.env.DELHIVERY_API_TOKEN)
                : carrier === "shiprocket"
                  ? Boolean(process.env.SHIPROCKET_API_EMAIL && (process.env.SHIPROCKET_API_KEY || process.env.SHIPROCKET_API_PASSWORD))
                  : Boolean(getProviderEndpoint(carrier)),
          ];
        }),
      ),
    });
  } catch (error) {
    console.error("Tracking lookup failed:", error);
    return NextResponse.json({ error: "Tracking lookup failed" }, { status: 500 });
  }
}
