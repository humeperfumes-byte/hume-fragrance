import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Image id is required" }, { status: 400 });
  }

  try {
    await db.delete(images).where(eq(images.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
