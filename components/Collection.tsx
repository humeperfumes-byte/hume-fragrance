"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PerfumeCard from "./PerfumeCard";
import {
  categoryOptions,
  matchesProductCategory,
} from "@/lib/product-categories";
import type { HomepagePerfumeCardData } from "@/types/homepage";

const Collection = ({ perfumes }: { perfumes: HomepagePerfumeCardData[] }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const categories = useMemo(
    () => [
      { id: "all", label: "All fragrances", count: perfumes.length },
      ...categoryOptions(perfumes),
    ],
    [perfumes],
  );
  const filteredPerfumes =
    activeCategory === "all"
      ? perfumes
      : perfumes.filter((p) => matchesProductCategory(p, activeCategory));
  const visiblePerfumes = filteredPerfumes.slice(0, 8);
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 9);
  const collectionHref =
    activeCategory === "all"
      ? "/shop"
      : "/shop?filter=nature&value=" + encodeURIComponent(activeCategory);

  return (
    <section id="collection" className="py-24 md:py-32">
      <div className="container-luxury">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-caption text-muted-foreground mb-4">
            The Collection
          </p>
          <h2 className="text-headline mb-6">
            Timeless <span className="italic">Elegance</span>
          </h2>
          <div className="divider-elegant mx-auto mb-6" />
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Each fragrance is a tribute to the world&apos;s most iconic scents,
            blended for everyday confidence, strong value, and memorable wear.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10"
        >
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              aria-pressed={activeCategory === cat.id}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs transition-colors md:text-sm ${activeCategory === cat.id ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            >
              {cat.label}
              <span className="text-[10px] opacity-60">{cat.count}</span>
            </button>
          ))}
          {categories.length > 9 && (
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              aria-expanded={showAllCategories}
              className="rounded-full border border-dashed border-border px-4 py-2.5 text-xs text-foreground hover:border-foreground"
            >
              {showAllCategories
                ? "Show fewer"
                : "+ " + (categories.length - 9) + " more families"}
            </button>
          )}
        </motion.div>

        {/* Perfume Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 gap-4 items-start md:grid-cols-3 md:gap-8 lg:grid-cols-4"
        >
          {visiblePerfumes.map((perfume, index) => (
            <div
              key={perfume.id}
              className={index >= 6 ? "hidden md:block" : ""}
            >
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
                soldOut={perfume.badges?.soldOut}
                prioritizeImage={false}
                compactBadges
              />
            </div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link
            href={collectionHref}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-foreground text-caption tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            View{" "}
            {activeCategory === "all"
              ? "all fragrances"
              : categories.find((c) => c.id === activeCategory)?.label +
                " fragrances"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Collection;
