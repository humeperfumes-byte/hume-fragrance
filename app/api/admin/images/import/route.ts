import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  destroyCloudinaryImageByPublicId,
  uploadRemoteImageToCloudinary,
} from "@/lib/cloudinary-server";
import { persistCloudinaryAsset } from "@/lib/cloudinary-persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const importSchema = z.object({
  url: z.string().url().max(2048),
  label: z.string().trim().min(1).max(255),
  usage: z.string().trim().min(1).max(100).default("product"),
  tags: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
});

const imageColumns = {
  id: images.id,
  label: images.label,
  url: images.url,
  link: images.link,
  usage: images.usage,
  tags: images.tags,
  mimeType: images.mimeType,
  sizeBytes: images.sizeBytes,
  provider: images.provider,
  providerAssetId: images.providerAssetId,
  providerPublicId: images.providerPublicId,
  width: images.width,
  height: images.height,
  format: images.format,
  createdAt: images.createdAt,
  updatedAt: images.updatedAt,
};

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const input = importSchema.parse(await request.json());
    const source = new URL(input.url);
    if (!new Set(["http:", "https:"]).has(source.protocol)) {
      return NextResponse.json({ error: "Only HTTP image URLs can be imported" }, { status: 400 });
    }
    if (source.hostname.endsWith("cloudinary.com")) {
      return NextResponse.json({ error: "This image is already hosted by Cloudinary" }, { status: 400 });
    }

    const fileName = source.pathname.split("/").filter(Boolean).pop() || input.label;
    const uploaded = await uploadRemoteImageToCloudinary({
      sourceUrl: input.url,
      fileName,
      label: input.label,
      usage: input.usage,
      tags: input.tags,
    });
    const created = await persistCloudinaryAsset({
      persist: () =>
        db
          .insert(images)
          .values({
            id: randomUUID(),
            label: input.label,
            url: uploaded.secureUrl,
            usage: input.usage,
            tags: input.tags,
            mimeType: `image/${uploaded.format}`,
            sizeBytes: uploaded.bytes,
            provider: "cloudinary",
            providerAssetId: uploaded.assetId,
            providerPublicId: uploaded.publicId,
            width: uploaded.width,
            height: uploaded.height,
            format: uploaded.format,
            dataBase64: null,
            updatedAt: new Date(),
          })
          .returning(imageColumns)
          .then(([record]) => record),
      rollback: () => destroyCloudinaryImageByPublicId(uploaded.publicId),
    });

    return NextResponse.json({ image: created }, { status: 201 });
  } catch (error) {
    console.error("Cloudinary legacy image import error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid image import details" }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not import this image to Cloudinary" }, { status: 500 });
  }
}
