import { NextRequest, NextResponse } from "next/server";
import { isInternalAdminRequest } from "@/lib/admin-data-filters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Simple auth check using standard admin token or cookie
  if (!isInternalAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL || "";
  let dbHost = "not_set";
  try {
    if (dbUrl) {
      const match = dbUrl.match(/@([^/:]+)/);
      if (match) dbHost = match[1];
    }
  } catch {
    dbHost = "parse_failed";
  }

  return NextResponse.json({
    siteHost: request.headers.get("host") || "unknown",
    databaseHost: dbHost,
    vercelEnv: process.env.VERCEL_ENV || "unknown",
  });
}
