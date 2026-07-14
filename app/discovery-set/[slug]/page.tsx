import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import DiscoverySetBuilder from "@/components/DiscoverySetBuilder";
import { getDiscoverySetSeoPageBySlug, getDiscoverySetSeoSlugs } from "@/lib/discovery-set-seo";
import {
  DISCOVERY_SET_PATH,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SIZE,
} from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";
import { getRequestSiteUrl } from "@/lib/request-site";
import { getBreadcrumbSchema, getOrganizationSchema } from "@/lib/seo";
import { siteUrlForBase } from "@/lib/site";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-discovery-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-discovery-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-discovery-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const discoverySetImages = [
  "/images/bg/tester_box1.png",
  "/images/bg/tester_box.png",
  "/images/bg/tester1.png",
  "/images/bg/tester2.png",
  "/images/bg/tester3.png",
  "/images/bg/tester4.png",
];

const discoverySetBenefits = [
  {
    title: "Try before a full bottle",
    body: "Wear each fragrance on skin instead of judging only from notes or product images.",
  },
  {
    title: "Build your own kit",
    body: `Choose any ${DISCOVERY_SET_SAMPLE_COUNT} available HUME perfumes instead of receiving a fixed sample set.`,
  },
  {
    title: "Better for gifting",
    body: "A trial kit helps the receiver explore different scent profiles before choosing one favorite.",
  },
  {
    title: "Travel-friendly testers",
    body: "Small 3ml testers are easy to carry for office, travel, events, and daily comparison.",
  },
];

const discoverySetUseCases = [
  "First perfume purchase",
  "Signature scent discovery",
  "Gifting",
  "Travel perfume kit",
  "Office and daily wear testing",
  "Comparing inspired fragrance directions",
];

const discoverySetFaq = [
  {
    question: "What is a perfume trial pack?",
    answer:
      `A perfume trial pack is a set of smaller testers that lets you wear and compare multiple fragrances before buying a full-size bottle. The HUME Discovery Set includes ${DISCOVERY_SET_SIZE} testers chosen by the customer.`,
  },
  {
    question: "What is included in the HUME Discovery Set?",
    answer:
      `The HUME Discovery Set includes ${DISCOVERY_SET_SAMPLE_COUNT} perfume testers of 3ml each. Customers can choose any ${DISCOVERY_SET_SAMPLE_COUNT} available HUME fragrances from the Discovery Set builder before checkout.`,
  },
  {
    question: "Can I choose the perfume samples myself?",
    answer:
      "Yes. The Discovery Set builder lets you choose your own HUME perfume samples and add the completed set to your bag.",
  },
  {
    question: "Can I order the HUME Discovery Set right now?",
    answer:
      "Yes. Select exactly 15 testers, add the Discovery Set to your bag, and complete checkout online or through WhatsApp.",
  },
  {
    question: "Who should buy a starter perfume kit?",
    answer:
      "A starter perfume kit is ideal for first-time perfume buyers, people exploring signature scents, gift shoppers, travellers, and customers who want to test longevity and projection before committing to a full bottle.",
  },
];

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getDiscoverySetSeoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getDiscoverySetSeoPageBySlug(slug);
  if (!page) return {};

  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = siteUrlForBase(baseUrl, `/discovery-set/${slug}`);
  const imageUrl = siteUrlForBase(baseUrl, discoverySetImages[0]);

  return {
    title: {
      absolute: page.title,
    },
    description: page.description,
    keywords: page.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      type: "website",
      siteName: "HUME Fragrance",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${page.h1} - HUME Discovery Set`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [imageUrl],
    },
  };
}

export default async function DiscoverySetSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getDiscoverySetSeoPageBySlug(slug);
  if (!page) notFound();

  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = siteUrlForBase(baseUrl, `/discovery-set/${slug}`);
  const imageUrls = discoverySetImages.map((image) => siteUrlForBase(baseUrl, image));
  const jsonLd = [
    getOrganizationSchema(baseUrl),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      name: page.title,
      url: canonicalUrl,
      description: page.description,
      keywords: page.keywords.join(", "),
      isPartOf: {
        "@type": "WebSite",
        name: "HUME Fragrance",
        url: baseUrl,
      },
      mainEntity: { "@id": `${canonicalUrl}#product` },
      about: [
        { "@type": "Thing", name: "Perfume trial pack" },
        { "@type": "Thing", name: "Perfume discovery set" },
        { "@type": "Thing", name: "Starter perfume kit" },
        { "@type": "Thing", name: "3ml perfume samples" },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${canonicalUrl}#product`,
      name: "HUME Discovery Set",
      alternateName: [
        "Perfume Trial Kit",
        "Perfume Trial Pack",
        "Perfume Sample Set",
        "Starter Perfume Kit",
      ],
      image: imageUrls,
      description: page.description,
      sku: "HUME-DISCOVERY-SET",
      mpn: "HUME-DISCOVERY-SET",
      brand: { "@type": "Brand", name: "HUME Fragrance" },
      offers: {
        "@type": "Offer",
        price: DISCOVERY_SET_PRICE,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: canonicalUrl,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "HUME Fragrance" },
      },
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: page.h1, url: canonicalUrl },
    ]),
  ];

  return (
    <main className={`${inter.variable} ${playfair.variable} ${cormorant.variable} min-h-screen bg-background pb-20 lg:pb-0 discovery-set-page`}>
      <JsonLd data={jsonLd} />
      <Header />
      <DiscoverySetBuilder customH1={page.h1} />
      
      {/* Dynamic SEO Landing Section */}
      <section className="border-t border-border bg-background px-4 py-14 text-foreground sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
                {page.h1}
              </p>
              <h2 className="mt-4 max-w-2xl font-serif text-4xl font-light leading-tight sm:text-5xl">
                A starter perfume kit for finding your signature scent.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                The HUME Discovery Set is built for customers who want to test perfume
                on skin before buying a full bottle. Build your own {DISCOVERY_SET_SIZE}
                fragrance sample set, compare performance through the day, and checkout
                with your chosen testers attached to the order.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {discoverySetBenefits.map((benefit) => (
                <article key={benefit.title} className="border border-border bg-secondary p-4">
                  <h3 className="text-sm font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">{benefit.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
            <div className="border border-border bg-secondary p-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold">
                Best For
              </h3>
              <ul className="mt-4 grid gap-2 text-sm text-foreground/85">
                {discoverySetUseCases.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-serif text-3xl font-light">Discovery Set FAQ</h3>
              <div className="mt-5 grid gap-3">
                {discoverySetFaq.map((item) => (
                  <details key={item.question} className="group border border-border bg-secondary p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">
                      {item.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
