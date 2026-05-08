"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import PerfumeCard from "./PerfumeCard";
import { isVisibleNatureCategory } from "@/lib/nature-categories";
import type { HomepagePerfumeCardData } from "@/types/homepage";

const Collection = ({ perfumes }: { perfumes: HomepagePerfumeCardData[] }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    perfumes.forEach((p) => {
      (p.dbCategoryTags ?? p.categoryTags ?? []).forEach((tag) => {
        if (!tag?.id) return;
        if (!isVisibleNatureCategory(tag.id) || !isVisibleNatureCategory(tag.label || tag.id)) return;
        map.set(tag.id, tag.label || tag.id);
      });
      (p.dbCategoryIds ?? p.categoryIds ?? []).forEach((id) => {
        if (id && !map.has(id) && isVisibleNatureCategory(id)) {
          map.set(
            id,
            id
              .replace(/[-_]+/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())
          );
        }
      });
    });

    const dynamic = Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [{ id: "all", label: "All Fragrances" }, ...dynamic];
  }, [perfumes]);

  const filteredPerfumes =
    activeCategory === "all"
      ? perfumes
      : perfumes.filter((p) => (p.dbCategoryIds ?? p.categoryIds ?? [p.categoryId]).includes(activeCategory));
  const visiblePerfumes = filteredPerfumes.slice(0, 8);
  const visibleCategories = categories.slice(0, 10);

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
          className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 md:mb-16"
        >
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`text-[10px] md:text-caption px-3 md:px-4 py-1.5 md:py-2 transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground border border-border hover:border-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
          {categories.length > 10 && (
            <Link
              href="/shop"
              className="text-[10px] md:text-caption px-3 md:px-4 py-1.5 md:py-2 transition-all duration-300 bg-foreground text-background border border-foreground hover:bg-background hover:text-foreground"
            >
              10+
            </Link>
          )}
        </motion.div>

        {/* Perfume Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 items-start"
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
                prioritizeImage={index === 0}
              />
            </div>
          ))}
        </motion.div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-foreground text-caption tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            See All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Collection;
