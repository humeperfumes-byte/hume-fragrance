import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HumeSpecialSection from "@/components/HumeSpecialSection";
import BestsellerSection from "@/components/BestsellerSection";
import ComingSoonSection from "@/components/ComingSoonSection";
import RefillProgramSection from "@/components/RefillProgramSection";
import SeoHubTeaser from "@/components/SeoHubTeaser";
import Collection from "@/components/Collection";
import HomeKitDiscoveryTeasers from "@/components/HomeKitDiscoveryTeasers";
import HomeVideoCarouselSection from "@/components/HomeVideoCarouselSection";
import HomeFaqSection from "@/components/HomeFaqSection";
import HomeReviewsSection from "@/components/HomeReviewsSection";
import LatestJournal from "@/components/LatestJournal";
import Footer from "@/components/Footer";
import nextDynamic from "next/dynamic";
import { JsonLd } from "@/components/JsonLd";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  getFAQSchema,
} from "@/lib/seo";
import { getAllPublicProducts } from "@/lib/db/products";
import { getImagesByUsage } from "@/lib/db/images";
import type { HomepagePerfumeCardData } from "@/types/homepage";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "HUME Fragrance | Premium Inspired Perfumes in India",
    description:
      "Shop HUME Fragrance for premium inspired EDP perfumes in India. Long-lasting scents, designer-style profiles, free delivery over INR 500, and WhatsApp support.",
    alternates: {
      canonical: SITE_URL,
    },
  };
}

const Craft = nextDynamic(() => import("@/components/Craft"), {
  loading: () => <div className="py-24 md:py-32" />,
});
const About = nextDynamic(() => import("@/components/About"), {
  loading: () => <div className="py-24 md:py-32" />,
});
export default async function Home() {
  const baseUrl = SITE_URL;

  const [perfumes, heroSlides] = await Promise.all([
    getAllPublicProducts(),
    getImagesByUsage("hero"),
  ]);

  function getProductScore(product: {
    id: string;
    badges?: { bestSeller?: boolean; humeSpecial?: boolean };
  }) {
    return product.badges?.bestSeller
      ? 35
      : product.badges?.humeSpecial
        ? 18
        : 0;
  }

  const availablePerfumes = perfumes.filter((product) => !product.badges?.soldOut);

  const homepagePerfumes: HomepagePerfumeCardData[] = availablePerfumes
    .map((product) => ({
      id: product.id,
      name: product.name,
      inspiration: product.inspiration,
      inspirationBrand: product.inspirationBrand,
      category: product.category,
      categoryId: product.categoryId,
      categoryTags: product.categoryTags,
      categoryIds: product.categoryIds,
      dbCategoryTags: product.dbCategoryTags,
      dbCategoryIds: product.dbCategoryIds,
      images: product.images.slice(0, 1),
      price: product.price,
      reviews: product.reviews,
      badges: product.badges,
    }))
    .sort((a, b) => {
      const scoreDiff = getProductScore(b) - getProductScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      if (b.badges?.bestSeller !== a.badges?.bestSeller)
        return b.badges?.bestSeller ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
  const jsonLd = [
    getOrganizationSchema(baseUrl),
    getWebSiteSchema(baseUrl),
    getFAQSchema(),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <div data-analytics-section="hero">
        <Hero initialSlides={heroSlides} />
      </div>
      <div data-analytics-section="bestsellers">
        <BestsellerSection perfumes={homepagePerfumes} />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }}
        data-analytics-section="hume_special"
      >
        <HumeSpecialSection perfumes={homepagePerfumes} />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "980px" }}
        data-analytics-section="new_launches"
      >
        <ComingSoonSection products={availablePerfumes} />
      </div>
      <div data-analytics-section="collection">
        <Collection perfumes={homepagePerfumes} />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1500px" }}
        data-analytics-section="kit_and_discovery"
      >
        <HomeKitDiscoveryTeasers />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "760px" }}
        data-analytics-section="home_video"
      >
        <HomeVideoCarouselSection />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1100px" }}
        data-analytics-section="refill"
      >
        <RefillProgramSection />
      </div>
      <div data-analytics-section="reviews">
        <HomeReviewsSection perfumes={homepagePerfumes} />
      </div>
      <div data-analytics-section="faq">
        <HomeFaqSection />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}
        data-analytics-section="seo_teaser"
      >
        <SeoHubTeaser />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}
        data-analytics-section="craft"
      >
        <Craft />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}
        data-analytics-section="journal"
      >
        <LatestJournal />
      </div>
      <div
        style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}
        data-analytics-section="about"
      >
        <About />
      </div>
      <Footer />
    </main>
  );
}
