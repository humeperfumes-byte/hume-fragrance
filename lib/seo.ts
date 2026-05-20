import { getProductPath } from "@/lib/product-route";
import { SITE_URL, siteUrlForBase } from "@/lib/site";

function getSeoProductUrl(
  product: {
    id: string;
    name: string;
    inspiration?: string;
    inspirationBrand?: string;
  },
  baseUrl = SITE_URL,
) {
  if (product.inspiration && product.inspirationBrand) {
    return siteUrlForBase(
      baseUrl,
      getProductPath({
        id: product.id,
        name: product.name,
        inspiration: product.inspiration,
        inspirationBrand: product.inspirationBrand,
      }),
    );
  }
  return siteUrlForBase(baseUrl, `/product/${product.id}`);
}

export const getOrganizationSchema = (baseUrl = SITE_URL) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": siteUrlForBase(baseUrl, "/#organization"),
  name: "HUME Fragrance",
  url: baseUrl,
  logo: siteUrlForBase(baseUrl, "/icon.png"),
  description:
    "HUME Fragrance is an Indian perfume brand from Kannauj that creates premium inspired alternatives to designer fragrances. EDP concentration with 8-12 hour longevity, designed for Indian weather. Starting INR 499.",
  sameAs: ["https://www.instagram.com/hume.perfume/", "https://wa.me/919559024822"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "en",
    telephone: "+91-9559024822",
    areaServed: "IN",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kannauj",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
});

export const getWebSiteSchema = (baseUrl = SITE_URL) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": siteUrlForBase(baseUrl, "/#website"),
  name: "HUME Fragrance",
  url: baseUrl,
  description:
    "Premium inspired perfumes for Indian weather with 8-12 hour longevity. Starting INR 499.",
  dateModified: new Date().toISOString(),
  potentialAction: {
    "@type": "SearchAction",
    target: siteUrlForBase(baseUrl, "/search?q={search_term_string}"),
    "query-input": "required name=search_term_string",
  },
});

export const getProductSchema = (
  product: {
    name: string;
    description: string;
    seoDescription: string;
    price: number;
    images: string[];
    inspiration: string;
    inspirationBrand: string;
    id: string;
    reviews: {
      rating: number;
      author: string;
      content: string;
      date: string;
    }[];
    category: string;
    badges?: {
      limitedStock?: boolean;
      soldOut?: boolean;
    };
    size?: string;
    gender?: string;
    notes?: {
      top: string[];
      heart: string[];
      base: string[];
    };
    longevity?: {
      duration: string;
      sillage: string;
      season: string[];
      occasion: string[];
    };
  },
  baseUrl = SITE_URL,
) => {
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.reviews.length
      : 0;
  const productUrl = getSeoProductUrl(product, baseUrl);
  const productImages = product.images.map((image) =>
    image.startsWith("http") ? image : siteUrlForBase(baseUrl, image),
  );
  const priceValidUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const availability = product.badges?.soldOut
    ? "https://schema.org/OutOfStock"
    : product.badges?.limitedStock
    ? "https://schema.org/LimitedAvailability"
    : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.description || product.seoDescription,
    image: productImages,
    sku: `HUME-${product.id}`,
    mpn: `HUME-${product.id}`,
    brand: { "@type": "Brand", name: "HUME Fragrance" },
    category: `Fragrances > ${product.category}`,
    url: productUrl,
    additionalProperty: [
      product.size
        ? { "@type": "PropertyValue", name: "Size", value: product.size.toUpperCase() }
        : null,
      product.gender
        ? { "@type": "PropertyValue", name: "Gender", value: product.gender }
        : null,
      product.longevity?.duration
        ? { "@type": "PropertyValue", name: "Longevity", value: product.longevity.duration }
        : null,
      product.longevity?.sillage
        ? { "@type": "PropertyValue", name: "Projection", value: product.longevity.sillage }
        : null,
      product.notes
        ? {
            "@type": "PropertyValue",
            name: "Fragrance Notes",
            value: [
              ...product.notes.top,
              ...product.notes.heart,
              ...product.notes.base,
            ].join(", "),
          }
        : null,
    ].filter(Boolean),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "INR",
      availability,
      url: productUrl,
      priceValidUntil,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "HUME Fragrance" },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 2,
            maxValue: 7,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    aggregateRating:
      product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount: product.reviews.length,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: product.reviews.slice(0, 3).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      datePublished: r.date,
      reviewBody: r.content,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
  };
};

export const getBreadcrumbSchema = (
  items: { name: string; url?: string }[],
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => {
    const node: {
      "@type": "ListItem";
      position: number;
      name: string;
      item?: string;
    } = {
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
    };
    if (item.url) {
      node.item = item.url;
    }
    return node;
  }),
});

export const getCollectionPageSchema = (
  products: {
    name: string;
    id: string;
    price: number;
    inspiration: string;
    inspirationBrand?: string;
  }[],
  baseUrl = SITE_URL,
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Shop All Fragrances - HUME Fragrance",
  description:
    "Browse our complete collection of premium fragrance interpretations and modern luxury scents.",
  url: siteUrlForBase(baseUrl, "/shop"),
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: getSeoProductUrl(
        {
          id: p.id,
          name: p.name,
          inspiration: p.inspiration,
          inspirationBrand: p.inspirationBrand,
        },
        baseUrl,
      ),
      name: `${p.name} - Luxury Fragrance`,
    })),
  },
});

export const getItemListSchema = (
  name: string,
  urlPath: string,
  items: {
    id: string;
    name: string;
    inspiration?: string;
    inspirationBrand?: string;
  }[],
  baseUrl = SITE_URL,
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  url: siteUrlForBase(baseUrl, urlPath),
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: getSeoProductUrl(item, baseUrl),
    name: item.name,
  })),
});

export const homeFaqItems = [
  {
    question: "What are inspired perfumes?",
    answer:
      "Inspired perfumes are fragrances created to capture the overall character and feel of iconic scent profiles. HUME crafts refined interpretations using premium ingredients and a modern EDP approach.",
  },
  {
    question: "How long do HUME perfumes last?",
    answer:
      "Most HUME perfumes are designed for 6 to 12+ hours of wear depending on the scent family, weather, skin type, and spray count. Richer woody, amber, oud, and gourmand profiles usually last the longest.",
  },
  {
    question: "Are HUME perfumes strong enough for Indian weather?",
    answer:
      "Yes. HUME fragrances are built with Indian weather in mind, so they are designed to project well and remain noticeable through heat, humidity, office wear, and evening outings.",
  },
  {
    question: "Are HUME perfumes the same as designer originals?",
    answer:
      "No. HUME perfumes are inspired by iconic fragrance directions, but they are not exact copies. The goal is to recreate the vibe, character, and experience in a HUME formulation.",
  },
  {
    question: "Which HUME perfumes are best sellers?",
    answer:
      "Our best sellers usually include versatile and compliment-getting profiles such as fresh blue fragrances, spicy evening scents, and rich gourmand blends. You can explore them directly in the Best Seller section on the homepage.",
  },
  {
    question: "Do you offer perfumes for office, date night, and daily wear?",
    answer:
      "Yes. HUME has fragrances suited for office, daily wear, parties, travel, weddings, date nights, gym freshness, and colder evening occasions. You can browse by occasion and scent family across the site.",
  },
  {
    question: "Can I try smaller formats before choosing a full bottle?",
    answer:
      "Yes. HUME offers build-your-kit and smaller-format discovery options so you can try multiple scent profiles before deciding on your full-bottle favorites.",
  },
  {
    question: "Do you offer refill options?",
    answer:
      "Yes. HUME has a refill program for customers who want a more sustainable and premium repurchase experience. You can explore it from the Refill section on the website.",
  },
  {
    question: "How do I choose the right HUME perfume for me?",
    answer:
      "The best way is to choose based on your preferred scent family, occasion, and performance style. Fresh and clean lovers can start with blue or citrus profiles, while richer evening wear usually leans toward amber, oud, leather, tobacco, or gourmand styles.",
  },
  {
    question: "Does HUME deliver across India?",
    answer:
      "Yes. HUME serves customers across India, with dispatch on ready-stock orders and clear WhatsApp support for order help and fragrance guidance.",
  },
] as const;

export const getFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

type ProductFaqInput = {
  name: string;
  size: string;
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: { duration: string };
};

export const getProductFaqItems = (product: ProductFaqInput) => {
  const isAquaMarine = product.name.toLowerCase().includes("aqua marine");
  const top1 = product.notes.top[0] ?? "citrus";
  const top2 = product.notes.top[1] ?? "fresh accords";
  const heart1 = product.notes.heart[0] ?? "aromatic notes";
  const base1 = product.notes.base[0] ?? "musk";
  const base2 = product.notes.base[1] ?? "amberwood";

  return [
    {
      question: `How long does HUME ${product.name} last?`,
      answer: `${product.longevity.duration} with moderate projection. EDP concentration ensures longevity even in Indian heat and humidity.`,
    },
    {
      question: `What does ${product.name} smell like?`,
      answer: isAquaMarine
        ? "Fresh marine opening with bergamot and sea salt, aromatic lavender heart, settling into warm musk and mineral base."
        : `Fresh opening with ${top1.toLowerCase()} and ${top2.toLowerCase()}, aromatic ${heart1.toLowerCase()} heart, settling into ${base1.toLowerCase()} and ${base2.toLowerCase()} base.`,
    },
    {
      question: "Is this suitable for office wear?",
      answer:
        "Yes, it's fresh and professional without being overwhelming. Perfect for daily office use.",
    },
    {
      question: "What's the bottle size?",
      answer: `${product.size.toUpperCase()} EDP (Eau de Parfum)`,
    },
    {
      question: "Do you ship across India?",
      answer:
        "Yes, free shipping on orders above INR 500. Dispatched within 24 hours.",
    },
  ];
};

export const getProductFAQSchema = (product: ProductFaqInput) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: getProductFaqItems(product).map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});

export const getProductReviewSchema = (
  product: {
    id: string;
    name: string;
    inspiration: string;
    inspirationBrand: string;
    reviews: {
      rating: number;
      author: string;
      content: string;
      date: string;
    }[];
  },
  baseUrl = SITE_URL,
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${product.name} Reviews`,
  itemListElement: product.reviews.slice(0, 10).map((review, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Review",
      itemReviewed: {
        "@type": "Product",
        name: product.name,
        url: getSeoProductUrl(product, baseUrl),
      },
      author: { "@type": "Person", name: review.author },
      datePublished: review.date,
      reviewBody: review.content,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
    },
  })),
});
