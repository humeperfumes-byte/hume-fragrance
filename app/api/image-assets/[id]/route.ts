import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { images } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [asset] = await db
      .select({
        url: images.url,
        mimeType: images.mimeType,
        dataBase64: images.dataBase64,
      })
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (asset.dataBase64 && asset.mimeType) {
      const bytes = Uint8Array.from(Buffer.from(asset.dataBase64, "base64"));
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": asset.mimeType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return NextResponse.redirect(new URL(asset.url, request.url));
  } catch (error) {
    console.error("Image asset fetch error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}
