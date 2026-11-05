import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { POST } from "../app/api/admin/session/route";

test("admin sign-in fails closed and returns JSON for rejected requests", async () => {
  const original = process.env.ADMIN_API_TOKEN;
  const request = (body: string, origin = "https://www.humefragrance.com") => new NextRequest("https://www.humefragrance.com/api/admin/session", {
    method: "POST", headers: { origin, "content-type": "application/json" }, body,
  });
  try {
    delete process.env.ADMIN_API_TOKEN;
    assert.equal((await POST(request('{"token":"anything"}'))).status, 503);
    process.env.ADMIN_API_TOKEN = "admin-session-test-only";
    assert.equal((await POST(request('{"token":"wrong"}', "https://example.invalid"))).status, 403);
    assert.equal((await POST(request("x".repeat(4097)))).status, 413);
    assert.equal((await POST(request("not-json"))).status, 400);
    assert.equal((await POST(request("{}"))).status, 400);
    const invalid = await POST(request('{"token":"wrong"}'));
    assert.equal(invalid.status, 401);
    assert.equal(invalid.headers.get("cache-control"), "private, no-store, max-age=0");
    assert.deepEqual(await invalid.json(), { success: false, error: "Invalid API Token" });
  } finally {
    if (original === undefined) delete process.env.ADMIN_API_TOKEN;
    else process.env.ADMIN_API_TOKEN = original;
  }
});
