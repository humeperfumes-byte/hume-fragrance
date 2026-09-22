import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnifiedOccasionsClientView from "./UnifiedOccasionsClientView";
import { getAllPublicProducts } from "@/lib/db/products";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Perfume Recommendations by Occasion | HUME Fragrance",
    description:
      "Find the perfect perfume for Date Night, College, Office, GYM, Night Out, and First Impression. Premium long-lasting inspired EDP perfumes in India.",
    alternates: {
      canonical: `${SITE_URL}/occasions`,
    },
  };
}

interface OccasionsPageProps {
  searchParams: Promise<{ selected?: string; id?: string }>;
}

export default async function OccasionsPage({ searchParams }: OccasionsPageProps) {
  const params = await searchParams;
  const selectedSlug = params?.selected || params?.id || "date-night";

  const allProducts = await getAllPublicProducts();

  const formattedProducts = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    inspiration: p.inspiration,
    inspirationBrand: p.inspirationBrand,
    category: p.category,
    categoryTags: p.categoryTags,
    categoryIds: p.categoryIds,
    images: p.images,
    price: p.price,
    gender: p.gender,
    longevity: p.longevity,
    badges: p.badges,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-[#c9b3ff]/30 selection:text-white">
      <Header />

      <UnifiedOccasionsClientView
        products={formattedProducts}
        initialSelectedSlug={selectedSlug}
      />

      <Footer />
    </main>
  );
}
