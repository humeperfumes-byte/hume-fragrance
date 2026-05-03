import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HumeSpecialSection from "@/components/HumeSpecialSection";
import BestsellerSection from "@/components/BestsellerSection";
import RefillProgramSection from "@/components/RefillProgramSection";
import SeoHubTeaser from "@/components/SeoHubTeaser";
import Collection from "@/components/Collection";
import HomeFaqSection from "@/components/HomeFaqSection";
import HomeReviewsSection from "@/components/HomeReviewsSection";
import LatestJournal from "@/components/LatestJournal";
import Footer from "@/components/Footer";
import nextDynamic from "next/dynamic";
import { JsonLd } from "@/components/JsonLd";
import { getOrganizationSchema, getWebSiteSchema, getFAQSchema } from "@/lib/seo";
import { getAllPublicProducts } from "@/lib/db/products";
import { getImagesByUsage } from "@/lib/db/images";
import type { HomepagePerfumeCardData } from "@/types/homepage";

export const revalidate = 120;

const Craft = nextDynamic(() => import("@/components/Craft"), {
  loading: () => <div className="py-24 md:py-32" />,
});
const About = nextDynamic(() => import("@/components/About"), {
  loading: () => <div className="py-24 md:py-32" />,
});
const KitPackShowcase = nextDynamic(() => import("@/components/KitPackShowcase"), {
  loading: () => <div className="py-24 md:py-32" />,
});

export default async function Home() {
  const [perfumes, heroSlides] = await Promise.all([
    getAllPublicProducts(),
    getImagesByUsage("hero"),
  ]);
  const homepagePerfumes: HomepagePerfumeCardData[] = perfumes.map((product) => ({
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
  }));
  const jsonLd = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getFAQSchema(),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <div data-analytics-section="hero">
        <Hero initialSlides={heroSlides} />
      </div>
      <div data-analytics-section="collection">
        <Collection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }} data-analytics-section="hume_special">
        <HumeSpecialSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }} data-analytics-section="bestsellers">
        <BestsellerSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1500px" }} data-analytics-section="kit_pack">
        <KitPackShowcase />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1100px" }} data-analytics-section="refill">
        <RefillProgramSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1300px" }} data-analytics-section="reviews">
        <HomeReviewsSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }} data-analytics-section="faq">
        <HomeFaqSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }} data-analytics-section="seo_teaser">
        <SeoHubTeaser />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }} data-analytics-section="craft">
        <Craft />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }} data-analytics-section="journal">
        <LatestJournal />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }} data-analytics-section="about">
        <About />
      </div>
      <Footer />
    </main>
  );
}
