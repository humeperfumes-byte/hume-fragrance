export const SAFE_ERROR_CODES = ["ORDER_SAVE_FAILED", "PAID_ORDER_SAVE_FAILED", "DRAFT_SAVE_FAILED", "PAYMENT_VERIFY_FAILED", "PAYMENT_PROVIDER_FAILED", "CUSTOMER_LINK_FAILED", "CHECKOUT_RESUME_FAILED"] as const;
export type SafeErrorCode = typeof SAFE_ERROR_CODES[number];
export const SAFE_FAILURE_OPERATIONS = ["start", "draft", "order"] as const;
export const SAFE_FAILURE_STAGES = ["session", "prepare", "persist", "transaction", "response"] as const;
export const SAFE_FAILURE_CATEGORIES = ["database_timeout", "database_lock", "database_conflict", "database_unavailable", "database_error", "connection_error", "service_unavailable", "unexpected_error"] as const;
const SQL_STATES = ["55P03", "57014", "40001", "40P01", "23505", "23503", "23502", "22P02", "22003", "42703", "42P01", "08000", "08001", "08003", "08006", "53300", "57P01", "57P02", "57P03"] as const;
export type SafeErrorDetails = {
  operation?: typeof SAFE_FAILURE_OPERATIONS[number];
  stage?: typeof SAFE_FAILURE_STAGES[number];
  category?: typeof SAFE_FAILURE_CATEGORIES[number];
  sqlState?: typeof SQL_STATES[number];
};
export type SafeErrorContext = SafeErrorDetails & { requestReference?: string };
export type SafeErrorEvent = { code: SafeErrorCode; reference: string; occurredAt: string; details?: SafeErrorDetails };
const requestUuid = (value: unknown) => typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value) ? value : null;

export function shouldRecordSafeError(recent: Map<string, number>, code: SafeErrorCode, context?: SafeErrorContext, now = Date.now()): boolean {
  const reference = requestUuid(context?.requestReference);
  const key = reference ? `${code}:${reference}` : code;
  const previous = recent.get(key);
  if (previous !== undefined && now - previous < 5000) return false;
  // A failure storm must not flood the application's database or alert destination.
  let burst = 0;
  for (const at of recent.values()) if (now - at < 5000) burst++;
  if (burst >= 20) return false;
  recent.set(key, now);
  if (recent.size > 1000) {
    for (const [entry, at] of recent) if (now - at >= 5000) recent.delete(entry);
    while (recent.size > 1000) recent.delete(recent.keys().next().value!);
  }
  return true;
}

export function safeErrorDetails(input?: unknown): SafeErrorDetails {
  if (!input || typeof input !== "object") return {};
  const value = input as Record<string, unknown>;
  const result: SafeErrorDetails = {};
  if (SAFE_FAILURE_OPERATIONS.includes(value.operation as SafeErrorDetails["operation"] & string)) result.operation = value.operation as SafeErrorDetails["operation"];
  if (SAFE_FAILURE_STAGES.includes(value.stage as SafeErrorDetails["stage"] & string)) result.stage = value.stage as SafeErrorDetails["stage"];
  if (SAFE_FAILURE_CATEGORIES.includes(value.category as SafeErrorDetails["category"] & string)) result.category = value.category as SafeErrorDetails["category"];
  if (SQL_STATES.includes(value.sqlState as typeof SQL_STATES[number])) result.sqlState = value.sqlState as typeof SQL_STATES[number];
  return result;
}

export function classifySafeFailure(error: unknown): SafeErrorDetails {
  let cause = error;
  for (let depth = 0; cause && typeof cause === "object" && depth < 4; depth++) {
    const { code, cause: next } = cause as { code?: unknown; cause?: unknown };
    const { sqlState } = safeErrorDetails({ sqlState: code });
    if (sqlState) {
      const category = sqlState === "57014" ? "database_timeout" : sqlState === "55P03" || sqlState === "40P01" ? "database_lock" : ["40001", "23505", "23503", "23502"].includes(sqlState) ? "database_conflict" : /^(08|53|57P)/.test(sqlState) ? "database_unavailable" : "database_error";
      return { category, sqlState };
    }
    if (typeof code === "string" && ["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "CONNECT_TIMEOUT", "CONNECTION_CLOSED"].includes(code)) return { category: "connection_error" };
    cause = next;
  }
  const status = error && typeof error === "object" && "status" in error ? error.status : undefined;
  return { category: typeof status === "number" && status >= 500 && status <= 599 ? "service_unavailable" : "unexpected_error" };
}

export async function persistSafeErrorWithLegacyFallback(event: SafeErrorEvent, detailed: (event: SafeErrorEvent) => Promise<unknown>, legacy: (event: SafeErrorEvent) => Promise<unknown>) {
  try { await detailed(event); }
  catch (error) {
    if (classifySafeFailure(error).sqlState !== "42703") throw error;
    await legacy(event);
  }
}

// Only fixed enums and a random request UUID are retained. Never include an error message.
export function makeSafeErrorEvent(code: SafeErrorCode, context?: SafeErrorContext): SafeErrorEvent {
  if (!SAFE_ERROR_CODES.includes(code)) throw new Error("Unknown monitoring event");
  const reference = requestUuid(context?.requestReference) || crypto.randomUUID();
  const details = safeErrorDetails(context);
  return { code, reference, occurredAt: new Date().toISOString(), ...(Object.keys(details).length ? { details } : {}) };
}

export async function deliverSafeError(code: SafeErrorCode, enabled: boolean, sink: (event: SafeErrorEvent) => unknown | Promise<unknown>, context?: SafeErrorContext): Promise<void> {
  if (!enabled) return;
  try { await sink(makeSafeErrorEvent(code, context)); } catch { /* Monitoring cannot change checkout outcomes. */ }
}
