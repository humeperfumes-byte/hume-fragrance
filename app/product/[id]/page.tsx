import type { Metadata } from "next";
import Link from "next/link";
import { getUnavailableProduct } from "@/lib/unavailable-products";
import { NIGHT_OUT_IMAGE_PLACEHOLDER, NIGHT_OUT_REFERENCE_URL } from "@/lib/night-out";
import { PACIFIC_CHILL_REFERENCE_URL } from "@/lib/pacific-chill";
import { ALTHAIR_REFERENCE_URL } from "@/lib/althair";
import { ANGELS_SHARE_REFERENCE_URL } from "@/lib/angels-share";
import { HUGO_BOSS_REFERENCE_URL } from "@/lib/hugo-boss";
import { MOST_WANTED_REFERENCE_URL } from "@/lib/most-wanted";
import { HER_REFERENCE_URL } from "@/lib/her";
import { JADORE_REFERENCE_URL } from "@/lib/jadore";
import { EROS_REFERENCE_URL } from "@/lib/eros";
import { ONE_MILLION_REFERENCE_URL } from "@/lib/one-million";
import { LA_NUIT_REFERENCE_URL } from "@/lib/la-nuit";
import { TOBACCO_VANILLE_REFERENCE_URL } from "@/lib/tobacco-vanille";
import { NOIR_EXTREME_REFERENCE_URL } from "@/lib/noir-extreme";
import { BRIGHT_CRYSTAL_REFERENCE_URL } from "@/lib/bright-crystal";
import { GODDESS_REFERENCE_URL } from "@/lib/goddess";
import { INVICTUS_REFERENCE_URL } from "@/lib/invictus";
import { notFound, permanentRedirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import ProductDetailView from "./ProductDetailView";
import { getRelatedBlogPostsByProductId } from "@/lib/db/blog";
import { getAllPublicProducts, getProductByRouteSegment } from "@/lib/db/products";
import {
  getProductSchema,
  getBreadcrumbSchema,
  getProductFAQSchema,
  getProductReviewSchema,
} from "@/lib/seo";
import { getProductPath, getProductSeoSlug } from "@/lib/product-route";
import {
  getUpcomingProductAsPerfume,
  getUpcomingProductBySlug,
} from "@/lib/upcoming-products";
import { SITE_URL, siteUrlForBase } from "@/lib/site";

export const revalidate = 21600;

export async function generateStaticParams() {
  const products = await getAllPublicProducts();
  return products.map((product) => ({ id: getProductSeoSlug(product) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const perfume = await getProductByRouteSegment(id);

  const baseUrl = SITE_URL;
  if (!perfume) {
    const unavailable = getUnavailableProduct(id);
    if (unavailable) return {
      title: `${unavailable.name} — Currently Unavailable`,
      description: `${unavailable.name} is currently unavailable. Explore the current HUME perfume collection.`,
      robots: { index: false, follow: true },
      alternates: { canonical: `${baseUrl}/product/${unavailable.id}` },
    };
    const launchProduct = getUpcomingProductBySlug(id);
    if (!launchProduct) return { title: "Product Not Found" };

    const product = getUpcomingProductAsPerfume(launchProduct);
    const canonicalUrl = siteUrlForBase(baseUrl, launchProduct.path);

    return {
      title: `${launchProduct.name} | HUME Fragrance`,
      description: product.seoDescription,
      keywords: product.seoKeywords,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${launchProduct.name} | HUME Fragrance`,
        description: product.seoDescription,
        url: canonicalUrl,
        images: product.images?.[0] ? [siteUrlForBase(baseUrl, product.images[0])] : [],
      },
    };
  }

  const canonicalUrl = `${baseUrl}${getProductPath(perfume)}`;

  return {
    title: `${perfume.name} - ${perfume.inspirationBrand} ${perfume.inspiration} Inspired Perfume`,
    description: perfume.seoDescription,
    ...(["night-out", "pacific-chill", "althair", "angels-share", "hugo-boss", "most-wanted", "her", "jadore", "eros", "1-million", "la-nuit", "tobacco-vanille", "noir-extreme", "bright-crystal", "goddess", "invictus"].includes(perfume.id) ? { keywords: perfume.seoKeywords } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${perfume.name} | HUME Fragrance`,
      description: perfume.seoDescription,
      url: canonicalUrl,
      images: perfume.images?.[0] ? [perfume.images[0]] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const perfume = await getProductByRouteSegment(id);

  if (!perfume) {
    const unavailable = getUnavailableProduct(id);
    if (unavailable) {
      if (id !== unavailable.id) permanentRedirect(`/product/${unavailable.id}`);
      return (
        <main className="bg-background min-h-screen">
          <Header />
          <section className="mx-auto max-w-2xl px-6 py-32 text-center">
            <p className="mb-4 text-sm uppercase tracking-widest">HUME Fragrance</p>
            <h1 className="mb-6 text-4xl">{unavailable.name}</h1>
            <p className="mb-8 text-muted-foreground">This perfume is currently unavailable. Explore our current collection to find your next scent.</p>
            <Link href="/shop" className="inline-block bg-black px-8 py-4 text-white">Explore available perfumes</Link>
          </section>
          <Footer />
        </main>
      );
    }
    const launchProduct = getUpcomingProductBySlug(id);
    if (!launchProduct) notFound();

    const liveProduct = getUpcomingProductAsPerfume(launchProduct);
    const baseUrl = SITE_URL;
    const canonicalUrl = siteUrlForBase(baseUrl, launchProduct.path);
    const jsonLd = [
      getProductSchema(liveProduct, baseUrl),
      getProductFAQSchema(liveProduct),
      getBreadcrumbSchema([
        { name: "Home", url: baseUrl },
        { name: "Shop", url: `${baseUrl}/shop` },
        { name: liveProduct.name, url: canonicalUrl },
      ]),
    ];

    return (
      <main className="bg-background min-h-screen">
        <JsonLd data={jsonLd} />
        <Header />
        <ProductDetailView
          perfume={liveProduct}
          relatedBlogs={[]}
          priceLabel={launchProduct.priceLabel}
          faqItems={launchProduct.faq}
        />
        <Footer />
      </main>
    );
  }

  const seoSlug = getProductSeoSlug(perfume);
  if (id !== seoSlug) {
    permanentRedirect(getProductPath(perfume));
  }

  const relatedBlogs = await getRelatedBlogPostsByProductId(perfume.id, 3);
  const baseUrl = SITE_URL;

  const productJsonLd = [
    getProductSchema(perfume, baseUrl),
    getProductFAQSchema(perfume),
    getProductReviewSchema(perfume, baseUrl),
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Shop", url: `${baseUrl}/shop` },
      { name: perfume.name, url: `${baseUrl}${getProductPath(perfume)}` },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={productJsonLd} />
      <Header />
      <ProductDetailView perfume={perfume} relatedBlogs={relatedBlogs} />
      {perfume.id === "stronger-with-you-intensely" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Strong With You guides</h2><p className="mb-4">Compare the inspiration, understand the scent direction and plan your own wear test.</p><Link href="/guides" className="underline">Read the Strong With You buying guides and comparisons</Link></section>}
      {perfume.id === "acqua-di-gio-profondo" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Acqua di Gio guides</h2><p className="mb-4">Explore the Profondo inspiration, marine scent direction, everyday wear and buying comparisons.</p><Link href="/guides#acqua-di-gio" className="underline">Read the Acqua di Gio buying guides and comparisons</Link></section>}
      {perfume.id === "creed-aventus" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Aventus guides</h2><p className="mb-4">Explore the Creed inspiration, fruity-smoky-woody direction, everyday wear and buying comparisons.</p><Link href="/guides#aventus" className="underline">Read the Aventus buying guides and comparisons</Link></section>}
      {perfume.id === "black-opium" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Black Opium guides</h2><p className="mb-4">Explore the YSL inspiration, coffee-vanilla-floral direction, occasion wear and buying comparisons.</p><Link href="/guides#black-opium" className="underline">Read the Black Opium buying guides and comparisons</Link></section>}
      {perfume.id === "good-girl" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Good Girl guides</h2><p className="mb-4">Explore the Carolina Herrera inspiration, sweet white-floral direction, occasion wear and buying comparisons.</p><Link href="/guides#good-girl" className="underline">Read the Good Girl buying guides and comparisons</Link></section>}
      {perfume.id === "hawas" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Hawas guides</h2><p className="mb-4">Explore the Rasasi inspiration, fresh aquatic-fruity direction, college and everyday wear, and buying comparisons.</p><Link href="/guides#hawas" className="underline">Read the Hawas buying guides and comparisons</Link></section>}
      {perfume.id === "lv-imagination" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Imagine guides</h2><p className="mb-4">Explore the Louis Vuitton inspiration, citrus-tea direction, office and daily wear, and buying comparisons.</p><Link href="/guides#imagine" className="underline">Read the Imagine buying guides and comparisons</Link></section>}
      {perfume.id === "lattafa-khamrah-qahwa-100ml" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Khamrah Qahwa guides</h2><p className="mb-4">Explore the Lattafa inspiration, coffee-gourmand direction, cooler-weather wear and buying comparisons.</p><Link href="/guides#khamrah-qahwa" className="underline">Read the Khamrah Qahwa buying guides and comparisons</Link></section>}
      {perfume.id === "le-male-elixir" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Le Male Elixir guides</h2><p className="mb-4">Explore the Jean Paul Gaultier inspiration, sweet aromatic direction, cooler-weather wear and buying comparisons.</p><Link href="/guides#le-male-elixir" className="underline">Read the Le Male Elixir buying guides and comparisons</Link></section>}
      {perfume.id === "flora" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Flora guides</h2><p className="mb-4">Explore the Gucci Flora inspiration and floral woody direction.</p><Link href="/guides#flora" className="underline">Read the Flora buying guides and comparisons</Link></section>}
      {perfume.id === "spicebomb" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Spice Inferno guides</h2><p className="mb-4">Explore the Viktor &amp; Rolf Spicebomb inspiration and spicy tobacco leather direction.</p><Link href="/guides#spice-inferno" className="underline">Read the Spice Inferno buying guides and comparisons</Link></section>}
      {perfume.id === "sauvage-elixir" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Sauvage Elixir guides</h2><p className="mb-4">Explore the Dior Sauvage Elixir inspiration and spicy lavender woody direction.</p><Link href="/guides#sauvage-elixir" className="underline">Read the Sauvage Elixir buying guides and comparisons</Link></section>}
      {perfume.id === "valentino-born-in-roma-intense" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Roma Intense guides</h2><p className="mb-4">Explore the Valentino Born in Roma Intense inspiration and warm vanilla aromatic direction.</p><Link href="/guides#roma-intense" className="underline">Read the Roma Intense buying guides and comparisons</Link></section>}
      {perfume.id === "paradoxe" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Paradoxe guides</h2><p className="mb-4">Explore the Prada Paradoxe inspiration and floral amber musk direction.</p><Link href="/guides#paradoxe" className="underline">Read the Paradoxe buying guides and comparisons</Link></section>}
      {perfume.id === "oud-maracuja" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Oud Maracuja guides</h2><p className="mb-4">Explore the Maison Crivelli inspiration and passion fruit oud leather direction.</p><Link href="/guides#oud-maracuja" className="underline">Read the Oud Maracuja buying guides and comparisons</Link></section>}
      {perfume.id === "myself" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Myself guides</h2><p className="mb-4">Explore the YSL MYSLF inspiration and citrus floral woody direction.</p><Link href="/guides#myself" className="underline">Read the Myself buying guides and comparisons</Link></section>}
      {perfume.id === "libre-intense" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Libre Intense guides</h2><p className="mb-4">Explore the YSL Libre Intense inspiration and lavender floral vanilla direction.</p><Link href="/guides#libre-intense" className="underline">Read the Libre Intense buying guides and comparisons</Link></section>}
      {perfume.id === "replica-jazz-club-100ml" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Jazz Club guides</h2><p className="mb-4">Explore the Maison Margiela REPLICA Jazz Club inspiration and rum-style tobacco vanilla direction.</p><Link href="/guides#jazz-club" className="underline">Read the Jazz Club buying guides and comparisons</Link></section>}
      {perfume.id === "homme-intense" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Homme Intense guides</h2><p className="mb-4">Explore the Dior Homme Intense inspiration and powdery iris woody direction.</p><Link href="/guides#homme-intense" className="underline">Read the Homme Intense buying guides and comparisons</Link></section>}
      {perfume.id === "hawas-ice" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Hawas Ice guides</h2><p className="mb-4">Explore the Rasasi Hawas Ice inspiration and fresh fruity woody character.</p><Link href="/guides#hawas-ice" className="underline">Read the Hawas Ice buying guides and comparisons</Link></section>}
      {perfume.id === "guilty-homme" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Guilty Pour Homme guides</h2><p className="mb-4">Explore the Gucci Guilty inspiration and aromatic woody character.</p><Link href="/guides#guilty-pour-homme" className="underline">Read the Guilty Pour Homme buying guides and comparisons</Link></section>}
      {perfume.id === "br-540" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore BR 540 guides</h2><p className="mb-4">Explore the Baccarat Rouge 540 inspiration and ambery woody direction.</p><Link href="/guides#br-540" className="underline">Read the BR 540 buying guides and comparisons</Link></section>}
      {perfume.id === "allure-sport" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Allure Sport guides</h2><p className="mb-4">Explore the Chanel Allure Homme Sport inspiration and fresh woody character.</p><Link href="/guides#allure-sport" className="underline">Read the Allure Sport buying guides and comparisons</Link></section>}
      {perfume.id === "tobacco-vanille" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Tobacco Vanille guides</h2><p className="mb-4">Explore the Tom Ford Tobacco Vanille inspiration and warm tobacco vanilla character.</p><Link href="/guides#tobacco-vanille" className="underline">Read the Tobacco Vanille buying guides and comparisons</Link></section>}
      {perfume.id === "pacific-chill" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Pacific Chill guides</h2><p className="mb-4">Explore the Louis Vuitton Pacific Chill inspiration and fresh citrus-fruity character.</p><Link href="/guides#pacific-chill" className="underline">Read the Pacific Chill buying guides and comparisons</Link></section>}
      {perfume.id === "noir-extreme" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Noir Extreme guides</h2><p className="mb-4">Explore the Tom Ford Noir Extreme EDP inspiration and warm gourmand woody character.</p><Link href="/guides#noir-extreme" className="underline">Read the Noir Extreme buying guides and comparisons</Link></section>}
      {perfume.id === "night-out" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Night Out guides</h2><p className="mb-4">Explore the Afnan 9 PM Night Out inspiration and fruity spicy amber character.</p><Link href="/guides#night-out" className="underline">Read the Night Out buying guides and comparisons</Link></section>}
      {perfume.id === "most-wanted" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Most Wanted guides</h2><p className="mb-4">Explore the Azzaro The Most Wanted Parfum inspiration and spicy woody vanilla character.</p><Link href="/guides#most-wanted" className="underline">Read the Most Wanted buying guides and comparisons</Link></section>}
      {perfume.id === "la-nuit" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore La Nuit guides</h2><p className="mb-4">Explore the YSL La Nuit de L’Homme EDT inspiration and spicy aromatic woody character.</p><Link href="/guides#la-nuit" className="underline">Read the La Nuit buying guides and comparisons</Link></section>}
      {perfume.id === "jadore" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore J’adore guides</h2><p className="mb-4">Explore the Dior J’adore EDP inspiration and floral bouquet character.</p><Link href="/guides#jadore" className="underline">Read the J’adore buying guides and comparisons</Link></section>}
      {perfume.id === "invictus" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Invictus guides</h2><p className="mb-4">Explore the Rabanne Invictus EDT inspiration, grapefruit and marine woody character.</p><Link href="/guides#invictus" className="underline">Read the Invictus buying guides and comparisons</Link></section>}
      {perfume.id === "hugo-boss" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Hugo Boss Man guides</h2><p className="mb-4">Explore the HUGO Man inspiration, green apple and aromatic woody character.</p><Link href="/guides#hugo-boss-man" className="underline">Read the Hugo Boss Man buying guides and comparisons</Link></section>}
      {perfume.id === "her" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Her guides</h2><p className="mb-4">Explore the Burberry Her EDP inspiration, berries, florals and creamy amber character.</p><Link href="/guides#her" className="underline">Read the Her buying guides and comparisons</Link></section>}
      {perfume.id === "goddess" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Goddess guides</h2><p className="mb-4">Explore the Burberry Goddess EDP inspiration, vanilla and lavender character.</p><Link href="/guides#goddess" className="underline">Read the Goddess buying guides and comparisons</Link></section>}
      {perfume.id === "eros" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Eros guides</h2><p className="mb-4">Explore the Versace Eros EDP inspiration, minty citrus and woody vanilla character.</p><Link href="/guides#eros" className="underline">Read the Eros buying guides and comparisons</Link></section>}
      {perfume.id === "bright-crystal" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Bright Crystal guides</h2><p className="mb-4">Explore the Versace Bright Crystal EDT inspiration, floral-fruity character and buying comparisons.</p><Link href="/guides#bright-crystal" className="underline">Read the Bright Crystal buying guides and comparisons</Link></section>}
      {perfume.id === "angels-share" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Angels Share guides</h2><p className="mb-4">Explore the Kilian Angels’ Share inspiration, cognac and cinnamon character and buying comparisons.</p><Link href="/guides#angels-share" className="underline">Read the Angels Share buying guides and comparisons</Link></section>}
      {perfume.id === "althair" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Althair guides</h2><p className="mb-4">Explore the Parfums de Marly Althaïr inspiration, vanilla character and buying comparisons.</p><Link href="/guides#althair" className="underline">Read the Althair buying guides and comparisons</Link></section>}
      {perfume.id === "1-million" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore 1 Million guides</h2><p className="mb-4">Explore the Rabanne 1 Million EDT inspiration, sweet-spicy woody character and buying comparisons.</p><Link href="/guides#1-million" className="underline">Read the 1 Million buying guides and comparisons</Link></section>}
      {perfume.id === "ysl-y-edp" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Y EDP guides</h2><p className="mb-4">Explore the YSL Y Eau de Parfum inspiration, fresh aromatic character and buying comparisons.</p><Link href="/guides#y-edp" className="underline">Read the Y EDP buying guides and comparisons</Link></section>}
      {perfume.id === "creed-viking" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Viking Spirit guides</h2><p className="mb-4">Explore the original Creed Viking inspiration, aromatic-woody character and buying comparisons.</p><Link href="/guides#viking-spirit" className="underline">Read the Viking Spirit buying guides and comparisons</Link></section>}
      {perfume.id === "bleu-de-chanel" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore The Blue guides</h2><p className="mb-4">Explore the Chanel Bleu de Chanel inspiration, fresh woody character and buying comparisons.</p><Link href="/guides#the-blue" className="underline">Read The Blue buying guides and comparisons</Link></section>}
      {perfume.id === "terre-de-hermes" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Terre de Hermes guides</h2><p className="mb-4">Explore the Hermès Terre d’Hermès inspiration, citrus-mineral woody character and buying comparisons.</p><Link href="/guides#terre-de-hermes" className="underline">Read the Terre de Hermes buying guides and comparisons</Link></section>}
      {perfume.id === "srk-special" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore SRK Special guides</h2><p className="mb-4">Explore HUME’s Tam Dao + Dunhill Icon interpretation, woody-aromatic character and buying comparisons. This is an independent HUME perfume with no Shah Rukh Khan endorsement.</p><Link href="/guides#srk-special" className="underline">Read the SRK Special buying guides and comparisons</Link></section>}
      {perfume.id === "sauvage-noir" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Sauvage guides</h2><p className="mb-4">Explore the Dior Sauvage Eau de Toilette inspiration, fresh-spicy character and buying comparisons.</p><Link href="/guides#sauvage" className="underline">Read the Sauvage buying guides and comparisons</Link></section>}
      {perfume.id === "red-tobacco" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Red Tobacco guides</h2><p className="mb-4">Explore the Mancera inspiration, sweet-spicy tobacco character and buying comparisons.</p><Link href="/guides#red-tobacco" className="underline">Read the Red Tobacco buying guides and comparisons</Link></section>}
      {perfume.id === "oud-wood" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Oud Wood guides</h2><p className="mb-4">Explore the Tom Ford Oud Wood Eau de Parfum inspiration, refined woody character and buying comparisons.</p><Link href="/guides#oud-wood" className="underline">Read the Oud Wood buying guides and comparisons</Link></section>}
      {perfume.id === "ombre-nomade" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Ombre Nomade guides</h2><p className="mb-4">Explore the Louis Vuitton inspiration, smoky oud character and buying comparisons.</p><Link href="/guides#ombre-nomade" className="underline">Read the Ombre Nomade buying guides and comparisons</Link></section>}
      {perfume.id === "ombre-leather" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Omb Leather guides</h2><p className="mb-4">Explore the Tom Ford Ombré Leather Eau de Parfum inspiration, leather character and buying comparisons.</p><Link href="/guides#omb-leather" className="underline">Read the Omb Leather buying guides and comparisons</Link></section>}
      {perfume.id === "no-5" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore No 5 guides</h2><p className="mb-4">Explore the Chanel N°5 Eau de Parfum inspiration, classic floral character and buying comparisons.</p><Link href="/guides#no-5" className="underline">Read the No 5 buying guides and comparisons</Link></section>}
      {perfume.id === "myrrh-tonka" && <section className="mx-auto max-w-4xl px-6 pb-16"><h2 className="text-xl mb-3">Explore Myrrh & Tonka guides</h2><p className="mb-4">Explore the Jo Malone inspiration, warm resinous direction, unisex appeal and buying comparisons.</p><Link href="/guides#myrrh-tonka" className="underline">Read the Myrrh & Tonka buying guides and comparisons</Link></section>}
      {perfume.id === "night-out" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Afnan 9 PM Night Out inspiration</h2>
          <p>Night Out explores a fruity, spicy, amber direction for evening wear. Its note pyramid references the inspiration profile; note names are scent descriptors, not an ingredient list or a promise of an identical formula.</p>
          <p className="mt-3">Reference: <a href={NIGHT_OUT_REFERENCE_URL} className="underline">Afnan’s official 9 PM Night Out profile</a>. HUME and Afnan are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "pacific-chill" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Louis Vuitton Pacific Chill inspiration</h2>
          <p>Pacific Chill explores fresh citrus, blackcurrant and cooling aromatic notes for daytime scent discovery. The note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={PACIFIC_CHILL_REFERENCE_URL} className="underline">Louis Vuitton’s official Pacific Chill profile</a>. HUME and Louis Vuitton are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "althair" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Parfums de Marly Althaïr inspiration</h2>
          <p>Althair explores a warm vanilla, amber and woody scent direction. The note groups describe the original Althaïr inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={ALTHAIR_REFERENCE_URL} className="underline">Parfums de Marly’s official Althaïr profile</a>. HUME and Parfums de Marly are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "angels-share" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Kilian Angels’ Share inspiration</h2>
          <p>Angels Share explores a warm gourmand scent direction. The note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={ANGELS_SHARE_REFERENCE_URL} className="underline">Kilian’s official Angels’ Share profile</a>. HUME and Kilian are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "hugo-boss" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the HUGO Man inspiration</h2>
          <p>Hugo Boss Man explores fresh green apple, aromatic notes and woods. The note groups describe the inspiration profile for browsing, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={HUGO_BOSS_REFERENCE_URL} className="underline">Hugo Boss’s official HUGO Man profile</a>. HUME and Hugo Boss are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "most-wanted" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Azzaro The Most Wanted Parfum inspiration</h2>
          <p>Most Wanted explores a warm spicy, woody vanilla direction. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={MOST_WANTED_REFERENCE_URL} className="underline">Azzaro’s official The Most Wanted Parfum page</a>. HUME and Azzaro are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "her" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Burberry Her inspiration</h2>
          <p>Her explores a fruity floral gourmand direction inspired by the original Burberry Her Eau de Parfum. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={HER_REFERENCE_URL} className="underline">Burberry’s official Her collection guide</a>. HUME and Burberry are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "jadore" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Dior J’adore Eau de Parfum inspiration</h2>
          <p>J’adore explores a floral bouquet direction. The reference notes are grouped for browsing, not a verified top-to-base progression, HUME ingredient pyramid or promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={JADORE_REFERENCE_URL} className="underline">Dior’s official J’adore Eau de Parfum profile</a>. HUME and Dior are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "eros" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Versace Eros Eau de Parfum inspiration</h2>
          <p>Eros explores a fresh, woody amber direction inspired specifically by the Eau de Parfum. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={EROS_REFERENCE_URL} className="underline">Versace’s official Eros Eau de Parfum profile</a>. HUME and Versace are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "1-million" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Rabanne 1 Million Eau de Toilette inspiration</h2>
          <p>1 Million explores a fresh spicy, woody amber direction inspired specifically by the original Eau de Toilette. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={ONE_MILLION_REFERENCE_URL} className="underline">Rabanne’s official 1 Million Eau de Toilette profile</a>. HUME and Rabanne are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "la-nuit" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the YSL La Nuit de L’Homme Eau de Toilette inspiration</h2>
          <p>La Nuit explores a spicy aromatic, woody direction inspired specifically by the Eau de Toilette. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={LA_NUIT_REFERENCE_URL} className="underline">YSL Beauty’s official La Nuit de L’Homme Eau de Toilette profile</a>. HUME and Yves Saint Laurent are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "tobacco-vanille" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Tom Ford Tobacco Vanille inspiration</h2>
          <p>Tobacco Vanille explores a warm tobacco, vanilla and woody direction. Its reference notes are grouped for browsing, not a verified top-to-base progression, HUME ingredient pyramid or promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={TOBACCO_VANILLE_REFERENCE_URL} className="underline">Tom Ford Beauty’s official Tobacco Vanille profile</a>. HUME and Tom Ford are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "noir-extreme" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Tom Ford Noir Extreme Eau de Parfum inspiration</h2>
          <p>Noir Extreme explores a warm spicy, amber and woody direction inspired specifically by the Eau de Parfum. Its reference notes are grouped for browsing, not a verified top-to-base progression, HUME ingredient pyramid or promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={NOIR_EXTREME_REFERENCE_URL} className="underline">Tom Ford Beauty’s official Noir Extreme Eau de Parfum profile</a>. HUME and Tom Ford are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "bright-crystal" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Versace Bright Crystal inspiration</h2>
          <p>Bright Crystal explores a fresh floral, fruity and musky direction inspired by the original Eau de Toilette. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={BRIGHT_CRYSTAL_REFERENCE_URL} className="underline">Versace’s official Bright Crystal Eau de Toilette profile</a>. HUME and Versace are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "goddess" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Burberry Goddess Eau de Parfum inspiration</h2>
          <p>Goddess explores a vanilla and lavender gourmand direction inspired by the original Eau de Parfum. Its reference notes are grouped for browsing, not a verified top-to-base progression, HUME ingredient pyramid or promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={GODDESS_REFERENCE_URL} className="underline">Burberry’s official Goddess Eau de Parfum profile</a>. HUME and Burberry are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      {perfume.id === "invictus" && (
        <section className="mx-auto max-w-4xl px-6 pb-16 text-sm leading-relaxed text-muted-foreground">
          <h2 className="mb-3 text-xl font-medium text-foreground">About the Paco Rabanne Invictus inspiration</h2>
          <p>Invictus explores a fresh marine and woody direction inspired by the original Eau de Toilette. Its note groups describe the inspiration profile, not a verified HUME ingredient pyramid or a promise of identical formulation.</p>
          <p className="mt-3">Reference: <a href={INVICTUS_REFERENCE_URL} className="underline">Rabanne’s official Invictus Eau de Toilette profile</a>. HUME and Rabanne are separate brands. HUME-specific wear-test results are not yet published.</p>
          {perfume.images.every((image) => image === NIGHT_OUT_IMAGE_PLACEHOLDER) && <p className="mt-3">Product photography is being added. The current image is the HUME brand mark, not a photograph of this bottle.</p>}
          <Link href="/shop" className="mt-4 inline-block underline">Explore available HUME perfumes</Link>
        </section>
      )}
      <Footer />
    </main>
  );
}
