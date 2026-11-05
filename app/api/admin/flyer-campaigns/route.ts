import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/admin-auth";
export async function GET(req: NextRequest) {
  const denied = requireAdminToken(req);
  if (denied) return denied;
  return NextResponse.json(
    { error: "Use the unified QR manager." },
    { status: 410 },
  );
}
