import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { db } from "@/db";
import { images } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

const linkSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || value.startsWith("http"), {
    message: "Link must start with / or http",
  });

const imageSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1),
  url: z.string().url(),
  link: linkSchema.optional(),
  usage: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const usage = searchParams.get("usage");
    const columns = {
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
    const rows = usage
      ? await db.select(columns).from(images).where(eq(images.usage, usage))
      : await db.select(columns).from(images);
    return NextResponse.json(
      rows.map((row) => ({
        ...row,
        url: row.url.startsWith("/api/image-assets/")
          ? row.url
          : withCloudinaryTransforms(row.url),
      }))
    );
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = imageSchema.parse(body);
    const [newImage] = await db
      .insert(images)
      .values({
        id: validatedData.id ?? randomUUID(),
        label: validatedData.label,
        url: validatedData.url,
        link: validatedData.link ?? null,
        usage: validatedData.usage ?? "general",
        tags: validatedData.tags ?? [],
      })
      .returning();

    return NextResponse.json(newImage);
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json({ error: "Failed to create image" }, { status: 500 });
  }
}
