import { randomUUID } from "crypto";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { images } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const linkSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || value.startsWith("http"), {
    message: "Link must start with / or http",
  });

const imageUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || value.startsWith("http"), {
    message: "Image URL must start with / or http",
  });

const imageCreateSchema = z.object({
  label: z.string().min(1).max(255),
  url: imageUrlSchema,
  link: linkSchema.optional().nullable(),
  usage: z.string().min(1).max(100).default("general"),
  tags: z.array(z.string().min(1).max(80)).default([]),
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
  createdAt: images.createdAt,
  updatedAt: images.updatedAt,
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select(imageColumns)
      .from(images)
      .orderBy(desc(images.updatedAt));

    return NextResponse.json({ images: rows });
  } catch (error) {
    console.error("Admin images fetch error:", error);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const data = imageCreateSchema.parse(await request.json());
    const [created] = await db
      .insert(images)
      .values({
        id: randomUUID(),
        label: data.label.trim(),
        url: data.url.trim(),
        link: data.link?.trim() || null,
        usage: data.usage.trim(),
        tags: data.tags.map((tag) => tag.trim()).filter(Boolean),
        updatedAt: new Date(),
      })
      .returning(imageColumns);

    return NextResponse.json({ image: created }, { status: 201 });
  } catch (error) {
    console.error("Admin image create error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid image details" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save image" }, { status: 500 });
  }
}
