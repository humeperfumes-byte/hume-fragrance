import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  getUpcomingProductAsPerfume,
  getUpcomingProductBySlug,
} from "@/lib/upcoming-products";

function readExecuteRows<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: T[] }).rows;
  }
  return [];
}

// GET all reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let productReviews: Array<typeof reviews.$inferSelect> = [];
    try {
      productReviews = await db.select().from(reviews).where(eq(reviews.productId, id));
    } catch (error) {
      console.warn("Falling back to legacy product reviews API query.", error);
      const result = await db.execute(sql`
        select
          id,
          product_id as "productId",
          author,
          null::varchar as "avatarUrl",
          null::varchar as "reviewerCity",
          null::varchar as "reviewerLanguage",
          rating,
          date,
          title,
          content,
          verified,
          created_at as "createdAt"
        from reviews
        where product_id = ${id}
      `);
      productReviews = readExecuteRows<typeof reviews.$inferSelect>(result);
    }

    return NextResponse.json(
      productReviews.map((r) => ({
        ...r,
        rating: parseFloat(r.rating),
      }))
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST create new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const reviewSchema = z.object({
      id: z.string().optional(),
      author: z.string().trim().min(2).max(80),
      avatarUrl: z.string().url().optional(),
      reviewerCity: z.string().max(255).optional(),
      reviewerLanguage: z.string().max(50).optional(),
      rating: z.coerce.number().int().min(1).max(5),
      date: z.string().optional(),
      title: z.string().trim().min(3).max(120).optional(),
      content: z.string().trim().min(5).max(1200),
      replyTo: z.string().trim().min(1).max(200).optional(),
      verified: z.boolean().optional(),
    });

    const validatedData = reviewSchema.parse(body);
    const [existingProduct] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existingProduct) {
      const staticProduct = getUpcomingProductBySlug(id);
      if (staticProduct) {
        const perfume = getUpcomingProductAsPerfume(staticProduct);
        await db
          .insert(products)
          .values({
            id: perfume.id,
            name: perfume.name,
            inspiration: perfume.inspiration,
            inspirationBrand: perfume.inspirationBrand,
            category: perfume.category,
            categoryId: perfume.categoryId,
            gender: perfume.gender,
            images: perfume.images,
            price: perfume.price.toString(),
            priceCurrency: perfume.priceCurrency ?? "INR",
            description: perfume.description,
            seoDescription: perfume.seoDescription,
            seoKeywords: perfume.seoKeywords,
            badges: perfume.badges ?? {},
            notes: perfume.notes,
            longevity: perfume.longevity,
            size: perfume.size,
          })
          .onConflictDoNothing();
      }
    }

    const reviewId = validatedData.id ?? `review-${id}-${crypto.randomUUID()}`;
    const reviewDate = validatedData.date ?? new Date().toISOString().slice(0, 10);
    const submittedKind = validatedData.reviewerLanguage?.trim().toLowerCase();
    const reviewKind =
      submittedKind === "question" || submittedKind === "response"
        ? submittedKind
        : "review";
    const reviewTitle =
      reviewKind === "question"
        ? "Question"
        : reviewKind === "response"
          ? `Response:${validatedData.replyTo ?? ""}`.slice(0, 120)
        : validatedData.title ?? `${validatedData.rating}/5 customer review`;

    let newReview: typeof reviews.$inferSelect;
    try {
      [newReview] = await db
        .insert(reviews)
        .values({
          ...validatedData,
          id: reviewId,
          productId: id,
          avatarUrl: validatedData.avatarUrl ?? null,
          reviewerCity: validatedData.reviewerCity?.trim() || null,
          reviewerLanguage: reviewKind,
          rating: validatedData.rating.toString(),
          date: reviewDate,
          title: reviewTitle,
          verified: Boolean(validatedData.verified),
        })
        .returning();
    } catch (error) {
      console.warn("Falling back to legacy review insert (without profile fields).", error);
      [newReview] = await db
        .insert(reviews)
        .values({
          id: reviewId,
          productId: id,
          author: validatedData.author,
          rating: validatedData.rating.toString(),
          date: reviewDate,
          title: reviewTitle,
          content: validatedData.content,
          verified: Boolean(validatedData.verified),
        })
        .returning();
    }

    revalidateTag("products", "max");
    revalidatePath(`/product/${id}`, "page");

    return NextResponse.json(
      {
        ...newReview,
        rating: parseFloat(newReview.rating),
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
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
