import {
  Heart,
  GraduationCap,
  Dumbbell,
  Briefcase,
  PartyPopper,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type OccasionIconName =
  | "heart"
  | "graduation-cap"
  | "dumbbell"
  | "briefcase"
  | "party-popper"
  | "sparkles";

export function getOccasionIcon(iconName?: string): LucideIcon {
  switch (iconName) {
    case "heart":
      return Heart;
    case "graduation-cap":
      return GraduationCap;
    case "dumbbell":
      return Dumbbell;
    case "briefcase":
      return Briefcase;
    case "party-popper":
      return PartyPopper;
    case "sparkles":
    default:
      return Sparkles;
  }
}

export interface OccasionCardConfig {
  id: string;
  slug: string;
  occasionTitle: string;
  shortTitle: string;
  badgeLabel: string;
  iconName: OccasionIconName;
  tagline: string;
  bgImage?: string;
  targetPerfumeId: string;
  fallbackName: string;
  fallbackInspiration: string;
  fallbackBrand: string;
  fallbackCategory: string;
  fallbackPrice: number;
  fallbackImage: string;
  keyNotes: string[];
  gradientTheme: {
    bgCard: string;
    badgeStyle: string;
    borderGlow: string;
    glowBg: string;
    accentText: string;
    iconBg: string;
    btnStyle: string;
  };
}

export const OCCASIONS_LIST: OccasionCardConfig[] = [
  {
    id: "date-night",
    slug: "date-night",
    occasionTitle: "Date Night",
    shortTitle: "Date Night",
    badgeLabel: "Intimate & Seductive",
    iconName: "heart",
    tagline: "Intimate, Seductive & Irresistible",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1783089906/8d10b185-b10b-4832-afe7-b43c4b3091cf_bizq5m.png",
    targetPerfumeId: "homme-intense",
    fallbackName: "Homme Intense",
    fallbackInspiration: "Dior Homme Intense",
    fallbackBrand: "Dior",
    fallbackCategory: "Woody",
    fallbackPrice: 48.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Iris", "Warm Woods", "Pear", "Amber"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#2a0e1c]/80 via-[#1a0a14]/90 to-[#11070d]",
      badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      borderGlow: "border-rose-500/30 group-hover:border-rose-400/70",
      glowBg: "from-rose-500/20 to-purple-600/10",
      accentText: "text-rose-300",
      iconBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      btnStyle: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40",
    },
  },
  {
    id: "college-school",
    slug: "college-school",
    occasionTitle: "College / School",
    shortTitle: "College",
    badgeLabel: "Fresh & Energetic",
    iconName: "graduation-cap",
    tagline: "Fresh, Energetic & Compliment Magnet",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1781631319/2a3bead4-42ea-4946-a10a-46a8eb4442ac_1_hqyb6r.png",
    targetPerfumeId: "ysl-y-edp",
    fallbackName: "Y Intense",
    fallbackInspiration: "YSL Y EDP",
    fallbackBrand: "Yves Saint Laurent",
    fallbackCategory: "Fresh",
    fallbackPrice: 44.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Fresh Apple", "Ginger", "Sage", "Cedarwood"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#0c2233]/80 via-[#091826]/90 to-[#07111c]",
      badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      borderGlow: "border-cyan-500/30 group-hover:border-cyan-400/70",
      glowBg: "from-cyan-500/20 to-blue-600/10",
      accentText: "text-cyan-300",
      iconBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      btnStyle: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40",
    },
  },
  {
    id: "gym-sports",
    slug: "gym-sports",
    occasionTitle: "GYM / Sports",
    shortTitle: "GYM",
    badgeLabel: "High Performance",
    iconName: "dumbbell",
    tagline: "Invigorating, High-Performance Freshness",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1788341543/7574d423-8075-48d4-933c-48643972ae2e_glt0gj.png",
    targetPerfumeId: "allure-sport",
    fallbackName: "Allure Sport",
    fallbackInspiration: "Allure Homme Sport",
    fallbackBrand: "Chanel",
    fallbackCategory: "Fresh",
    fallbackPrice: 42.0,
    fallbackImage: "/images/perfume-3.jpg",
    keyNotes: ["Sea Notes", "Mandarin", "White Musk", "Pepper"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#0b2b22]/80 via-[#081e18]/90 to-[#061410]",
      badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      borderGlow: "border-emerald-500/30 group-hover:border-emerald-400/70",
      glowBg: "from-emerald-500/20 to-teal-600/10",
      accentText: "text-emerald-300",
      iconBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      btnStyle: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40",
    },
  },
  {
    id: "office-daily",
    slug: "office-daily",
    occasionTitle: "Office / Daily Wear",
    shortTitle: "Office",
    badgeLabel: "Clean & Signature",
    iconName: "briefcase",
    tagline: "Sophisticated, Clean & All-Day Presence",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1774209656/be0e4de8-6197-458f-b10f-da1898090685_yvwjnd.png",
    targetPerfumeId: "lv-imagination",
    fallbackName: "Infinite Vision",
    fallbackInspiration: "Imagination",
    fallbackBrand: "Louis Vuitton",
    fallbackCategory: "Fresh",
    fallbackPrice: 54.0,
    fallbackImage: "/images/perfume-4.jpg",
    keyNotes: ["Black Tea", "Calabrian Citrus", "Ambroxan", "Frankincense"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#1e1e24]/80 via-[#14141a]/90 to-[#0e0e12]",
      badgeStyle: "bg-zinc-300/20 text-zinc-200 border-zinc-300/30",
      borderGlow: "border-zinc-400/30 group-hover:border-zinc-300/70",
      glowBg: "from-zinc-400/15 to-stone-500/10",
      accentText: "text-zinc-200",
      iconBg: "bg-zinc-300/20 text-zinc-200 border-zinc-300/30",
      btnStyle: "bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-zinc-950/40",
    },
  },
  {
    id: "night-out",
    slug: "night-out",
    occasionTitle: "Night Out",
    shortTitle: "Night Out",
    badgeLabel: "Bold & Explosive",
    iconName: "party-popper",
    tagline: "Bold, Explosive & Club-Ready",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1783093871/d2b446b5-f58f-42e8-bc59-8b65640d4208.png",
    targetPerfumeId: "spicebomb",
    fallbackName: "Spice Inferno",
    fallbackInspiration: "Spicebomb",
    fallbackBrand: "Viktor & Rolf",
    fallbackCategory: "Spicy",
    fallbackPrice: 50.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Cinnamon", "Fiery Spices", "Rich Tobacco", "Leather"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#2d1b0a]/80 via-[#1f1207]/90 to-[#140b04]",
      badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      borderGlow: "border-amber-500/30 group-hover:border-amber-400/70",
      glowBg: "from-amber-500/20 to-orange-600/10",
      accentText: "text-amber-300",
      iconBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      btnStyle: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40",
    },
  },
  {
    id: "first-impression",
    slug: "first-impression",
    occasionTitle: "First Impression",
    shortTitle: "First Impression",
    badgeLabel: "Statement & Charisma",
    iconName: "sparkles",
    tagline: "Unforgettable, Charismatic & Confident",
    bgImage: "https://res.cloudinary.com/dmbfo7uzl/image/upload/v1783094739/11e5e062-d581-485a-8462-c60f81298e3c.png",
    targetPerfumeId: "myself",
    fallbackName: "Myself",
    fallbackInspiration: "YSL Myself",
    fallbackBrand: "Yves Saint Laurent",
    fallbackCategory: "Woody",
    fallbackPrice: 46.0,
    fallbackImage: "/images/perfume-1.jpg",
    keyNotes: ["Orange Blossom", "Bergamot", "Sandalwood", "Patchouli"],
    gradientTheme: {
      bgCard: "bg-gradient-to-b from-[#1a122e]/80 via-[#120b21]/90 to-[#0b0717]",
      badgeStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      borderGlow: "border-indigo-500/30 group-hover:border-indigo-400/70",
      glowBg: "from-indigo-500/20 to-purple-600/10",
      accentText: "text-indigo-300",
      iconBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      btnStyle: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40",
    },
  },
];
