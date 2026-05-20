export const TRACKING_CARRIERS = {
  speed_post: {
    label: "India Post Speed Post",
    shortLabel: "Speed Post",
    codeLabel: "Consignment number",
    officialUrl: "https://www.indiapost.gov.in/home#trackandtrace",
    accent: "from-amber-400 to-orange-500",
    tone: "text-amber-200",
    envKeys: ["Official India Post Track N Trace"],
    hint: "Usually starts with two letters and ends with IN.",
  },
  delhivery: {
    label: "Delhivery",
    shortLabel: "Delhivery",
    codeLabel: "AWB / tracking ID",
    officialUrl: "https://www.delhivery.com/tracking",
    accent: "from-sky-400 to-cyan-500",
    tone: "text-sky-200",
    envKeys: ["DELHIVERY_TRACKING_ENDPOINT", "DELHIVERY_API_TOKEN"],
    hint: "Usually a 12-14 digit AWB number.",
  },
  bluedart: {
    label: "Blue Dart",
    shortLabel: "Blue Dart",
    codeLabel: "Waybill / reference number",
    officialUrl: "https://www.bluedart.com/tracking",
    accent: "from-blue-500 to-indigo-500",
    tone: "text-blue-200",
    envKeys: ["BLUEDART_TRACKING_ENDPOINT", "BLUEDART_API_TOKEN"],
    hint: "Track by waybill or reference number.",
  },
} as const;

export type TrackingCarrier = keyof typeof TRACKING_CARRIERS;

export const TRACKING_STATUS_META = {
  delivered: {
    label: "Delivered",
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  },
  out_for_delivery: {
    label: "Out for delivery",
    className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
  },
  in_transit: {
    label: "In transit",
    className: "border-blue-400/25 bg-blue-400/10 text-blue-200",
  },
  picked_up: {
    label: "Picked up",
    className: "border-violet-400/25 bg-violet-400/10 text-violet-200",
  },
  pending: {
    label: "Pending",
    className: "border-white/15 bg-white/[0.06] text-white/70",
  },
  exception: {
    label: "Needs attention",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  },
  returned: {
    label: "RTO / returned",
    className: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  },
  manual_check: {
    label: "Open official tracker",
    className: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  },
  not_found: {
    label: "Not found yet",
    className: "border-amber-400/25 bg-amber-400/10 text-amber-200",
  },
  needs_setup: {
    label: "API setup needed",
    className: "border-white/15 bg-white/[0.06] text-white/65",
  },
  unknown: {
    label: "Unknown",
    className: "border-white/15 bg-white/[0.04] text-white/55",
  },
} as const;

export type TrackingStatus = keyof typeof TRACKING_STATUS_META;

export type TrackingTimelineItem = {
  label: string;
  location?: string | null;
  time?: string | null;
  description?: string | null;
};

export type TrackingResult = {
  carrier: TrackingCarrier;
  trackingNumber: string;
  status: TrackingStatus;
  statusLabel: string;
  source: "api" | "official_link" | "manual" | "setup";
  officialUrl: string;
  checkedAt: string;
  lastScan?: string | null;
  location?: string | null;
  expectedDelivery?: string | null;
  timeline: TrackingTimelineItem[];
  message: string;
  nextAction?: string | null;
  rawSummary?: string | null;
};

export function isTrackingCarrier(value: unknown): value is TrackingCarrier {
  return typeof value === "string" && value in TRACKING_CARRIERS;
}

export function cleanTrackingNumber(value: string): string {
  return value.trim().replace(/\s+/g, "").toUpperCase();
}

export function getOfficialTrackingUrl(carrier: TrackingCarrier): string {
  return TRACKING_CARRIERS[carrier].officialUrl;
}

export function normalizeTrackingStatus(value: unknown): TrackingStatus {
  const status = String(value ?? "").toLowerCase();

  if (/(delivered|success|complete)/.test(status)) return "delivered";
  if (/(out\s*for\s*delivery|ofd|delivery\s*out)/.test(status)) return "out_for_delivery";
  if (/(in\s*transit|transit|dispatched|forwarded|arrived|departed|bagged|manifested)/.test(status)) {
    return "in_transit";
  }
  if (/(picked|pickup|collected|booked|accepted|received)/.test(status)) return "picked_up";
  if (/(rto|return|returned)/.test(status)) return "returned";
  if (/(failed|exception|hold|undelivered|lost|damaged|delay|rejected)/.test(status)) return "exception";
  if (/(pending|ready|created|not\s*found|awaiting)/.test(status)) return "pending";

  return "unknown";
}
