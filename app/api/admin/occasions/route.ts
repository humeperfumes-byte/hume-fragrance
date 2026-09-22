export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdminToken } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

const payloadSchema = z.object({
  occasionSlug: z.string().min(1),
  genderScope: z.enum(["all", "men", "women"]).optional().default("all"),
  perfumeIds: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { occasionSlug, genderScope, perfumeIds } = payloadSchema.parse(body);

    const baseSlug = occasionSlug.trim().toLowerCase();
    const targetKey =
      genderScope === "all"
        ? baseSlug
        : `${baseSlug}:${genderScope.toLowerCase()}`;

    const selectedSet = new Set(perfumeIds);

    const allProducts = await db.select().from(products);

    const updatePromises = allProducts.map(async (product) => {
      const currentLongevity = product.longevity || {
        duration: "8-12 Hours",
        sillage: "Strong Trail",
        season: [],
        occasion: [],
      };
      const currentOccasions = (currentLongevity.occasion || []).map((o) =>
        o.trim().toLowerCase(),
      );

      const shouldHaveOccasion = selectedSet.has(product.id);
      const currentlyHasOccasion = currentOccasions.includes(targetKey);

      if (shouldHaveOccasion === currentlyHasOccasion) {
        return null;
      }

      let updatedOccasions: string[];
      if (shouldHaveOccasion) {
        updatedOccasions = Array.from(new Set([...currentOccasions, targetKey]));
      } else {
        updatedOccasions = currentOccasions.filter((o) => o !== targetKey);
      }

      const updatedLongevity = {
        ...currentLongevity,
        occasion: updatedOccasions,
      };

      return db
        .update(products)
        .set({
          longevity: updatedLongevity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, product.id));
    });

    await Promise.all(updatePromises.filter(Boolean));

    try {
      (revalidateTag as any)("products");
    } catch (e) {
      console.warn("revalidateTag warning:", e);
    }

    const updatedProductsList = await db.select().from(products);

    return NextResponse.json({
      success: true,
      message: `Occasion '${targetKey}' updated successfully`,
      products: updatedProductsList.map((p) => ({
        ...p,
        price: parseFloat(p.price),
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.errors },
        { status: 400 },
      );
    }
    console.error("Error updating occasion assignments:", error);
    return NextResponse.json(
      { error: "Failed to update occasion assignments" },
      { status: 500 },
    );
  }
}
