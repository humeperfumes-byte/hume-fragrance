"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronRight,
  Clock,
  Wind,
  Flame,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import PerfumeCard from "@/components/PerfumeCard";
import {
  OCCASIONS_LIST,
  getOccasionIcon,
  type OccasionCardConfig,
} from "@/data/occasions";
import { GenderToggleSwitch } from "@/components/GenderToggleSwitch";

interface ProductData {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  category: string;
  categoryId?: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  images: string[];
  price: number;
  gender?: string;
  longevity?: {
    occasion?: string[];
    duration?: string;
    sillage?: string;
  };
  badges?: {
    bestSeller?: boolean;
    humeSpecial?: boolean;
    limitedStock?: boolean;
    soldOut?: boolean;
  };
}

interface UnifiedOccasionsClientViewProps {
  products: ProductData[];
  initialSelectedSlug?: string;
}

function UnifiedOccasionsInnerContent({
  products,
  initialSelectedSlug = "date-night",
}: UnifiedOccasionsClientViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const querySelected = searchParams.get("selected") || searchParams.get("id");
  const queryGender = searchParams.get("gender");

  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    const candidate = (querySelected || initialSelectedSlug || "").toLowerCase();
    const match = OCCASIONS_LIST.find(
      (o) => o.slug.toLowerCase() === candidate || o.id.toLowerCase() === candidate,
    );
    return match ? match.slug : "date-night";
  });

  const [selectedGender, setSelectedGender] = useState<string>(() => {
    if (queryGender) return queryGender.toLowerCase();
    return "all";
  });

  useEffect(() => {
    if (queryGender) {
      setSelectedGender(queryGender.toLowerCase());
    }
  }, [queryGender]);

  useEffect(() => {
    if (querySelected) {
      const match = OCCASIONS_LIST.find(
        (o) =>
          o.slug.toLowerCase() === querySelected.toLowerCase() ||
          o.id.toLowerCase() === querySelected.toLowerCase(),
      );
      if (match && match.slug !== selectedSlug) {
        setSelectedSlug(match.slug);
      }
    }
  }, [querySelected, selectedSlug]);

  const activeOccasion = useMemo(() => {
    return (
      OCCASIONS_LIST.find((o) => o.slug === selectedSlug) || OCCASIONS_LIST[0]
    );
  }, [selectedSlug]);

  const handleSelectOccasion = (slug: string) => {
    setSelectedSlug(slug);
    router.replace(`/occasions?selected=${slug}`, { scroll: false });
  };

  // Filter products for active occasion and selected gender
  const occasionProducts = useMemo(() => {
    const occSlug = activeOccasion.slug.toLowerCase();
    const genderKey = selectedGender.toLowerCase();

    return products.filter((product) => {
      if (product.badges?.soldOut) return false;

      const longevityOccasions = (product.longevity?.occasion || []).map((o) =>
        o.trim().toLowerCase(),
      );

      return longevityOccasions.some((o) => {
        if (o === occSlug || o.includes(occSlug)) return true;
        if (genderKey !== "all" && (o === `${occSlug}:${genderKey}` || o === `${occSlug}-${genderKey}`)) return true;
        return false;
      });
    });
  }, [activeOccasion, products, selectedGender]);

  const filteredProducts = useMemo(() => {
    return occasionProducts;
  }, [occasionProducts]);

  const IconComponent = getOccasionIcon(activeOccasion.iconName);

  return (
    <div className="pt-24 pb-20 md:pt-32 md:pb-28">
      <div className="container-luxury px-3 sm:px-6">
        {/* Page Header */}
        <div className="mb-6 md:mb-10 text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Curated Scent Guide
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light italic mt-1 text-foreground">
            Perfume Recommendations by Occasion
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Select an occasion below to filter our long-lasting inspired EDP fragrances crafted for your specific vibe and lifestyle.
          </p>
        </div>

        {/* 6 Grid Cards Desktop / 3 Grid Cards Mobile */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-4 mb-12">
          {OCCASIONS_LIST.map((occ) => {
            const Icon = getOccasionIcon(occ.iconName);
            const isSelected = selectedSlug === occ.slug;

            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => handleSelectOccasion(occ.slug)}
                className={`group relative flex flex-col items-center justify-between text-center aspect-[3/4] w-full rounded-2xl border overflow-hidden p-2.5 sm:p-3.5 backdrop-blur-xl transition-all duration-300 ${
                  isSelected
                    ? "border-amber-400/90 bg-amber-500/20 shadow-lg shadow-amber-500/20 scale-[1.02]"
                    : "border-border/50 bg-card/60 hover:border-foreground/40 hover:bg-card/80"
                }`}
              >
                {/* Background Image if configured */}
                {occ.bgImage ? (
                  <>
                    <img
                      src={occ.bgImage}
                      alt={occ.occasionTitle}
                      className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        isSelected ? "opacity-90" : "opacity-80"
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
                  </>
                ) : null}

                {/* Active Checkmark Badge */}
                <div
                  className={`absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                    isSelected
                      ? "bg-amber-400 text-black scale-100 opacity-100 shadow-md"
                      : "bg-white/10 text-white/30 scale-75 opacity-0 group-hover:opacity-50"
                  }`}
                >
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>

                {/* Occasion Title */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full px-1.5">
                  <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-white leading-snug text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                    {occ.occasionTitle}
                  </h3>
                </div>

                {/* Selected Indicator Pill */}
                <div
                  className={`relative z-10 flex items-center gap-1 text-[10px] sm:text-xs font-semibold transition-colors mt-2 shrink-0 ${
                    isSelected ? "text-amber-400" : "text-white/80 group-hover:text-white"
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-amber-400 font-bold drop-shadow">
                      <Check className="h-3 w-3 stroke-[3]" /> Selected
                    </span>
                  ) : (
                    <span className="font-medium">Select</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Occasion Hero Showcase */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 md:p-10 ${activeOccasion.gradientTheme.bgCard} ${activeOccasion.gradientTheme.borderGlow} shadow-2xl backdrop-blur-xl mb-12`}
        >
          {/* Background Image if configured */}
          {activeOccasion.bgImage && (
            <>
              <img
                src={activeOccasion.bgImage}
                alt={activeOccasion.occasionTitle}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-overlay"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            </>
          )}

          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${activeOccasion.gradientTheme.badgeStyle}`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  {activeOccasion.badgeLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <Sparkles className="h-3 w-3 text-amber-300" /> Active Recommendation
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                Best Scents for{" "}
                <span className={activeOccasion.gradientTheme.accentText}>
                  {activeOccasion.occasionTitle}
                </span>
              </h2>
            </div>

            {/* Performance Stats */}
            <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur sm:flex-row md:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/50">Average Longevity</div>
                  <div className="text-xs font-bold text-white">8 to 12+ Hours</div>
                </div>
              </div>
              <div className="h-px w-full bg-white/10 sm:h-auto sm:w-px md:h-px md:w-full" />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                  <Wind className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-white/50">Sillage & Projection</div>
                  <div className="text-xs font-bold text-white">Strong Trail</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Perfume Grid Header & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Recommended Scents ({filteredProducts.length})
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Showing perfumes matching {activeOccasion.occasionTitle}
            </p>
          </div>

          {/* Gender Toggle Switch */}
          <GenderToggleSwitch
            value={selectedGender === "women" ? "Women" : "Men"}
            onChange={(val) => setSelectedGender(val.toLowerCase())}
          />
        </div>

        {/* Perfumes Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((perfume, idx) => (
              <PerfumeCard
                key={perfume.id}
                id={perfume.id}
                name={perfume.name}
                inspiration={perfume.inspiration}
                inspirationBrand={perfume.inspirationBrand}
                category={perfume.category}
                categoryTags={perfume.categoryTags}
                categoryIds={perfume.categoryIds}
                image={perfume.images[0] || "/images/perfume-1.jpg"}
                price={perfume.price}
                index={idx}
                bestSeller={perfume.badges?.bestSeller}
                humeSpecial={perfume.badges?.humeSpecial}
                limitedStock={perfume.badges?.limitedStock}
                soldOut={perfume.badges?.soldOut}
                showAddToCartButton={true}
                disableEntranceAnimation={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-14 text-center">
            <SlidersHorizontal className="h-7 w-7 text-muted-foreground/40" />
            <h4 className="mt-3 text-sm font-bold text-foreground">
              No matching perfumes for this filter
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Switch the gender filter to view all perfumes for {activeOccasion.occasionTitle}.
            </p>
            <button
              onClick={() => setSelectedGender("all")}
              className="mt-4 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold transition hover:bg-muted"
            >
              Show All Scents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UnifiedOccasionsClientView(
  props: UnifiedOccasionsClientViewProps,
) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 pb-20 flex items-center justify-center text-center">
          <p className="text-sm text-muted-foreground">Loading scent guide...</p>
        </div>
      }
    >
      <UnifiedOccasionsInnerContent {...props} />
    </Suspense>
  );
}
