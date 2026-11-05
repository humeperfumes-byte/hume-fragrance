import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/app/admin/actions";

export async function POST(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store, max-age=0" };
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ success: false, error: "Invalid sign-in origin" }, { status: 403, headers });
  }
  if (!process.env.ADMIN_API_TOKEN) {
    return NextResponse.json({ success: false, error: "Admin sign-in is not configured" }, { status: 503, headers });
  }
  try {
    const text = await request.text();
    if (text.length > 4096) return NextResponse.json({ success: false, error: "Invalid sign-in request" }, { status: 413, headers });
    const body = JSON.parse(text);
    if (typeof body?.token !== "string" || !body.token || body.token.length > 1024) {
      return NextResponse.json({ success: false, error: "Enter your admin token" }, { status: 400, headers });
    }
    const result = await loginAdmin(body.token);
    return NextResponse.json(result, { status: result.success ? 200 : 401, headers });
  } catch {
    return NextResponse.json({ success: false, error: "Unable to complete sign-in. Please retry." }, { status: 400, headers });
  }
}
