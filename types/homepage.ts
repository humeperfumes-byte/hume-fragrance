import type { CategoryTag } from "@/lib/product-categories";
export type HomepagePerfumeCardData = {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  visibility?: "public" | "seo_only";
  category: string;
  categoryId: string;
  categoryTags?: CategoryTag[];
  categoryIds?: string[];
  dbCategoryTags?: CategoryTag[];
  dbCategoryIds?: string[];
  images: string[];
  price: number;
  reviews?: Array<{
    id: string;
    author: string;
    avatarUrl?: string;
    reviewerCity?: string;
    reviewerLanguage?: string;
    rating: number;
    date: string;
    title?: string;
    content: string;
    verified?: boolean;
  }>;
  badges?: {
    bestSeller?: boolean;
    humeSpecial?: boolean;
    limitedStock?: boolean;
    soldOut?: boolean;
  };
};
