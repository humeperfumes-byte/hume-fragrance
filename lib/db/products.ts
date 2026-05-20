import { db } from "@/db";
import { products, reviews, productCategories } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { type PerfumeData } from "@/data/perfumes";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductSeoSlug } from "@/lib/product-route";
import { unstable_cache } from "next/cache";
import { cache } from "react";

type ProductRow = typeof products.$inferSelect;
type ReviewRow = typeof reviews.$inferSelect;
type CategoryMapping = { id: string; label?: string };
type ProductBadges = Partial<{
  bestSeller: boolean;
  humeSpecial: boolean;
  limitedStock: boolean;
  soldOut: boolean;
}>;
type ProductVisibility = "public" | "seo_only";
let hasLoggedLegacyReviewsFallback = false;

async function fetchReviewsByProductIds(productIds: string[]): Promise<ReviewRow[]> {
  if (productIds.length === 0) return [];
  try {
    return await db.select().from(reviews).where(inArray(reviews.productId, productIds));
  } catch {
    if (!hasLoggedLegacyReviewsFallback) {
      hasLoggedLegacyReviewsFallback = true;
      console.warn("Using legacy reviews query until new review profile columns are added in DB.");
    }
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
      where product_id in (${sql.join(
        productIds.map((productId) => sql`${productId}`),
        sql`, `
      )})
    `);
    return result.rows as ReviewRow[];
  }
}

async function fetchReviewsByProductId(productId: string): Promise<ReviewRow[]> {
  return fetchReviewsByProductIds([productId]);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

// Transform database product to PerfumeData format
function transformProduct(
  product: ProductRow,
  productReviews: ReviewRow[],
  mappedCategories: CategoryMapping[] = []
): PerfumeData {
  const defaultCelebImage = "https://placehold.co/600x600?text=Celeb";
  const badges = (product.badges ?? {}) as ProductBadges;
  const imageUrls = getStringArray(product.images);
  const seoKeywords = getStringArray(product.seoKeywords);

  const mappedReviews = productReviews.map((r) => ({
    id: r.id,
    author: r.author,
    avatarUrl: r.avatarUrl ?? undefined,
    reviewerCity: r.reviewerCity ?? undefined,
    reviewerLanguage: r.reviewerLanguage ?? undefined,
    rating: parseFloat(r.rating),
    date: r.date,
    title: r.title,
    content: r.content,
    verified: r.verified,
  }));

  return {
    id: product.id,
    name: product.name,
    inspiration: product.inspiration,
    inspirationBrand: product.inspirationBrand,
    visibility: (product.visibility ?? "public") as ProductVisibility,
    woreBy: product.woreBy ?? undefined,
    woreByImageUrl: withCloudinaryTransforms(product.woreByImageUrl ?? defaultCelebImage),
    category: product.category,
    categoryId: product.categoryId,
    categoryIds:
      mappedCategories.length > 0
        ? Array.from(
            new Set([product.categoryId, ...mappedCategories.map((c) => c.id)].filter(Boolean))
          )
        : [product.categoryId],
    dbCategoryIds: mappedCategories.map((c) => c.id).filter(Boolean),
    categoryTags:
      mappedCategories.length > 0
        ? Array.from(
            new Map(
              [{ id: product.categoryId, label: product.category }, ...mappedCategories].map((c) => [
                c.id,
                { id: c.id, label: c.label || c.id },
              ])
            ).values()
          )
        : [{ id: product.categoryId, label: product.category }],
    dbCategoryTags: mappedCategories.map((c) => ({ id: c.id, label: c.label || c.id })),
    gender: product.gender,
    images: imageUrls.map((url) => withCloudinaryTransforms(url)),
    price: parseFloat(product.price),
    priceCurrency: "INR",
    description: product.description,
    seoDescription: product.seoDescription,
    seoKeywords,
    badges: {
      bestSeller: Boolean(badges.bestSeller),
      humeSpecial: Boolean(badges.humeSpecial),
      limitedStock: Boolean(badges.limitedStock),
      soldOut: Boolean(badges.soldOut),
    },
    notes: product.notes as PerfumeData["notes"],
    longevity: product.longevity as PerfumeData["longevity"],
    size: product.size,
    reviews: mappedReviews.slice(0, 12),
  };
}

// Get all products
async function getAllProductsRaw(): Promise<PerfumeData[]> {
  try {
    const allProducts = await db.select().from(products);
    if (allProducts.length === 0) return [];

    const productIds = allProducts.map((product) => product.id);
    const [allReviews, allCategoryRows] = await Promise.all([
      fetchReviewsByProductIds(productIds),
      db
        .select({
          productId: productCategories.productId,
          categoryId: productCategories.categoryId,
          categoryLabel: productCategories.categoryLabel,
        })
        .from(productCategories)
        .where(inArray(productCategories.productId, productIds))
        .catch(() => [] as Array<{ productId: string; categoryId: string; categoryLabel: string | null }>),
    ]);

    const reviewsByProduct = new Map<string, ReviewRow[]>();
    allReviews.forEach((review) => {
      const existing = reviewsByProduct.get(review.productId);
      if (existing) existing.push(review);
      else reviewsByProduct.set(review.productId, [review]);
    });

    const categoriesByProduct = new Map<string, CategoryMapping[]>();
    allCategoryRows.forEach((row) => {
      const mapping = { id: row.categoryId, label: row.categoryLabel ?? undefined };
      const existing = categoriesByProduct.get(row.productId);
      if (existing) existing.push(mapping);
      else categoriesByProduct.set(row.productId, [mapping]);
    });

    const productsWithReviews = allProducts.map((product) =>
      transformProduct(
        product,
        reviewsByProduct.get(product.id) ?? [],
        categoriesByProduct.get(product.id) ?? [{ id: product.categoryId, label: product.category }]
      )
    );

    return productsWithReviews;
  } catch (error) {
    console.error("Error loading products from DB:", error);
    return [];
  }
}

const getAllProductsCached = unstable_cache(getAllProductsRaw, ["products:all"], {
  revalidate: 120,
  tags: ["products"],
});

export const getAllProducts = cache(async (): Promise<PerfumeData[]> => {
  return getAllProductsCached();
});

const getAllPublicProductsCached = unstable_cache(
  async (): Promise<PerfumeData[]> => {
    const all = await getAllProductsRaw();
    const visible = all.filter((product) => (product.visibility ?? "public") === "public");

    // Safety fallback: if visibility flags are misconfigured in DB,
    // do not return an empty storefront.
    if (visible.length === 0 && all.length > 0) {
      return all;
    }

    return visible;
  },
  ["products:public"],
  {
    revalidate: 120,
    tags: ["products"],
  }
);

export const getAllPublicProducts = cache(async (): Promise<PerfumeData[]> => {
  return getAllPublicProductsCached();
});

// Get product by ID
export async function getProductById(id: string): Promise<PerfumeData | null> {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!product) {
      return null;
    }

    const productReviews = await fetchReviewsByProductId(id);

    let mappedCategories: Array<{ id: string; label?: string }> = [];
    try {
      const rows = await db
        .select({
          categoryId: productCategories.categoryId,
          categoryLabel: productCategories.categoryLabel,
        })
        .from(productCategories)
        .where(eq(productCategories.productId, id));
      mappedCategories = rows.map((row) => ({
        id: row.categoryId,
        label: row.categoryLabel ?? undefined,
      }));
    } catch {
      mappedCategories = [{ id: product.categoryId, label: product.category }];
    }

    return transformProduct(product, productReviews, mappedCategories);
  } catch (error) {
    console.error(`Error loading product ${id} from DB:`, error);
    return null;
  }
}

export const getProductByRouteSegment = cache(async (segment: string): Promise<PerfumeData | null> => {
  const byId = await getProductById(segment);
  if (byId) return byId;

  const all = await getAllProducts();
  return all.find((product) => getProductSeoSlug(product) === segment) ?? null;
});

// Get products by category
export async function getProductsByCategory(
  categoryId: string
): Promise<PerfumeData[]> {
  try {
    const all = await getAllPublicProducts();
    return all.filter((p) => (p.categoryIds ?? [p.categoryId]).includes(categoryId));
  } catch (error) {
    console.error(`Error loading category ${categoryId} from DB:`, error);
    return [];
  }
}
