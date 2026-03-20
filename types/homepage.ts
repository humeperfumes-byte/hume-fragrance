export type HomepagePerfumeCardData = {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  category: string;
  categoryId: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  dbCategoryTags?: Array<{ id: string; label?: string }>;
  dbCategoryIds?: string[];
  images: string[];
  price: number;
  badges?: {
    bestSeller?: boolean;
    humeSpecial?: boolean;
    limitedStock?: boolean;
  };
};
