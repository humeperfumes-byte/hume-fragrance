import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const imageColumns = {
  id: images.id,
  label: images.label,
  url: images.url,
  link: images.link,
  usage: images.usage,
  tags: images.tags,
  mimeType: images.mimeType,
  sizeBytes: images.sizeBytes,
  createdAt: images.createdAt,
  updatedAt: images.updatedAt,
};

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const label = String(formData.get("label") || "").trim();
    const usage = String(formData.get("usage") || "general").trim() || "general";
    const linkValue = String(formData.get("link") || "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only PNG, JPG, WebP, or GIF images are allowed" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Image must be 4 MB or smaller" }, { status: 400 });
    }

    const id = randomUUID();
    const bytes = Buffer.from(await file.arrayBuffer());
    const [created] = await db
      .insert(images)
      .values({
        id,
        label: label || file.name.replace(/\.[^.]+$/, "") || "Untitled image",
        url: `/api/image-assets/${id}`,
        link: linkValue || null,
        usage,
        tags: parseTags(formData.get("tags")),
        mimeType: file.type,
        sizeBytes: file.size,
        dataBase64: bytes.toString("base64"),
        updatedAt: new Date(),
      })
      .returning(imageColumns);

    return NextResponse.json({ image: created }, { status: 201 });
  } catch (error) {
    console.error("Admin image upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
