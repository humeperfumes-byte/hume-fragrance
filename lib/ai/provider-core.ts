import {
  aiAnalyticsReportSchema,
  type AiAnalyticsReportContent,
} from "./report-schema";

export type AiProviderAttempt = {
  provider: "gemini" | "openrouter";
  model: string;
  error?: string;
};

export type AiProviderResult = {
  report: AiAnalyticsReportContent;
  provider: "gemini" | "openrouter";
  model: string;
  attempts: AiProviderAttempt[];
};

const FORBIDDEN_KEYS = new Set([
  "fullname",
  "phone",
  "alternatephone",
  "email",
  "addressline1",
  "addressline2",
  "address",
  "pincode",
  "ipaddress",
  "sessionid",
  "userid",
  "useragent",
  "notes",
  "contactinfo",
  "destination",
]);

function redactString(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(?:\+?91[-\s]?)?[6-9]\d{9}/g, "[redacted-phone]");
}

export function sanitizeAiPayload(value: unknown): unknown {
  if (typeof value === "string") return redactString(value);
  if (Array.isArray(value)) return value.map(sanitizeAiPayload);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !FORBIDDEN_KEYS.has(key.toLowerCase().replace(/[^a-z0-9]/g, "")))
      .map(([key, entry]) => [key, sanitizeAiPayload(entry)]),
  );
}

export function cleanProviderError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error || "Unknown provider error");
  return redactString(raw).replace(/(key=|bearer\s+)[^\s&]+/gi, "$1[redacted]").slice(0, 500);
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  fetcher: typeof fetch = fetch,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function parseAiReportText(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  if (!cleaned) throw new Error("Provider returned an empty response");
  return aiAnalyticsReportSchema.parse(JSON.parse(cleaned));
}

type ProviderSequenceOptions = {
  geminiModels: readonly string[];
  openRouterModel: string;
  callGemini: (model: string) => Promise<AiAnalyticsReportContent>;
  callOpenRouter: (
    model: string,
  ) => Promise<{ report: AiAnalyticsReportContent; resolvedModel: string }>;
};

export async function runAiProviderSequence({
  geminiModels,
  openRouterModel,
  callGemini,
  callOpenRouter,
}: ProviderSequenceOptions): Promise<AiProviderResult> {
  const attempts: AiProviderAttempt[] = [];

  for (const model of geminiModels) {
    try {
      const report = await callGemini(model);
      attempts.push({ provider: "gemini", model });
      return { report, provider: "gemini", model, attempts };
    } catch (error) {
      attempts.push({ provider: "gemini", model, error: cleanProviderError(error) });
    }
  }

  try {
    const result = await callOpenRouter(openRouterModel);
    attempts.push({ provider: "openrouter", model: result.resolvedModel });
    return {
      report: result.report,
      provider: "openrouter",
      model: result.resolvedModel,
      attempts,
    };
  } catch (error) {
    attempts.push({
      provider: "openrouter",
      model: openRouterModel,
      error: cleanProviderError(error),
    });
  }

  const finalError = new Error("All configured AI providers failed");
  Object.assign(finalError, { attempts });
  throw finalError;
}

export function getProviderAttempts(error: unknown): AiProviderAttempt[] {
  if (!error || typeof error !== "object" || !("attempts" in error)) return [];
  const attempts = (error as { attempts?: unknown }).attempts;
  return Array.isArray(attempts) ? (attempts as AiProviderAttempt[]) : [];
}
