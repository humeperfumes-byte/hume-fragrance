export type AcquisitionSource = {
  source: string;
  category: "search" | "social" | "ai" | "direct" | "other";
  referrerHost: string | null;
};

function safeHostname(url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeSourceLabel(value: string) {
  return value.trim().toLowerCase();
}

export function detectAcquisitionSource({
  utmSource,
  referrer,
}: {
  utmSource?: string | null;
  referrer?: string | null;
}): AcquisitionSource {
  const normalizedUtm = normalizeSourceLabel(utmSource || "");
  const referrerHost = safeHostname(referrer);

  if (normalizedUtm) {
    if (["google", "googleads", "adwords"].includes(normalizedUtm)) {
      return { source: "Google", category: "search", referrerHost };
    }
    if (["instagram", "ig", "insta"].includes(normalizedUtm)) {
      return { source: "Instagram", category: "social", referrerHost };
    }
    if (["chatgpt", "openai", "gpt"].includes(normalizedUtm)) {
      return { source: "ChatGPT", category: "ai", referrerHost };
    }
    if (["perplexity"].includes(normalizedUtm)) {
      return { source: "Perplexity", category: "ai", referrerHost };
    }
    if (["claude", "anthropic"].includes(normalizedUtm)) {
      return { source: "Claude", category: "ai", referrerHost };
    }
    if (["gemini"].includes(normalizedUtm)) {
      return { source: "Gemini", category: "ai", referrerHost };
    }
    if (["facebook", "meta"].includes(normalizedUtm)) {
      return { source: "Facebook", category: "social", referrerHost };
    }
    return {
      source: utmSource?.trim() || "Campaign",
      category: "other",
      referrerHost,
    };
  }

  if (!referrerHost) {
    return { source: "Direct", category: "direct", referrerHost: null };
  }

  if (referrerHost.includes("google.")) {
    return { source: "Google", category: "search", referrerHost };
  }
  if (
    referrerHost.includes("instagram.com") ||
    referrerHost.includes("l.instagram.com")
  ) {
    return { source: "Instagram", category: "social", referrerHost };
  }
  if (
    referrerHost.includes("chatgpt.com") ||
    referrerHost.includes("chat.openai.com")
  ) {
    return { source: "ChatGPT", category: "ai", referrerHost };
  }
  if (referrerHost.includes("perplexity.ai")) {
    return { source: "Perplexity", category: "ai", referrerHost };
  }
  if (referrerHost.includes("claude.ai")) {
    return { source: "Claude", category: "ai", referrerHost };
  }
  if (referrerHost.includes("gemini.google.com")) {
    return { source: "Gemini", category: "ai", referrerHost };
  }
  if (
    referrerHost.includes("facebook.com") ||
    referrerHost.includes("l.facebook.com") ||
    referrerHost.includes("m.facebook.com")
  ) {
    return { source: "Facebook", category: "social", referrerHost };
  }
  if (referrerHost.includes("bing.com")) {
    return { source: "Bing", category: "search", referrerHost };
  }
  if (referrerHost.includes("youtube.com")) {
    return { source: "YouTube", category: "social", referrerHost };
  }
  if (referrerHost.includes("x.com") || referrerHost.includes("twitter.com") || referrerHost.includes("t.co")) {
    return { source: "X", category: "social", referrerHost };
  }

  return { source: referrerHost, category: "other", referrerHost };
}
