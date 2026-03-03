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

export const dynamic = "force-dynamic";

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
  const perfumes = await getAllProducts();
  const jsonLd = [
    getOrganizationSchema(),
    getWebSiteSchema(),
    getFAQSchema(),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />
      <Hero />
      <Collection perfumes={perfumes} />
      <HumeSpecialSection perfumes={perfumes} />
      <BestsellerSection perfumes={perfumes} />
      <RefillProgramSection />
      <SeoHubTeaser />
      <Craft />
      <LatestJournal />
      <About />
      <Footer />
    </main>
  );
}
