import {
  TRACKING_STATUS_META,
  TrackingResult,
  TrackingTimelineItem,
  cleanTrackingNumber,
  getOfficialTrackingUrl,
  normalizeTrackingStatus,
} from "@/lib/tracking/carriers";

const INDIA_POST_ACTION_URL = "https://www.indiapost.gov.in/home";
const INDIA_POST_ACTION_ID =
  process.env.INDIA_POST_ACTION_ID ?? "7f04c72a185756a3940501a7996e6b83e2a72a488e";

type IndiaPostBookingDetails = {
  article_number?: string | null;
  article_type?: string | null;
  booking_date?: string | null;
  booking_office_name?: string | null;
  booking_pin?: string | null;
  destination_office_name?: string | null;
  destination_pincode?: string | null;
  destination_city?: string | null;
  weight_value?: string | null;
  tariff?: string | null;
  cod_amount?: string | null;
  source_country?: string | null;
  destination_country?: string | null;
  delivery_confirmed_on?: string | null;
};

type IndiaPostTrackingEvent = {
  event?: string | null;
  eventcode?: string | null;
  date?: string | null;
  time?: string | null;
  office?: string | null;
  remarks?: string | null;
};

type IndiaPostTrackingPayload = {
  data?: {
    booking_details?: IndiaPostBookingDetails | null;
    tracking_details?: IndiaPostTrackingEvent[] | null;
    del_status?: {
      del_status?: string | null;
    } | null;
  } | null;
  success?: boolean;
  message?: string | null;
  error?: string | null;
};

function extractRscActionPayload<T>(text: string): T {
  const line = text.split(/\r?\n/).find((entry) => entry.startsWith("1:"));
  if (!line) throw new Error("India Post did not return a tracking payload");

  return JSON.parse(line.slice(2)) as T;
}

function toIndiaPostEventLabel(event: IndiaPostTrackingEvent): string {
  const eventCode = event.eventcode ?? "";
  const eventText = event.event ?? "";
  const remarks = event.remarks ?? "";

  const eventMap: Record<string, string> = {
    ITEM_BOOK: "Item booked",
    BAG_CLOSE: "Item dispatched",
    BAG_DISPATCH: "Item dispatched",
    TMO_RECEIVE: "Item in transit",
    BAG_OPEN: "Item in transit",
    ITEM_INVOICE: "Item in transit",
    OUT_FOR_DELIVERY: "Out for delivery",
    ITEM_ONHOLD: remarks ? `Item on hold - ${remarks}` : "Item on hold",
    ITEM_REDIRECT: "Item redirected",
    ITEM_RETURN: remarks ? `Returned to sender - ${remarks}` : "Returned to sender",
    ITEM_DELIVERY: eventText.includes("(Sender)") ? "Returned to sender" : "Delivered",
  };

  return eventMap[eventCode] ?? eventText ?? "Tracking update";
}

function getEventStatus(event?: IndiaPostTrackingEvent | null): TrackingResult["status"] {
  if (!event) return "not_found";

  const eventCode = event.eventcode ?? "";
  const eventText = event.event ?? "";
  const remarks = event.remarks ?? "";

  if (eventCode === "ITEM_DELIVERY" && !eventText.includes("(Sender)")) return "delivered";
  if (eventCode === "OUT_FOR_DELIVERY") return "out_for_delivery";
  if (eventCode === "ITEM_RETURN" || eventText.includes("(Sender)")) return "returned";
  if (eventCode === "ITEM_ONHOLD") return "exception";
  if (eventCode === "ITEM_BOOK") return "picked_up";
  if (["BAG_CLOSE", "BAG_DISPATCH", "TMO_RECEIVE", "BAG_OPEN", "ITEM_INVOICE", "ITEM_REDIRECT"].includes(eventCode)) {
    return "in_transit";
  }

  return normalizeTrackingStatus(`${eventText} ${remarks}`);
}

function getEventTime(event: IndiaPostTrackingEvent): string | null {
  if (event.date && event.time) {
    const dateOnly = event.date.slice(0, 10);
    return `${dateOnly}T${event.time}`;
  }

  return event.date ?? null;
}

function sortEventsNewestFirst(events: IndiaPostTrackingEvent[]): IndiaPostTrackingEvent[] {
  return [...events].sort((a, b) => {
    const aTime = new Date(a.date ?? "").getTime();
    const bTime = new Date(b.date ?? "").getTime();
    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;
    return bTime - aTime;
  });
}

function toTimeline(events: IndiaPostTrackingEvent[]): TrackingTimelineItem[] {
  return sortEventsNewestFirst(events)
    .filter((event) => event.event || event.eventcode)
    .map((event) => ({
      label: toIndiaPostEventLabel(event),
      location: event.office?.trim() || null,
      time: getEventTime(event),
      description: event.remarks || null,
    }));
}

function toResult(
  trackingNumber: string,
  payload: IndiaPostTrackingPayload,
  checkedAt: string,
): TrackingResult {
  if (!payload.success && (payload.error || payload.message)) {
    throw new Error(payload.error || payload.message || "India Post tracking failed");
  }

  const data = payload.data;
  const booking = data?.booking_details;
  const events = Array.isArray(data?.tracking_details) ? data.tracking_details : [];
  const sortedEvents = sortEventsNewestFirst(events);
  const latestEvent = sortedEvents[0];
  const articleNumber = cleanTrackingNumber(booking?.article_number || trackingNumber);

  if (!booking?.article_number && !events.length) {
    return {
      carrier: "speed_post",
      trackingNumber: articleNumber,
      status: "not_found",
      statusLabel: TRACKING_STATUS_META.not_found.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("speed_post"),
      checkedAt,
      timeline: [],
      message:
        "No Speed Post booking was found yet. Please verify the tracking ID or check again after India Post receives the parcel.",
      nextAction: "Try again after handover to India Post.",
      rawSummary: JSON.stringify(payload).slice(0, 300),
    };
  }

  const status = getEventStatus(latestEvent);
  const destination = [booking?.destination_office_name, booking?.destination_pincode]
    .filter(Boolean)
    .join(" - ");

  return {
    carrier: "speed_post",
    trackingNumber: articleNumber,
    status,
    statusLabel: TRACKING_STATUS_META[status].label,
    source: "api",
    officialUrl: getOfficialTrackingUrl("speed_post"),
    checkedAt,
    lastScan: latestEvent ? getEventTime(latestEvent) : booking?.booking_date ?? null,
    location: latestEvent?.office?.trim() || booking?.booking_office_name || null,
    expectedDelivery: booking?.delivery_confirmed_on ?? null,
    timeline: toTimeline(events),
    message: latestEvent
      ? toIndiaPostEventLabel(latestEvent)
      : `Booked at ${booking?.booking_office_name || "India Post"}`,
    nextAction: destination ? `Destination: ${destination}` : null,
    rawSummary: JSON.stringify(payload).slice(0, 300),
  };
}

export function isValidSpeedPostConsignment(value: string): boolean {
  const trackingNumber = cleanTrackingNumber(value);
  return /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(trackingNumber) && !(trackingNumber.startsWith("WT") && trackingNumber.endsWith("IN"));
}

export async function trackSpeedPostConsignment(value: string): Promise<TrackingResult> {
  const trackingNumber = cleanTrackingNumber(value);
  const checkedAt = new Date().toISOString();

  if (!isValidSpeedPostConsignment(trackingNumber)) {
    return {
      carrier: "speed_post",
      trackingNumber,
      status: "unknown",
      statusLabel: TRACKING_STATUS_META.unknown.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("speed_post"),
      checkedAt,
      timeline: [],
      message: "Enter a valid Speed Post consignment number, for example AA123456789IN.",
      nextAction: "Check the tracking ID and try again.",
    };
  }

  const response = await fetch(INDIA_POST_ACTION_URL, {
    method: "POST",
    headers: {
      accept: "text/x-component",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": INDIA_POST_ACTION_ID,
      "user-agent": "Mozilla/5.0 HUME-Fragrance/1.0",
    },
    body: JSON.stringify(["ARTICLE_TRACKING_URL", "GET", null, trackingNumber]),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`India Post tracking returned HTTP ${response.status}`);
  }

  const text = await response.text();
  const payload = extractRscActionPayload<IndiaPostTrackingPayload>(text);
  return toResult(trackingNumber, payload, checkedAt);
}
