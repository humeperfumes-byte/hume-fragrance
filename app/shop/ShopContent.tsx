"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import PerfumeCard from "@/components/PerfumeCard";
import type { PerfumeData } from "@/data/perfumes";
import { celebrityFavorites } from "@/lib/celebrity-favorites";
import {
  DISCOVERY_SET_IMAGES,
  isDiscoverySetProductId,
} from "@/lib/discovery-set";
import {
  categoryOptions,
  matchesProductCategory,
  normalizeCategoryId,
} from "@/lib/product-categories";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type FilterType = "nature" | "selection" | "gender" | "occasion" | "celebrity";

interface FilterConfig {
  type: FilterType;
  label: string;
  options: { value: string; label: string; count: number }[];
}

const baseFilterConfigs: Omit<FilterConfig, "options">[] = [
  { type: "selection", label: "By Selection" },
  { type: "nature", label: "By Nature" },
  { type: "gender", label: "By Gender" },
  { type: "occasion", label: "By Occasion" },
];

const celebrityMap: Record<string, string[]> = Object.fromEntries(
  celebrityFavorites.map((c) => [c.label, c.perfumeIds]),
);

function filterPerfumes(
  allPerfumes: PerfumeData[],
  filterType: FilterType | null,
  filterValue: string | null,
): PerfumeData[] {
  if (!filterType || !filterValue) return allPerfumes;

  switch (filterType) {
    case "nature":
      return allPerfumes.filter((p) => matchesProductCategory(p, filterValue));
    case "gender":
      return allPerfumes.filter(
        (p) => p.gender.toLowerCase() === filterValue.toLowerCase(),
      );
    case "selection":
      if (filterValue.toLowerCase() === "best seller") {
        return allPerfumes.filter((p) => Boolean(p.badges?.bestSeller));
      }
      if (filterValue.toLowerCase() === "hume special") {
        return allPerfumes.filter((p) => Boolean(p.badges?.humeSpecial));
      }
      return allPerfumes;
    case "occasion":
      return allPerfumes.filter(
        (p) =>
          p.longevity.occasion.some((o) =>
            o.toLowerCase().includes(filterValue.toLowerCase()),
          ) ||
          p.longevity.season.some((s) =>
            s.toLowerCase().includes(filterValue.toLowerCase()),
          ),
      );
    case "celebrity": {
      const ids = celebrityMap[filterValue] || [];
      return allPerfumes.filter((p) => ids.includes(p.id));
    }
    default:
      return allPerfumes;
  }
}

export default function ShopContent({
  perfumes,
  disableTopPadding = false,
}: {
  perfumes: PerfumeData[];
  disableTopPadding?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterType = (searchParams.get("filter") as FilterType) || null;
  const activeFilterValue = searchParams.get("value") || null;

  const filteredPerfumes = useMemo(
    () => filterPerfumes(perfumes, activeFilterType, activeFilterValue),
    [perfumes, activeFilterType, activeFilterValue],
  );

  const displayPerfumes = useMemo(
    () =>
      [...filteredPerfumes].sort(
        (a, b) =>
          Number(Boolean(a.badges?.soldOut)) -
          Number(Boolean(b.badges?.soldOut)),
      ),
    [filteredPerfumes],
  );

  const natureOptions = useMemo(() => categoryOptions(perfumes), [perfumes]);
  const filterConfigs: FilterConfig[] = useMemo(
    () =>
      baseFilterConfigs.map((config) => {
        if (config.type === "nature")
          return {
            ...config,
            label: "Scent families",
            options: natureOptions.map((c) => ({
              value: c.id,
              label: c.label,
              count: c.count,
            })),
          };
        const labels =
          config.type === "selection"
            ? ["Best Seller", "HUME Special"]
            : config.type === "gender"
              ? ["Men", "Women", "Unisex"]
              : [
                  "Gym",
                  "Daily Wear",
                  "Office",
                  "Date Night",
                  "Party",
                  "Evening",
                  "Formal",
                  "Special Events",
                ];
        return {
          ...config,
          options: labels
            .map((label) => ({
              value: label,
              label,
              count: filterPerfumes(perfumes, config.type, label).length,
            }))
            .filter((option) => option.count > 0),
        };
      }),
    [perfumes, natureOptions],
  );
  const activeFilterLabel =
    activeFilterType === "nature"
      ? natureOptions.find(
          (c) => c.id === normalizeCategoryId(activeFilterValue || ""),
        )?.label || activeFilterValue
      : activeFilterValue;

  const setFilter = (type: FilterType, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", type);
    params.set("value", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filter");
    params.delete("value");
    router.replace(pathname + (params.size ? `?${params}` : ""), {
      scroll: false,
    });
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <main className={disableTopPadding ? "pb-20" : "pt-24 pb-20"}>
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-caption text-muted-foreground mb-4">
            The Collection
          </p>
          <h1 className="text-headline mb-4">
            Shop All <span className="italic">Fragrances</span>
          </h1>
          <div className="divider-elegant mx-auto mb-6" />
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Discover our curated collection of premium fragrances, inspired by
            the world&apos;s most iconic scents.
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
              <span className="text-caption text-muted-foreground">
                Filtered by:
              </span>
              <button
                onClick={clearFilter}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-caption"
              >
                {activeFilterLabel}
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-10">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-none pr-1 space-y-8">
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
                  <h3 className="text-caption text-foreground mb-3">
                    {config.label}
                  </h3>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {config.options.map((option) => {
                      const isActive =
                        activeFilterType === config.type &&
                        normalizeCategoryId(activeFilterValue || "") ===
                          normalizeCategoryId(option.value);
                      const isSelection = config.type === "selection";
                      return (
                        <li key={option.value}>
                          <button
                            aria-pressed={isActive}
                            onClick={() => setFilter(config.type, option.value)}
                            className={`text-sm tracking-wide transition-luxury block w-full text-left leading-tight ${
                              isSelection
                                ? `border px-3 py-2 text-[13px] whitespace-nowrap ${
                                    isActive
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "border-border text-foreground hover:border-foreground"
                                  }`
                                : `${
                                    isActive
                                      ? "text-foreground font-normal"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`
                            }`}
                          >
                            {!isSelection && isActive && "- "}
                            {option.label}
                            <span className="ml-2 text-[10px] opacity-50">
                              {option.count}
                            </span>
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

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent
              side="bottom"
              className="max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-background p-6"
            >
              <SheetTitle className="text-xl">Find your fragrance</SheetTitle>
              <SheetDescription>
                Choose a scent family or explore by occasion and gender.
              </SheetDescription>
              <button
                onClick={() => {
                  clearFilter();
                  setMobileFiltersOpen(false);
                }}
                className="my-5 text-sm underline underline-offset-4"
              >
                All fragrances ({perfumes.length})
              </button>
              <div className="space-y-6 pb-8">
                {filterConfigs.map((config) => (
                  <section key={config.type}>
                    <h3 className="mb-3 text-sm font-medium">{config.label}</h3>
                    <div className="flex flex-wrap gap-2">
                      {config.options.map((option) => {
                        const active =
                          activeFilterType === config.type &&
                          normalizeCategoryId(activeFilterValue || "") ===
                            normalizeCategoryId(option.value);
                        return (
                          <button
                            key={option.value}
                            aria-pressed={active}
                            onClick={() => setFilter(config.type, option.value)}
                            className={`rounded-full border px-4 py-2.5 text-sm ${active ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground"}`}
                          >
                            {option.label}
                            <span className="ml-2 text-xs opacity-50">
                              {option.count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            {activeFilterType === "nature" &&
              natureOptions.find(
                (c) => c.id === normalizeCategoryId(activeFilterValue || ""),
              )?.description && (
                <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                  {
                    natureOptions.find(
                      (c) =>
                        c.id === normalizeCategoryId(activeFilterValue || ""),
                    )?.description
                  }
                </p>
              )}
            <div className="flex items-center justify-between mb-8">
              <p className="text-body text-muted-foreground">
                {filteredPerfumes.length} fragrance
                {filteredPerfumes.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filteredPerfumes.length > 0 ? (
              <motion.div
                layout
                className="grid grid-cols-2 gap-4 items-start md:grid-cols-3 md:gap-8 xl:grid-cols-4"
              >
                {displayPerfumes.map((perfume, index) => (
                  <div key={perfume.id}>
                    <PerfumeCard
                      id={perfume.id}
                      name={perfume.name}
                      inspiration={perfume.inspiration}
                      inspirationBrand={perfume.inspirationBrand}
                      category={perfume.category}
                      categoryTags={perfume.categoryTags}
                      categoryIds={perfume.categoryIds}
                      image={
                        isDiscoverySetProductId(perfume.id)
                          ? DISCOVERY_SET_IMAGES[0]
                          : perfume.images[0]
                      }
                      price={perfume.price}
                      index={index}
                      bestSeller={perfume.badges?.bestSeller}
                      humeSpecial={perfume.badges?.humeSpecial}
                      limitedStock={perfume.badges?.limitedStock}
                      soldOut={perfume.badges?.soldOut}
                      compactBadges
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
