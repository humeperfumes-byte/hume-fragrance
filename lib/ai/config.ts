import "server-only";

export const AI_CONFIG = Object.freeze({
  analyticsEnabled: true,
  primaryProvider: "gemini" as const,
  primaryModel: "gemini-3.7-flash",
  fallbackModel: "gemini-3.5-flash-lite",
  providerFallback: "openrouter" as const,
  providerFallbackModel: "openrouter/free",
  requestTimeoutMs: 20_000,
  cacheTtlSeconds: 900,
});

export type AiRuntimeStatus = {
  analyticsEnabled: boolean;
  ready: boolean;
  geminiConfigured: boolean;
  openRouterConfigured: boolean;
  primaryModel: string;
  fallbackModel: string;
  providerFallbackModel: string;
  requestTimeoutMs: number;
  cacheTtlSeconds: number;
};

export function getAiRuntimeStatus(): AiRuntimeStatus {
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const openRouterConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());

  return {
    analyticsEnabled: AI_CONFIG.analyticsEnabled,
    ready:
      AI_CONFIG.analyticsEnabled &&
      (geminiConfigured || openRouterConfigured),
    geminiConfigured,
    openRouterConfigured,
    primaryModel: AI_CONFIG.primaryModel,
    fallbackModel: AI_CONFIG.fallbackModel,
    providerFallbackModel: AI_CONFIG.providerFallbackModel,
    requestTimeoutMs: AI_CONFIG.requestTimeoutMs,
    cacheTtlSeconds: AI_CONFIG.cacheTtlSeconds,
  };
}

