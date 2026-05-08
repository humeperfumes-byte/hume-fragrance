import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

function getIncomingToken(request: NextRequest): string | null {
  const headerToken = request.headers.get("x-admin-token");
  if (headerToken) return headerToken;

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }

  const cookieToken = request.cookies.get("admin_token")?.value;
  if (cookieToken) return cookieToken;

  return null;
}

export function requireAdminToken(request: NextRequest): NextResponse | null {
  const expectedToken = process.env.ADMIN_API_TOKEN;

  // If no token is configured, keep local development flexible but fail closed in production.
  if (!expectedToken) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Admin token is not configured" }, { status: 503 });
    }
    return null;
  }

  const incomingToken = getIncomingToken(request);
  if (incomingToken !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function checkAdminToken(): Promise<boolean> {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  if (!expectedToken) return process.env.NODE_ENV !== "production";

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  return token === expectedToken;
}
