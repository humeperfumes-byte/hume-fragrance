import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

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
      productReviews = result.rows as Array<typeof reviews.$inferSelect>;
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
      id: z.string(),
      author: z.string(),
      avatarUrl: z.string().url().optional(),
      reviewerCity: z.string().max(255).optional(),
      reviewerLanguage: z.string().max(50).optional(),
      rating: z.number().min(1).max(5),
      date: z.string(),
      title: z.string(),
      content: z.string(),
      verified: z.boolean().default(false),
    });

    const validatedData = reviewSchema.parse(body);

    let newReview: typeof reviews.$inferSelect;
    try {
      [newReview] = await db
        .insert(reviews)
        .values({
          ...validatedData,
          productId: id,
          avatarUrl: validatedData.avatarUrl ?? null,
          reviewerCity: validatedData.reviewerCity ?? null,
          reviewerLanguage: validatedData.reviewerLanguage ?? null,
          rating: validatedData.rating.toString(),
        })
        .returning();
    } catch (error) {
      console.warn("Falling back to legacy review insert (without profile fields).", error);
      [newReview] = await db
        .insert(reviews)
        .values({
          id: validatedData.id,
          productId: id,
          author: validatedData.author,
          rating: validatedData.rating.toString(),
          date: validatedData.date,
          title: validatedData.title,
          content: validatedData.content,
          verified: validatedData.verified,
        })
        .returning();
    }

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
