"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Check,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  ShieldCheck,
  Clock,
  Wind,
} from "lucide-react";
import PerfumeCard from "@/components/PerfumeCard";
import { getOccasionIcon, type OccasionCardConfig } from "@/data/occasions";

interface ProductData {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  category: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  images: string[];
  price: number;
  gender?: string;
  badges?: {
    bestSeller?: boolean;
    humeSpecial?: boolean;
    limitedStock?: boolean;
    soldOut?: boolean;
  };
}

interface OccasionClientViewProps {
  occasion: OccasionCardConfig;
  products: ProductData[];
  allOccasions: OccasionCardConfig[];
}

export default function OccasionClientView({
  occasion,
  products,
  allOccasions,
}: OccasionClientViewProps) {
  const [selectedGender, setSelectedGender] = useState<string>("all");

  const IconComponent = getOccasionIcon(occasion.iconName);

  const filteredProducts = products.filter((p) => {
    if (selectedGender === "all") return true;
    if (!p.gender) return true;
    return p.gender.toLowerCase() === selectedGender.toLowerCase();
  });

  const otherOccasions = allOccasions.filter((o) => o.slug !== occasion.slug);

  return (
    <div className="relative pb-24 pt-28 md:pb-32 md:pt-36">
      {/* Background Gradient Mesh */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] overflow-hidden opacity-40">
        <div
          className={`absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b ${occasion.gradientTheme.glowBg} blur-[120px]`}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/#occasions-section"
            className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            All Occasions
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-xs font-semibold text-white/90">
            {occasion.occasionTitle}
          </span>
        </div>

        {/* Hero Section */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-8 md:p-12 ${occasion.gradientTheme.bgCard} ${occasion.gradientTheme.borderGlow} shadow-2xl backdrop-blur-xl transition duration-500`}
        >
          {/* Subtle Ambient Light */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/[0.03] blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${occasion.gradientTheme.badgeStyle}`}
                >
                  <IconComponent className="h-3.5 w-3.5" />
                  {occasion.badgeLabel}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                  <Sparkles className="h-3 w-3 text-amber-300" /> Curated Collection
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                Perfumes for{" "}
                <span className={occasion.gradientTheme.accentText}>
                  {occasion.occasionTitle}
                </span>
              </h1>

              <p className="text-base text-white/70 sm:text-lg">
                {occasion.tagline}. Designed for long-lasting projection, luxury appeal, and maximum compliments.
              </p>

              {/* Key Scent Notes Pills */}
              <div className="pt-2">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-white/40">
                  Recommended Note Profiles
                </p>
                <div className="flex flex-wrap gap-2">
                  {occasion.keyNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stat / Guarantee Badge */}
            <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur sm:flex-row lg:flex-col">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Clock className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white/50">Average Longevity</div>
                  <div className="text-sm font-bold text-white">8 to 12+ Hours</div>
                </div>
              </div>
              <div className="h-px w-full bg-white/10 sm:h-auto sm:w-px lg:h-px lg:w-full" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Wind className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white/50">Projection & Sillage</div>
                  <div className="text-sm font-bold text-white">Strong & Enveloping</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Results Section */}
        <div className="mt-12 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Recommended Scents ({filteredProducts.length})
              </h2>
              <p className="mt-1 text-xs text-white/50">
                Handpicked inspired Extrait & Eau de Parfum blends crafted for {occasion.occasionTitle}
              </p>
            </div>

            {/* Gender Filter Tabs */}
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur">
              {[
                { id: "all", label: "All Scents" },
                { id: "men", label: "For Men" },
                { id: "women", label: "For Women" },
                { id: "unisex", label: "Unisex" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedGender(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedGender === tab.id
                      ? "bg-white text-black shadow-lg"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
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
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
              <SlidersHorizontal className="h-8 w-8 text-white/30" />
              <h3 className="mt-4 text-base font-bold text-white">No exact match for filter</h3>
              <p className="mt-1 text-xs text-white/50">
                Try switching the gender tab to view all perfumes for {occasion.occasionTitle}.
              </p>
              <button
                onClick={() => setSelectedGender("all")}
                className="mt-4 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
              >
                Show All Scents
              </button>
            </div>
          )}
        </div>

        {/* Occasion Wearing Tips Section */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-8 md:p-10 backdrop-blur">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Flame className="h-3.5 w-3.5" /> Wearing Guide
            </span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
              How to maximize your scent for {occasion.occasionTitle}?
            </h3>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-extrabold text-white">
                  01
                </div>
                <h4 className="text-sm font-bold text-white">Apply on Pulse Points</h4>
                <p className="text-xs leading-relaxed text-white/60">
                  Target behind the ears, base of throat, and inner wrists to naturally project warm scent trails as you move.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-extrabold text-white">
                  02
                </div>
                <h4 className="text-sm font-bold text-white">Layer with Unscented Lotion</h4>
                <p className="text-xs leading-relaxed text-white/60">
                  Hydrated skin retains perfume oils longer, boosting your longevity for an extra 3-4 hours easily.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-xs font-extrabold text-white">
                  03
                </div>
                <h4 className="text-sm font-bold text-white">Spray on Outfit Fabrics</h4>
                <p className="text-xs leading-relaxed text-white/60">
                  Lightly misting jackets or collars keeps scent active all day without changing performance notes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Explore Other Occasions Switcher */}
        <div className="mt-24 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white">Explore Other Recommended Occasions</h3>
            <Link
              href="/#occasions-section"
              className="group flex items-center gap-1 text-xs font-bold text-[#c9b3ff] hover:underline"
            >
              View All <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {otherOccasions.map((other) => {
              const OtherIcon = getOccasionIcon(other.iconName);
              return (
                <Link
                  key={other.id}
                  href={`/occasions/${other.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur transition duration-300 hover:border-white/25 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 transition group-hover:scale-110 group-hover:text-white">
                      <OtherIcon className="h-4 w-4" />
                    </span>
                    <span className="truncate text-xs font-bold text-white">
                      {other.occasionTitle}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
