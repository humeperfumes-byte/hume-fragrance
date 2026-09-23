import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnifiedOccasionsClientView from "../UnifiedOccasionsClientView";
import { getAllPublicProducts } from "@/lib/db/products";
import { OCCASIONS_LIST, type OccasionCardConfig } from "@/data/occasions";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

interface OccasionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return OCCASIONS_LIST.map((occ) => ({
    id: occ.slug,
  }));
}

function findOccasionBySlug(slug: string): OccasionCardConfig | null {
  const normalized = slug.toLowerCase().trim();
  const found = OCCASIONS_LIST.find(
    (occ) => occ.slug.toLowerCase() === normalized || occ.id.toLowerCase() === normalized,
  );
  if (found) return found;

  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    id: slug,
    slug,
    occasionTitle: formattedTitle,
    shortTitle: formattedTitle,
    badgeLabel: formattedTitle,
    iconName: "sparkles",
    tagline: `Best ${formattedTitle} perfumes crafted for luxury & performance`,
    targetPerfumeId: "",
    fallbackName: "HUME Signature",
    fallbackInspiration: "Luxury EDP",
    fallbackBrand: "HUME",
    fallbackCategory: "Fresh / Woody",
    fallbackPrice: 48,
    fallbackImage: "/images/perfume-1.jpg",
    keyNotes: ["Amber", "Citrus", "Cedarwood", "Musk"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#1a1528]/90 via-[#120e1f]/95 to-[#0b0814]",
      badgeStyle: "bg-[#c9b3ff]/20 text-[#e6deff] border-[#c9b3ff]/30",
      borderGlow: "border-[#c9b3ff]/20 group-hover:border-[#c9b3ff]/50",
      glowBg: "from-[#c9b3ff]/20 to-purple-600/10",
      accentText: "text-[#d8c7ff]",
      iconBg: "bg-[#c9b3ff]/20 text-[#e6deff] border-[#c9b3ff]/30",
      btnStyle: "bg-[#c9b3ff] hover:bg-[#d8c9ff] text-[#17121e] font-bold shadow-purple-950/40",
    },
  };
}

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { id } = await params;
  const occasion = findOccasionBySlug(id);
  const title = occasion
    ? `Best Perfumes for ${occasion.occasionTitle} | HUME Fragrance`
    : "Occasion Perfumes | HUME Fragrance";
  const description = occasion
    ? `Explore top-rated long-lasting inspired EDP perfumes for ${occasion.occasionTitle}. ${occasion.tagline}. Free shipping across India.`
    : "Find the best long-lasting perfumes for date night, office, college, gym, and night outs.";

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/occasions/${id}`,
    },
  };
}

export default async function OccasionPage({ params }: OccasionPageProps) {
  const { id } = await params;
  const occasion = findOccasionBySlug(id);
  if (!occasion) notFound();

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

      <Suspense
        fallback={
          <div className="min-h-screen pt-24 pb-20 flex items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">Loading occasion...</p>
          </div>
        }
      >
        <UnifiedOccasionsClientView
          products={formattedProducts}
          initialSelectedSlug={occasion.slug}
        />
      </Suspense>

      <Footer />
    </main>
  );
}
