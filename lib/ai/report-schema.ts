import { z } from "zod";

export const AI_SECTION_KEYS = [
  "executive",
  "sales",
  "conversion",
  "catalog",
  "stock",
  "customers",
  "marketing",
  "system",
] as const;

export type AiSectionKey = (typeof AI_SECTION_KEYS)[number];

const prioritySchema = z.enum(["critical", "high", "medium", "low"]);
const insightSchema = z.object({
  title: z.string().min(1).max(140),
  evidence: z.array(z.string().min(1).max(220)).min(1).max(4),
  reason: z.string().min(1).max(600),
  action: z.string().min(1).max(600),
  priority: prioritySchema,
});

const sectionSchema = z.object({
  headline: z.string().min(1).max(160),
  summary: z.string().min(1).max(700),
  reasons: z.array(z.string().min(1).max(350)).max(5),
  actions: z.array(z.string().min(1).max(350)).max(5),
  metricRefs: z.array(z.string().min(1).max(160)).max(8),
  confidence: z.enum(["high", "medium", "low"]),
});

export const aiAnalyticsReportSchema = z.object({
  executiveSummary: z.array(z.string().min(1).max(350)).min(1).max(5),
  risks: z.array(insightSchema).max(8),
  opportunities: z.array(insightSchema).max(8),
  recommendedActions: z.array(insightSchema).max(10),
  sections: z.object({
    executive: sectionSchema,
    sales: sectionSchema,
    conversion: sectionSchema,
    catalog: sectionSchema,
    stock: sectionSchema,
    customers: sectionSchema,
    marketing: sectionSchema,
    system: sectionSchema,
  }),
});

export type AiAnalyticsReportContent = z.infer<typeof aiAnalyticsReportSchema>;
export type AiInsight = z.infer<typeof insightSchema>;

const insightJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "evidence", "reason", "action", "priority"],
  properties: {
    title: { type: "string" },
    evidence: { type: "array", minItems: 1, maxItems: 4, items: { type: "string" } },
    reason: { type: "string" },
    action: { type: "string" },
    priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
  },
} as const;

const sectionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "reasons", "actions", "metricRefs", "confidence"],
  properties: {
    headline: { type: "string" },
    summary: { type: "string" },
    reasons: { type: "array", maxItems: 5, items: { type: "string" } },
    actions: { type: "array", maxItems: 5, items: { type: "string" } },
    metricRefs: { type: "array", maxItems: 8, items: { type: "string" } },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
  },
} as const;

export const AI_REPORT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["executiveSummary", "risks", "opportunities", "recommendedActions", "sections"],
  properties: {
    executiveSummary: {
      type: "array",
      minItems: 1,
      maxItems: 5,
      items: { type: "string" },
    },
    risks: { type: "array", maxItems: 8, items: insightJsonSchema },
    opportunities: { type: "array", maxItems: 8, items: insightJsonSchema },
    recommendedActions: { type: "array", maxItems: 10, items: insightJsonSchema },
    sections: {
      type: "object",
      additionalProperties: false,
      required: [...AI_SECTION_KEYS],
      properties: Object.fromEntries(AI_SECTION_KEYS.map((key) => [key, sectionJsonSchema])),
    },
  },
} as const;

function toGeminiCompatibleSchema(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(toGeminiCompatibleSchema);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      // Gemini structured output supports a subset of JSON Schema. Zod remains the
      // authoritative validator for these bounds after the provider responds.
      .filter(([key]) => !["additionalProperties", "minItems", "maxItems"].includes(key))
      .map(([key, entry]) => [key, toGeminiCompatibleSchema(entry)]),
  );
}

export const GEMINI_REPORT_JSON_SCHEMA = toGeminiCompatibleSchema(AI_REPORT_JSON_SCHEMA);
