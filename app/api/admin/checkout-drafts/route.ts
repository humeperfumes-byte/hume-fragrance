import { NextRequest, NextResponse } from "next/server";
import { and, desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { checkoutDrafts } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const hours = Math.min(24 * 90, Math.max(1, Number(searchParams.get("hours") || "720")));
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const drafts = await db
      .select()
      .from(checkoutDrafts)
      .where(and(gte(checkoutDrafts.updatedAt, since)))
      .orderBy(desc(checkoutDrafts.updatedAt))
      .limit(200);

    return NextResponse.json(drafts);
  } catch (error) {
    console.error("admin checkout-drafts fetch error:", error);
    return NextResponse.json({ error: "Failed to load checkout drafts" }, { status: 500 });
  }
}
