import type { NextResponse } from "next/server";

// Record only fixed stage names and elapsed times. Never log request bodies,
// checkout capabilities, provider credentials, or database error messages.
export function checkoutRequestTiming(operation: "start" | "draft" | "order") {
  const started = performance.now();
  let stage = "session";
  let stageStarted = started;
  const timings: { stage: string; ms: number }[] = [];
  function mark(next: "prepare" | "persist" | "transaction" | "response") {
    const now = performance.now();
    timings.push({ stage, ms: Math.round(now - stageStarted) });
    stage = next;
    stageStarted = now;
  }
  function finish(response: NextResponse) {
    const now = performance.now();
    timings.push({ stage, ms: Math.round(now - stageStarted) });
    const durationMs = Math.round(now - started);
    response.headers.set("Server-Timing", [...timings.map(t => `${t.stage};dur=${t.ms}`), `total;dur=${durationMs}`].join(", "));
    if (durationMs >= 3000 || response.status >= 500) {
      console.warn("checkout_request_timing", { operation, region: process.env.VERCEL_REGION || "local", status: response.status, durationMs, timings });
    }
    return response;
  }
  return { mark, finish };
}
