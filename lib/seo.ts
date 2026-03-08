import { getProductPath } from "@/lib/product-route";
import { SITE_URL, siteUrl } from "@/lib/site";

function getSeoProductUrl(product: {
  id: string;
  name: string;
  inspiration?: string;
  inspirationBrand?: string;
}) {
  if (product.inspiration && product.inspirationBrand) {
    return `${SITE_URL}${getProductPath({
      id: product.id,
      name: product.name,
      inspiration: product.inspiration,
      inspirationBrand: product.inspirationBrand,
    })}`;
  }
  return siteUrl(`/product/${product.id}`);
}

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HUME Fragrance",
  url: SITE_URL,
  logo: siteUrl("/images/logo.png"),
  description:
    "Premium inspired perfumes crafted to celebrate iconic scent profiles with refined quality and modern luxury.",
  sameAs: ["https://instagram.com/humefragrance", "https://wa.me/919559024822"],
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

export const getWebSiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: siteUrl("/search?q={search_term_string}"),
    "query-input": "required name=search_term_string",
  },
});

export const getProductSchema = (product: {
  name: string;
  description: string;
  seoDescription: string;
  price: number;
  images: string[];
  inspiration: string;
  inspirationBrand: string;
  id: string;
  reviews: { rating: number; author: string; content: string; date: string }[];
  category: string;
}) => {
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.seoDescription,
    image: product.images[0],
    brand: { "@type": "Brand", name: "HUME Fragrance" },
    category: `Fragrances > ${product.category}`,
    url: getSeoProductUrl(product),
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: getSeoProductUrl(product),
      seller: { "@type": "Organization", name: "HUME Fragrance" },
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

export const getBreadcrumbSchema = (items: { name: string; url?: string }[]) => ({
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
  }[]
) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Shop All Fragrances - HUME Fragrance",
  description:
    "Browse our complete collection of premium fragrance interpretations and modern luxury scents.",
  url: siteUrl("/shop"),
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: getSeoProductUrl({
        id: p.id,
        name: p.name,
        inspiration: p.inspiration,
        inspirationBrand: p.inspirationBrand,
      }),
      name: `${p.name} - Luxury Fragrance`,
    })),
  },
});

export const getFAQSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What are inspired perfumes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inspired perfumes are fragrances crafted to capture the essence and character of iconic luxury scents. HUME Perfumes uses premium ingredients to create refined alternatives with a modern, elevated profile.",
      },
    },
    {
      "@type": "Question",
      name: "How long do HUME perfumes last?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HUME perfumes are formulated for exceptional longevity, typically lasting 6-12+ hours depending on the fragrance. Our oriental and oud-based scents offer the longest performance.",
      },
    },
    {
      "@type": "Question",
      name: "Are HUME perfumes the same as designer originals?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HUME perfumes are inspired by iconic fragrance profiles and crafted to capture their essence. While they share similar scent profiles, they are unique formulations by HUME with a modern, elevated character.", 
      },
    },
    {
      "@type": "Question",
      name: "Which brands does HUME have inspired alternatives for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HUME offers inspired alternatives across a curated range of luxury scent profiles, with new interpretations added regularly.", 
      },
    },
  ],
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
        "Yes, free shipping on orders above INR 799. Dispatched within 24 hours.",
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

export const getProductReviewSchema = (product: {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand: string;
  reviews: { rating: number; author: string; content: string; date: string }[];
}) => ({
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
        url: getSeoProductUrl(product),
      },
      author: { "@type": "Person", name: review.author },
      datePublished: review.date,
      reviewBody: review.content,
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5 },
    },
  })),
});






