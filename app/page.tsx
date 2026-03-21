import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HumeSpecialSection from "@/components/HumeSpecialSection";
import BestsellerSection from "@/components/BestsellerSection";
import RefillProgramSection from "@/components/RefillProgramSection";
import SeoHubTeaser from "@/components/SeoHubTeaser";
import Collection from "@/components/Collection";
import Footer from "@/components/Footer";
import nextDynamic from "next/dynamic";
import { JsonLd } from "@/components/JsonLd";
import { getOrganizationSchema, getWebSiteSchema, getFAQSchema } from "@/lib/seo";
import { getAllProducts } from "@/lib/db/products";
import { getImagesByUsage } from "@/lib/db/images";
import type { HomepagePerfumeCardData } from "@/types/homepage";

export const revalidate = 120;

const Craft = nextDynamic(() => import("@/components/Craft"), {
  loading: () => <div className="py-24 md:py-32" />,
});
const LatestJournal = nextDynamic(() => import("@/components/LatestJournal"), {
  loading: () => <div className="py-24 md:py-32" />,
});
const About = nextDynamic(() => import("@/components/About"), {
  loading: () => <div className="py-24 md:py-32" />,
});

export default async function Home() {
  const [perfumes, heroSlides] = await Promise.all([
    getAllProducts(),
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
      <Hero initialSlides={heroSlides} />
      <Collection perfumes={homepagePerfumes} />
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }}>
        <HumeSpecialSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }}>
        <BestsellerSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1100px" }}>
        <RefillProgramSection />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "900px" }}>
        <SeoHubTeaser />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
        <Craft />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
        <LatestJournal />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1200px" }}>
        <About />
      </div>
      <Footer />
    </main>
  );
}
