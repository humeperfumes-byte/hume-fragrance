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
import { db } from "@/db";
import { behavioralEvents, cartEvents, consentEvents, orders } from "@/db/schema";
import { and, desc, gte, sql } from "drizzle-orm";
import { getProductPath } from "@/lib/product-route";

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

type ProductSignal = {
  views: number;
  clicks: number;
  addToCart: number;
  orderedUnits: number;
  orderRevenue: number;
};

function createProductSignal(): ProductSignal {
  return {
    views: 0,
    clicks: 0,
    addToCart: 0,
    orderedUnits: 0,
    orderRevenue: 0,
  };
}

function normalizeCartProductId(id: string | null | undefined) {
  return String(id ?? "").split("::")[0].replace(/^gift-/, "").trim();
}

function addSignal(
  map: Map<string, ProductSignal>,
  productId: string,
  apply: (signal: ProductSignal) => void,
) {
  if (!productId) return;
  const existing = map.get(productId) ?? createProductSignal();
  apply(existing);
  map.set(productId, existing);
}

export default async function Home() {
  const signalWindow = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const [perfumes, heroSlides, productViewStats, productClickRows, cartRows, orderRows] =
    await Promise.all([
      getAllPublicProducts(),
      getImagesByUsage("hero"),
      db
        .select({
          path: behavioralEvents.path,
          views: sql<number>`count(*)`.as("views"),
        })
        .from(behavioralEvents)
        .where(
          and(
            gte(behavioralEvents.createdAt, signalWindow),
            sql`${behavioralEvents.path} LIKE '/product/%'`,
          ),
        )
        .groupBy(behavioralEvents.path)
        .orderBy(desc(sql`views`))
        .catch(() => []),
      db
        .select({
          data: consentEvents.data,
          createdAt: consentEvents.createdAt,
        })
        .from(consentEvents)
        .where(gte(consentEvents.createdAt, signalWindow))
        .orderBy(desc(consentEvents.createdAt))
        .limit(10000)
        .catch(() => []),
      db
        .select({
          eventType: cartEvents.eventType,
          productId: cartEvents.productId,
        })
        .from(cartEvents)
        .where(gte(cartEvents.createdAt, signalWindow))
        .orderBy(desc(cartEvents.createdAt))
        .limit(10000)
        .catch(() => []),
      db
        .select({
          status: orders.status,
          cartSnapshot: orders.cartSnapshot,
        })
        .from(orders)
        .where(gte(orders.createdAt, signalWindow))
        .orderBy(desc(orders.createdAt))
        .limit(5000)
        .catch(() => []),
    ]);

  const productSignals = new Map<string, ProductSignal>();
  const productPathToId = new Map<string, string>();

  perfumes.forEach((product) => {
    const path = getProductPath({
      id: product.id,
      name: product.name,
      inspiration: product.inspiration,
      inspirationBrand: product.inspirationBrand,
    });
    productPathToId.set(path, product.id);
  });

  productViewStats.forEach((stat) => {
    const path = String(stat.path ?? "").split("?")[0];
    const productId = productPathToId.get(path);
    if (productId) {
      addSignal(productSignals, productId, (signal) => {
        signal.views += Number(stat.views) || 0;
      });
    }
  });

  productClickRows.forEach((row) => {
    if (row.data?.eventType !== "product_click") return;
    const productId = normalizeCartProductId(String(row.data?.productId ?? ""));
    addSignal(productSignals, productId, (signal) => {
      signal.clicks += 1;
    });
  });

  cartRows
    .filter((row) => row.eventType === "add_to_cart")
    .forEach((row) => {
      const productId = normalizeCartProductId(row.productId);
      addSignal(productSignals, productId, (signal) => {
        signal.addToCart += 1;
      });
    });

  orderRows
    .filter((row) => row.status !== "cancelled")
    .forEach((order) => {
      order.cartSnapshot?.forEach((item) => {
        if (item.isGift) return;
        const productId = normalizeCartProductId(item.id);
        addSignal(productSignals, productId, (signal) => {
          signal.orderedUnits += item.quantity;
          signal.orderRevenue += item.price * item.quantity;
        });
      });
    });

  function getProductScore(product: {
    id: string;
    badges?: { bestSeller?: boolean; humeSpecial?: boolean };
  }) {
    const signal = productSignals.get(product.id) ?? createProductSignal();
    const badgeBoost = product.badges?.bestSeller ? 35 : product.badges?.humeSpecial ? 18 : 0;

    return (
      signal.orderedUnits * 120 +
      signal.orderRevenue / 20 +
      signal.addToCart * 35 +
      signal.clicks * 14 +
      signal.views * 3 +
      badgeBoost
    );
  }

  const homepagePerfumes: HomepagePerfumeCardData[] = perfumes
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
      if (b.badges?.bestSeller !== a.badges?.bestSeller) return b.badges?.bestSeller ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
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
      <div data-analytics-section="bestsellers">
        <BestsellerSection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1400px" }} data-analytics-section="hume_special">
        <HumeSpecialSection perfumes={homepagePerfumes} />
      </div>
      <div data-analytics-section="collection">
        <Collection perfumes={homepagePerfumes} />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1500px" }} data-analytics-section="kit_pack">
        <KitPackShowcase />
      </div>
      <div style={{ contentVisibility: "auto", containIntrinsicSize: "1100px" }} data-analytics-section="refill">
        <RefillProgramSection />
      </div>
      <div data-analytics-section="reviews">
        <HomeReviewsSection perfumes={homepagePerfumes} />
      </div>
      <div data-analytics-section="faq">
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
