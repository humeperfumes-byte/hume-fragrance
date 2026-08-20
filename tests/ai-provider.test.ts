import assert from "node:assert/strict";
import test from "node:test";

import {
  fetchWithTimeout,
  getProviderAttempts,
  parseAiReportText,
  runAiProviderSequence,
  sanitizeAiPayload,
} from "../lib/ai/provider-core";
import {
  GEMINI_REPORT_JSON_SCHEMA,
  aiAnalyticsReportSchema,
} from "../lib/ai/report-schema";
import { shouldReuseCompletedAiReport } from "../lib/ai/report-policy";

function reportFixture() {
  const section = {
    headline: "No material change",
    summary: "The aggregate dataset has insufficient signal.",
    reasons: ["Only aggregate data was supplied."],
    actions: ["Continue monitoring."],
    metricRefs: ["sales.current.qualifiedOrders"],
    confidence: "low" as const,
  };

  return aiAnalyticsReportSchema.parse({
    executiveSummary: ["No material change."],
    risks: [],
    opportunities: [],
    recommendedActions: [],
    sections: {
      executive: section,
      sales: section,
      conversion: section,
      catalog: section,
      stock: section,
      customers: section,
      marketing: section,
      system: section,
    },
  });
}

test("sanitizes direct identifiers and redacts identifiers in strings", () => {
  const sanitized = sanitizeAiPayload({
    customerName: "Allowed aggregate label",
    email: "private@example.com",
    phone: "9876543210",
    nested: {
      sessionId: "secret-session",
      summary: "Contact private@example.com or +91 9876543210",
      count: 4,
    },
  }) as Record<string, unknown>;

  assert.equal("email" in sanitized, false);
  assert.equal("phone" in sanitized, false);
  assert.deepEqual(sanitized.nested, {
    summary: "Contact [redacted-email] or [redacted-phone]",
    count: 4,
  });
});

test("uses Gemini models in order before OpenRouter", async () => {
  const calls: string[] = [];
  const report = reportFixture();
  const result = await runAiProviderSequence({
    geminiModels: ["primary", "fallback"],
    openRouterModel: "router",
    callGemini: async (model) => {
      calls.push(`gemini:${model}`);
      throw new Error(`${model} unavailable`);
    },
    callOpenRouter: async (model) => {
      calls.push(`openrouter:${model}`);
      return { report, resolvedModel: "resolved-free-model" };
    },
  });

  assert.deepEqual(calls, ["gemini:primary", "gemini:fallback", "openrouter:router"]);
  assert.equal(result.provider, "openrouter");
  assert.equal(result.model, "resolved-free-model");
  assert.equal(result.attempts.length, 3);
});

test("preserves sanitized attempts when every provider fails", async () => {
  await assert.rejects(
    runAiProviderSequence({
      geminiModels: ["primary", "fallback"],
      openRouterModel: "router",
      callGemini: async () => {
        throw new Error("failed for private@example.com");
      },
      callOpenRouter: async () => {
        throw new Error("failed for 9876543210");
      },
    }),
    (error: unknown) => {
      const attempts = getProviderAttempts(error);
      assert.equal(attempts.length, 3);
      assert.match(attempts[0].error || "", /\[redacted-email\]/);
      assert.match(attempts[2].error || "", /\[redacted-phone\]/);
      return true;
    },
  );
});

test("rejects empty, malformed, and schema-invalid provider output", () => {
  assert.throws(() => parseAiReportText(""), /empty response/);
  assert.throws(() => parseAiReportText("not json"), SyntaxError);
  assert.throws(() => parseAiReportText('{"executiveSummary":[]}'));
});

test("aborts a provider request at the configured timeout", async () => {
  const neverCompletes = ((_url: string | URL | Request, init?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        reject(new DOMException("Timed out", "AbortError"));
      });
    })) as typeof fetch;

  await assert.rejects(
    fetchWithTimeout("https://example.test", {}, 5, neverCompletes),
    (error: unknown) => error instanceof DOMException && error.name === "AbortError",
  );
});

test("Gemini receives only its supported JSON Schema subset", () => {
  const serialized = JSON.stringify(GEMINI_REPORT_JSON_SCHEMA);
  assert.equal(serialized.includes("additionalProperties"), false);
  assert.equal(serialized.includes("minItems"), false);
  assert.equal(serialized.includes("maxItems"), false);
});

test("reuses only a recent completed report with the same aggregate hash", () => {
  const now = new Date("2026-08-20T10:00:00.000Z");
  const recent = {
    status: "completed",
    inputHash: "same-hash",
    createdAt: new Date("2026-08-20T09:50:00.000Z"),
  };
  assert.equal(shouldReuseCompletedAiReport(recent, "same-hash", now, 15 * 60_000), true);
  assert.equal(shouldReuseCompletedAiReport(recent, "changed-hash", now, 15 * 60_000), false);
  assert.equal(
    shouldReuseCompletedAiReport(
      { ...recent, createdAt: new Date("2026-08-20T09:40:00.000Z") },
      "same-hash",
      now,
      15 * 60_000,
    ),
    false,
  );
});
