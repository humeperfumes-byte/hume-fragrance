"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import PerfumeCard from "@/components/PerfumeCard";
import type { PerfumeData } from "@/data/perfumes";
import { celebrityFavorites } from "@/lib/celebrity-favorites";
import { isVisibleNatureCategory } from "@/lib/nature-categories";

type FilterType = "nature" | "gender" | "occasion" | "celebrity";

interface FilterConfig {
  type: FilterType;
  label: string;
  options: string[];
}

const baseFilterConfigs: Omit<FilterConfig, "options">[] = [
  { type: "nature", label: "By Nature" },
  { type: "gender", label: "By Gender" },
  { type: "occasion", label: "By Occasion" },
];

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

const celebrityMap: Record<string, string[]> = Object.fromEntries(
  celebrityFavorites.map((c) => [c.label, c.perfumeIds])
);

const prettifyCategory = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

function filterPerfumes(
  allPerfumes: PerfumeData[],
  filterType: FilterType | null,
  filterValue: string | null
): PerfumeData[] {
  if (!filterType || !filterValue) return allPerfumes;

  switch (filterType) {
    case "nature": {
      const normalizedSelected = normalizeKey(filterValue);
      return allPerfumes.filter((p) => {
        const categoryTokens = new Set<string>();

        (p.dbCategoryTags ?? []).forEach((tag) => {
          categoryTokens.add(normalizeKey(tag.id));
          if (tag.label) categoryTokens.add(normalizeKey(tag.label));
        });

        (p.dbCategoryIds ?? []).forEach((id) => categoryTokens.add(normalizeKey(id)));

        return Array.from(categoryTokens).some(
          (token) => token === normalizedSelected
        );
      });
    }
    case "gender":
      return allPerfumes.filter(
        (p) => p.gender.toLowerCase() === filterValue.toLowerCase()
      );
    case "occasion":
      return allPerfumes.filter((p) =>
        p.longevity.occasion.some(
          (o) => o.toLowerCase().includes(filterValue.toLowerCase())
        ) ||
        p.longevity.season.some(
          (s) => s.toLowerCase().includes(filterValue.toLowerCase())
        )
      );
    case "celebrity": {
      const ids = celebrityMap[filterValue] || [];
      return allPerfumes.filter((p) => ids.includes(p.id));
    }
    default:
      return allPerfumes;
  }
}

export default function ShopContent({ perfumes }: { perfumes: PerfumeData[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterType = (searchParams.get("filter") as FilterType) || null;
  const activeFilterValue = searchParams.get("value") || null;

  const filteredPerfumes = useMemo(
    () => filterPerfumes(perfumes, activeFilterType, activeFilterValue),
    [perfumes, activeFilterType, activeFilterValue]
  );

  const dynamicNatureOptions = useMemo(() => {
    const map = new Map<string, string>();
    perfumes.forEach((perfume) => {
      const tags = perfume.dbCategoryTags?.length ? perfume.dbCategoryTags : [];
      tags.forEach((tag) => {
        const label = (tag.label || prettifyCategory(tag.id)).trim();
        if (!isVisibleNatureCategory(tag.id) || !isVisibleNatureCategory(label)) return;
        const key = normalizeKey(label);
        if (!key) return;
        if (!map.has(key)) map.set(key, label);
      });
      (perfume.dbCategoryIds ?? []).forEach((id) => {
        const label = prettifyCategory(id);
        if (!isVisibleNatureCategory(id) || !isVisibleNatureCategory(label)) return;
        const key = normalizeKey(label);
        if (!key) return;
        if (!map.has(key)) map.set(key, label);
      });
    });

    const knownOrder = [
      "Amber",
      "Animalic",
      "Aquatic",
      "Aromatic",
      "Citrus",
      "Earthy",
      "Floral",
      "Fresh",
      "Fruity",
      "Green",
      "Incense",
      "Leather",
      "Musky",
      "Mysterious",
      "Oud",
      "Patchouli",
      "Smoky",
      "Spicy",
      "Tobacco",
      "Vanilla",
      "Woody",
    ];

    const ordered: string[] = [];
    const usedKeys = new Set<string>();
    knownOrder.forEach((label) => {
      const key = normalizeKey(label);
      if (map.has(key)) {
        ordered.push(map.get(key)!);
        usedKeys.add(key);
      }
    });

    const rest = Array.from(map.entries())
      .filter(([key]) => !usedKeys.has(key))
      .map(([, label]) => label)
      .sort((a, b) => a.localeCompare(b));

    return [...ordered, ...rest];
  }, [perfumes]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      { ...baseFilterConfigs[0], options: dynamicNatureOptions },
      { ...baseFilterConfigs[1], options: ["Men", "Women", "Unisex"] },
      {
        ...baseFilterConfigs[2],
        options: ["Gym", "Daily Wear", "Office", "Date Night", "Party", "Evening", "Formal", "Special Events"],
      },
    ],
    [dynamicNatureOptions]
  );

  const setFilter = (type: FilterType, value: string) => {
    router.replace(`/shop?filter=${type}&value=${encodeURIComponent(value)}`);
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilter = () => {
    router.replace("/shop");
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className="pt-24 pb-20">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-caption text-muted-foreground mb-4">The Collection</p>
          <h1 className="text-headline mb-4">
            Shop All <span className="italic">Fragrances</span>
          </h1>
          <div className="divider-elegant mx-auto mb-6" />
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Discover our curated collection of premium fragrances, inspired by the world&apos;s most iconic scents.
          </p>
        </motion.div>

        <AnimatePresence>
          {activeFilterValue && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <span className="text-caption text-muted-foreground">Filtered by:</span>
              <button
                onClick={clearFilter}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-caption"
              >
                {activeFilterValue}
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28 space-y-8">
              <button
                onClick={clearFilter}
                className={`text-caption w-full text-left pb-2 border-b border-border transition-luxury ${
                  !activeFilterValue
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Fragrances ({perfumes.length})
              </button>
              {filterConfigs.map((config) => (
                <div key={config.type}>
                  <h3 className="text-caption text-foreground mb-3">{config.label}</h3>
                  <ul className="space-y-2">
                    {config.options.map((option) => {
                      const isActive =
                        activeFilterType === config.type && activeFilterValue === option;
                      return (
                        <li key={option}>
                          <button
                            onClick={() => setFilter(config.type, option)}
                            className={`text-sm font-light tracking-wide transition-luxury block w-full text-left ${
                              isActive
                                ? "text-foreground font-normal"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {isActive && "— "}
                            {option}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-3 rounded-full bg-foreground px-7 py-4 text-[11px] uppercase tracking-[0.32em] text-background shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
          </div>

          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm lg:hidden"
              >
                <div className="h-full overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-subheadline">Filters</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-muted transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      clearFilter();
                      setMobileFiltersOpen(false);
                    }}
                    className="text-caption text-foreground mb-8 block"
                  >
                    All Fragrances ({perfumes.length})
                  </button>
                  <div className="space-y-8">
                    {filterConfigs.map((config) => (
                      <div key={config.type}>
                        <h3 className="text-caption text-foreground mb-3">{config.label}</h3>
                        <div className="flex flex-wrap gap-2">
                          {config.options.map((option) => {
                            const isActive =
                              activeFilterType === config.type &&
                              activeFilterValue === option;
                            return (
                              <button
                                key={option}
                                onClick={() => setFilter(config.type, option)}
                                className={`text-sm font-light px-3 py-1.5 border transition-luxury ${
                                  isActive
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-body text-muted-foreground">
                {filteredPerfumes.length} fragrance{filteredPerfumes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredPerfumes.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start"
              >
                {filteredPerfumes.map((perfume, index) => (
                  <div key={perfume.id} className={index % 2 === 1 ? "mt-24 md:mt-0" : ""}>
                    <PerfumeCard
                      id={perfume.id}
                      name={perfume.name}
                      inspiration={perfume.inspiration}
                      inspirationBrand={perfume.inspirationBrand}
                      category={perfume.category}
                      categoryTags={perfume.categoryTags}
                      categoryIds={perfume.categoryIds}
                      image={perfume.images[0]}
                      price={perfume.price}
                      index={index}
                      bestSeller={perfume.badges?.bestSeller}
                      humeSpecial={perfume.badges?.humeSpecial}
                      limitedStock={perfume.badges?.limitedStock}
                    />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <p className="text-subheadline text-muted-foreground mb-2">
                  No fragrances found
                </p>
                <p className="text-body text-muted-foreground/70 mb-6">
                  Try a different filter or browse all fragrances
                </p>
                <button
                  onClick={clearFilter}
                  className="text-caption link-underline text-foreground"
                >
                  View All Perfumes
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
