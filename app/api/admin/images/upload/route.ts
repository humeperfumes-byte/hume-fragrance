import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  destroyCloudinaryImageByUrl,
  getCloudinaryConfiguration,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-server";
import { persistCloudinaryAsset } from "@/lib/cloudinary-persistence";
import { validateImageUpload } from "@/lib/image-upload-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const configuration = getCloudinaryConfiguration();
  return NextResponse.json(configuration);
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

    const validationError = validateImageUpload(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const id = randomUUID();
    const bytes = Buffer.from(await file.arrayBuffer());
    const resolvedLabel =
      label || file.name.replace(/\.[^.]+$/, "") || "Untitled image";
    const tags = parseTags(formData.get("tags"));
    const uploaded = await uploadImageToCloudinary({
      buffer: bytes,
      fileName: file.name,
      label: resolvedLabel,
      usage,
      tags,
    });

    const created = await persistCloudinaryAsset({
      persist: () =>
        db
          .insert(images)
          .values({
            id,
            label: resolvedLabel,
            url: uploaded.secureUrl,
            link: linkValue || null,
            usage,
            tags,
            mimeType: file.type,
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
      rollback: () => destroyCloudinaryImageByUrl(uploaded.secureUrl),
    });

    return NextResponse.json(
      {
        image: created,
        cloudinary: {
          assetId: uploaded.assetId,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin image upload error:", error);
    const detail =
      error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Unknown upload error";
    const message =
      detail === "Cloudinary is not configured"
        ? "Cloudinary is not configured. Add its credentials to .env.local."
        : "Failed to upload image to Cloudinary";
    return NextResponse.json(
      {
        error: message,
        ...(process.env.NODE_ENV === "development" ? { detail: detail.slice(0, 300) } : {}),
      },
      { status: 500 },
    );
  }
}
