import {
  TRACKING_STATUS_META,
  type TrackingDestination,
  type TrackingResult,
  type TrackingTimelineItem,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  normalizeTrackingStatus,
} from "@/lib/tracking/carriers";

const SHIPROCKET_BASE_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_REFRESH_BUFFER_MS = 60 * 60 * 1000;
const TOKEN_TTL_MS = 9 * 24 * 60 * 60 * 1000;

type UnknownRecord = Record<string, unknown>;

let cachedToken: { token: string; expiresAt: number } | null = null;

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

function getTrackingData(payload: unknown): unknown {
  if (!isRecord(payload)) return payload;
  return payload.tracking_data ?? payload.trackingData ?? payload.data ?? payload;
}

function getFirstRecord(value: unknown, keyHints: string[]): unknown {
  const normalizedHints = keyHints.map(normalizeKey);
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.shift();
    if (Array.isArray(current)) {
      if (current.length && current.some(isRecord)) return current.find(isRecord) ?? current[0];
      continue;
    }

    if (!isRecord(current)) continue;
    for (const [key, childValue] of Object.entries(current)) {
      const normalizedKey = normalizeKey(key);
      if (normalizedHints.some((hint) => normalizedKey === hint || normalizedKey.includes(hint))) {
        if (Array.isArray(childValue) && childValue.length) return childValue.find(isRecord) ?? childValue[0];
        if (isRecord(childValue)) return childValue;
      }
      if (childValue && typeof childValue === "object") stack.push(childValue);
    }
  }

  return null;
}

function getFirstArray(value: unknown, keyHints: string[]): unknown[] {
  const normalizedHints = keyHints.map(normalizeKey);
  const stack: unknown[] = [value];

  while (stack.length) {
    const current = stack.shift();
    if (Array.isArray(current)) continue;
    if (!isRecord(current)) continue;

    for (const [key, childValue] of Object.entries(current)) {
      const normalizedKey = normalizeKey(key);
      if (
        normalizedHints.some((hint) => normalizedKey === hint || normalizedKey.includes(hint)) &&
        Array.isArray(childValue)
      ) {
        return childValue;
      }
      if (childValue && typeof childValue === "object") stack.push(childValue);
    }
  }

  return [];
}

function parseActivities(payload: unknown): TrackingTimelineItem[] {
  const trackingData = getTrackingData(payload);
  const activities = getFirstArray(trackingData, ["shipmenttrackactivities", "trackactivities", "activities"]);

  return activities
    .filter(isRecord)
    .map((activity) => {
      const label =
        pickString(activity, ["activity", "status", "currentstatus", "scan", "description"]) ??
        "Tracking update";
      return {
        label,
        location: pickString(activity, ["location", "statuslocation", "scanlocation", "city"]),
        time: pickString(activity, ["date", "time", "datetime", "updatedat", "statusdatetime"]),
        description: pickString(activity, ["remarks", "remark", "message"]),
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

function getShipmentSummary(payload: unknown): unknown {
  const trackingData = getTrackingData(payload);
  return (
    getFirstRecord(trackingData, ["shipmenttrack", "track"]) ??
    getFirstRecord(payload, ["shipmenttrack", "track"]) ??
    trackingData
  );
}

function getCarrierDestination(summary: unknown): TrackingDestination | null {
  const fullName = deepPickString(summary, ["consigneename", "customername", "receivername"]);
  const phone = deepPickString(summary, ["phone", "mobile", "contact"]);
  const city = deepPickString(summary, ["destination", "destinationcity", "deliveredto", "city"]);
  const state = deepPickString(summary, ["destinationstate", "state"]);
  const pincode = deepPickString(summary, ["destinationpincode", "pincode", "pin"]);

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

function getShiprocketCredentials() {
  const email = process.env.SHIPROCKET_API_EMAIL?.trim();
  const password =
    process.env.SHIPROCKET_API_PASSWORD?.trim() ||
    process.env.SHIPROCKET_API_KEY?.trim();

  return { email, password };
}

function setupNeededResult(trackingNumber: string, checkedAt: string): TrackingResult {
  return {
    carrier: "shiprocket",
    trackingNumber,
    status: "needs_setup",
    statusLabel: TRACKING_STATUS_META.needs_setup.label,
    source: "setup",
    officialUrl: getOfficialTrackingUrl("shiprocket"),
    checkedAt,
    timeline: [],
    message: "Shiprocket tracking is ready in code, but API credentials are not configured yet.",
    nextAction: "Add SHIPROCKET_API_EMAIL and SHIPROCKET_API_KEY in Vercel, then redeploy.",
  };
}

function getShiprocketResponseMessage(text: string, fallback: string): string {
  try {
    const payload = JSON.parse(text) as UnknownRecord;
    const message = deepPickString(payload, ["message", "error", "description"]);
    return message || fallback;
  } catch {
    return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 180) || fallback;
  }
}

async function getShiprocketToken(): Promise<string | null> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt - TOKEN_REFRESH_BUFFER_MS > now) {
    return cachedToken.token;
  }

  const { email, password } = getShiprocketCredentials();
  if (!email || !password) return null;

  const response = await fetch(`${SHIPROCKET_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      getShiprocketResponseMessage(text, `Shiprocket authentication returned HTTP ${response.status}.`),
    );
  }

  const payload = JSON.parse(text) as UnknownRecord;
  const token = typeof payload.token === "string" ? payload.token : null;
  if (!token) throw new Error("Shiprocket authentication did not return a token.");

  cachedToken = { token, expiresAt: now + TOKEN_TTL_MS };
  return token;
}

function toTrackingResult(trackingNumber: string, payload: unknown, checkedAt: string): TrackingResult {
  const trackingData = getTrackingData(payload);
  const summary = getShipmentSummary(payload);
  const timeline = parseActivities(payload);
  const awb = cleanTrackingNumber(
    deepPickString(summary, ["awbcode", "awb", "trackingnumber", "waybill"]) ??
      deepPickString(trackingData, ["awbcode", "awb", "trackingnumber", "waybill"]) ??
      trackingNumber,
  );
  const statusText =
    deepPickString(summary, ["currentstatus", "shipmentstatus", "status", "statuscode"]) ??
    deepPickString(trackingData, ["currentstatus", "shipmentstatus", "status", "statuscode"]) ??
    timeline[0]?.label ??
    "Unknown";
  const status = normalizeTrackingStatus(statusText);
  const errorMessage = deepPickString(payload, ["message", "error", "remarks"]);

  if (!timeline.length && status === "unknown") {
    return {
      carrier: "shiprocket",
      trackingNumber: awb,
      status: "not_found",
      statusLabel: TRACKING_STATUS_META.not_found.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("shiprocket"),
      checkedAt,
      timeline: [],
      message: errorMessage || "No Shiprocket shipment was found for this AWB yet.",
      nextAction: "Check the AWB or try again after Shiprocket receives carrier scans.",
      rawSummary: JSON.stringify(payload).slice(0, 300),
    };
  }

  return {
    carrier: "shiprocket",
    trackingNumber: awb,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source: "api",
    officialUrl:
      deepPickString(trackingData, ["trackurl", "trackingurl"]) ??
      getOfficialTrackingUrl("shiprocket"),
    checkedAt,
    lastScan:
      deepPickString(summary, ["lastupdated", "updatedat", "statusdatetime"]) ??
      timeline[0]?.time ??
      null,
    location:
      deepPickString(summary, ["currentlocation", "statuslocation", "deliveredto", "destination"]) ??
      timeline[0]?.location ??
      null,
    destination: getCarrierDestination(summary),
    expectedDelivery: deepPickString(summary, ["edd", "expecteddelivery", "promiseddelivery", "deliverydate"]),
    timeline,
    message:
      timeline[0]?.label ||
      deepPickString(summary, ["currentstatus", "couriername"]) ||
      "Shiprocket returned a live tracking response.",
    rawSummary: JSON.stringify(payload).slice(0, 300),
  };
}

export async function trackShiprocketAwb(value: string): Promise<TrackingResult> {
  const trackingNumber = cleanTrackingNumber(value);
  const checkedAt = new Date().toISOString();
  let token: string | null = null;

  try {
    token = await getShiprocketToken();
  } catch (error) {
    return {
      carrier: "shiprocket",
      trackingNumber,
      status: "needs_setup",
      statusLabel: TRACKING_STATUS_META.needs_setup.label,
      source: "setup",
      officialUrl: getOfficialTrackingUrl("shiprocket"),
      checkedAt,
      timeline: [],
      message: error instanceof Error ? error.message : "Shiprocket authentication failed.",
      nextAction: "Check the Shiprocket API email/password, then update the env values and redeploy.",
    };
  }

  if (!token) return setupNeededResult(trackingNumber, checkedAt);

  const response = await fetch(`${SHIPROCKET_BASE_URL}/courier/track/awb/${encodeURIComponent(trackingNumber)}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  const text = await response.text();

  if (!response.ok) {
    return {
      carrier: "shiprocket",
      trackingNumber,
      status: response.status === 401 || response.status === 403 ? "needs_setup" : "exception",
      statusLabel:
        response.status === 401 || response.status === 403
          ? TRACKING_STATUS_META.needs_setup.label
          : TRACKING_STATUS_META.exception.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("shiprocket"),
      checkedAt,
      timeline: [],
      message: `Shiprocket tracking returned HTTP ${response.status}.`,
      nextAction: "Check the Shiprocket API user credentials or try again shortly.",
      rawSummary: text.slice(0, 300),
    };
  }

  try {
    return toTrackingResult(trackingNumber, JSON.parse(text), checkedAt);
  } catch {
    const status = normalizeTrackingStatus(text);
    return {
      carrier: "shiprocket",
      trackingNumber,
      status,
      statusLabel: TRACKING_STATUS_META[status].label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("shiprocket"),
      checkedAt,
      timeline: [],
      message:
        text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
        "Shiprocket returned a tracking response.",
      rawSummary: text.slice(0, 300),
    };
  }
}
