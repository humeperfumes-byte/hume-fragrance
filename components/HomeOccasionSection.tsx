"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { HomepagePerfumeCardData } from "@/types/homepage";
import { OCCASIONS_LIST, getOccasionIcon, type OccasionCardConfig } from "@/data/occasions";
import { GenderToggleSwitch } from "@/components/GenderToggleSwitch";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

export { OCCASIONS_LIST, type OccasionCardConfig };

export default function HomeOccasionSection({
  perfumes = [],
}: {
  perfumes?: HomepagePerfumeCardData[];
}) {
  const [genderFilter, setGenderFilter] = useState<"Men" | "Women">("Men");

  return (
    <section id="occasions-section" className="pt-10 pb-3 md:pt-24 md:pb-10">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light italic text-foreground">
            Shop by Occasion
          </h2>

          <div className="flex items-center gap-4 sm:gap-6">
            <GenderToggleSwitch
              value={genderFilter}
              onChange={setGenderFilter}
            />

            <Link
              href={`/occasions?gender=${genderFilter.toLowerCase()}`}
              className="text-[11px] md:text-caption uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground border-b border-border pb-1 shrink-0 hidden sm:block"
            >
              See All
            </Link>
          </div>
        </div>

        {/* 6 Grid Desktop / 3 Grid Mobile */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-4">
          {OCCASIONS_LIST.map((occ, idx) => {
            const Icon = getOccasionIcon(occ.iconName);
            return (
              <motion.div
                key={occ.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <Link
                  href={`/occasions?selected=${occ.slug}&gender=${genderFilter.toLowerCase()}`}
                  className={`group relative flex flex-col items-center justify-between text-center aspect-[3/4] w-full rounded-2xl border overflow-hidden ${occ.gradientTheme.borderGlow} ${occ.gradientTheme.bgCard} p-2.5 sm:p-3.5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
                >
                  {/* Background Image if configured */}
                  {occ.bgImage ? (
                    <>
                      <img
                        src={withCloudinaryTransforms(occ.bgImage, { width: 480 })}
                        alt={occ.occasionTitle}
                        loading="lazy"
                        decoding="async"
                        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                    </>
                  ) : null}

                  {/* Subtle Top Glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b ${occ.gradientTheme.glowBg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                  />

                  {/* Occasion Title */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full px-1.5">
                    <h3 className="font-serif text-base sm:text-lg md:text-xl font-semibold text-white leading-snug text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
                      {occ.occasionTitle}
                    </h3>
                  </div>

                  {/* Arrow Link Indicator */}
                  <div className="relative z-10 flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold text-white/80 group-hover:text-white transition-colors mt-2 shrink-0">
                    <span>Explore</span>
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
