export type CapturedDomainKind = "india" | "global" | "local" | "preview" | "unknown" | "other";

export type CapturedDomainInfo = {
  kind: CapturedDomainKind;
  label: string;
  shortLabel: string;
  host: string | null;
};

function cleanHost(host: string) {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

export function getCapturedHost(path: string | null | undefined): string | null {
  const value = String(path ?? "").trim();
  if (!value) return null;

  try {
    return cleanHost(new URL(value).hostname);
  } catch {
    const possibleHost = value.split(/[/?#]/)[0] ?? "";
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(possibleHost)) return null;

    try {
      return cleanHost(new URL(`https://${possibleHost}`).hostname);
    } catch {
      return null;
    }
  }
}

export function getCapturedDomainInfo(path: string | null | undefined): CapturedDomainInfo {
  const host = getCapturedHost(path);

  if (!host) {
    return {
      kind: "unknown",
      label: "Unknown domain",
      shortLabel: "Unknown",
      host: null,
    };
  }

  if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") {
    return {
      kind: "local",
      label: "Localhost",
      shortLabel: "Local",
      host,
    };
  }

  if (host.endsWith(".in")) {
    return {
      kind: "india",
      label: ".in site",
      shortLabel: ".in",
      host,
    };
  }

  if (host.endsWith(".com")) {
    return {
      kind: "global",
      label: ".com site",
      shortLabel: ".com",
      host,
    };
  }

  if (host.endsWith(".vercel.app") || host.endsWith(".app")) {
    return {
      kind: "preview",
      label: "Preview",
      shortLabel: "Preview",
      host,
    };
  }

  return {
    kind: "other",
    label: host,
    shortLabel: host,
    host,
  };
}
