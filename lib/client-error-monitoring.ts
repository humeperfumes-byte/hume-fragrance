import type { SafeErrorCode } from "./safe-error-monitoring";
export function reportCheckoutError(code: SafeErrorCode) {
  try {
    void fetch("/api/diagnostics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }), signal: AbortSignal.timeout(3000) }).catch(() => {});
  } catch { /* Best effort; no customer details are transmitted. */ }
}
