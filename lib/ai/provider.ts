import "server-only";

import { AI_CONFIG } from "@/lib/ai/config";
import {
  fetchWithTimeout,
  getProviderAttempts,
  parseAiReportText,
  runAiProviderSequence,
  sanitizeAiPayload,
  type AiProviderAttempt,
  type AiProviderResult,
} from "@/lib/ai/provider-core";
import {
  AI_REPORT_JSON_SCHEMA,
  GEMINI_REPORT_JSON_SCHEMA,
} from "@/lib/ai/report-schema";

async function providerFailure(response: Response, label: string) {
  const raw = await response.text().catch(() => "");
  let detail = raw;
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } | string; message?: string };
    detail =
      (typeof parsed.error === "object" ? parsed.error?.message : parsed.error) ||
      parsed.message ||
      raw;
  } catch {
    // Keep the provider's plain-text error response when it is not JSON.
  }

  const suffix = detail.trim() ? `: ${detail.trim().slice(0, 320)}` : "";
  return new Error(`${label} failed with ${response.status}${suffix}`);
}

function buildPrompt(payload: unknown) {
  return [
    "You are the private business analyst for HUME Fragrance, an Indian ecommerce fragrance brand.",
    "Analyze only the supplied aggregated metrics. Never invent a value, customer fact, cause, or trend.",
    "Every recommendation must cite evidence from the payload in plain language.",
    "If a dataset has insufficient signal, say so and use low confidence.",
    "Treat revenue, order status, conversion and stock figures as authoritative and read-only.",
    "Return only JSON matching the supplied schema. Keep advice practical, concise and prioritized.",
    "The stock system may be frontend-only; never claim inventory quantities unless they appear in the payload.",
    `AGGREGATED_METRICS=${JSON.stringify(payload)}`,
  ].join("\n\n");
}

async function callGemini(model: string, prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Gemini is not configured");

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: GEMINI_REPORT_JSON_SCHEMA,
          maxOutputTokens: 8192,
        },
      }),
    },
    AI_CONFIG.requestTimeoutMs,
  );

  if (!response.ok) {
    throw await providerFailure(response, `Gemini ${model}`);
  }
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();
  return parseAiReportText(text || "");
}

async function callOpenRouter(model: string, prompt: string) {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OpenRouter is not configured");

  const response = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://humefragrance.com",
      "X-Title": "HUME Admin Analytics",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hume_admin_analytics_report",
          strict: true,
          schema: AI_REPORT_JSON_SCHEMA,
        },
      },
      max_tokens: 8192,
    }),
  }, AI_CONFIG.requestTimeoutMs);

  if (!response.ok) {
    throw await providerFailure(response, "OpenRouter");
  }
  const data = (await response.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string | Array<{ type?: string; text?: string }> } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  const text = Array.isArray(content)
    ? content.map((part) => part.text || "").join("")
    : content || "";
  return { report: parseAiReportText(text), resolvedModel: data.model || model };
}

export async function generateAiAnalyticsReport(payload: unknown): Promise<AiProviderResult> {
  const safePayload = sanitizeAiPayload(payload);
  const prompt = buildPrompt(safePayload);
  return runAiProviderSequence({
    geminiModels: [AI_CONFIG.primaryModel, AI_CONFIG.fallbackModel],
    openRouterModel: AI_CONFIG.providerFallbackModel,
    callGemini: (model) => callGemini(model, prompt),
    callOpenRouter: (model) => callOpenRouter(model, prompt),
  });
}

export { getProviderAttempts };
export type { AiProviderAttempt, AiProviderResult };
