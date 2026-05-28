import {
  DISCOVERY_SET_IMAGES,
  DISCOVERY_SET_PATH,
  DISCOVERY_SET_PRICE,
} from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";
import type { PerfumeData } from "@/data/perfumes";

export type UpcomingProduct = {
  id: string;
  slug: string;
  path: string;
  name: string;
  eyebrow: string;
  category: string;
  inspiration: string;
  priceLabel: string;
  shortDescription: string;
  longDescription: string;
  image?: string;
  visualClassName?: string;
  visualLabel?: string;
  keywords: string[];
  facts: Array<{ label: string; value: string }>;
  benefits: Array<{ title: string; body: string }>;
  faq: Array<{ question: string; answer: string }>;
  detail: {
    price: number;
    size: string;
    gender: PerfumeData["gender"];
    images: string[];
    description: string;
    scentStory: string;
    pairingTips: string[];
    notes: PerfumeData["notes"];
    longevity: PerfumeData["longevity"];
  };
};

const productBasePath = "/product";
const PURE_ROSE_WATER_PRICE = 299;
const KAPOOR_CAR_STABILISER_PRICE = 399;

export const UPCOMING_PRODUCTS: UpcomingProduct[] = [
  {
    id: "hume-discovery-set",
    slug: "hume-discovery-set",
    path: DISCOVERY_SET_PATH,
    name: "HUME Discovery Set",
    eyebrow: "Discovery Set",
    category: "Discovery Set",
    inspiration: "Build your own 10 sample box",
    image: DISCOVERY_SET_IMAGES[0],
    priceLabel: formatINR(DISCOVERY_SET_PRICE),
    shortDescription:
      "Choose any 10 HUME perfume testers and compare them before buying a full bottle.",
    longDescription:
      "A discovery set for first-time perfume buyers, gifters, and anyone who wants to test HUME fragrances on skin before committing to a full bottle.",
    keywords: [
      "perfume trial kit India",
      "perfume sample set",
      "3ml perfume samples",
      "starter perfume kit",
    ],
    facts: [
      { label: "Format", value: "10 x 3ml perfume testers" },
      { label: "Status", value: "Available now" },
      { label: "Best for", value: "First-time buyers and scent comparison" },
    ],
    benefits: [
      {
        title: "Try before full bottle",
        body: "Test opening, dry-down and longevity before choosing a larger bottle.",
      },
      {
        title: "Choose your samples",
        body: "Build the trial kit from available HUME fragrances instead of a fixed box.",
      },
    ],
    faq: [
      {
        question: "Can I order the HUME Discovery Set now?",
        answer:
          "Yes. Choose 10 HUME testers in the Discovery Set builder and add the finished set to your bag.",
      },
    ],
    detail: {
      price: DISCOVERY_SET_PRICE,
      size: "10 x 3ml",
      gender: "Unisex",
      images: DISCOVERY_SET_IMAGES,
      description:
        "Choose any 10 HUME perfume testers and compare them before buying a full bottle.",
      scentStory:
        "A sample-first way to understand HUME fragrances on your own skin before choosing the scent that deserves a full bottle.",
      pairingTips: [
        "Test one fragrance per day to understand opening, dry-down and longevity.",
        "Use the set for gifting, travel and first-time perfume discovery.",
        "Choose 10 testers, add the set to bag, and use checkout when you are ready.",
      ],
      notes: {
        top: ["Discovery", "Choice", "First Spray"],
        heart: ["Skin Testing", "Comparison", "Daily Wear"],
        base: ["Signature Scent", "Confidence", "Full Bottle Decision"],
      },
      longevity: {
        duration: "Multiple wears per tester",
        sillage: "Compare projection",
        season: ["All seasons"],
        occasion: ["Discovery", "Gifting", "Travel"],
      },
    },
  },
  {
    id: "pure-rose-water-gulab-jal",
    slug: "pure-rose-water-gulab-jal",
    path: `${productBasePath}/pure-rose-water-gulab-jal`,
    name: "Pure Rose Water",
    eyebrow: "Gulab Jal",
    category: "Rose Water / Skin Ritual",
    inspiration: "100% pure gulab jal for face mist, skin ritual and daily freshness",
    priceLabel: formatINR(PURE_ROSE_WATER_PRICE),
    shortDescription:
      "Pure gulab jal for face mist, daily freshness and simple Indian skincare rituals.",
    longDescription:
      "HUME Pure Rose Water is a Kannauj-inspired gulab jal face mist for Indian skincare routines, daily freshness, toner-style use and light rose aroma. It is made for people searching for pure rose water in India, rose water for face, gulab jal for summer freshness and a simple non-perfume floral ritual.",
    visualClassName:
      "bg-[radial-gradient(circle_at_30%_22%,rgba(255,235,232,0.95),transparent_34%),radial-gradient(circle_at_72%_68%,rgba(136,30,44,0.82),transparent_38%),linear-gradient(135deg,#fff7f1_0%,#efc8c3_44%,#6f1d2b_100%)]",
    visualLabel: "Gulab Jal",
    keywords: [
      "pure rose water India",
      "gulab jal for face",
      "rose water face mist",
      "natural rose water",
      "rose water toner India",
      "best rose water for face India",
      "Kannauj rose water",
      "gulab jal face mist India",
      "rose water for summer freshness",
      "rose water for skincare routine",
      "HUME rose water",
      "HUME gulab jal",
    ],
    facts: [
      { label: "Product type", value: "Rose water face mist" },
      { label: "Availability", value: "Available now" },
      { label: "Best for", value: "Daily freshness, face mist and simple skincare rituals" },
      { label: "Market", value: "India" },
    ],
    benefits: [
      {
        title: "Clean daily ritual",
        body: "Made for a simple rose-water step after cleansing, before moisturiser, or during the day.",
      },
      {
        title: "Fresh rose aroma",
        body: "Built around a soft gulab jal feel, not a heavy perfume-style fragrance.",
      },
      {
        title: "Travel-friendly freshness",
        body: "An easy mist for office, travel, summer days and gifting.",
      },
      {
        title: "Ready to order",
        body: "Add it to your bag directly from this page and checkout with online payment or WhatsApp.",
      },
    ],
    faq: [
      {
        question: "What is HUME Pure Rose Water best for?",
        answer:
          "HUME Pure Rose Water is best for a light face mist, toner-style skincare step, summer freshness, office bag freshness, gifting and a simple gulab jal ritual after cleansing.",
      },
      {
        question: "Can I use HUME Pure Rose Water on my face?",
        answer:
          "Yes. It is positioned as a rose water face mist and daily freshness ritual. Use it as a gentle mist after cleansing, before moisturiser, or during the day when your skin needs a fresh rose-water feel.",
      },
      {
        question: "Is it a perfume?",
        answer:
          "No. This product is rose water, not an EDP perfume. It belongs to HUME's broader self-care ritual line.",
      },
      {
        question: "Is rose water useful in Indian weather?",
        answer:
          "Yes. Rose water is popular in Indian routines because it feels light, fresh and easy to use in heat, travel and long office days. HUME Pure Rose Water is made for that simple daily freshness moment.",
      },
      {
        question: "Why is Kannauj important for rose water and fragrance?",
        answer:
          "Kannauj in Uttar Pradesh is widely known as the Perfume Capital of India. Its Gangetic plains and traditional attar-making heritage are closely associated with highly fragrant roses, including Damask rose, which is valued for a deep, rich floral aroma.",
      },
      {
        question: "Why choose HUME Pure Rose Water?",
        answer:
          "Choose HUME Pure Rose Water if you want a minimal rose-water ritual from a Kannauj fragrance brand: soft gulab jal freshness, no heavy perfume feel, and an easy face mist format for everyday Indian use.",
      },
    ],
    detail: {
      price: PURE_ROSE_WATER_PRICE,
      size: "100ml",
      gender: "Unisex",
      images: [
        "/images/upcoming/pure-rose-water.svg",
        "/images/perfume-packaging.png",
        "/images/notes.png",
      ],
      description:
        "Pure gulab jal for face mist, daily freshness and simple Indian skincare routines.",
      scentStory:
        "Soft rose water, clean skin freshness and a gentle daily ritual mood. HUME Pure Rose Water is a light gulab jal product, not a heavy perfume.",
      pairingTips: [
        "Use as a face mist after cleansing or during the day for a quick fresh feel.",
        "Best for summer, office bags, gifting and simple rose-water skincare routines.",
        "Use as a gentle daily ritual product; add to bag when you are ready to order.",
      ],
      notes: {
        top: ["Fresh Rose", "Dew", "Petals"],
        heart: ["Gulab Jal", "Soft Floral", "Clean Mist"],
        base: ["Skin Freshness", "Daily Ritual", "Light Rose"],
      },
      longevity: {
        duration: "Daily freshness ritual",
        sillage: "Soft rose mist",
        season: ["Summer", "All seasons"],
        occasion: ["Face mist", "Skincare", "Travel"],
      },
    },
  },
  {
    id: "kapoor-camphor-car-perfume",
    slug: "kapoor-camphor-car-perfume",
    path: `${productBasePath}/kapoor-camphor-car-perfume`,
    name: "Kapoor Car Freshener",
    eyebrow: "Car Fragrance",
    category: "Camphor / Car Perfume",
    inspiration: "Kapoor aroma for car bad odour control and a clean natural car ritual",
    priceLabel: formatINR(KAPOOR_CAR_STABILISER_PRICE),
    shortDescription:
      "A kapoor-inspired car fragrance for a cleaner-smelling cabin and natural camphor freshness.",
    longDescription:
      "HUME Kapoor Car Freshener is a kapoor-inspired car perfume for Indian drivers who want clean camphor freshness, stale cabin odour support and a calmer car atmosphere. It is designed especially for cars, can also be used at home, and offers a familiar Indian kapoor aroma instead of sugary synthetic car fresheners.",
    visualClassName:
      "bg-[radial-gradient(circle_at_68%_24%,rgba(243,245,238,0.92),transparent_30%),radial-gradient(circle_at_30%_72%,rgba(184,148,96,0.56),transparent_38%),linear-gradient(135deg,#080806_0%,#2d261e_54%,#d7c4a6_100%)]",
    visualLabel: "Kapoor",
    keywords: [
      "kapoor car perfume",
      "camphor car fragrance",
      "car bad odour remover India",
      "natural car perfume",
      "car freshener kapoor",
      "best car perfume India",
      "car perfume for bad odour",
      "car perfume for closed car smell",
      "kapoor fragrance for car",
      "camphor fragrance for home and car",
      "cool car perfume India",
      "HUME car perfume",
      "HUME Kapoor Car Freshener",
    ],
    facts: [
      { label: "Product type", value: "Kapoor-inspired car fragrance" },
      { label: "Availability", value: "Available now" },
      { label: "Best for", value: "Cars, cabin freshness and bad odour control" },
      { label: "Aroma direction", value: "Clean camphor / kapoor freshness" },
    ],
    benefits: [
      {
        title: "Clean car ritual",
        body: "Made for people who prefer a kapoor-style car aroma over loud synthetic car fresheners.",
      },
      {
        title: "Bad odour support",
        body: "Positioned for everyday cabin freshness after food smell, dampness, smoke or closed-car odour.",
      },
      {
        title: "Natural-feeling aroma",
        body: "Built around the familiar Indian camphor scent profile with a refined HUME presentation.",
      },
      {
        title: "Ready to order",
        body: "Add it to your bag directly from this page and checkout with online payment or WhatsApp.",
      },
    ],
    faq: [
      {
        question: "What does it smell like?",
        answer:
          "It smells like clean kapoor or camphor freshness with a cool, airy and slightly spiritual Indian character. The profile is calmer and more natural-feeling than many sweet car perfumes.",
      },
      {
        question: "Is this for home or car?",
        answer:
          "It is specially designed for cars as a kapoor-inspired car freshener and car perfume, but you can also use it at home when you want a clean camphor freshness.",
      },
      {
        question: "Why to use HUME car perfume?",
        answer:
          "HUME Kapoor Car Perfume is built around the familiar Indian freshness of kapoor, which has long been used in homes and religious rituals for a clean, positive atmosphere. Camphor is also valued for its crisp, cooling aroma, helping reduce stale cabin smell and making the car feel fresher, calmer and more pleasant.",
      },
      {
        question: "Which car smells is HUME Kapoor Car Perfume best for?",
        answer:
          "It is best for closed-car smell, food odour, dampness, smoke-like stale air and everyday cabin freshness. Use it when you want the car to feel cleaner and cooler without a loud sweet fragrance.",
      },
      {
        question: "How should I use HUME Kapoor Car Perfume?",
        answer:
          "Use it in a parked or well-ventilated car and let the kapoor freshness settle naturally through the cabin. It works best as a daily freshness ritual for closed-car smell, food odour, dampness and long commutes.",
      },
      {
        question: "Is kapoor car perfume better than sweet car fresheners?",
        answer:
          "If you prefer a clean, cooling and familiar Indian aroma, kapoor car perfume can feel better than sweet car fresheners. HUME Kapoor is made for people who want a refined camphor freshness rather than candy-like cabin fragrance.",
      },
    ],
    detail: {
      price: KAPOOR_CAR_STABILISER_PRICE,
      size: "Car fragrance",
      gender: "Unisex",
      images: [
        "/images/upcoming/kapoor-car-perfume.svg",
        "/images/perfume-packaging.png",
        "/images/black-perfume.png",
      ],
      description:
        "A kapoor-inspired car fragrance for a cleaner-smelling cabin and natural camphor freshness.",
      scentStory:
        "Clean kapoor, calm cabin freshness and a familiar Indian camphor profile designed for people who do not want sugary car fresheners.",
      pairingTips: [
        "Best for car cabins that need a cleaner, calmer scent profile.",
        "Use after ventilation and cleaning when food, dampness or closed-car odours linger.",
        "Add to your bag when you want a cleaner, calmer scent profile for the car.",
      ],
      notes: {
        top: ["Kapoor", "Camphor", "Clean Air"],
        heart: ["Resin", "Dry Woods", "Mineral Freshness"],
        base: ["Calm Cabin", "Soft Smoke", "Natural Clean"],
      },
      longevity: {
        duration: "Car freshness ritual",
        sillage: "Clean cabin presence",
        season: ["All seasons"],
        occasion: ["Car", "Commute", "Travel"],
      },
    },
  },
];

export const DETAIL_UPCOMING_PRODUCTS = UPCOMING_PRODUCTS.filter(
  (product) => product.path.startsWith(productBasePath),
);

export function getUpcomingProductBySlug(slug: string) {
  return DETAIL_UPCOMING_PRODUCTS.find((product) => product.slug === slug);
}

export function getUpcomingProductAsPerfume(product: UpcomingProduct): PerfumeData {
  return {
    id: product.id,
    name: product.name,
    inspiration: product.eyebrow,
    inspirationBrand: product.id === "hume-discovery-set" ? "HUME" : "",
    category: product.category,
    categoryId:
      product.id === "pure-rose-water-gulab-jal"
        ? "rose-water"
        : product.id === "kapoor-camphor-car-perfume"
          ? "car-fragrance"
          : "discovery-set",
    gender: product.detail.gender,
    images: product.detail.images,
    price: product.detail.price,
    description: product.detail.description,
    seoDescription: product.longDescription,
    seoKeywords: product.keywords,
    scentStory: product.detail.scentStory,
    pairingTips: product.detail.pairingTips,
    badges: {
      humeSpecial: true,
    },
    notes: product.detail.notes,
    longevity: product.detail.longevity,
    size: product.detail.size,
    reviews: [],
  };
}
