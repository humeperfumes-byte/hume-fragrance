"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ShoppingBag, Truck } from "lucide-react";
import type { CityFlyerConfig } from "@/lib/flyer-cities";

interface FlyerHeroBannerProps {
  config: CityFlyerConfig;
  mode: "perfumes" | "discovery-set";
}

export default function FlyerHeroBanner({ config, mode }: FlyerHeroBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(config.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-stone-950 pt-28 md:pt-36 pb-12 md:pb-16 text-foreground">
      {/* Elegant subtle radial glow matching HUME dark luxury theme */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          
          {/* Partner Delivery Badge (Sleek Frosted Pill) */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-stone-300 backdrop-blur-md">
            <Truck className="h-3.5 w-3.5 text-stone-300" />
            <span>Blinkit & Zepto Order Partner Offer</span>
          </div>

          {/* Localized City Greeting - Signature Serif Typography */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl font-serif">
            {config.greeting}
          </h1>

          {/* Subheading */}
          <p className="text-base text-stone-300 md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            {config.tagline}
          </p>

          {/* Coupon Code Offer Box - Dark Metallic Card */}
          <div className="pt-2">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3.5 rounded-2xl border border-stone-800 bg-stone-900/90 px-5 py-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 text-left">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400">Exclusive Flyer Voucher</p>
                  <p className="text-sm font-bold text-white">{config.discountText}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-3.5 py-1.5">
                <span className="font-mono text-sm font-bold tracking-widest text-stone-100">
                  {config.couponCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-1.5 inline-flex items-center justify-center rounded-lg bg-white/10 p-1.5 text-stone-200 transition-colors hover:bg-white/20 hover:text-white"
                  title="Copy coupon code"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons - HUME Luxury Monochrome Styling */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <Link
              href={`/flyers/${config.slug}/perfumes`}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs md:text-sm font-semibold tracking-wide transition-all shadow-lg ${
                mode === "perfumes"
                  ? "bg-white text-stone-950 hover:bg-stone-200"
                  : "border border-white/20 bg-stone-900/60 text-stone-200 hover:bg-stone-800 hover:text-white hover:border-white/40"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop All Perfumes</span>
            </Link>

            <Link
              href={`/flyers/${config.slug}/discovery-set`}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-xs md:text-sm font-semibold tracking-wide transition-all shadow-lg ${
                mode === "discovery-set"
                  ? "bg-white text-stone-950 hover:bg-stone-200"
                  : "border border-white/20 bg-stone-900/60 text-stone-200 hover:bg-stone-800 hover:text-white hover:border-white/40"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Try Discovery Set (Sample Kit)</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
