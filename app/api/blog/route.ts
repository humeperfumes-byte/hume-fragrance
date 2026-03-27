import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { blogPosts as localBlogPosts } from "@/data/blogPosts";
import { requireAdminToken } from "@/lib/admin-auth";

// GET all blog posts
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const conditions = [];
    if (category && category !== "All") {
      conditions.push(eq(blogPosts.category, category));
    }
    if (featured === "true") {
      conditions.push(eq(blogPosts.featured, true));
    }

    const posts = await db
      .select()
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(posts, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const filtered = localBlogPosts.filter((post) => {
      const categoryMatch = !category || category === "All" || post.category === category;
      const featuredMatch = featured !== "true" || post.featured;
      return categoryMatch && featuredMatch;
    });

    return NextResponse.json(filtered, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800" },
    });
  }
}

// POST create new blog post
export async function POST(request: NextRequest) {
  const unauthorized = requireAdminToken(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    const blogPostSchema = z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      excerpt: z.string(),
      content: z.string(),
      seoTitle: z.string(),
      seoDescription: z.string(),
      seoKeywords: z.array(z.string()),
      category: z.string(),
      author: z.string(),
      date: z.string(),
      readTime: z.string(),
      featured: z.boolean().default(false),
    });

    const validatedData = blogPostSchema.parse(body);

    const [newPost] = await db
      .insert(blogPosts)
      .values(validatedData)
      .returning();

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
