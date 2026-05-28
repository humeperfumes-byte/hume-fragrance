import { randomUUID } from "crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { requireAdminToken } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

const responseSchema = z.object({
  questionId: z.string().min(1).max(255),
  content: z.string().trim().min(2).max(1200),
  author: z.string().trim().min(2).max(80).default("HUME Admin"),
});

function isQuestion(row: Pick<typeof reviews.$inferSelect, "title" | "reviewerLanguage">) {
  return row.reviewerLanguage === "question" || row.title.toLowerCase() === "question";
}

function responseTitle(questionId: string) {
  return `Response:${questionId}`;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const rows = await db
      .select({
        id: reviews.id,
        productId: reviews.productId,
        author: reviews.author,
        avatarUrl: reviews.avatarUrl,
        reviewerCity: reviews.reviewerCity,
        reviewerLanguage: reviews.reviewerLanguage,
        rating: reviews.rating,
        date: reviews.date,
        title: reviews.title,
        content: reviews.content,
        verified: reviews.verified,
        createdAt: reviews.createdAt,
        productName: products.name,
        productInspiration: products.inspiration,
        productInspirationBrand: products.inspirationBrand,
      })
      .from(reviews)
      .leftJoin(products, eq(reviews.productId, products.id))
      .orderBy(desc(reviews.createdAt))
      .limit(1000);

    return NextResponse.json({
      reviews: rows.map((row) => ({
        ...row,
        rating: Number.parseFloat(row.rating),
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Admin reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const data = responseSchema.parse(await request.json());
    const [question] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, data.questionId))
      .limit(1);

    if (!question || !isQuestion(question)) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const [created] = await db
      .insert(reviews)
      .values({
        id: `admin-response-${randomUUID()}`,
        productId: question.productId,
        author: data.author,
        reviewerLanguage: "response",
        rating: "5",
        date: today,
        title: responseTitle(question.id),
        content: data.content,
        verified: true,
      })
      .returning();

    revalidateTag("products", "max");
    revalidatePath(`/product/${question.productId}`, "page");

    return NextResponse.json(
      { review: { ...created, rating: Number.parseFloat(created.rating), createdAt: created.createdAt.toISOString() } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin review response create error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid response details" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Review id is required" }, { status: 400 });
  }

  try {
    const [row] = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
    if (!row) return NextResponse.json({ ok: true });

    if (isQuestion(row)) {
      await db
        .delete(reviews)
        .where(
          and(
            eq(reviews.reviewerLanguage, "response"),
            or(eq(reviews.title, responseTitle(id)), eq(reviews.title, `Response:${id}`)),
          ),
        );
    }

    await db.delete(reviews).where(eq(reviews.id, id));

    revalidateTag("products", "max");
    revalidatePath(`/product/${row.productId}`, "page");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin review delete error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
