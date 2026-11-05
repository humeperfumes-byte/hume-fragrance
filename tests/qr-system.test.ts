import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeQrDestination, qrBrowser, qrDevice } from "../lib/qr-system";
test("routes and query/hash destinations survive normalization", () => {
  assert.equal(
    normalizeQrDestination("/perfumes?utm_source=pack#rose"),
    "https://www.humefragrance.com/perfumes?utm_source=pack#rose",
  );
  assert.equal(
    normalizeQrDestination("https://example.com/offer?a=1#details"),
    "https://example.com/offer?a=1#details",
  );
});
test("unsafe, ambiguous and recursive destinations are rejected", () => {
  for (const value of [
    "",
    "javascript:alert(1)",
    "//example.com",
    "perfumes",
    "https://user:password@example.com",
    "/q/abc",
    "/admin/orders",
    "/api/orders",
    "/us/q/abc",
    "/%71/abc",
    "/us/admin/orders",
    "https://www.humefragrance.com/q/test",
  ])
    assert.throws(() => normalizeQrDestination(value), value);
});
test("devices and browser families do not retain raw user agents", () => {
  assert.equal(qrDevice("Googlebot"), "bot");
  assert.equal(qrDevice("Mozilla iPhone Mobile"), "Mobile");
  assert.equal(qrDevice("iPad Safari"), "Tablet");
  assert.equal(qrBrowser("Chrome/123 Edg/123"), "Edge");
  assert.equal(qrBrowser("Version/17 Safari/600"), "Safari");
});

// CSV exports quote text and prevent spreadsheet formulas from executing.
test("CSV exports use UTC and neutralize spreadsheet formulas", async () => {
  const { qrScanCsv } = await import("../lib/qr-system");
  const csv = qrScanCsv([
    {
      scanned_at: "2026-10-31T10:00:00Z",
      device: "Mobile",
      browser: "Other",
      referrer_host: "=SUM(1,2)",
    },
  ]);
  assert.ok(csv.includes("2026-10-31T10:00:00.000Z"));
  assert.ok(csv.includes('"\'=SUM(1,2)"'));
  assert.equal(csv.split("\r\n").length, 2);
});
