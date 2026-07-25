"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ShoppingBag, Gift, Truck } from "lucide-react";
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
      // Fallback if clipboard fails
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-stone-900 via-zinc-950 to-background pt-28 md:pt-36 pb-12 md:pb-16">
      {/* Background glow overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-80" />

      <div className="container relative mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          {/* Partner Delivery Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 backdrop-blur-md">
            <Truck className="h-3.5 w-3.5" />
            <span>Blinkit & Zepto Order Partner Special</span>
          </div>

          {/* Localized City Greeting */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl font-serif">
            {config.greeting}
          </h1>

          {/* Subheading */}
          <p className="text-base text-stone-300 md:text-lg max-w-2xl mx-auto leading-relaxed">
            {config.tagline}
          </p>

          {/* Coupon Code Offer Box */}
          <div className="pt-2">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-amber-500/20 bg-stone-900/90 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-left">
                <Gift className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-stone-400">Exclusive Flyer Offer</p>
                  <p className="text-sm font-bold text-white">{config.discountText}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5">
                <span className="font-mono text-sm font-bold text-amber-400 tracking-wider">
                  {config.couponCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="ml-1 inline-flex items-center justify-center rounded-lg bg-amber-500/20 p-1.5 text-amber-300 transition-colors hover:bg-amber-500/30"
                  title="Copy coupon code"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mode Navigation Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href={`/flyers/${config.slug}/perfumes`}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs md:text-sm font-bold transition-all shadow-md ${
                mode === "perfumes"
                  ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                  : "border border-stone-700 bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop All Perfumes</span>
            </Link>

            <Link
              href={`/flyers/${config.slug}/discovery-set`}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs md:text-sm font-bold transition-all shadow-md ${
                mode === "discovery-set"
                  ? "bg-amber-500 text-stone-950 hover:bg-amber-400"
                  : "border border-stone-700 bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-white"
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
