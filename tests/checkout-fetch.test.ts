import test from "node:test";
import assert from "node:assert/strict";
import { checkoutFetch } from "../lib/checkout-fetch";

test("Checkout timeout covers stalled headers and stalled response bodies without a retry", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  let requestSignal: AbortSignal | undefined;
  try {
    globalThis.fetch = async (_, init) => { calls++; requestSignal = init?.signal as AbortSignal; return new Promise<Response>(() => {}); };
    await assert.rejects(checkoutFetch("http://localhost/api/orders", { method: "POST" }, 20), /tap Place Order to try again/);
    assert.equal(requestSignal?.aborted, true);
    assert.equal(calls, 1, "An ambiguous write must not be retried automatically");
    globalThis.fetch = async () => { calls++; return new Response(new ReadableStream({ start() { /* Server sends headers but never a body. */ } })); };
    await assert.rejects(checkoutFetch("http://localhost/api/create-order", {}, 20), /connection took too long/);
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; }
});

test("Successful and rejected checkout responses retain status and JSON", async () => {
  const original = globalThis.fetch;
  try {
    for (const status of [200, 409]) {
      globalThis.fetch = async () => Response.json({ ok: status === 200 }, { status });
      const response = await checkoutFetch("http://localhost/api/orders", {}, 100);
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { ok: status === 200 });
    }
  } finally { globalThis.fetch = original; }
});

test("Account timeout uses its own retry message for a stalled response body", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(new ReadableStream({ start() {} }));
    await assert.rejects(checkoutFetch("http://localhost/api/account", {}, 20, "Your account took too long to load. Please try again."), /Your account took too long to load/);
  } finally { globalThis.fetch = original; }
});
