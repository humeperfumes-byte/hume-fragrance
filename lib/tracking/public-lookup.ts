import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { trackSpeedPostConsignment } from "@/lib/tracking/india-post";
import {
  TRACKING_CARRIERS,
  TRACKING_STATUS_META,
  type TrackingCarrier,
  type TrackingDestination,
  type TrackingResult,
  type TrackingTimelineItem,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  isTrackingCarrier,
  normalizeTrackingStatus,
} from "@/lib/tracking/carriers";

type UnknownRecord = Record<string, unknown>;

function clean(value: string | null | undefined) {
  return value?.trim() || null;
}

function cleanCountry(value: string | null | undefined) {
  const country = clean(value);
  if (!country || country.toUpperCase() === "IN") return "India";
  return country;
}

function hasDestination(destination: TrackingDestination) {
  return Boolean(
    destination.fullName ||
      destination.phone ||
      destination.addressLine1 ||
      destination.addressLine2 ||
      destination.city ||
      destination.state ||
      destination.pincode ||
      destination.country,
  );
}

function normalizeCarrier(value: string | null | undefined, trackingNumber: string): TrackingCarrier {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (isTrackingCarrier(normalized)) return normalized;
  if (/blue_?dart|bluedart/.test(normalized)) return "bluedart";
  if (/delhivery/.test(normalized)) return "delhivery";
  if (/speed|india_?post|indian_?post/.test(normalized)) return "speed_post";
  if (/^[A-Z]{2}\d{9}IN$/.test(cleanTrackingNumber(trackingNumber))) return "speed_post";
  return "speed_post";
}

async function getSavedOrderTrackingDetails(trackingNumber: string) {
  const [order] = await db
    .select({
      fulfillmentCarrier: orders.fulfillmentCarrier,
      fullName: orders.fullName,
      phone: orders.phone,
      addressLine1: orders.addressLine1,
      addressLine2: orders.addressLine2,
      city: orders.city,
      state: orders.state,
      pincode: orders.pincode,
      country: orders.country,
    })
    .from(orders)
    .where(eq(orders.trackingNumber, cleanTrackingNumber(trackingNumber)))
    .limit(1);

  if (!order) return null;

  const destination: TrackingDestination = {
    source: "hume_order",
    label: "Delivery address",
    fullName: clean(order.fullName),
    phone: clean(order.phone),
    addressLine1: clean(order.addressLine1),
    addressLine2: clean(order.addressLine2),
    city: clean(order.city),
    state: clean(order.state),
    pincode: clean(order.pincode),
    country: cleanCountry(order.country),
  };

  return {
    carrier: normalizeCarrier(order.fulfillmentCarrier, trackingNumber),
    destination: hasDestination(destination) ? destination : null,
  };
}

function getProviderEndpoint(carrier: TrackingCarrier): string | undefined {
  switch (carrier) {
    case "speed_post":
      return process.env.SPEED_POST_TRACKING_ENDPOINT;
    case "delhivery":
      return process.env.DELHIVERY_TRACKING_ENDPOINT;
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
    carrier,
  };

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_match, key: string) => {
    return encodeURIComponent(replacements[key] ?? "");
  });
}

function fallbackResult(
  carrier: TrackingCarrier,
  trackingNumber: string,
  checkedAt: string,
  status: TrackingResult["status"],
  message: string,
  source: TrackingResult["source"] = "manual",
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
  return findTimelineArrays(payload)
    .flat()
    .filter(isRecord)
    .map((row) => {
      const label =
        deepPickString(row, ["status", "scan", "event", "activity", "instructions", "description"]) ??
        "Tracking update";
      const location = deepPickString(row, ["location", "city", "scanlocation", "statuslocation"]);
      const time = deepPickString(row, ["date", "time", "datetime", "statusdatetime", "scandatetime"]);

      return {
        label,
        location,
        time,
        description: deepPickString(row, ["remark", "remarks", "message"]),
      };
    })
    .filter((item) => item.label || item.location || item.time)
    .slice(0, 12);
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

async function trackCarrierConsignment(
  carrier: TrackingCarrier,
  trackingNumber: string,
  checkedAt: string,
): Promise<TrackingResult> {
  if (carrier === "speed_post") {
    return trackSpeedPostConsignment(trackingNumber);
  }

  const endpointTemplate = getProviderEndpoint(carrier);
  if (!endpointTemplate) {
    return fallbackResult(
      carrier,
      trackingNumber,
      checkedAt,
      "manual_check",
      `${TRACKING_CARRIERS[carrier].shortLabel} tracking is linked to this order.`,
      "manual",
      "Live carrier API is not configured yet.",
    );
  }

  const response = await fetch(buildEndpoint(endpointTemplate, carrier, trackingNumber), {
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
      response.status === 401 || response.status === 403 ? "needs_setup" : "exception",
      `${TRACKING_CARRIERS[carrier].shortLabel} tracking returned HTTP ${response.status}.`,
      "api",
      "Check carrier API credentials.",
    );
  }

  try {
    return normalizeApiPayload(carrier, trackingNumber, JSON.parse(text), checkedAt);
  } catch {
    return normalizeTextResponse(carrier, trackingNumber, text, checkedAt);
  }
}

export async function lookupPublicTrackingResult(value: string): Promise<TrackingResult> {
  const trackingNumber = cleanTrackingNumber(value);
  const checkedAt = new Date().toISOString();
  const savedOrder = await getSavedOrderTrackingDetails(trackingNumber);
  const carrier = savedOrder?.carrier ?? normalizeCarrier(null, trackingNumber);
  const result = await trackCarrierConsignment(carrier, trackingNumber, checkedAt);

  return {
    ...result,
    destination: savedOrder?.destination ?? result.destination ?? null,
  };
}
