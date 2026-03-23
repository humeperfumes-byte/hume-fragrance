export type HomepagePerfumeCardData = {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  visibility?: "public" | "seo_only";
  category: string;
  categoryId: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  dbCategoryTags?: Array<{ id: string; label?: string }>;
  dbCategoryIds?: string[];
  images: string[];
  price: number;
  reviews?: Array<{
    id: string;
    author: string;
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
  };
};
