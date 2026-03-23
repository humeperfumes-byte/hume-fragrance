import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews, productCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireAdminToken } from "@/lib/admin-auth";

const imageUrlSchema = z
  .array(z.string().trim().url())
  .min(1, "At least one image URL is required");

const productSchema = z.object({
  name: z.string().optional(),
  inspiration: z.string().optional(),
  inspirationBrand: z.string().optional(),
  woreBy: z.string().optional().nullable(),
  woreByImageUrl: z.string().trim().url().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  gender: z.enum(["Men", "Women", "Unisex"]).optional(),
  images: imageUrlSchema.optional(),
  price: z.number().optional(),
  priceCurrency: z.literal("INR").optional(),
  description: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  notes: z
    .object({
      top: z.array(z.string()),
      heart: z.array(z.string()),
      base: z.array(z.string()),
    })
    .optional(),
  longevity: z
    .object({
      duration: z.string(),
      sillage: z.string(),
      season: z.array(z.string()),
      occasion: z.array(z.string()),
    })
    .optional(),
  size: z.string().optional(),
  visibility: z.enum(["public", "seo_only"]).optional(),
});

type ProductUpdateInput = z.infer<typeof productSchema>;
type ProductUpdateRecord = Partial<typeof products.$inferInsert> & { updatedAt: Date };

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, id));

    let mappedCategoryIds: string[] = [product.categoryId];
    try {
      const rows = await db
        .select({ categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(eq(productCategories.productId, id));
      mappedCategoryIds = rows.length > 0 ? rows.map((row) => row.categoryId) : [product.categoryId];
    } catch {
      mappedCategoryIds = [product.categoryId];
    }

    return NextResponse.json({
      ...product,
      price: parseFloat(product.price),
      categoryIds: Array.from(new Set([product.categoryId, ...mappedCategoryIds].filter(Boolean))),
      reviews: productReviews.map((r) => ({
        ...r,
        rating: parseFloat(r.rating),
      })),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await request.json();

    const validatedData = productSchema.parse(body);

    const { price, ...restValidatedData } = validatedData as ProductUpdateInput;
    const updateData: ProductUpdateRecord = {
      ...restValidatedData,
      updatedAt: new Date(),
      ...(price !== undefined ? { price: price.toString() } : {}),
    };

    const [updatedProduct] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    try {
      if (validatedData.categoryId || validatedData.categoryIds) {
        const resolvedPrimary = validatedData.categoryId ?? updatedProduct.categoryId;
        const resolvedLabel = validatedData.category ?? updatedProduct.category;
        const categoryIds = Array.from(
          new Set([resolvedPrimary, ...(validatedData.categoryIds ?? [])].filter(Boolean))
        );

        await db.delete(productCategories).where(eq(productCategories.productId, id));
        if (categoryIds.length > 0) {
          await db.insert(productCategories).values(
            categoryIds.map((categoryId) => ({
              productId: id,
              categoryId,
              categoryLabel: resolvedLabel,
            }))
          );
        }
      }
    } catch (error) {
      console.error("Failed to sync product_categories:", error);
    }

    let mappedCategoryIds: string[] = [updatedProduct.categoryId];
    try {
      const rows = await db
        .select({ categoryId: productCategories.categoryId })
        .from(productCategories)
        .where(eq(productCategories.productId, id));
      mappedCategoryIds = rows.length > 0 ? rows.map((row) => row.categoryId) : [updatedProduct.categoryId];
    } catch {
      mappedCategoryIds = [updatedProduct.categoryId];
    }

    return NextResponse.json({
      ...updatedProduct,
      price: parseFloat(updatedProduct.price),
      categoryIds: Array.from(new Set([updatedProduct.categoryId, ...mappedCategoryIds].filter(Boolean))),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    // Delete reviews first (cascade should handle this, but being explicit)
    await db.delete(reviews).where(eq(reviews.productId, id));
    await db.delete(productCategories).where(eq(productCategories.productId, id));

    const [deletedProduct] = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
