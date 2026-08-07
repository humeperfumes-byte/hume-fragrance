import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit per photo
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: "Maximum 5 photos allowed per review" }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: `File ${file.name} is not a valid image. Only JPG, PNG, WebP or GIF allowed.` },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 5 MB size limit.` },
          { status: 400 }
        );
      }

      const id = `review-img-${Date.now()}-${randomUUID().slice(0, 8)}`;
      const bytes = Buffer.from(await file.arrayBuffer());

      // Save into DB image assets table
      await db.insert(images).values({
        id,
        label: `Review Photo - ${file.name}`,
        url: `/api/image-assets/${id}`,
        usage: "review_photo",
        mimeType: file.type,
        sizeBytes: file.size,
        dataBase64: bytes.toString("base64"),
        updatedAt: new Date(),
      }).onConflictDoNothing();

      uploadedUrls.push(`/api/image-assets/${id}`);
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
  } catch (error) {
    console.error("Review photo upload error:", error);
    return NextResponse.json({ error: "Failed to upload review photos" }, { status: 500 });
  }
}
