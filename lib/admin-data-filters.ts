import type { NextRequest } from "next/server";

type AdminDataRow = {
  sessionId?: string | null;
  phone?: string | null;
  email?: string | null;
  destination?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

const DEFAULT_INTERNAL_PHONES = ["919559024822"];

function splitEnv(value: string | undefined): string[] {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizePhone(value: string | null | undefined): string | null {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = String(value ?? "").trim().toLowerCase();
  return email.includes("@") ? email : null;
}

function exclusionConfig() {
  return {
    emails: new Set(splitEnv(process.env.ADMIN_EXCLUDED_EMAILS).map((email) => email.toLowerCase())),
    phones: new Set(
      [...DEFAULT_INTERNAL_PHONES, ...splitEnv(process.env.ADMIN_EXCLUDED_PHONES)]
        .map(normalizePhone)
        .filter(Boolean) as string[],
    ),
    sessionIds: new Set(splitEnv(process.env.ADMIN_EXCLUDED_SESSION_IDS)),
    ips: new Set(splitEnv(process.env.ADMIN_EXCLUDED_IPS)),
    userAgentMatches: splitEnv(process.env.ADMIN_EXCLUDED_USER_AGENT_MATCHES).map((value) => value.toLowerCase()),
  };
}

export function isInternalAdminRequest(request: NextRequest): boolean {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  const rawCookie = request.headers.get("cookie") || "";
  if (rawCookie.includes("hume_admin_internal=1")) return true;
  if (request.cookies.get("hume_admin_internal")?.value === "1") return true;
  if (!expectedToken) return false;
  if (rawCookie.includes(`admin_token=${expectedToken}`)) return true;
  return request.cookies.get("admin_token")?.value === expectedToken;
}

export function isExcludedAdminDataRow(row: AdminDataRow): boolean {
  const config = exclusionConfig();

  if (row.sessionId && config.sessionIds.has(row.sessionId)) return true;
  if (row.ipAddress && config.ips.has(row.ipAddress)) return true;

  const phone = normalizePhone(row.phone ?? row.destination);
  if (phone && config.phones.has(phone)) return true;

  const email = normalizeEmail(row.email ?? row.destination);
  if (email && config.emails.has(email)) return true;

  const userAgent = String(row.userAgent ?? "").toLowerCase();
  return Boolean(
    userAgent &&
      config.userAgentMatches.some((match) => match.length > 0 && userAgent.includes(match)),
  );
}

export function collectExcludedSessionIds(...groups: AdminDataRow[][]): Set<string> {
  const ids = new Set<string>();

  for (const group of groups) {
    for (const row of group) {
      if (row.sessionId && isExcludedAdminDataRow(row)) {
        ids.add(row.sessionId);
      }
    }
  }

  return ids;
}

export function filterExcludedAdminRows<T extends AdminDataRow>(
  rows: T[],
  excludedSessionIds: Set<string>,
): T[] {
  return rows.filter((row) => {
    if (row.sessionId && excludedSessionIds.has(row.sessionId)) return false;
    return !isExcludedAdminDataRow(row);
  });
}
