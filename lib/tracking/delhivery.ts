import {
  TRACKING_STATUS_META,
  type TrackingDestination,
  type TrackingResult,
  type TrackingTimelineItem,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  normalizeTrackingStatus,
} from "@/lib/tracking/carriers";

const DEFAULT_DELHIVERY_TRACKING_ENDPOINT = "https://track.delhivery.com/api/v1/packages/json/";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function pickString(value: unknown, keyHints: string[]): string | null {
  if (!isRecord(value)) return null;

  const normalizedHints = keyHints.map(normalizeKey);
  for (const [key, childValue] of Object.entries(value)) {
    const normalizedKey = normalizeKey(key);
    if (
      normalizedHints.some((hint) => normalizedKey === hint || normalizedKey.includes(hint)) &&
      (typeof childValue === "string" || typeof childValue === "number")
    ) {
      return String(childValue).trim() || null;
    }
  }

  return null;
}

function deepPickString(value: unknown, keyHints: string[]): string | null {
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.shift();
    if (Array.isArray(current)) {
      stack.push(...current);
      continue;
    }

    if (!isRecord(current)) continue;
    const found = pickString(current, keyHints);
    if (found) return found;

    for (const childValue of Object.values(current)) {
      if (childValue && typeof childValue === "object") stack.push(childValue);
    }
  }

  return null;
}

function getShipmentPayload(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;

  const shipmentData = payload.ShipmentData;
  if (Array.isArray(shipmentData) && shipmentData.length) {
    const firstShipment = shipmentData[0];
    if (isRecord(firstShipment) && "Shipment" in firstShipment) return firstShipment.Shipment;
    return firstShipment;
  }

  if ("Shipment" in payload) return payload.Shipment;
  return payload;
}

function getScanDetail(scan: unknown): UnknownRecord | null {
  if (!isRecord(scan)) return null;
  const detail = scan.ScanDetail ?? scan.Scan ?? scan;
  return isRecord(detail) ? detail : scan;
}

function parseTimeline(shipment: unknown): TrackingTimelineItem[] {
  if (!isRecord(shipment)) return [];

  const scans = Array.isArray(shipment.Scans)
    ? shipment.Scans
    : Array.isArray(shipment.scans)
      ? shipment.scans
      : [];

  return scans
    .map(getScanDetail)
    .filter((detail): detail is UnknownRecord => Boolean(detail))
    .map((detail) => {
      const label =
        pickString(detail, ["scan", "status", "instructions", "activity", "event"]) ??
        "Tracking update";
      const location = pickString(detail, ["scannedlocation", "scanlocation", "statuslocation", "location", "city"]);
      const time = pickString(detail, ["scandatetime", "statusdatetime", "datetime", "date", "time"]);

      return {
        label,
        location,
        time,
        description: pickString(detail, ["instructions", "remark", "remarks", "message"]),
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.time ?? "").getTime();
      const bTime = new Date(b.time ?? "").getTime();
      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
      if (Number.isNaN(aTime)) return 1;
      if (Number.isNaN(bTime)) return -1;
      return bTime - aTime;
    })
    .slice(0, 12);
}

function getCarrierDestination(shipment: unknown): TrackingDestination | null {
  const fullName = deepPickString(shipment, ["consignee", "receivername", "customername"]);
  const phone = deepPickString(shipment, ["mobile", "phone", "phoneno", "contact"]);
  const city = deepPickString(shipment, ["destinationcity", "destination", "city"]);
  const state = deepPickString(shipment, ["destinationstate", "state"]);
  const pincode = deepPickString(shipment, ["destinationpincode", "pin", "pincode"]);

  if (!fullName && !phone && !city && !state && !pincode) return null;

  return {
    source: "carrier",
    label: "Delivery address",
    fullName,
    phone,
    city,
    state,
    pincode,
    country: "India",
  };
}

function buildDelhiveryEndpoint(trackingNumber: string, token: string): string {
  const template = process.env.DELHIVERY_TRACKING_ENDPOINT?.trim();
  const replacements: Record<string, string> = {
    trackingNumber,
    waybill: trackingNumber,
    awb: trackingNumber,
    delhiveryToken: token,
    token,
  };

  if (template) {
    const replaced = template.replace(/\{([A-Za-z0-9_]+)\}/g, (_match, key: string) => {
      return encodeURIComponent(replacements[key] ?? "");
    });

    if (replaced !== template) return replaced;

    const url = new URL(replaced);
    if (!url.searchParams.has("token")) url.searchParams.set("token", token);
    if (!url.searchParams.has("waybill")) url.searchParams.set("waybill", trackingNumber);
    return url.toString();
  }

  const url = new URL(DEFAULT_DELHIVERY_TRACKING_ENDPOINT);
  url.searchParams.set("token", token);
  url.searchParams.set("waybill", trackingNumber);
  return url.toString();
}

function setupNeededResult(trackingNumber: string, checkedAt: string): TrackingResult {
  return {
    carrier: "delhivery",
    trackingNumber,
    status: "needs_setup",
    statusLabel: TRACKING_STATUS_META.needs_setup.label,
    source: "setup",
    officialUrl: getOfficialTrackingUrl("delhivery"),
    checkedAt,
    timeline: [],
    message: "Delhivery tracking is ready in code, but the API token is not configured yet.",
    nextAction: "Add DELHIVERY_API_TOKEN in Vercel and redeploy.",
  };
}

function toTrackingResult(trackingNumber: string, payload: unknown, checkedAt: string): TrackingResult {
  const shipment = getShipmentPayload(payload);
  const awb = cleanTrackingNumber(deepPickString(shipment, ["awb", "waybill", "trackingnumber"]) ?? trackingNumber);
  const timeline = parseTimeline(shipment);
  const statusText =
    deepPickString(shipment, ["currentstatus", "lateststatus", "shipmentstatus", "status", "statustype", "instructions"]) ??
    timeline[0]?.label ??
    "Unknown";
  const status = normalizeTrackingStatus(statusText);
  const lastScan =
    deepPickString(shipment, ["statusdatetime", "scandatetime", "lastupdated", "updatedat", "timestamp"]) ??
    timeline[0]?.time ??
    null;
  const location =
    deepPickString(shipment, ["statuslocation", "scannedlocation", "scanlocation", "currentlocation", "location"]) ??
    timeline[0]?.location ??
    null;

  if (!isRecord(shipment) || (!timeline.length && status === "unknown")) {
    const errorMessage = deepPickString(payload, ["error", "message", "remark", "remarks"]);
    return {
      carrier: "delhivery",
      trackingNumber: awb,
      status: "not_found",
      statusLabel: TRACKING_STATUS_META.not_found.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("delhivery"),
      checkedAt,
      timeline: [],
      message: errorMessage || "No Delhivery shipment was found for this AWB yet.",
      nextAction: "Check the AWB or try again after Delhivery receives the shipment.",
      rawSummary: JSON.stringify(payload).slice(0, 300),
    };
  }

  return {
    carrier: "delhivery",
    trackingNumber: awb,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source: "api",
    officialUrl: getOfficialTrackingUrl("delhivery"),
    checkedAt,
    lastScan,
    location,
    destination: getCarrierDestination(shipment),
    expectedDelivery: deepPickString(shipment, ["expecteddeliverydate", "expecteddate", "promiseddeliverydate", "edd"]),
    timeline,
    message: timeline[0]?.label || statusText || "Delhivery returned a live tracking response.",
    rawSummary: JSON.stringify(payload).slice(0, 300),
  };
}

export function isLikelyDelhiveryAwb(value: string): boolean {
  return /^\d{12,14}$/.test(cleanTrackingNumber(value));
}

export async function trackDelhiveryWaybill(value: string): Promise<TrackingResult> {
  const trackingNumber = cleanTrackingNumber(value);
  const checkedAt = new Date().toISOString();
  const token = process.env.DELHIVERY_API_TOKEN?.trim();

  if (!token) return setupNeededResult(trackingNumber, checkedAt);

  const response = await fetch(buildDelhiveryEndpoint(trackingNumber, token), {
    method: "GET",
    headers: {
      accept: "application/json, text/plain;q=0.8, */*;q=0.5",
      Authorization: `Token ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();

  if (!response.ok) {
    return {
      carrier: "delhivery",
      trackingNumber,
      status: response.status === 401 || response.status === 403 ? "needs_setup" : "exception",
      statusLabel:
        response.status === 401 || response.status === 403
          ? TRACKING_STATUS_META.needs_setup.label
          : TRACKING_STATUS_META.exception.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("delhivery"),
      checkedAt,
      timeline: [],
      message: `Delhivery tracking returned HTTP ${response.status}.`,
      nextAction: "Check the Delhivery API token or try again shortly.",
      rawSummary: text.slice(0, 300),
    };
  }

  try {
    return toTrackingResult(trackingNumber, JSON.parse(text), checkedAt);
  } catch {
    return {
      carrier: "delhivery",
      trackingNumber,
      status: normalizeTrackingStatus(text),
      statusLabel: TRACKING_STATUS_META[normalizeTrackingStatus(text)].label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("delhivery"),
      checkedAt,
      timeline: [],
      message: text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
        "Delhivery returned a tracking response.",
      rawSummary: text.slice(0, 300),
    };
  }
}
