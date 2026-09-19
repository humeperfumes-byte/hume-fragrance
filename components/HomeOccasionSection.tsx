"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  GraduationCap,
  Dumbbell,
  Briefcase,
  PartyPopper,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Zap,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-route";
import type { HomepagePerfumeCardData } from "@/types/homepage";

export interface OccasionCardConfig {
  id: string;
  occasionTitle: string;
  badgeLabel: string;
  icon: typeof Heart;
  tagline: string;
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
    btnStyle: string;
  };
}

const OCCASIONS: OccasionCardConfig[] = [
  {
    id: "date-night",
    occasionTitle: "Date Night",
    badgeLabel: "Date Night",
    icon: Heart,
    tagline: "Intimate, Seductive & Irresistible",
    targetPerfumeId: "homme-intense",
    fallbackName: "Homme Intense",
    fallbackInspiration: "Dior Homme Intense",
    fallbackBrand: "Dior",
    fallbackCategory: "Woody",
    fallbackPrice: 48.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Iris", "Warm Woods", "Pear", "Amber"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#2a0e1c]/90 via-[#1a0a14]/95 to-[#11070d]",
      badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      borderGlow: "border-rose-500/20 group-hover:border-rose-500/50",
      glowBg: "from-rose-500/20 to-purple-600/10",
      accentText: "text-rose-300",
      btnStyle: "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40",
    },
  },
  {
    id: "college-school",
    occasionTitle: "College / School",
    badgeLabel: "College & Campus",
    icon: GraduationCap,
    tagline: "Fresh, Energetic & Compliment Magnet",
    targetPerfumeId: "ysl-y-edp",
    fallbackName: "Y Intense",
    fallbackInspiration: "YSL Y EDP",
    fallbackBrand: "Yves Saint Laurent",
    fallbackCategory: "Fresh",
    fallbackPrice: 44.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Fresh Apple", "Ginger", "Sage", "Cedarwood"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#0c2233]/90 via-[#091826]/95 to-[#07111c]",
      badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      borderGlow: "border-cyan-500/20 group-hover:border-cyan-500/50",
      glowBg: "from-cyan-500/20 to-blue-600/10",
      accentText: "text-cyan-300",
      btnStyle: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/40",
    },
  },
  {
    id: "gym-sports",
    occasionTitle: "GYM / Sports",
    badgeLabel: "GYM & Athletic",
    icon: Dumbbell,
    tagline: "Invigorating, High-Performance Freshness",
    targetPerfumeId: "allure-sport",
    fallbackName: "Allure Sport",
    fallbackInspiration: "Allure Homme Sport",
    fallbackBrand: "Chanel",
    fallbackCategory: "Fresh",
    fallbackPrice: 42.0,
    fallbackImage: "/images/perfume-3.jpg",
    keyNotes: ["Sea Notes", "Mandarin", "White Musk", "Pepper"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#0b2b22]/90 via-[#081e18]/95 to-[#061410]",
      badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      borderGlow: "border-emerald-500/20 group-hover:border-emerald-500/50",
      glowBg: "from-emerald-500/20 to-teal-600/10",
      accentText: "text-emerald-300",
      btnStyle: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40",
    },
  },
  {
    id: "office-daily",
    occasionTitle: "Office / Daily Wear",
    badgeLabel: "Office & Signature",
    icon: Briefcase,
    tagline: "Sophisticated, Clean & All-Day Presence",
    targetPerfumeId: "lv-imagination",
    fallbackName: "Infinite Vision",
    fallbackInspiration: "Imagination",
    fallbackBrand: "Louis Vuitton",
    fallbackCategory: "Fresh",
    fallbackPrice: 54.0,
    fallbackImage: "/images/perfume-4.jpg",
    keyNotes: ["Black Tea", "Calabrian Citrus", "Ambroxan", "Frankincense"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#1e1e24]/90 via-[#14141a]/95 to-[#0e0e12]",
      badgeStyle: "bg-zinc-300/20 text-zinc-200 border-zinc-300/30",
      borderGlow: "border-zinc-400/20 group-hover:border-zinc-300/50",
      glowBg: "from-zinc-400/15 to-stone-500/10",
      accentText: "text-zinc-200",
      btnStyle: "bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-zinc-950/40",
    },
  },
  {
    id: "night-out",
    occasionTitle: "Night Out",
    badgeLabel: "Club & Nightlife",
    icon: PartyPopper,
    tagline: "Bold, Explosive & Club-Ready",
    targetPerfumeId: "spicebomb",
    fallbackName: "Spice Inferno",
    fallbackInspiration: "Spicebomb",
    fallbackBrand: "Viktor & Rolf",
    fallbackCategory: "Spicy",
    fallbackPrice: 50.0,
    fallbackImage: "/images/perfume-2.jpg",
    keyNotes: ["Cinnamon", "Fiery Spices", "Rich Tobacco", "Leather"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#2d1b0a]/90 via-[#1f1207]/95 to-[#140b04]",
      badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      borderGlow: "border-amber-500/20 group-hover:border-amber-500/50",
      glowBg: "from-amber-500/20 to-orange-600/10",
      accentText: "text-amber-300",
      btnStyle: "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/40",
    },
  },
  {
    id: "first-impression",
    occasionTitle: "First Impression",
    badgeLabel: "Statement & Charisma",
    icon: Sparkles,
    tagline: "Unforgettable, Charismatic & Confident",
    targetPerfumeId: "myself",
    fallbackName: "Myself",
    fallbackInspiration: "YSL Myself",
    fallbackBrand: "Yves Saint Laurent",
    fallbackCategory: "Woody",
    fallbackPrice: 46.0,
    fallbackImage: "/images/perfume-1.jpg",
    keyNotes: ["Orange Blossom", "Bergamot", "Sandalwood", "Patchouli"],
    gradientTheme: {
      bgCard: "bg-gradient-to-br from-[#1a122e]/90 via-[#120b21]/95 to-[#0b0717]",
      badgeStyle: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      borderGlow: "border-indigo-500/20 group-hover:border-indigo-500/50",
      glowBg: "from-indigo-500/20 to-purple-600/10",
      accentText: "text-indigo-300",
      btnStyle: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40",
    },
  },
];

export default function HomeOccasionSection({
  perfumes = [],
}: {
  perfumes?: HomepagePerfumeCardData[];
}) {
  const { addItem } = useCart();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});

  // Map backend perfume products to occasion cards
  const occasionCards = useMemo(() => {
    return OCCASIONS.map((occ) => {
      const matched = perfumes.find((p) => p.id === occ.targetPerfumeId);
      const name = matched?.name || occ.fallbackName;
      const inspiration = matched?.inspiration || occ.fallbackInspiration;
      const inspirationBrand = matched?.inspirationBrand || occ.fallbackBrand;
      const category = matched?.category || occ.fallbackCategory;
      const price = matched?.price || occ.fallbackPrice;
      const image = matched?.images?.[0] || occ.fallbackImage;
      const id = matched?.id || occ.targetPerfumeId;

      const productPath = getProductPath({
        id,
        name,
        inspirationBrand,
        inspiration,
      });

      return {
        ...occ,
        product: {
          id,
          name,
          inspiration,
          inspirationBrand,
          category,
          price,
          image,
          productPath,
        },
      };
    });
  }, [perfumes]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "all") return occasionCards;
    return occasionCards.filter((card) => card.id === activeFilter);
  }, [activeFilter, occasionCards]);

  const handleAddToCart = (
    e: React.MouseEvent,
    card: (typeof occasionCards)[0]
  ) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: card.product.id,
      name: card.product.name,
      inspiration: card.product.inspiration,
      category: card.product.category,
      image: card.product.image,
      price: card.product.price,
      size: "50ml",
    });

    setAddedItems((prev) => ({ ...prev, [card.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [card.id]: false }));
    }, 2000);

    toast({
      title: `${card.product.name} added to cart`,
      description: `Perfect choice for ${card.occasionTitle}!`,
    });
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-28 bg-[#09090b] text-white border-t border-b border-white/5">
      {/* Background Subtle Luxury Light Orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-rose-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="container-luxury relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-amber-300 uppercase mb-4 shadow-inner">
            <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            Curated Fragrance Guide
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-tight">
            Perfumes for Every Occasion
          </h2>
          <p className="mt-4 text-sm md:text-base leading-relaxed text-zinc-400 max-w-2xl mx-auto font-light">
            Whether it&apos;s an intimate date night, an energetic campus day, a heavy gym session, or a high-stakes meeting — discover your signature scent crafted for the moment.
          </p>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 md:mb-12 scrollbar-none justify-start md:justify-center px-1">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-all duration-300 border ${
              activeFilter === "all"
                ? "bg-white text-zinc-950 border-white shadow-lg shadow-white/10 scale-105"
                : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}
          >
            All Occasions
          </button>
          {OCCASIONS.map((occ) => {
            const Icon = occ.icon;
            const isActive = activeFilter === occ.id;
            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => setActiveFilter(occ.id)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs md:text-sm font-medium transition-all duration-300 border ${
                  isActive
                    ? "bg-white text-zinc-950 border-white shadow-lg shadow-white/10 scale-105"
                    : "bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                {occ.occasionTitle}
              </button>
            );
          })}
        </div>

        {/* 6 High-Engaging Cards Grid */}
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredCards.map((card, idx) => {
              const Icon = card.icon;
              const cardImage = withCloudinaryTransforms(card.product.image, {
                width: 720,
              });
              const isAdded = Boolean(addedItems[card.id]);

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.06 }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border ${card.gradientTheme.borderGlow} ${card.gradientTheme.bgCard} p-6 md:p-7 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)]`}
                >
                  {/* Subtle Background Glow on Hover */}
                  <div
                    className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${card.gradientTheme.glowBg} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
                  />

                  {/* Top Card Info & Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wider uppercase backdrop-blur-md ${card.gradientTheme.badgeStyle}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {card.badgeLabel}
                      </span>
                      <span className="text-xs font-semibold tracking-wide text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {card.product.category}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-white group-hover:text-white transition-colors">
                      {card.occasionTitle}
                    </h3>
                    <p className="mt-1 text-xs md:text-sm font-light text-zinc-300/80 italic">
                      &ldquo;{card.tagline}&rdquo;
                    </p>
                  </div>

                  {/* Center Product Showcase */}
                  <Link
                    href={card.product.productPath}
                    className="relative my-6 block overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 transition-all duration-500 group-hover:border-white/20 group-hover:bg-black/60"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-950/80">
                      <Image
                        src={cardImage}
                        alt={`${card.product.name} - ${card.occasionTitle}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Product Overlay Tag */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                            Recommended
                          </p>
                          <h4 className="text-base font-semibold text-white tracking-tight line-clamp-1">
                            {card.product.name}
                          </h4>
                          <p className="text-[11px] text-zinc-300/90 italic line-clamp-1">
                            Inspired by {card.product.inspiration}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-base font-bold text-white">
                            {formatINR(card.product.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Scent Notes Pills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {card.keyNotes.map((note) => (
                        <span
                          key={note}
                          className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300 font-medium"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </Link>

                  {/* Bottom Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, card)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg ${card.gradientTheme.btnStyle}`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-4 w-4" />
                          Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    <Link
                      href={card.product.productPath}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white"
                      title="View Details"
                    >
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 md:mt-18 rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 md:p-8 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left max-w-xl">
            <h4 className="font-serif text-xl md:text-2xl font-light text-white">
              Not sure which scent suits your style?
            </h4>
            <p className="mt-1 text-xs md:text-sm text-zinc-400 font-light">
              Try our Discovery Box with 5 luxury sample atomizers to test every occasion before committing.
            </p>
          </div>
          <Link
            href="/discovery-set"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs md:text-sm font-bold uppercase tracking-wider text-zinc-950 transition-all hover:bg-amber-100 hover:scale-105 shadow-xl"
          >
            Explore Discovery Set
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
