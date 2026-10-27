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

  const entries=Object.entries(value);
  for (const hint of keyHints.map(normalizeKey)) {
    const entry=entries.find(([key,child])=>normalizeKey(key)===hint&&(typeof child==='string'||typeof child==='number'));
    if(entry){const text=String(entry[1]).trim();if(text)return text;}
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

function getShipmentPayload(payload: unknown, trackingNumber:string): unknown {
  if (!isRecord(payload)) return payload;

  const shipmentData = payload.ShipmentData;
  if (Array.isArray(shipmentData)) {
    return shipmentData.map(entry=>isRecord(entry)?entry.Shipment??entry:null).find(entry=>isRecord(entry)&&cleanTrackingNumber(pickString(entry,['AWB','waybill','trackingnumber'])||'')===trackingNumber)??null;
  }

  if ("Shipment" in payload) return payload.Shipment;
  return payload;
}

function getScanDetail(scan: unknown): UnknownRecord | null {
  if (!isRecord(scan)) return null;
  const detail = scan.ScanDetail ?? scan.Scan ?? scan;
  return isRecord(detail) ? detail : scan;
}

function carrierTime(value:string|null):string|null {
  if(!value)return null;
  // Delhivery scan timestamps without an offset are India Standard Time.
  return /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)?value.replace(' ','T')+'+05:30':value;
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
      const time = carrierTime(pickString(detail, ["scandatetime", "statusdatetime", "datetime", "date", "time"]));

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
    });
}

function getCarrierDestination(shipment: unknown): TrackingDestination | null {
  const city=pickString(shipment,['DestinationCity','Destination']);
  const state=pickString(shipment,['DestinationState']);
  const pincode=pickString(shipment,['DestinationPincode','DestinationPin']);
  if(!city&&!state&&!pincode)return null;
  return {source:'carrier',label:'Delivery destination',city,state,pincode,country:'India'};
}

function buildDelhiveryEndpoint(trackingNumber:string):string {
  const template=process.env.DELHIVERY_TRACKING_ENDPOINT?.trim()||DEFAULT_DELHIVERY_TRACKING_ENDPOINT;
  const url=new URL(template.replace(/\{(?:trackingNumber|waybill|awb)\}/g,encodeURIComponent(trackingNumber)));
  if(url.protocol!=='https:')throw new Error('HTTPS is required');
  url.searchParams.delete('token');
  url.searchParams.set('waybill',trackingNumber);
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
  const shipment = getShipmentPayload(payload,trackingNumber);
  const awb = cleanTrackingNumber(deepPickString(shipment, ["awb", "waybill", "trackingnumber"]) ?? trackingNumber);
  const timeline = parseTimeline(shipment);
  const current=isRecord(shipment)&&isRecord(shipment.Status)?shipment.Status:null;
  const statusText=pickString(current,['Status','Instructions'])??pickString(shipment,['CurrentStatus','LatestStatus','ShipmentStatus','Status'])??timeline[0]?.label??'Unknown';
  const statusType=pickString(current,['StatusType']);
  const status=statusType==='RT'?'returned':statusType==='DL'?'delivered':/^dispatched$/i.test(statusText)?'out_for_delivery':normalizeTrackingStatus(statusText);
  const lastScan=carrierTime(pickString(current,['StatusDateTime']))??timeline[0]?.time??null;
  const location=pickString(current,['StatusLocation'])??timeline[0]?.location??null;

  if (!isRecord(shipment) || (!timeline.length && status === "unknown")) {

    return {
      carrier: "delhivery",
      trackingNumber: awb,
      status: "not_found",
      statusLabel: TRACKING_STATUS_META.not_found.label,
      source: "api",
      officialUrl: getOfficialTrackingUrl("delhivery"),
      checkedAt,
      timeline: [],
      message: "No Delhivery shipment was found for this AWB yet.",
      nextAction: "Check the AWB or try again after Delhivery receives the shipment.",
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
    expectedDelivery: carrierTime(pickString(shipment, ["ExpectedDeliveryDate", "ExpectedDate", "PromisedDeliveryDate", "EDD", "DeliveryDate"])),
    timeline,
    message: statusText,
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

  const failure=(message:string,status:TrackingResult['status']='exception'):TrackingResult=>({carrier:'delhivery',trackingNumber,status,statusLabel:TRACKING_STATUS_META[status].label,source:'api',officialUrl:getOfficialTrackingUrl('delhivery'),checkedAt,timeline:[],message});
  try {
    const response=await fetch(buildDelhiveryEndpoint(trackingNumber),{
      method:'GET',headers:{accept:'application/json',Authorization:`Token ${token}`},
      next:{revalidate:60},signal:AbortSignal.timeout(12000),
    });
    if(response.status===401||response.status===403)return failure('Delhivery authentication needs to be checked.','needs_setup');
    if(response.status===404)return failure('No Delhivery shipment was found for this AWB yet.','not_found');
    if(response.status===429)return failure('Carrier tracking is busy. Please try again in a minute.');
    if(!response.ok)return failure('Carrier tracking is temporarily unavailable. Please try again shortly.');
    return toTrackingResult(trackingNumber,await response.json(),checkedAt);
  } catch {
    return failure('Unable to reach Delhivery right now. Please try again shortly or use the official tracker.');
  }
}
