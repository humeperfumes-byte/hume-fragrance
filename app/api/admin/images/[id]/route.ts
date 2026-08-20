import { eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { accessories, blogPosts, images, products, reviews } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";
import {
  destroyCloudinaryImageByPublicId,
  destroyCloudinaryImageByUrl,
} from "@/lib/cloudinary-server";

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
    const [asset] = await db
      .select({ url: images.url, providerPublicId: images.providerPublicId })
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (!asset) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const jsonReference = JSON.stringify([asset.url]);
    const [productReference, reviewReference, blogReference, accessoryReference] =
      await Promise.all([
        db
          .select({ id: products.id })
          .from(products)
          .where(
            or(
              eq(products.woreByImageUrl, asset.url),
              sql`${products.images} @> ${jsonReference}::jsonb`,
            ),
          )
          .limit(1),
        db
          .select({ id: reviews.id })
          .from(reviews)
          .where(
            or(
              eq(reviews.avatarUrl, asset.url),
              sql`${reviews.images} @> ${jsonReference}::jsonb`,
            ),
          )
          .limit(1),
        db
          .select({ id: blogPosts.id })
          .from(blogPosts)
          .where(eq(blogPosts.imageUrl, asset.url))
          .limit(1),
        db
          .select({ id: accessories.id })
          .from(accessories)
          .where(sql`${accessories.images} @> ${jsonReference}::jsonb`)
          .limit(1),
      ]);

    const usedBy = [
      productReference.length ? "products" : null,
      reviewReference.length ? "reviews" : null,
      blogReference.length ? "blogs" : null,
      accessoryReference.length ? "accessories" : null,
    ].filter(Boolean);
    if (usedBy.length) {
      return NextResponse.json(
        {
          error: `Detach this image from ${usedBy.join(", ")} before deleting it`,
          referenced: true,
          usedBy,
        },
        { status: 409 },
      );
    }

    const cloudinaryResult = asset.providerPublicId
      ? await destroyCloudinaryImageByPublicId(asset.providerPublicId)
      : await destroyCloudinaryImageByUrl(asset.url);
    if (cloudinaryResult.reason === "not-configured") {
      return NextResponse.json(
        { error: "Cloudinary is not configured, so the original was not removed" },
        { status: 503 },
      );
    }
    if (
      cloudinaryResult.reason !== "not-cloudinary" &&
      !cloudinaryResult.removed
    ) {
      return NextResponse.json(
        { error: "Cloudinary could not remove the original image" },
        { status: 502 },
      );
    }

    await db.delete(images).where(eq(images.id, id));
    return NextResponse.json({
      ok: true,
      cloudinaryRemoved: cloudinaryResult.removed,
    });
  } catch (error) {
    console.error("Admin image delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
