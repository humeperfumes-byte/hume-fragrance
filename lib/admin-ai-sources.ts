export type AdminAttributionRow = {
  acquisitionSource?: string | null;
  acquisitionCategory?: string | null;
  acquisitionReferrerHost?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  path?: string | null;
  userAgent?: string | null;
};

export type AdminSourceKey =
  | "chatgpt"
  | "perplexity"
  | "gemini"
  | "copilot"
  | "google"
  | "bing"
  | "instagram"
  | "whatsapp"
  | "direct"
  | "other";

export type AdminSourceGroup = {
  key: AdminSourceKey;
  label: string;
  tone: string;
  isAi: boolean;
};

export const ADMIN_SOURCE_GROUPS: Record<AdminSourceKey, AdminSourceGroup> = {
  chatgpt: {
    key: "chatgpt",
    label: "ChatGPT / OpenAI",
    tone: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    isAi: true,
  },
  perplexity: {
    key: "perplexity",
    label: "Perplexity",
    tone: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    isAi: true,
  },
  gemini: {
    key: "gemini",
    label: "Gemini / Google AI",
    tone: "border-blue-400/20 bg-blue-400/10 text-blue-200",
    isAi: true,
  },
  copilot: {
    key: "copilot",
    label: "Copilot / Bing AI",
    tone: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    isAi: true,
  },
  google: {
    key: "google",
    label: "Google Organic",
    tone: "border-white/15 bg-white/[0.06] text-white/75",
    isAi: false,
  },
  bing: {
    key: "bing",
    label: "Bing Organic",
    tone: "border-white/15 bg-white/[0.06] text-white/75",
    isAi: false,
  },
  instagram: {
    key: "instagram",
    label: "Instagram / Meta",
    tone: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200",
    isAi: false,
  },
  whatsapp: {
    key: "whatsapp",
    label: "WhatsApp",
    tone: "border-green-400/20 bg-green-400/10 text-green-200",
    isAi: false,
  },
  direct: {
    key: "direct",
    label: "Direct / Typed",
    tone: "border-white/15 bg-white/[0.06] text-white/70",
    isAi: false,
  },
  other: {
    key: "other",
    label: "Other / Unknown",
    tone: "border-white/15 bg-white/[0.04] text-white/55",
    isAi: false,
  },
};

function hostFromPath(path?: string | null) {
  if (!path) return null;

  try {
    return new URL(path).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function textForAttribution(row: AdminAttributionRow) {
  return [
    row.acquisitionSource,
    row.acquisitionCategory,
    row.acquisitionReferrerHost,
    row.utmSource,
    row.utmMedium,
    row.utmCampaign,
    row.path,
    row.userAgent,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getAttributionDomain(row: AdminAttributionRow) {
  return hostFromPath(row.path) || "unknown-domain";
}

export function classifyAdminSource(row: AdminAttributionRow): AdminSourceGroup {
  const text = textForAttribution(row);

  if (/(chatgpt|openai|oai-searchbot|gptbot|chat\.openai\.com)/.test(text)) {
    return ADMIN_SOURCE_GROUPS.chatgpt;
  }
  if (/(perplexity|perplexitybot)/.test(text)) return ADMIN_SOURCE_GROUPS.perplexity;
  if (/(gemini|bard|google ai|ai overview|google-extended)/.test(text)) {
    return ADMIN_SOURCE_GROUPS.gemini;
  }
  if (/(copilot|bing ai|bingbot|msnbot)/.test(text)) return ADMIN_SOURCE_GROUPS.copilot;
  if (/(google|googlebot|organic)/.test(text)) return ADMIN_SOURCE_GROUPS.google;
  if (/(bing|duckduckgo|yahoo)/.test(text)) return ADMIN_SOURCE_GROUPS.bing;
  if (/(instagram|facebook|meta|igshid|fbclid)/.test(text)) return ADMIN_SOURCE_GROUPS.instagram;
  if (/(whatsapp|wa\.me|api\.whatsapp\.com)/.test(text)) return ADMIN_SOURCE_GROUPS.whatsapp;
  if (/(direct|typed|none)/.test(text)) return ADMIN_SOURCE_GROUPS.direct;

  return ADMIN_SOURCE_GROUPS.other;
}
