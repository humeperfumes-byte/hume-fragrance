import {
  TRACKING_STATUS_META,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  normalizeTrackingStatus,
  type TrackingResult,
  type TrackingStatus,
} from "@/lib/tracking/carriers";

const PRODUCTION_BASE = "https://dale.shadowfax.in/api";
const STAGING_BASE = "https://dale.staging.shadowfax.in/api";
type Row = Record<string, unknown>;

function record(value: unknown): value is Row {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() || null : null;
}

function carrierTime(value: unknown): string | null {
  const time = text(value);
  if (!time) return null;
  // Offset-free local carrier timestamps are Indian Standard Time; preserve dates and explicit offsets.
  return /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(time)
    ? `${time.replace(" ", "T")}+05:30`
    : time;
}

export function isLikelyShadowfaxAwb(value: string): boolean {
  return /^SF[A-Z0-9]{6,30}$/.test(cleanTrackingNumber(value));
}

function shadowfaxStatus(code: unknown, display: unknown): TrackingStatus {
  const status = text(code)?.toLowerCase() || "";
  // Codes take precedence: RTS delivered means returned to seller, never customer delivery.
  if (/^(rto|rts)(_|$)/.test(status)) return "returned";
  if (["cid", "nc", "na", "on_hold", "lost", "cancelled", "canceled", "reopen_ndr"].includes(status)) return "exception";
  if (["new", "created", "allocated", "assigned", "pickup_scheduled"].includes(status)) return "pending";
  if (status === "picked") return "picked_up";
  if (/^(recd_at_|in_transit|dispatched|departed|arrived)/.test(status)) return "in_transit";
  if (status === "ofd") return "out_for_delivery";
  if (status === "delivered") return "delivered";
  return normalizeTrackingStatus(text(display) || status.replace(/_/g, " "));
}

async function readPayload(response: Response): Promise<unknown> {
  // One shipment should be small. Bound buffering even if the upstream sends an unexpected body.
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Empty tracking response");
  const decoder = new TextDecoder();
  let body = "", bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1024 * 1024) {
        await reader.cancel();
        throw new Error("Tracking response too large");
      }
      body += decoder.decode(value, { stream: true });
    }
    return JSON.parse(body + decoder.decode());
  } finally {
    reader.releaseLock();
  }
}

export async function trackShadowfaxAwb(value: string): Promise<TrackingResult> {
  const trackingNumber = cleanTrackingNumber(value);
  const checkedAt = new Date().toISOString();
  const result = (status: TrackingStatus, message: string, nextAction?: string): TrackingResult => ({
    carrier: "shadowfax", trackingNumber, status, statusLabel: TRACKING_STATUS_META[status].label,
    source: status === "needs_setup" ? "setup" : "api",
    officialUrl: getOfficialTrackingUrl("shadowfax"), checkedAt, timeline: [], message, nextAction,
  });
  if (!/^[A-Z0-9_-]{1,100}$/.test(trackingNumber)) return result("not_found", "Check the Shadowfax AWB number.");
  const token = process.env.SHADOWFAX_API_TOKEN?.trim();
  if (!token) return result("needs_setup", "Shadowfax API token is not configured yet.", "Add SHADOWFAX_API_TOKEN as a production Worker secret and deploy the change.");
  const base = (process.env.SHADOWFAX_API_BASE_URL?.trim() || PRODUCTION_BASE).replace(/\/+$/, "");
  // Prevent credentials being sent to a typo, proxy, or redirect destination.
  if (base !== PRODUCTION_BASE && base !== STAGING_BASE) {
    return result("needs_setup", "Shadowfax API base URL must be its official production or staging API address.");
  }
  try {
    const response = await fetch(`${base}/v4/clients/orders/${encodeURIComponent(trackingNumber)}/track/`, {
      method: "GET", headers: { accept: "application/json", Authorization: `Token ${token}` },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    });
    if (response.status === 401 || response.status === 403) return result("needs_setup", "Shadowfax authentication failed. Check that the token matches the production or staging server.");
    if (response.status === 404) return result("not_found", "No Shadowfax shipment was found for this AWB yet.");
    if (response.status === 429) return result("exception", "Shadowfax tracking is busy. Please retry in a minute.");
    if (!response.ok && response.status !== 400) return result("exception", "Shadowfax tracking is temporarily unavailable. Please retry shortly.");
    const payload = await readPayload(response);
    if (!record(payload)) return result("exception", "Shadowfax returned an unexpected tracking response.");
    if (response.status === 400) {
      return /invalid awb|not found|does not exist|no order/i.test(text(payload.message) || "")
        ? result("not_found", "No Shadowfax shipment was found for this AWB. Check the number and API environment.")
        : result("exception", "Shadowfax could not process this tracking request. Please check the AWB and retry.");
    }
    const order = record(payload.order_details) ? payload.order_details : null;
    if (!order) return result("not_found", "No Shadowfax shipment was found for this AWB yet.");
    if (cleanTrackingNumber(text(order.awb_number) || "") !== trackingNumber) {
      return result("exception", "Shadowfax returned a different shipment. Please retry or use the official tracker.");
    }
    const scans = (Array.isArray(payload.tracking_details) ? payload.tracking_details : [])
      .filter(record)
      .filter(scan => !text(scan.awb_number) || cleanTrackingNumber(text(scan.awb_number) || "") === trackingNumber)
      .map((scan, index) => ({
        label: text(scan.status) || text(scan.status_id)?.replace(/_/g, " ") || "Tracking update",
        location: text(scan.location), time: carrierTime(scan.created), description: text(scan.remarks), index,
        code: scan.status_id,
      }))
      .sort((a, b) => (Date.parse(b.time || "") || 0) - (Date.parse(a.time || "") || 0) || b.index - a.index);
    const latest = scans[0];
    const statusText = text(order.status_display) || text(order.status)?.replace(/_/g, " ") || latest?.label || "Unknown";
    const status = shadowfaxStatus(order.status || latest?.code, statusText);
    const delivery = record(order.delivery_details) ? order.delivery_details : null;
    return {
      ...result(status, statusText), lastScan: latest?.time || null, location: latest?.location || null,
      expectedDelivery: carrierTime(order.promised_delivery_date),
      // Exclude carrier contact details and raw payloads from public responses.
      destination: delivery && (text(delivery.city) || text(delivery.pincode)) ? {
        source: "carrier", label: "Destination", city: text(delivery.city), pincode: text(delivery.pincode), country: "India",
      } : null,
      timeline: scans.map(({ label, location, time, description }) => ({ label, location, time, description })),
    };
  } catch {
    return result("exception", "Unable to reach Shadowfax tracking right now. Please retry or use the official tracker.");
  }
}
