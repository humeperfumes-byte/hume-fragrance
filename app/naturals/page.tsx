import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import NaturalsFeed from "@/components/NaturalsFeed";

export const metadata = {
  title: "Naturals | Pure Botanical Oils | HUME Fragrance",
  description: "Explore the pure organic essence of HUME Fragrance. Discover our premium essential oils like Rose Oil, Chandan, Kesar, Keora, and Jasmine.",
};

export default function NaturalsPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      <Header />

      {/* Editorial Split Hero Section */}
      <section className="relative bg-[#FBF9F6] pt-24 pb-16 md:pt-36 md:pb-24 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            
            {/* Left Copy Column */}
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-stone-500 mb-6 block">
                THE NATURALS COLLECTION
              </span>
              
              <h1 className="font-serif text-[2.75rem] font-semibold leading-[1.1] text-stone-950 sm:text-[3.8rem] lg:text-[4.2rem] mb-6">
                Single-origin <br className="hidden sm:inline" />
                essential oils. <br />
                <span className="font-serif italic font-medium text-stone-800">Undiluted, unhurried.</span>
              </h1>
              
              <p className="text-sm sm:text-base leading-7 text-stone-600 font-light max-w-lg mb-8">
                A quiet library of steam-distilled and cold-pressed oils, sourced from the farms and forests that have grown them for generations. Nothing added, nothing extended — just the raw material of perfumery.
              </p>

              {/* Elegant divider */}
              <div className="h-[0.5px] bg-stone-250 w-full mb-8" />

              {/* Metrics Row */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="font-serif italic text-3xl md:text-4xl text-stone-900 mb-1.5 block">
                    100%
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.14em] text-stone-500 block leading-tight">
                    NATURAL & UNDILUTED
                  </span>
                </div>
                <div>
                  <span className="font-serif italic text-3xl md:text-4xl text-stone-900 mb-1.5 block">
                    12
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.14em] text-stone-500 block leading-tight">
                    REGIONAL ORIGINS
                  </span>
                </div>
                <div>
                  <span className="font-serif italic text-3xl md:text-4xl text-stone-900 mb-1.5 block">
                    GC/MS
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-sans font-bold uppercase tracking-[0.14em] text-stone-500 block leading-tight">
                    BATCH TESTED
                  </span>
                </div>
              </div>
            </div>

            {/* Right Media Column */}
            <div className="relative aspect-[0.98] w-full overflow-hidden rounded-[20px] shadow-sm border border-stone-200/40 bg-stone-100">
              <Image
                src="/images/naturals/naturals-hero-oils.png"
                alt="Essential oils bottle collection"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Product Grid Feed */}
      <NaturalsFeed />

      <Footer />
    </main>
  );
}
