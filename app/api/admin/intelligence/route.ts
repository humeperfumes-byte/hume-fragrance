import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    disabled: true,
    sessions: [],
    sections: [],
    enriched: [],
    market: "india",
  });
}
