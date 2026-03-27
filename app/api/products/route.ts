import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, productCategories } from "@/db/schema";
import { z } from "zod";
import { requireAdminToken } from "@/lib/admin-auth";
import { getAllProducts, getAllPublicProducts } from "@/lib/db/products";

const imageUrlSchema = z
  .array(z.string().trim().url())
  .min(1, "At least one image URL is required");
const defaultCelebImage = "https://placehold.co/600x600?text=Celeb";

// GET all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");
    const gender = searchParams.get("gender");
    const includeHidden = searchParams.get("includeHidden") === "1";
    const unauthorized = includeHidden ? requireAdminToken(request) : null;
    if (unauthorized) return unauthorized;

    const allProducts = includeHidden ? await getAllProducts() : await getAllPublicProducts();
    const filtered = allProducts.filter((product) => {
      const byCategory =
        !categoryId ||
        categoryId === "all" ||
        (product.categoryIds ?? [product.categoryId]).includes(categoryId);
      const byGender = !gender || product.gender === gender;
      return byCategory && byGender;
    });

    return NextResponse.json(filtered, {
      headers: includeHidden
        ? { "Cache-Control": "private, no-store" }
        : { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json([]);
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    const productSchema = z.object({
      id: z.string(),
      name: z.string(),
      inspiration: z.string(),
      inspirationBrand: z.string(),
      woreBy: z.string().optional().nullable(),
      woreByImageUrl: z.string().trim().url().default(defaultCelebImage),
      category: z.string(),
      categoryId: z.string(),
      categoryIds: z.array(z.string()).optional(),
      gender: z.enum(["Men", "Women", "Unisex"]),
      images: imageUrlSchema,
      price: z.number(),
      priceCurrency: z.literal("INR").optional().default("INR"),
      description: z.string(),
      seoDescription: z.string(),
      seoKeywords: z.array(z.string()),
      notes: z.object({
        top: z.array(z.string()),
        heart: z.array(z.string()),
        base: z.array(z.string()),
      }),
      longevity: z.object({
        duration: z.string(),
        sillage: z.string(),
        season: z.array(z.string()),
        occasion: z.array(z.string()),
      }),
      size: z.string(),
      visibility: z.enum(["public", "seo_only"]).optional().default("public"),
    });

    const validatedData = productSchema.parse(body);

    const [newProduct] = await db
      .insert(products)
      .values({
        ...validatedData,
        price: validatedData.price.toString(),
      })
      .returning();

    const categoryIds = Array.from(
      new Set([validatedData.categoryId, ...(validatedData.categoryIds ?? [])].filter(Boolean))
    );

    try {
      if (categoryIds.length > 0) {
        await db.insert(productCategories).values(
          categoryIds.map((id) => ({
            productId: validatedData.id,
            categoryId: id,
            categoryLabel: validatedData.category,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to save product_categories rows:", error);
    }

    return NextResponse.json(
      {
        ...newProduct,
        price: parseFloat(newProduct.price),
        categoryIds,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
