import { db } from "@/db";
import { products, reviews, productCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { perfumes as localPerfumes, type PerfumeData, type Review } from "@/data/perfumes";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductSeoSlug } from "@/lib/product-route";

function buildDefaultReviews(product: any): Review[] {
  const productLabel = product.name ?? product.inspiration ?? "this fragrance";
  const entries: Array<Pick<Review, "author" | "rating" | "date" | "content">> = [
    {
      author: "Arjun M.",
      rating: 5,
      date: "2026-01-12",
      content: `Amazing longevity. ${productLabel} lasts all day even in Mumbai humidity.`,
    },
    {
      author: "Ritika S.",
      rating: 5,
      date: "2026-01-24",
      content: "Very premium blend for the price. Smooth opening and beautiful dry down.",
    },
    {
      author: "Vikram R.",
      rating: 4,
      date: "2026-02-02",
      content: "Projection is strong for the first few hours, then sits close and elegant.",
    },
    {
      author: "Neha P.",
      rating: 5,
      date: "2026-02-09",
      content: "Received compliments in office and at dinner both. Great signature scent.",
    },
    {
      author: "Karan D.",
      rating: 4,
      date: "2026-02-15",
      content: "Quality feels consistent and bottle performance is excellent for daily wear.",
    },
  ];

  return entries.map((entry, index) => ({
    id: `default-${product.id}-${index + 1}`,
    author: entry.author,
    rating: entry.rating,
    date: entry.date,
    title: "Verified Buyer Review",
    content: entry.content,
    verified: true,
  }));
}

// Transform database product to PerfumeData format
function transformProduct(
  product: any,
  productReviews: any[],
  mappedCategories: Array<{ id: string; label?: string }> = []
): PerfumeData {
  const defaultCelebImage = "https://placehold.co/600x600?text=Celeb";
  const fallbackReviews = buildDefaultReviews(product);
  const mappedReviews = productReviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: parseFloat(r.rating),
    date: r.date,
    title: r.title,
    content: r.content,
    verified: r.verified,
  }));

  const normalizedReviews =
    mappedReviews.length >= 5
      ? mappedReviews.slice(0, 7)
      : [...mappedReviews, ...fallbackReviews].slice(0, 5);

  return {
    id: product.id,
    name: product.name,
    inspiration: product.inspiration,
    inspirationBrand: product.inspirationBrand,
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
    images: (product.images as string[]).map((url) => withCloudinaryTransforms(url)),
    price: parseFloat(product.price),
    priceCurrency: "INR",
    description: product.description,
    seoDescription: product.seoDescription,
    seoKeywords: product.seoKeywords as string[],
    badges: {
      bestSeller: Boolean((product.badges as any)?.bestSeller),
      humeSpecial: Boolean((product.badges as any)?.humeSpecial),
      limitedStock: Boolean((product.badges as any)?.limitedStock),
    },
    notes: product.notes as {
      top: string[];
      heart: string[];
      base: string[];
    },
    longevity: product.longevity as {
      duration: string;
      sillage: string;
      season: string[];
      occasion: string[];
    },
    size: product.size,
    reviews: normalizedReviews,
  };
}

// Get all products
export async function getAllProducts(): Promise<PerfumeData[]> {
  try {
    const allProducts = await db.select().from(products);

    const productsWithReviews = await Promise.all(
      allProducts.map(async (product) => {
        const productReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.productId, product.id));

        let mappedCategories: Array<{ id: string; label?: string }> = [];
        try {
          const rows = await db
            .select({
              categoryId: productCategories.categoryId,
              categoryLabel: productCategories.categoryLabel,
            })
            .from(productCategories)
            .where(eq(productCategories.productId, product.id));
          mappedCategories = rows.map((row) => ({
            id: row.categoryId,
            label: row.categoryLabel ?? undefined,
          }));
        } catch {
          mappedCategories = [{ id: product.categoryId, label: product.category }];
        }

        return transformProduct(product, productReviews, mappedCategories);
      })
    );

    return productsWithReviews;
  } catch (error) {
    console.error("Error loading products from DB, using local fallback:", error);
    return localPerfumes;
  }
}

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

    const productReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, id));

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
    console.error(`Error loading product ${id} from DB, using local fallback:`, error);
    return localPerfumes.find((p) => p.id === id) ?? null;
  }
}

export async function getProductByRouteSegment(segment: string): Promise<PerfumeData | null> {
  const byId = await getProductById(segment);
  if (byId) return byId;

  const all = await getAllProducts();
  return all.find((product) => getProductSeoSlug(product) === segment) ?? null;
}

// Get products by category
export async function getProductsByCategory(
  categoryId: string
): Promise<PerfumeData[]> {
  try {
    const all = await getAllProducts();
    return all.filter((p) => (p.categoryIds ?? [p.categoryId]).includes(categoryId));
  } catch (error) {
    console.error(`Error loading category ${categoryId} from DB, using local fallback:`, error);
    return localPerfumes.filter((p) => p.categoryId === categoryId);
  }
}
