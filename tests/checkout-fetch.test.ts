import test from "node:test";
import assert from "node:assert/strict";
import { checkoutFetch } from "../lib/checkout-fetch";

test("Checkout timeout covers stalled headers and stalled response bodies without a retry", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  let requestSignal: AbortSignal | undefined;
  try {
    globalThis.fetch = async (_, init) => { calls++; requestSignal = init?.signal as AbortSignal; return new Promise<Response>(() => {}); };
    await assert.rejects(checkoutFetch("http://localhost/api/orders", { method: "POST" }, 20), /check its payment before retrying/);
    assert.equal(requestSignal?.aborted, true);
    assert.equal(calls, 1, "An ambiguous write must not be retried automatically");
    globalThis.fetch = async () => { calls++; return new Response(new ReadableStream({ start() { /* Server sends headers but never a body. */ } })); };
    await assert.rejects(checkoutFetch("http://localhost/api/create-order", {}, 20), /Checkout took too long/);
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
