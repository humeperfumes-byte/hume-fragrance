import { db } from "@/db";
import { blogPosts, products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { blogPosts as localBlogPosts, type BlogPost } from "@/data/blogPosts";

// Transform database blog post to BlogPost format
type BlogPostRow = typeof blogPosts.$inferSelect;
const IS_PRODUCTION_BUILD = process.env.NEXT_PHASE === "phase-production-build";

function transformBlogPost(post: BlogPostRow): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    seoKeywords: post.seoKeywords as string[],
    category: post.category,
    author: post.author,
    date: post.date,
    readTime: post.readTime,
    featured: post.featured,
    imageUrl: post.imageUrl ?? "",
    relatedProductId: post.relatedProductId ?? "",
  };
}

const getAllBlogPostsPersistent = unstable_cache(
  async (): Promise<BlogPost[]> => {
    if (IS_PRODUCTION_BUILD) return localBlogPosts;
    try {
      const posts = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt));

      return posts.map(transformBlogPost);
    } catch (error) {
      console.error("Error loading blog posts from DB, using local fallback:", error);
      return localBlogPosts;
    }
  },
  ["blog:all"],
  {
    revalidate: 300,
    tags: ["blog"],
  }
);

const getAllBlogPostsCached = cache(async (): Promise<BlogPost[]> => {
  try {
    return await getAllBlogPostsPersistent();
  } catch (error) {
    console.error("Error loading blog posts from DB, using local fallback:", error);
    return localBlogPosts;
  }
});

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return getAllBlogPostsCached();
}

const getBlogPostBySlugCached = cache(async (slug: string): Promise<BlogPost | null> => {
  if (IS_PRODUCTION_BUILD) return localBlogPosts.find((post) => post.slug === slug) ?? null;
  try {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (!post) {
      return null;
    }

    return transformBlogPost(post);
  } catch (error) {
    console.error(`Error loading blog post ${slug} from DB, using local fallback:`, error);
    return localBlogPosts.find((post) => post.slug === slug) ?? null;
  }
});

// Get blog post by slug
export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | null> {
  return getBlogPostBySlugCached(slug);
}

// Get blog posts by category
export async function getBlogPostsByCategory(
  category: string
): Promise<BlogPost[]> {
  if (IS_PRODUCTION_BUILD) return localBlogPosts.filter((post) => post.category === category);
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.category, category))
      .orderBy(desc(blogPosts.createdAt));

    return posts.map(transformBlogPost);
  } catch (error) {
    console.error(`Error loading blog category ${category} from DB, using local fallback:`, error);
    return localBlogPosts.filter((post) => post.category === category);
  }
}

// Get featured blog posts
export async function getFeaturedBlogPosts(): Promise<BlogPost[]> {
  if (IS_PRODUCTION_BUILD) return localBlogPosts.filter((post) => post.featured);
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.featured, true))
      .orderBy(desc(blogPosts.createdAt));

    return posts.map(transformBlogPost);
  } catch (error) {
    console.error("Error loading featured blog posts from DB, using local fallback:", error);
    return localBlogPosts.filter((post) => post.featured);
  }
}

// Get related blog posts by product ID
async function getRelatedBlogPostsByProductIdRaw(
  productId: string,
  limit = 3
): Promise<BlogPost[]> {
  if (IS_PRODUCTION_BUILD) {
    return localBlogPosts.filter((post) => post.relatedProductId === productId).slice(0, limit);
  }
  try {
    const directPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.relatedProductId, productId))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);

    if (directPosts.length > 0) {
      return directPosts.map(transformBlogPost);
    }

    const [product] = await db
      .select({ primaryBlogSlug: products.primaryBlogSlug })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product?.primaryBlogSlug) {
      return [];
    }

    const slugPosts = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, product.primaryBlogSlug))
      .limit(limit);

    return slugPosts.map(transformBlogPost);
  } catch (error) {
    console.error(`Error loading related blogs for ${productId}, using local fallback:`, error);
    return localBlogPosts
      .filter((post) => post.relatedProductId === productId)
      .slice(0, limit);
  }
}

export const getRelatedBlogPostsByProductId = cache(
  async (productId: string, limit = 3): Promise<BlogPost[]> => {
    const getCachedRelatedPosts = unstable_cache(
      () => getRelatedBlogPostsByProductIdRaw(productId, limit),
      ["blog:related-product", productId, String(limit)],
      {
        revalidate: 6 * 60 * 60,
        tags: ["blog", "products"],
      },
    );

    return getCachedRelatedPosts();
  },
);
