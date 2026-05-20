const IMG = "/images";
const p1 = `${IMG}/perfume-1.jpg`;
const p2 = `${IMG}/perfume-2.jpg`;
const p3 = `${IMG}/perfume-3.jpg`;
const p4 = `${IMG}/perfume-4.jpg`;

export type Gender = "Men" | "Women" | "Unisex";

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string;
  reviewerCity?: string;
  reviewerLanguage?: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
}

export interface PerfumeData {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand: string;
  visibility?: "public" | "seo_only";
  woreBy?: string;
  woreByImageUrl?: string;
  category: string;
  categoryId: string;
  categoryIds?: string[];
  categoryTags?: Array<{ id: string; label: string }>;
  dbCategoryIds?: string[];
  dbCategoryTags?: Array<{ id: string; label?: string }>;
  gender: Gender;
  images: string[];
  videos?: string[];
  price: number;
  priceCurrency?: "INR";
  description: string;
  seoDescription: string;
  seoKeywords: string[];
  scentStory?: string;
  pairingTips?: string[];
  badges?: {
    bestSeller?: boolean;
    humeSpecial?: boolean;
    limitedStock?: boolean;
    soldOut?: boolean;
  };
  notes: {
    top: string[];
    heart: string[];
    base: string[];
  };
  longevity: {
    duration: string;
    sillage: string;
    season: string[];
    occasion: string[];
  };
  size: string;
  reviews: Review[];
}

const reviewsPool: Review[] = [
  {
    id: "rev-1",
    author: "James W.",
    rating: 5,
    date: "2024-01-15",
    title: "Absolutely stunning fragrance",
    content: "I've been searching for an affordable alternative to the original for years, and HUME has absolutely nailed it. The longevity is incredible, easily lasting through a full workday. My colleagues keep asking what I'm wearing. Worth every penny.",
    verified: true,
  },
  {
    id: "rev-2",
    author: "Sophie L.",
    rating: 5,
    date: "2024-01-28",
    title: "Better than expected",
    content: "Bought this as a gift for my husband and he loves it. The scent is sophisticated and long-lasting. The packaging is beautiful too - feels very premium. Will definitely be ordering more from HUME.",
    verified: true,
  },
  {
    id: "rev-3",
    author: "Michael T.",
    rating: 4,
    date: "2024-02-03",
    title: "Great value for money",
    content: "Very close to the original designer fragrance. The opening is slightly different but the dry down is nearly identical. Excellent projection for the first 3-4 hours then becomes more intimate. Highly recommend.",
    verified: true,
  },
  {
    id: "rev-4",
    author: "Emma R.",
    rating: 5,
    date: "2024-02-10",
    title: "My new signature scent",
    content: "This has become my go-to fragrance. I receive compliments everywhere I go. The quality is exceptional and it lasts all day. HUME has converted me - I won't be paying designer prices anymore.",
    verified: true,
  },
  {
    id: "rev-5",
    author: "David K.",
    rating: 4,
    date: "2024-02-18",
    title: "Impressive clone",
    content: "As someone who owns the original, I can say this is 90% there. The performance is actually better than my original bottle. Shipping was fast and customer service was excellent. Will try other scents from the collection.",
    verified: true,
  },
  {
    id: "rev-6",
    author: "Charlotte M.",
    rating: 5,
    date: "2024-02-25",
    title: "Luxurious and elegant",
    content: "The attention to detail is remarkable. From the elegant bottle to the perfectly crafted scent, everything screams quality. This is my third purchase from HUME and they never disappoint. Absolutely love it.",
    verified: true,
  },
];

const getReviewsForPerfume = (seed: number): Review[] => {
  const shuffled = [...reviewsPool].sort(() => 0.5 - Math.sin(seed));
  return shuffled.slice(0, 5 + (seed % 2)).map((r, i) => ({
    ...r,
    id: `${r.id}-${seed}-${i}`,
  }));
};

export const perfumes: PerfumeData[] = [
  {
    id: "sauvage-noir",
    name: "Sauvage",
    inspiration: "Dior Sauvage",
    inspirationBrand: "Dior",
    woreBy: "Johnny Depp",
    woreByImageUrl: "https://placehold.co/600x600?text=Johnny+Depp",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p1, p2, p3, p4],
    price: 45.0,
    description:
      "A bold reinterpretation of the iconic masculine freshness. Raw, noble, and undeniably magnetic with an irresistible blend of spicy bergamot and warm amber.",
    seoDescription:
      "Buy Sauvage Noir by HUME — a premium Dior Sauvage inspired perfume. Long-lasting Eau Sauvage alternative with bergamot, pepper & amber. Affordable luxury fragrance for men.",
    seoKeywords: [
      "sauvage inspired perfume",
      "dior sauvage alternative",
      "dior inspired fragrance",
      "sauvage clone",
      "eau sauvage inspired",
      "affordable sauvage",
      "best sauvage dupe",
      "mens cologne dior inspired",
    ],
    badges: { bestSeller: true },
    notes: {
      top: ["Bergamot", "Pepper", "Calabrian Lemon"],
      heart: ["Lavender", "Sichuan Pepper", "Geranium"],
      base: ["Ambroxan", "Cedar", "Labdanum"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate to Strong",
      season: ["Spring", "Summer", "Autumn"],
      occasion: ["Daily Wear", "Office", "Casual"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(1),
  },
  {
    id: "homme-intense",
    name: "Homme Intense",
    inspiration: "Dior Homme Intense",
    inspirationBrand: "Dior",
    category: "Woody",
    categoryId: "woody",
    gender: "Men",
    images: [p2, p1, p4, p3],
    price: 48.0,
    description:
      "An intensely seductive fragrance that captures the essence of modern masculinity. Rich iris and warm woods create an unforgettable signature.",
    seoDescription:
      "Buy Homme Intense by HUME — a luxury Dior Homme Intense inspired perfume. Seductive iris & cedar fragrance. Best affordable Dior clone for men.",
    seoKeywords: [
      "dior homme intense inspired",
      "dior inspired perfume",
      "dior homme alternative",
      "dior clone perfume",
      "iris perfume men",
      "best dior dupe",
      "affordable dior fragrance",
      "dior homme intense clone",
    ],
    badges: { bestSeller: true },
    notes: {
      top: ["Lavender", "Pear", "Bergamot"],
      heart: ["Iris", "Violet", "Rose"],
      base: ["Virginia Cedar", "Vetiver", "Leather"],
    },
    longevity: {
      duration: "10-12 hours",
      sillage: "Strong",
      season: ["Autumn", "Winter"],
      occasion: ["Evening", "Date Night", "Special Events"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(2),
  },
  {
    id: "allure-sport",
    name: "Allure Sport",
    inspiration: "Allure Homme Sport",
    inspirationBrand: "Chanel",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p3, p4, p1, p2],
    price: 42.0,
    description:
      "Dynamic and invigorating, this fragrance embodies athletic elegance. A perfect balance of freshness and sensuality for the active gentleman.",
    seoDescription:
      "Buy Allure Sport by HUME — a premium Chanel Allure Homme Sport inspired perfume. Fresh & sporty men's cologne alternative at an affordable price.",
    seoKeywords: [
      "chanel allure homme sport inspired",
      "chanel inspired perfume",
      "chanel alternative fragrance",
      "chanel clone cologne",
      "sporty mens fragrance",
      "allure homme sport dupe",
      "affordable chanel perfume",
      "best chanel alternative",
    ],
    notes: {
      top: ["Mandarin Orange", "Sea Notes", "Aldehydes"],
      heart: ["Neroli", "Cedar", "Pepper"],
      base: ["Tonka Bean", "White Musk", "Amber"],
    },
    longevity: {
      duration: "6-8 hours",
      sillage: "Moderate",
      season: ["Spring", "Summer"],
      occasion: ["Sports", "Casual", "Daytime"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(3),
  },
  {
    id: "guilty-homme",
    name: "Guilty Pour Homme",
    inspiration: "Gucci Guilty",
    inspirationBrand: "Gucci",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p4, p3, p2, p1],
    price: 44.0,
    description:
      "A contemporary aromatic fougère with an urban twist. Boldly unconventional yet irresistibly sophisticated for the modern rebel.",
    seoDescription:
      "Buy Guilty Pour Homme by HUME — a luxury Gucci Guilty inspired perfume for men. Bold aromatic fougère alternative. Best Gucci dupe fragrance.",
    seoKeywords: [
      "gucci guilty inspired perfume",
      "gucci inspired fragrance",
      "gucci alternative cologne",
      "gucci guilty clone",
      "gucci dupe men",
      "affordable gucci perfume",
      "best gucci alternative",
      "gucci guilty pour homme dupe",
    ],
    notes: {
      top: ["Lavender", "Lemon", "Pink Pepper"],
      heart: ["Orange Blossom", "Neroli", "Geranium"],
      base: ["Cedar", "Patchouli", "Amber"],
    },
    longevity: {
      duration: "7-9 hours",
      sillage: "Moderate to Strong",
      season: ["Spring", "Autumn"],
      occasion: ["Casual", "Night Out", "Date Night"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(4),
  },
  {
    id: "myself",
    name: "Myself",
    inspiration: "YSL Myself",
    inspirationBrand: "Yves Saint Laurent",
    category: "Woody",
    categoryId: "woody",
    gender: "Unisex",
    images: [p1, p3, p2, p4],
    price: 46.0,
    description:
      "A deeply personal fragrance celebrating authenticity and self-expression. Elegant orange blossom meets powerful woody notes in perfect harmony.",
    seoDescription:
      "Buy Myself by HUME — a premium YSL Myself inspired perfume. Unisex orange blossom & woody fragrance. Affordable Yves Saint Laurent alternative.",
    seoKeywords: [
      "ysl myself inspired perfume",
      "ysl inspired fragrance",
      "yves saint laurent alternative",
      "ysl clone perfume",
      "ysl myself dupe",
      "affordable ysl fragrance",
      "best ysl alternative",
      "unisex ysl inspired",
    ],
    notes: {
      top: ["Bergamot", "Orange Blossom", "Mandarin"],
      heart: ["Orange Blossom Absolute", "Jasmine", "Orris"],
      base: ["Indonesian Patchouli", "Vanilla", "Cedarwood"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate",
      season: ["All Year"],
      occasion: ["Office", "Casual", "Evening"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(5),
  },
  {
    id: "ysl-y-edp",
    name: "Y Intense",
    inspiration: "YSL Y EDP",
    inspirationBrand: "Yves Saint Laurent",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p2, p4, p1, p3],
    price: 44.0,
    description:
      "An intensely fresh and powerful fragrance for the generation that rewrites the rules. Bold yet refined with an addictive aromatic signature.",
    seoDescription:
      "Buy Y Intense by HUME — a luxury YSL Y EDP inspired perfume for men. Fresh & powerful aromatic signature. Best affordable YSL Y alternative.",
    seoKeywords: [
      "ysl y edp inspired perfume",
      "ysl y alternative",
      "yves saint laurent y clone",
      "ysl inspired cologne men",
      "affordable ysl y fragrance",
      "best ysl y dupe",
      "ysl y edp clone",
      "ysl inspired men perfume",
    ],
    notes: {
      top: ["Apple", "Ginger", "Bergamot"],
      heart: ["Sage", "Juniper Berries", "Geranium"],
      base: ["Amberwood", "Tonka Bean", "Cedar"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Strong",
      season: ["Autumn", "Winter", "Spring"],
      occasion: ["Office", "Date Night", "Daily Wear"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(6),
  },
  {
    id: "tom-ford-oud-wood",
    name: "Oud Wood",
    inspiration: "Tom Ford Oud Wood",
    inspirationBrand: "Tom Ford",
    category: "Oud",
    categoryId: "oud",
    gender: "Unisex",
    images: [p3, p1, p4, p2],
    price: 58.0,
    description:
      "A masterpiece of oriental luxury. Rare oud wood meets exotic spices in a composition of unparalleled sophistication and depth.",
    seoDescription:
      "Buy Oud Royale by HUME — a premium Tom Ford Oud Wood inspired perfume. Luxury oud & sandalwood fragrance. Best affordable Tom Ford alternative.",
    seoKeywords: [
      "tom ford oud wood inspired",
      "tom ford inspired perfume",
      "tom ford alternative fragrance",
      "tom ford clone",
      "oud wood dupe",
      "affordable tom ford",
      "best tom ford alternative",
      "luxury oud perfume",
      "ombre nomade alternative",
    ],
    notes: {
      top: ["Oud", "Rosewood", "Cardamom"],
      heart: ["Chinese Pepper", "Sandalwood", "Vetiver"],
      base: ["Tonka Bean", "Amber", "Musk"],
    },
    longevity: {
      duration: "12+ hours",
      sillage: "Strong to Powerful",
      season: ["Autumn", "Winter"],
      occasion: ["Evening", "Special Events", "Formal"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(7),
  },
  {
    id: "ombre-nomade",
    name: "Nomade Noir",
    inspiration: "Ombre Nomade",
    inspirationBrand: "Louis Vuitton",
    category: "Oriental",
    categoryId: "oriental",
    gender: "Unisex",
    images: [p3, p1, p4, p2],
    price: 58.0,
    description:
      "An intense journey into the depths of oud and rose. Dark, smoky, and luxurious — a bold statement fragrance crafted for those who command presence.",
    seoDescription:
      "Buy Nomade Noir by HUME — a luxury Louis Vuitton Ombre Nomade inspired perfume. Rich oud & rose unisex fragrance. Best affordable LV alternative.",
    seoKeywords: [
      "ombre nomade inspired perfume",
      "lv ombre nomade alternative",
      "louis vuitton inspired fragrance",
      "oud rose perfume dupe",
      "ombre nomade clone",
      "affordable lv perfume",
      "luxury oud fragrance",
    ],
    badges: { limitedStock: true },
    notes: {
      top: ["Raspberry", "Saffron"],
      heart: ["Rose", "Geranium"],
      base: ["Oud", "Amberwood", "Incense", "Benzoin"],
    },
    longevity: {
      duration: "12+ hours",
      sillage: "Very Strong",
      season: ["Fall", "Winter"],
      occasion: ["Evening", "Luxury Events", "Special Occasions"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(11),
  },
  {
    id: "lv-imagination",
    name: "Infinite Vision",
    inspiration: "Imagination",
    inspirationBrand: "Louis Vuitton",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p4, p2, p1, p3],
    price: 54.0,
    description:
      "Bright citrus blended with black tea and ambroxan creates a clean, uplifting, and modern signature scent full of energy and refinement.",
    seoDescription:
      "Buy Infinite Vision by HUME — a premium Louis Vuitton Imagination inspired perfume. Fresh citrus & tea men's fragrance. Affordable LV alternative.",
    seoKeywords: [
      "lv imagination inspired perfume",
      "louis vuitton imagination alternative",
      "fresh citrus tea fragrance",
      "imagination clone",
      "affordable lv fragrance",
      "luxury fresh men perfume",
    ],
    notes: {
      top: ["Calabrian Bergamot", "Citron", "Orange"],
      heart: ["Black Tea", "Neroli", "Ginger"],
      base: ["Ambroxan", "Guaiac Wood", "Frankincense"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate",
      season: ["Spring", "Summer"],
      occasion: ["Daily Wear", "Office", "Casual", "Travel"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(12),
  },
  {
    id: "ombre-leather",
    name: "Leather Eclipse",
    inspiration: "Ombre Leather",
    inspirationBrand: "Tom Ford",
    category: "Leather",
    categoryId: "leather",
    gender: "Unisex",
    images: [p1, p3, p2, p4],
    price: 56.0,
    description:
      "Raw leather wrapped in soft florals and warm amber. A bold yet refined scent that captures the spirit of freedom and sophistication.",
    seoDescription:
      "Buy Leather Eclipse by HUME — a Tom Ford Ombre Leather inspired perfume. Rich leather & amber unisex fragrance. Affordable Tom Ford alternative.",
    seoKeywords: [
      "ombre leather inspired perfume",
      "tom ford leather alternative",
      "leather fragrance dupe",
      "ombre leather clone",
      "affordable tom ford perfume",
      "luxury leather scent",
    ],
    badges: { limitedStock: true },
    notes: {
      top: ["Cardamom"],
      heart: ["Jasmine Sambac", "Leather"],
      base: ["Amber", "Moss", "Patchouli"],
    },
    longevity: {
      duration: "9-11 hours",
      sillage: "Strong",
      season: ["Fall", "Winter"],
      occasion: ["Evening", "Date Night", "Formal"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(13),
  },
  {
    id: "spicebomb",
    name: "Spice Inferno",
    inspiration: "Spicebomb",
    inspirationBrand: "Viktor & Rolf",
    category: "Spicy",
    categoryId: "spicy",
    gender: "Men",
    images: [p2, p4, p1, p3],
    price: 50.0,
    description:
      "An explosive blend of fiery spices and warm tobacco balanced with smooth vanilla. Powerful, seductive, and unforgettable.",
    seoDescription:
      "Buy Spice Inferno by HUME — a Viktor & Rolf Spicebomb inspired perfume. Warm spicy men's fragrance. Best affordable Spicebomb alternative.",
    seoKeywords: [
      "spicebomb inspired perfume",
      "viktor and rolf alternative",
      "spicy men fragrance dupe",
      "spicebomb clone",
      "warm winter cologne",
      "affordable spicy perfume",
    ],
    notes: {
      top: ["Pink Pepper", "Bergamot", "Grapefruit"],
      heart: ["Cinnamon", "Saffron", "Paprika"],
      base: ["Tobacco", "Leather", "Vetiver"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Strong",
      season: ["Fall", "Winter"],
      occasion: ["Night Out", "Parties", "Evening"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(14),
  },
  {
    id: "eros-flame",
    name: "Flame Desire",
    inspiration: "Eros Flame",
    inspirationBrand: "Versace",
    category: "Woody",
    categoryId: "woody",
    gender: "Men",
    images: [p3, p2, p4, p1],
    price: 49.0,
    description:
      "A vibrant contrast of fresh citrus and warm vanilla woods. Passionate, confident, and designed for the modern romantic.",
    seoDescription:
      "Buy Flame Desire by HUME — a Versace Eros Flame inspired perfume. Citrus vanilla men's fragrance. Affordable Eros Flame alternative.",
    seoKeywords: [
      "eros flame inspired perfume",
      "versace eros alternative",
      "citrus vanilla cologne",
      "eros flame dupe",
      "affordable versace perfume",
      "romantic men fragrance",
    ],
    notes: {
      top: ["Mandarin", "Black Pepper", "Lemon"],
      heart: ["Rosemary", "Geranium", "Pepperwood"],
      base: ["Vanilla", "Tonka Bean", "Sandalwood", "Cedar"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate to Strong",
      season: ["Fall", "Winter", "Spring"],
      occasion: ["Date Night", "Evening", "Special Events"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(15),
  },
  {
    id: "acqua-di-gio-profondo",
    name: "Deep Ocean",
    inspiration: "Acqua di Gio Profondo",
    inspirationBrand: "Giorgio Armani",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p4, p1, p3, p2],
    price: 48.0,
    description:
      "A deep marine freshness fused with aromatic herbs and mineral amber. Clean, masculine, and effortlessly sophisticated.",
    seoDescription:
      "Buy Deep Ocean by HUME — an Acqua di Gio Profondo inspired perfume. Fresh aquatic men's fragrance. Affordable Armani alternative.",
    seoKeywords: [
      "acqua di gio profondo inspired perfume",
      "armani profondo alternative",
      "aquatic men fragrance",
      "acqua di gio dupe",
      "fresh summer cologne",
      "affordable armani perfume",
    ],
    notes: {
      top: ["Marine Notes", "Green Mandarin", "Bergamot"],
      heart: ["Lavender", "Rosemary", "Cypress"],
      base: ["Patchouli", "Musk", "Amber", "Mineral Notes"],
    },
    longevity: {
      duration: "7-9 hours",
      sillage: "Moderate",
      season: ["Spring", "Summer"],
      occasion: ["Daily Wear", "Office", "Gym", "Casual"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(16),
  },
  
  {
    id: "bleu-de-chanel",
    name: "Bleu Intense",
    inspiration: "Bleu de Chanel",
    inspirationBrand: "Chanel",
    woreBy: "David Beckham",
    woreByImageUrl: "https://placehold.co/600x600?text=David+Beckham",
    category: "Woody",
    categoryId: "woody",
    gender: "Men",
    images: [p1, p4, p3, p2],
    price: 48.0,
    description:
      "The epitome of modern masculine elegance. A harmonious blend of fresh citrus, aromatic mint, and sensual woods that defies convention.",
    seoDescription:
      "Buy Bleu Intense by HUME — a premium Bleu de Chanel inspired perfume. Fresh citrus & woody men's cologne. Best affordable Chanel alternative.",
    seoKeywords: [
      "bleu de chanel inspired perfume",
      "chanel inspired fragrance",
      "chanel bleu alternative",
      "chanel clone cologne",
      "bleu de chanel dupe",
      "affordable chanel perfume",
      "best bleu de chanel alternative",
      "chanel inspired men cologne",
    ],
    notes: {
      top: ["Grapefruit", "Lemon", "Mint"],
      heart: ["Ginger", "Nutmeg", "Jasmine"],
      base: ["Incense", "Vetiver", "Cedar", "Sandalwood"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate to Strong",
      season: ["All Year"],
      occasion: ["Office", "Date Night", "Formal", "Casual"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(9),
  },
  {
    id: "creed-aventus",
    name: "Aventus",
    inspiration: "Creed Aventus",
    inspirationBrand: "Creed",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Men",
    images: [p2, p3, p4, p1],
    price: 52.0,
    description:
      "A legendary fragrance celebrating strength, power, and success. Bold pineapple and birch create an iconic signature of the accomplished man.",
    seoDescription:
      "Buy Aventus Legend by HUME — a luxury Creed Aventus inspired perfume. Iconic pineapple & birch men's fragrance. Best affordable Creed Aventus clone.",
    seoKeywords: [
      "creed aventus inspired perfume",
      "creed inspired fragrance",
      "creed aventus alternative",
      "aventus clone",
      "creed aventus dupe",
      "affordable creed perfume",
      "best creed alternative",
      "creed aventus clone UK",
      "armani inspired perfume",
    ],
    badges: { bestSeller: true },
    notes: {
      top: ["Pineapple", "Bergamot", "Black Currant", "Apple"],
      heart: ["Birch", "Patchouli", "Moroccan Jasmine", "Rose"],
      base: ["Musk", "Oak Moss", "Ambergris", "Vanilla"],
    },
    longevity: {
      duration: "10-12 hours",
      sillage: "Strong",
      season: ["All Year"],
      occasion: ["Business", "Special Events", "Daily Wear"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(10),
  },
  {
    id: "creed-viking",
    name: "Viking Spirit",
    inspiration: "Creed Viking",
    inspirationBrand: "Creed",
    woreBy: "Virat Kohli",
    woreByImageUrl: "https://placehold.co/600x600?text=Virat+Kohli",
    category: "Woody",
    categoryId: "woody",
    gender: "Men",
    images: [p2, p1, p4, p3],
    price: 54.0,
    description:
      "A bold aromatic-woody composition with citrus, spice, and warm woods inspired by Creed Viking.",
    seoDescription:
      "Buy Viking Spirit by HUME - inspired by Creed Viking. A spicy woody men's fragrance with strong signature performance.",
    seoKeywords: [
      "creed viking inspired perfume",
      "creed viking alternative",
      "virat kohli perfume",
      "woody spicy fragrance",
      "creed inspired perfume",
    ],
    notes: {
      top: ["Bergamot", "Lemon", "Pink Pepper"],
      heart: ["Pepper", "Rose", "Mint"],
      base: ["Sandalwood", "Vetiver", "Cedar"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Strong",
      season: ["All Year"],
      occasion: ["Daily Wear", "Office", "Evening"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(17),
  },
  {
    id: "srk-special",
    name: "SRK Special",
    inspiration: "Tam Dao + Dunhill Icon",
    inspirationBrand: "Diptyque + Dunhill",
    woreBy: "Shah Rukh Khan (SRK)",
    woreByImageUrl: "https://placehold.co/600x600?text=SRK",
    category: "Woody",
    categoryId: "woody",
    gender: "Men",
    images: [p1, p2, p3, p4],
    price: 56.0,
    description:
      "A unique combo profile blending Tam Dao style creamy sandalwood with the clean aromatic edge of Dunhill Icon.",
    seoDescription:
      "Buy SRK Special by HUME - a combo inspired by Tam Dao and Dunhill Icon. Elegant woody-aromatic signature scent.",
    seoKeywords: [
      "srk special perfume",
      "tam dao inspired perfume",
      "dunhill icon inspired",
      "shah rukh khan perfume",
      "woody aromatic fragrance",
    ],
    notes: {
      top: ["Neroli", "Bergamot", "Pepper"],
      heart: ["Cypress", "Iris", "Lavender"],
      base: ["Sandalwood", "Amber", "Cedar"],
    },
    longevity: {
      duration: "8-10 hours",
      sillage: "Moderate to Strong",
      season: ["All Year"],
      occasion: ["Formal", "Office", "Evening"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(18),
  },
  {
    id: "gypsy-water",
    name: "Gypsy Water Bloom",
    inspiration: "Byredo Gypsy Water",
    inspirationBrand: "Byredo",
    woreBy: "Taylor Swift",
    woreByImageUrl: "https://placehold.co/600x600?text=Taylor+Swift",
    category: "Fresh",
    categoryId: "fresh",
    gender: "Unisex",
    images: [p4, p3, p1, p2],
    price: 53.0,
    description:
      "A clean woody-fresh scent inspired by Byredo Gypsy Water with citrus sparkle, soft woods, and light incense warmth.",
    seoDescription:
      "Buy Gypsy Water Bloom by HUME - inspired by Byredo Gypsy Water. A fresh woody unisex fragrance loved for daily elegance.",
    seoKeywords: [
      "byredo gypsy water inspired",
      "gypsy water alternative",
      "taylor swift perfume",
      "fresh woody unisex perfume",
      "byredo inspired fragrance",
    ],
    notes: {
      top: ["Bergamot", "Lemon", "Juniper"],
      heart: ["Incense", "Pine", "Orris"],
      base: ["Sandalwood", "Vanilla", "Amber"],
    },
    longevity: {
      duration: "7-9 hours",
      sillage: "Moderate",
      season: ["Spring", "Summer", "Autumn"],
      occasion: ["Daily Wear", "Casual", "Date Night"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(19),
  },
  {
    id: "valentino-born-in-roma-intense",
    name: "Roma Intense",
    inspiration: "Valentino Born in Roma Intense",
    inspirationBrand: "Valentino",
    category: "Sweet",
    categoryId: "sweet",
    gender: "Men",
    images: [p2, p4, p1, p3],
    price: 55.0,
    description:
      "A sensual sweet-amber profile inspired by Born in Roma Intense, blending warm vanilla with rich aromatic depth.",
    seoDescription:
      "Buy Roma Intense by HUME - inspired by Valentino Born in Roma Intense. A sweet amber-vanilla signature for evenings and special nights.",
    seoKeywords: [
      "valentino born in roma intense inspired",
      "born in roma intense alternative",
      "sweet amber perfume",
      "valentino inspired fragrance",
      "vanilla men fragrance",
    ],
    notes: {
      top: ["Vanilla", "Lavender", "Bergamot"],
      heart: ["Jasmine", "Spices", "Amber Accord"],
      base: ["Benzoin", "Tonka Bean", "Sandalwood"],
    },
    longevity: {
      duration: "9-11 hours",
      sillage: "Strong",
      season: ["Autumn", "Winter"],
      occasion: ["Date Night", "Evening", "Party"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(20),
  },
  {
    id: "stronger-with-you-intensely",
    name: "Intense You",
    inspiration: "Emporio Armani Stronger With You Intensely",
    inspirationBrand: "Giorgio Armani",
    category: "Sweet",
    categoryId: "sweet",
    gender: "Men",
    images: [p1, p3, p4, p2],
    price: 54.0,
    description:
      "A rich sweet-spicy fragrance inspired by Stronger With You Intensely with warm toffee, cinnamon, and amber woods.",
    seoDescription:
      "Buy Intense You by HUME - inspired by Stronger With You Intensely. Sweet spicy amber fragrance with powerful evening performance.",
    seoKeywords: [
      "stronger with you intensely inspired",
      "armani stronger with you alternative",
      "sweet spicy perfume",
      "toffee cinnamon fragrance",
      "armani inspired perfume",
    ],
    notes: {
      top: ["Pink Pepper", "Juniper", "Violet"],
      heart: ["Toffee", "Cinnamon", "Lavender"],
      base: ["Amber", "Tonka Bean", "Vanilla", "Suede"],
    },
    longevity: {
      duration: "10-12 hours",
      sillage: "Strong",
      season: ["Autumn", "Winter"],
      occasion: ["Date Night", "Evening", "Special Events"],
    },
    size: "50ml",
    reviews: getReviewsForPerfume(21),
  },
];

export const categories = [
  { id: "all", label: "All Fragrances" },
  { id: "fresh", label: "Fresh" },
  { id: "woody", label: "Woody" },
  { id: "sweet", label: "Sweet" },
  { id: "oriental", label: "Oriental" },
  { id: "oud", label: "Oud" },
];

export const getPerfumeById = (id: string): PerfumeData | undefined => {
  return perfumes.find((p) => p.id === id);
};

export const getAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};
