import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { NextRequest } from "next/server";
import { trackShadowfaxAwb, isLikelyShadowfaxAwb } from "../lib/tracking/shadowfax";
import { isTrackingCarrier } from "../lib/tracking/carriers";
import { POST } from "../app/api/admin/tracking/route";

const originalFetch = globalThis.fetch;
const originalEnv = { token: process.env.SHADOWFAX_API_TOKEN, base: process.env.SHADOWFAX_API_BASE_URL, admin: process.env.ADMIN_API_TOKEN };
const awb = "SF1234567890";
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries({ SHADOWFAX_API_TOKEN: originalEnv.token, SHADOWFAX_API_BASE_URL: originalEnv.base, ADMIN_API_TOKEN: originalEnv.admin })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
function shipment(order: Record<string, unknown> = {}, tracking?: unknown[]) {
  return {
    message: "Success",
    order_details: {
      awb_number: awb, status: "recd_at_fwd_hub", status_display: "Received At Forward Hub",
      promised_delivery_date: "2026-11-08", client_name: "private client",
      delivery_details: { name: "private name", contact: "private phone", address_line_1: "private street", city: "Delhi", pincode: "110001" },
      ...order,
    },
    tracking_details: tracking ?? [
      { awb_number: awb, status_id: "picked", status: "Picked Up", location: "Origin", created: "2026-11-05T10:00:00Z", remarks: "Collected from seller" },
      { awb_number: awb, status_id: "recd_at_fwd_hub", status: "Received At Forward Hub", location: "Delhi Hub", created: "2026-11-06T10:00:00Z", remarks: "At destination hub" },
    ],
  };
}
function mock(payload: unknown = shipment(), status = 200) {
  process.env.SHADOWFAX_API_TOKEN = "mock-secret";
  delete process.env.SHADOWFAX_API_BASE_URL;
  globalThis.fetch = async () => Response.json(payload, { status });
}

test("Shadowfax carrier detection recognizes its AWB and carrier ID", () => {
  assert.equal(isTrackingCarrier("shadowfax"), true);
  assert.equal(isLikelyShadowfaxAwb(" sf44263941065 "), true);
  assert.equal(isLikelyShadowfaxAwb("54682010000022"), false);
  assert.equal(isLikelyShadowfaxAwb("AB123456789IN"), false);
});

test("missing token and invalid AWBs do not call the carrier", async () => {
  delete process.env.SHADOWFAX_API_TOKEN;
  globalThis.fetch = async () => { throw new Error("must not call"); };
  assert.equal((await trackShadowfaxAwb(awb)).status, "needs_setup");
  assert.equal((await trackShadowfaxAwb("../private")).status, "not_found");
});

test("production request uses header authentication, timeout and no redirects", async () => {
  mock();
  globalThis.fetch = async (input, options) => {
    assert.equal(String(input), `https://dale.shadowfax.in/api/v4/clients/orders/${awb}/track/`);
    assert.equal(new Headers(options?.headers).get("Authorization"), "Token mock-secret");
    assert.equal(options?.cache, "no-store");
    assert.equal(options?.redirect, "error");
    assert.ok(options?.signal);
    assert.equal(String(input).includes("mock-secret"), false);
    return Response.json(shipment());
  };
  const result = await trackShadowfaxAwb(awb.toLowerCase());
  assert.equal(result.status, "in_transit");
  assert.equal(result.location, "Delhi Hub");
  assert.equal(result.expectedDelivery, "2026-11-08");
  assert.equal(result.lastScan, "2026-11-06T10:00:00Z");
  assert.equal(result.timeline[0].label, "Received At Forward Hub");
  assert.equal(result.timeline[1].description, "Collected from seller");
  assert.equal(result.destination?.city, "Delhi");
  assert.equal(result.rawSummary, undefined);
  assert.doesNotMatch(JSON.stringify(result), /private name|private phone|private street|private client/);
});

test("sandbox is explicit and credentials cannot go to an arbitrary host", async () => {
  mock();
  process.env.SHADOWFAX_API_BASE_URL = "https://dale.staging.shadowfax.in/api/";
  let calls = 0;
  globalThis.fetch = async input => { calls++; assert.ok(String(input).startsWith("https://dale.staging.shadowfax.in/api/")); return Response.json(shipment()); };
  assert.equal((await trackShadowfaxAwb(awb)).status, "in_transit");
  process.env.SHADOWFAX_API_BASE_URL = "https://example.invalid/api";
  assert.equal((await trackShadowfaxAwb(awb)).status, "needs_setup");
  assert.equal(calls, 1);
});

test("Shadowfax codes preserve delivery failures, pending states and return-to-seller outcomes", async () => {
  const cases = {
    new: "pending", allocated: "pending", picked: "picked_up", recd_at_fwd_hub: "in_transit", ofd: "out_for_delivery",
    delivered: "delivered", cid: "exception", nc: "exception", na: "exception", on_hold: "exception", lost: "exception",
    reopen_ndr: "exception", cancelled: "exception", rts: "returned", rts_d: "returned", rto_d: "returned",
  };
  for (const [status, expected] of Object.entries(cases)) {
    mock(shipment({ status, status_display: "Delivered" }));
    assert.equal((await trackShadowfaxAwb(awb)).status, expected, status);
  }
});

test("history is complete, sorted, scoped to AWB, and offset-free timestamps use IST", async () => {
  const events = Array.from({ length: 16 }, (_, index) => ({
    awb_number: awb, status: "In Transit", status_id: "recd_at_fwd_hub", created: `2026-10-${String(index + 1).padStart(2, "0")} 12:00:00`,
  }));
  mock(shipment({}, [...events, { awb_number: "OTHER", status: "Delivered", created: "2026-11-06T10:00:00Z" }]));
  const result = await trackShadowfaxAwb(awb);
  assert.equal(result.timeline.length, 16);
  assert.equal(result.lastScan, "2026-10-16T12:00:00+05:30");
  assert.ok(result.timeline.every(item => item.label === "In Transit"));
});

test("empty, mismatched and malformed payloads cannot report another parcel as delivered", async () => {
  for (const payload of [{ message: "Success" }, { order_details: null }, shipment({ awb_number: "OTHER", status: "delivered" })]) {
    mock(payload);
    assert.notEqual((await trackShadowfaxAwb(awb)).status, "delivered");
  }
  mock();
  globalThis.fetch = async () => new Response("<!DOCTYPE html>private upstream failure");
  const result = await trackShadowfaxAwb(awb);
  assert.equal(result.status, "exception");
  assert.doesNotMatch(JSON.stringify(result), /private upstream failure/);
});

test("authentication, AWB, throttling and upstream errors return safe messages", async () => {
  for (const [code, expected] of [[401, "needs_setup"], [403, "needs_setup"], [404, "not_found"], [429, "exception"], [500, "exception"]] as const) {
    mock({ message: "private provider response" }, code);
    const result = await trackShadowfaxAwb(awb);
    assert.equal(result.status, expected);
    assert.doesNotMatch(JSON.stringify(result), /private provider response/);
  }
  mock({ message: "Invalid AWB Number" }, 400);
  assert.equal((await trackShadowfaxAwb(awb)).status, "not_found");
  mock({ message: "Invalid Request" }, 400);
  assert.equal((await trackShadowfaxAwb(awb)).status, "exception");
  globalThis.fetch = async () => { throw new Error("private URL with token"); };
  assert.doesNotMatch(JSON.stringify(await trackShadowfaxAwb(awb)), /private URL/);
});

test("oversized carrier responses are cancelled", async () => {
  mock();
  let cancelled = false;
  globalThis.fetch = async () => new Response(new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array(1024 * 1024 + 1)); }, cancel() { cancelled = true; },
  }));
  assert.equal((await trackShadowfaxAwb(awb)).status, "exception");
  assert.equal(cancelled, true);
});

test("authenticated admin lookup dispatches Shadowfax and reports provider setup", async () => {
  mock();
  process.env.ADMIN_API_TOKEN = "mock-admin";
  const request = (token: string) => new NextRequest("https://www.humefragrance.com/api/admin/tracking", {
    method: "POST", headers: { "content-type": "application/json", "x-admin-token": token },
    body: JSON.stringify({ carrier: "shadowfax", trackingNumbers: [awb, awb] }),
  });
  assert.equal((await POST(request("wrong"))).status, 401);
  const response = await POST(request("mock-admin"));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.providerSetup.shadowfax, true);
  assert.equal(body.results.length, 1);
  assert.equal(body.results[0].carrier, "shadowfax");
  assert.equal(body.results[0].status, "in_transit");
  assert.doesNotMatch(JSON.stringify(body), /mock-secret/);
});
