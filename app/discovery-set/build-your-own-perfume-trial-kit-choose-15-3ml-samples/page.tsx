import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import DiscoverySetBuilder from "@/components/DiscoverySetBuilder";
import DiscoverySetAeoContent from "@/components/DiscoverySetAeoContent";
import {
  DISCOVERY_SET_DESCRIPTION,
  getDiscoverySetReviewAggregate,
  DISCOVERY_SET_IMAGES,
  DISCOVERY_SET_ORIGINAL_PRICE,
  DISCOVERY_SET_PATH,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_PRODUCT_ID,
  DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SCHEMA_AVAILABILITY,
  DISCOVERY_SET_SIZE,
  DISCOVERY_SET_STATUS,
} from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";
import { getRequestSiteUrl } from "@/lib/request-site";
import { getBreadcrumbSchema, getOrganizationSchema } from "@/lib/seo";
import { siteUrlForBase } from "@/lib/site";
import { getProductById } from "@/lib/db/products";
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

export const dynamic = "force-dynamic";

const discoverySetKeywords = [
  "perfume trial pack",
  "perfume trial kit India",
  "perfume sample set India",
  "3ml perfume samples",
  "build your own perfume kit",
  "starter perfume kit",
  "small batch perfume",
  "fragrance discovery set India",
  "try before buy perfume",
  "perfume tester set",
  "choose 15 perfume samples",
  "order perfume sample set",
  "HUME discovery set",
];

const discoverySetDescription = DISCOVERY_SET_DESCRIPTION;

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
      `Yes. The ${DISCOVERY_SET_SIZE} Discovery Set is open for pre-order at ${formatINR(DISCOVERY_SET_PRICE)} (original price ${formatINR(DISCOVERY_SET_ORIGINAL_PRICE)}). Choose exactly ${DISCOVERY_SET_SAMPLE_COUNT} testers, add the set to your bag, and complete checkout online or through WhatsApp.`,
  },
  {
    question: "Who should buy a starter perfume kit?",
    answer:
      "A starter perfume kit is ideal for first-time perfume buyers, people exploring signature scents, gift shoppers, travellers, and customers who want to test longevity and projection before committing to a full bottle.",
  },
  {
    question: "Is 3ml enough to test a perfume properly?",
    answer:
      "Yes. A 3ml tester is enough for multiple wears, so customers can test opening notes, dry-down, projection, longevity, and how the fragrance behaves in Indian weather.",
  },
  {
    question: "Is the Discovery Set suitable for Indian weather?",
    answer:
      "Yes. HUME fragrances are designed for Indian weather, and the Discovery Set helps customers test performance, projection, and dry-down on their own skin before buying a larger bottle.",
  },
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

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = await getRequestSiteUrl();
  const canonicalUrl = siteUrlForBase(baseUrl, DISCOVERY_SET_PATH);
  const imageUrl = siteUrlForBase(baseUrl, DISCOVERY_SET_IMAGES[0]);

  return {
    title: {
      absolute: "Perfume Trial Kit India | Build Your Own 15 x 3ml Discovery Set | HUME",
    },
    description: discoverySetDescription,
    keywords: discoverySetKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: "Build Your Own Perfume Trial Kit | HUME Discovery Set",
      description: discoverySetDescription,
      url: canonicalUrl,
      type: "website",
      siteName: "HUME Fragrance",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "HUME Discovery Set perfume trial kit with 15 testers",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Perfume Trial Kit India | Choose 15 HUME Samples",
      description: discoverySetDescription,
      images: [imageUrl],
    },
  };
}

function DiscoverySetSeoContent() {
  return (
    <section className="border-t border-border bg-background px-4 py-14 text-foreground sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
              Perfume Trial Pack
            </p>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-light leading-tight sm:text-5xl">
              A starter perfume kit for finding your signature scent.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              The HUME Discovery Set is built for customers who want to test perfume
              on skin before buying a full bottle. It is currently open for pre-order at{" "}
              {formatINR(DISCOVERY_SET_PRICE)} (original price{" "}
              {formatINR(DISCOVERY_SET_ORIGINAL_PRICE)}). Build your own {DISCOVERY_SET_SIZE}{" "}
              fragrance sample set and compare performance through the day.
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
  );
}

export default async function DiscoverySetCanonicalPage() {
  const [baseUrl, discoverySetProduct] = await Promise.all([
    getRequestSiteUrl(),
    getProductById(DISCOVERY_SET_PRODUCT_ID),
  ]);
  const canonicalUrl = siteUrlForBase(baseUrl, DISCOVERY_SET_PATH);
  const imageUrls = DISCOVERY_SET_IMAGES.map((image) => siteUrlForBase(baseUrl, image));
  const aggregateRating = getDiscoverySetReviewAggregate(discoverySetProduct?.reviews ?? []);
  const jsonLd = [
    getOrganizationSchema(baseUrl),
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      name: "Perfume Trial Kit India | HUME Discovery Set",
      url: canonicalUrl,
      description: discoverySetDescription,
      keywords: discoverySetKeywords.join(", "),
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
        { "@type": "Thing", name: "Perfume sample order" },
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
        "Build Your Own Perfume Kit",
      ],
      description: discoverySetDescription,
      image: imageUrls,
      sku: "HUME-DISCOVERY-SET",
      mpn: "HUME-DISCOVERY-SET",
      brand: { "@type": "Brand", name: "HUME Fragrance" },
      ...(aggregateRating ? { aggregateRating } : {}),
      category: "Fragrance samples, perfume tester set, perfume trial kit",
      url: canonicalUrl,
      audience: {
        "@type": "PeopleAudience",
        suggestedGender: "Unisex",
        geographicArea: { "@type": "Country", name: "India" },
      },
      additionalProperty: [
        { "@type": "PropertyValue", name: "Tester count", value: `${DISCOVERY_SET_SAMPLE_COUNT} testers` },
        { "@type": "PropertyValue", name: "Tester size", value: "3ml each" },
        { "@type": "PropertyValue", name: "Selection", value: `Choose any ${DISCOVERY_SET_SAMPLE_COUNT} available HUME fragrances` },
        { "@type": "PropertyValue", name: "Best for", value: "First-time buyers, gifting, scent comparison, signature scent discovery, travel testing" },
        { "@type": "PropertyValue", name: "Market", value: "India" },
        { "@type": "PropertyValue", name: "Product type", value: "Build your own perfume sample kit" },
        { "@type": "PropertyValue", name: "Availability", value: DISCOVERY_SET_STATUS },
        { "@type": "PropertyValue", name: "Original price", value: `INR ${DISCOVERY_SET_ORIGINAL_PRICE}` },
      ],
      offers: {
        "@type": "Offer",
        price: DISCOVERY_SET_PRICE.toFixed(2),
        priceCurrency: "INR",
        availability: DISCOVERY_SET_SCHEMA_AVAILABILITY,
        url: canonicalUrl,
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "HUME Fragrance" },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "INR" },
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 7, unitCode: "DAY" },
          },
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${canonicalUrl}#use-cases`,
      name: "HUME Discovery Set use cases",
      itemListElement: discoverySetUseCases.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${canonicalUrl}#how-to-build`,
      name: "How to build your HUME perfume trial kit",
      description: `Choose ${DISCOVERY_SET_SAMPLE_COUNT} HUME fragrances, order the Discovery Set, and test each 3ml sample before buying a full bottle.`,
      step: [
        { "@type": "HowToStep", position: 1, name: "Open the builder", text: "Use the Discovery Set builder on the page." },
        { "@type": "HowToStep", position: 2, name: "Choose 15 perfumes", text: `Select any ${DISCOVERY_SET_SAMPLE_COUNT} available HUME fragrances as 3ml testers.` },
        { "@type": "HowToStep", position: 3, name: "Pre-order the set", text: "Add the completed Discovery Set to your bag with your selections attached and complete the pre-order." },
        { "@type": "HowToStep", position: 4, name: "Test on skin", text: "Wear each sample across different days to compare opening, dry-down, projection, and longevity." },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: discoverySetFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
    getBreadcrumbSchema([
      { name: "Home", url: baseUrl },
      { name: "Perfume Trial Kit", url: canonicalUrl },
    ]),
  ];

  return (
    <main className={`${inter.variable} ${playfair.variable} ${cormorant.variable} min-h-screen bg-background pb-20 lg:pb-0 discovery-set-page`}>
      <JsonLd data={jsonLd} />
      <Header />
      <DiscoverySetBuilder />
      <DiscoverySetSeoContent />
      <DiscoverySetAeoContent reviews={discoverySetProduct?.reviews ?? []} />
      <Footer />
    </main>
  );
}
