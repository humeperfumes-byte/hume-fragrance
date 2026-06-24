"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock,
  Wind,
  Sun,
  Calendar,
  Star,
  ShieldCheck,
  RotateCcw,
  FlaskConical,
  Truck,
  WalletCards,
} from "lucide-react";
import { getAverageRating } from "@/data/perfumes";
import ProductImageGallery from "@/components/ProductImageGallery";
import ProductReviews from "@/components/ProductReviews";
import ProductDetailClient from "./ProductDetailClient";
import type { PerfumeData } from "@/data/perfumes";
import type { BlogPost } from "@/data/blogPosts";
import { formatINR } from "@/lib/currency";
import { getProductFaqItems } from "@/lib/seo";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

export default function ProductDetailView({
  perfume,
  relatedBlogs = [],
  priceLabel,
  faqItems: customFaqItems,
}: {
  perfume: PerfumeData;
  relatedBlogs?: BlogPost[];
  priceLabel?: string;
  faqItems?: Array<{ question: string; answer: string }>;
}) {
  const averageRating = getAverageRating(perfume.reviews);
  const isComingSoon = Boolean(perfume.badges?.comingSoon);
  const hasInspirationBrand = Boolean(perfume.inspirationBrand?.trim());
  const productSubtitle = hasInspirationBrand
    ? `Inspired by ${perfume.inspirationBrand} ${perfume.inspiration}`
    : perfume.inspiration;
  const isRoseWater = perfume.categoryId === "rose-water";
  const isKapoorCarFragrance = perfume.categoryId === "car-fragrance";
  const showFragranceNotes = !["rose-water", "car-fragrance"].includes(
    perfume.categoryId,
  );
  const detailCopy = isRoseWater
    ? {
        sectionEyebrow: "Rose Water Ritual",
        sectionTitle: "A clean daily freshness step",
        durationLabel: "Use",
        projectionLabel: "Mist Feel",
        seasonLabel: "Best Weather",
        occasionLabel: "Best For",
        storyLabel: "Gulab Jal Story",
        tipsLabel: "How to Use",
        whyLabel: "Why HUME Rose Water?",
        paymentChips: ["Secured Payment", "Face Mist", "Daily Ritual"],
        trustCards: [
          "Made for a simple face mist and toner-style skincare ritual.",
          "Soft rose freshness without a heavy perfume-style character.",
          "Prepared and packed with HUME's clean, minimal presentation.",
          "Dispatched within 24 hours on ready stock.",
        ],
      }
    : isKapoorCarFragrance
      ? {
          sectionEyebrow: "Car Fragrance Ritual",
          sectionTitle: "A clean, calm cabin profile",
          durationLabel: "Use",
          projectionLabel: "Cabin Presence",
          seasonLabel: "Best Setting",
          occasionLabel: "Best For",
          storyLabel: "Kapoor Story",
          tipsLabel: "How to Use",
          whyLabel: "Why HUME Kapoor?",
          paymentChips: ["Secured Payment", "Car Freshness", "Kapoor Aroma"],
          trustCards: [
            "Made for car cabins that need a cleaner, calmer scent profile.",
            "Built around familiar kapoor freshness instead of sugary car perfume notes.",
            "Prepared with HUME's minimal, fragrance-led presentation.",
            "Dispatched within 24 hours on ready stock.",
          ],
        }
    : {
        sectionEyebrow: "Performance & Character",
        sectionTitle: "A quiet, composed trail",
        durationLabel: "Longevity",
        projectionLabel: "Projection",
        seasonLabel: "Best Season",
        occasionLabel: "Occasion",
        storyLabel: "Scent Story",
        tipsLabel: "Pairing & Occasion Tips",
        whyLabel: "Why HUME?",
        paymentChips: isComingSoon
          ? ["Waitlist", "Launch Notice", "Checkout Disabled"]
          : ["Secured Payment", "UPI", "Cards"],
        trustCards: [
          "100% authentic ingredients.",
          "Formulated following IFRA rules.",
          "Made in our own manufacturing facility.",
          isComingSoon
            ? "Ordering opens only when the product is ready for fulfillment."
            : "Dispatched within 24 hours on ready stock.",
        ],
      };
  const [noteImages, setNoteImages] = useState<{
    id: string;
    label: string;
    url: string;
    usage: string;
    tags: string[];
  }[]>([]);

  useEffect(() => {
    let active = true;
    const loadImages = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }
        const data = (await response.json()) as typeof noteImages;
        if (active) {
          setNoteImages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load note images:", error);
      }
    };

    loadImages();
    return () => {
      active = false;
    };
  }, []);

  const noteImageLookup = useMemo(() => {
    const map = new Map<string, { url: string; label: string }>();
    noteImages
      .filter((image) => image.usage === "notes")
      .forEach((image) => {
        const labelKey = image.label.trim().toLowerCase();
        if (labelKey && !map.has(labelKey)) {
          map.set(labelKey, { url: image.url, label: image.label });
        }
        image.tags?.forEach((tag) => {
          const tagKey = tag.trim().toLowerCase();
          if (tagKey && !map.has(tagKey)) {
            map.set(tagKey, { url: image.url, label: image.label });
          }
        });
      });
    return map;
  }, [noteImages]);
  const story =
    perfume.scentStory ??
    `A modern interpretation of ${perfume.inspirationBrand} ${perfume.inspiration}, opening with ${perfume.notes.top[0]} and settling into ${perfume.notes.base[0]}. Crafted to feel polished, memorable, and effortlessly wearable.`;
  const tips =
    perfume.pairingTips ??
    [
      `Best worn during ${perfume.longevity.season.join(", ")} for the most balanced projection.`,
      perfume.longevity.occasion[0]
        ? `Perfect for ${perfume.longevity.occasion[0]} moments when you want to leave a refined trail.`
        : "Perfect for moments when you want to leave a refined trail.",
      `Pairs beautifully with crisp shirts, tailored layers, or minimal evening looks.`,
    ];
  const faqItems = customFaqItems ?? getProductFaqItems(perfume);

  const renderNoteGroup = (title: string, notes: string[]) => {
    const noteContext =
      title === "Top Notes"
        ? "Opening impression"
        : title === "Heart Notes"
          ? "Signature body"
          : "Lasting dry-down";
    return (
      <article className="group relative overflow-hidden rounded-[1.25rem] border border-[#e8dfd4] bg-[#fbfaf8] shadow-[0_14px_42px_rgba(22,18,14,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_56px_rgba(22,18,14,0.09)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#9b7a4a]/45 to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-[#e7d1aa]/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-44 w-44 rounded-full bg-[#f7eee1]/80 blur-3xl" />

        <div className="relative grid gap-4 p-4 sm:p-5 lg:grid-cols-[9.5rem_minmax(0,1fr)] lg:items-center lg:p-5">
          <div className="flex items-end justify-between gap-4 border-b border-[#e8dfd4] pb-4 lg:block lg:border-b-0 lg:border-r lg:pb-0 lg:pr-5">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-[#9b7a4a]">
                {noteContext}
              </p>
              <h3 className="mt-2 font-serif text-3xl font-light leading-none text-foreground lg:text-[2rem]">
                {title.replace(" Notes", "")}
              </h3>
            </div>
            <span className="shrink-0 text-[8px] uppercase tracking-[0.28em] text-muted-foreground/70 lg:mt-4 lg:inline-flex">
              {notes.length} notes
            </span>
          </div>

          <div
            className="grid grid-cols-[repeat(var(--note-count),minmax(5.75rem,6.75rem))] justify-center gap-2 sm:grid-cols-[repeat(var(--note-count),minmax(8.75rem,8.75rem))] sm:justify-start sm:gap-4 lg:grid-cols-[repeat(var(--note-count),minmax(9.25rem,9.25rem))] lg:gap-5"
            style={{ "--note-count": notes.length } as CSSProperties}
          >
          {notes.map((note) => {
            const key = note.trim().toLowerCase();
            const image = noteImageLookup.get(key);
            return (
              <div key={note} className="flex min-w-0 flex-col">
                <div className="relative aspect-[1.28] w-full overflow-hidden rounded-xl border border-white bg-[#eee8df] shadow-[0_12px_26px_rgba(24,18,14,0.09)] ring-1 ring-black/5">
                  {image?.url ? (
                    <Image
                      src={withCloudinaryTransforms(image.url, { width: 320 })}
                      alt={`${note} note`}
                      fill
                      sizes="(min-width: 1024px) 148px, (min-width: 640px) 140px, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {note}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_52%,rgba(255,255,255,0.22)_100%)]" />
                </div>
                <p className="mt-2.5 truncate text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-foreground/80 sm:text-[9px] lg:text-[8px] lg:tracking-[0.22em]">
                  {note}
                </p>
              </div>
            );
          })}
          </div>
        </div>
      </article>
    );
  };

  return (
    <>
      <section className="pt-20 pb-16 md:pt-20 md:pb-24">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full lg:max-w-[500px] lg:mx-auto"
            >
              <ProductImageGallery images={perfume.images} videos={perfume.videos} name={perfume.name} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col"
            >
              <div className="flex flex-wrap justify-center gap-2 md:pt-10 mb-4">
                <span className="inline-flex items-center border border-foreground/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                  {perfume.gender}
                </span>
                <span className="inline-flex items-center border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {perfume.category}
                </span>
                {perfume.badges?.bestSeller && (
                  <span className="inline-flex items-center border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Best Seller
                  </span>
                )}
                {perfume.badges?.limitedStock && (
                  <span className="inline-flex items-center border border-amber-600/50 bg-amber-50/50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-800 font-medium">
                    Only 2 Left in Stock!
                  </span>
                )}
                {isComingSoon ? (
                  <span className="inline-flex items-center border border-foreground/30 bg-secondary px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                    Coming Soon
                  </span>
                ) : perfume.badges?.soldOut ? (
                  <span className="inline-flex items-center border border-red-500/50 bg-red-50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-red-700">
                    Sold Out
                  </span>
                ) : null}
              </div>

              <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">
                HUME {isComingSoon ? "COMING SOON" : perfume.size.toUpperCase()}
              </p>
              <h1 className="font-serif text-[2.75rem] md:text-5xl lg:text-6xl font-light italic tracking-tight mb-2">
                {perfume.name}
              </h1>
              <p className="text-[clamp(0.9rem,1vw,1rem)] italic text-muted-foreground mb-4">
                {productSubtitle}
              </p>

              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      className={
                        star <= Math.round(averageRating)
                          ? "fill-foreground text-foreground"
                          : "fill-muted text-muted/70"
                      }
                    />
                  ))}
                </div>
                <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {perfume.reviews.length > 0 ? `${averageRating} (${perfume.reviews.length} reviews)` : "No reviews yet"}
                </span>
              </div>

              <p className="text-[2.05rem] leading-none text-center font-light mb-8">
                {priceLabel ?? formatINR(perfume.price)}
              </p>
              </div>

              <p className="text-body text-muted-foreground leading-relaxed mb-10">{perfume.description}</p>

              <ProductDetailClient perfume={perfume} priceLabel={priceLabel} />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.55 }}
            className="mx-auto mt-6 max-w-5xl md:mt-14 lg:mt-20"
          >
              {showFragranceNotes ? (
                <div className="border-t border-border pt-8 mb-12">
                  <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-caption text-muted-foreground">Fragrance Notes</p>
                      <h2 className="font-serif text-3xl font-light tracking-wide sm:text-4xl">A layered composition</h2>
                    </div>
                    <div className="hidden h-px min-w-28 flex-1 bg-gradient-to-r from-foreground/20 to-transparent sm:block" />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {renderNoteGroup("Top Notes", perfume.notes.top)}
                    {renderNoteGroup("Heart Notes", perfume.notes.heart)}
                    {renderNoteGroup("Base Notes", perfume.notes.base)}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-border pt-8">
                <div className="relative overflow-hidden rounded-[1.6rem] border border-[#30261d] bg-[#15120f] text-[#fffaf2] shadow-[0_28px_80px_rgba(20,14,10,0.18)]">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_32%),linear-gradient(180deg,#211a15_0%,#14110f_100%)]" />
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#d8b46d]/70 to-transparent" />

                  <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.85fr_1.35fr] lg:gap-8">
                    <div className="flex flex-col justify-between border-b border-white/10 pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-7">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-[#d8b46d]">
                          {detailCopy.sectionEyebrow}
                        </p>
                        <h2 className="mt-4 max-w-sm font-serif text-[2.25rem] font-light leading-[1.05] sm:text-[3rem]">
                          {detailCopy.sectionTitle}
                        </h2>
                      </div>
                      <div className="mt-7 flex items-center gap-3">
                        <span className="h-px w-16 bg-[#d8b46d]/70" />
                        <span className="text-[9px] uppercase tracking-[0.3em] text-white/45">
                          HUME dossier
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        {
                          label: detailCopy.durationLabel,
                          value: perfume.longevity.duration,
                          icon: Clock,
                        },
                        {
                          label: detailCopy.projectionLabel,
                          value: perfume.longevity.sillage,
                          icon: Wind,
                        },
                        {
                          label: detailCopy.seasonLabel,
                          value: perfume.longevity.season.join(", "),
                          icon: Sun,
                        },
                        {
                          label: detailCopy.occasionLabel,
                          value: perfume.longevity.occasion.join(" / "),
                          icon: Calendar,
                        },
                      ].map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="relative min-h-[118px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.065] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:min-h-[142px] sm:p-5"
                          >
                            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-[#d8b46d]/80 to-transparent" />
                            <div className="mb-5 flex items-start justify-between gap-3">
                              <div>
                                <span className="font-serif text-xl leading-none text-[#d8b46d]">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <p className="mt-3 text-[8px] font-medium uppercase tracking-[0.28em] text-white/55 sm:text-[9px]">
                                  {item.label}
                                </p>
                              </div>
                              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 text-[#fffaf2]/75">
                                <Icon size={14} />
                              </span>
                            </div>
                            <p className="font-serif text-[1.24rem] font-light leading-tight text-[#fffaf2] sm:text-[1.7rem]">
                              {item.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative overflow-hidden rounded-[1.15rem] border border-[#e8dfd4] bg-[#fbfaf8] p-5 shadow-[0_16px_44px_rgba(24,18,14,0.07)] sm:p-6">
                  <div className="absolute left-0 top-6 h-16 w-[3px] bg-[#9b7a4a]" />
                  <p className="text-caption text-muted-foreground mb-4">
                    {detailCopy.storyLabel}
                  </p>
                  <p className="font-serif text-[1.12rem] leading-[1.58] text-foreground/85 sm:text-[1.27rem]">
                    {story}
                  </p>
                </div>

                <div className="rounded-[1.15rem] border border-[#e8dfd4] bg-[#f8f4ed] p-5 shadow-[0_16px_44px_rgba(24,18,14,0.07)] sm:p-6">
                  <p className="text-caption text-muted-foreground mb-5">
                    {detailCopy.tipsLabel}
                  </p>
                  <div className="space-y-3">
                    {tips.map((tip, index) => (
                      <div
                        key={tip}
                        className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 rounded-xl border border-[#e8dfd4] bg-background/75 p-3.5"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#15120f] font-serif text-sm text-[#d8b46d]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="text-body text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

                <div className="relative mt-6 overflow-hidden rounded-[1.4rem] border border-[#d9c8ad] bg-[#fbfaf8] p-4 shadow-[0_22px_64px_rgba(24,18,14,0.09)] sm:p-6">
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#9b7a4a]/60 to-transparent" />
                  <div className="pointer-events-none absolute -right-20 -top-24 h-52 w-52 rounded-full bg-[#ead8b8]/45 blur-3xl" />

                  <div className="relative z-10 flex items-center justify-between mb-5">
                    <div>
                      <p className="text-caption text-muted-foreground">{detailCopy.whyLabel}</p>
                      <h3 className="mt-2 font-serif text-2xl font-light sm:text-3xl">
                        Trust, care, and fulfilment
                      </h3>
                    </div>
                    <div className="hidden h-px w-20 bg-[#9b7a4a]/35 sm:block" />
                  </div>

                  <div className="relative z-10 flex flex-wrap gap-2.5 mb-5">
                    {detailCopy.paymentChips.map((method) => (
                      <span
                        key={method}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c8ad] bg-background px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground shadow-[0_8px_18px_rgba(24,18,14,0.06)]"
                      >
                        <WalletCards size={12} />
                        {method}
                      </span>
                    ))}
                  </div>

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="group flex items-start gap-3 rounded-2xl border border-[#e8dfd4] bg-background/90 p-4 shadow-[0_10px_26px_rgba(24,18,14,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c9aa72]">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[#d8b46d]">
                        <ShieldCheck size={15} />
                      </span>
                      <p className="text-body">{detailCopy.trustCards[0]}</p>
                    </div>
                    <div className="group flex items-start gap-3 rounded-2xl border border-[#e8dfd4] bg-background/90 p-4 shadow-[0_10px_26px_rgba(24,18,14,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c9aa72]">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[#d8b46d]">
                        <FlaskConical size={15} />
                      </span>
                      <p className="text-body">{detailCopy.trustCards[1]}</p>
                    </div>
                    <div className="group flex items-start gap-3 rounded-2xl border border-[#e8dfd4] bg-background/90 p-4 shadow-[0_10px_26px_rgba(24,18,14,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c9aa72]">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[#d8b46d]">
                        <RotateCcw size={15} />
                      </span>
                      <p className="text-body">{detailCopy.trustCards[2]}</p>
                    </div>
                    <div className="group flex items-start gap-3 rounded-2xl border border-[#e8dfd4] bg-background/90 p-4 shadow-[0_10px_26px_rgba(24,18,14,0.05)] transition duration-300 hover:-translate-y-0.5 hover:border-[#c9aa72]">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[#d8b46d]">
                        <Truck size={15} />
                      </span>
                      <p className="text-body">
                        {detailCopy.trustCards[3]}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="https://wa.me/919559024822"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(37,211,102,0.24)] transition-colors hover:bg-[#20c15a]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#fff" d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z" />
                        <path fill="#fff" d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z" />
                        <path fill="#cfd8dc" d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z" />
                        <path fill="#40c351" d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z" />
                        <path fill="#fff" fillRule="evenodd" d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z" clipRule="evenodd" />
                      </svg>
                      <span>Queries on WhatsApp</span>
                    </a>
                    <a
                      href="https://www.instagram.com/hume.perfume/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9c8ad] bg-background px-5 text-sm font-medium text-foreground shadow-[0_10px_22px_rgba(24,18,14,0.06)] transition-colors hover:bg-[#f8f4ed]"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132.004 132" width="18" height="18" aria-hidden="true">
                        <defs>
                          <linearGradient id="instaB">
                            <stop offset="0" stopColor="#3771c8" />
                            <stop stopColor="#3771c8" offset=".128" />
                            <stop offset="1" stopColor="#60f" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="instaA">
                            <stop offset="0" stopColor="#fd5" />
                            <stop offset=".1" stopColor="#fd5" />
                            <stop offset=".5" stopColor="#ff543e" />
                            <stop offset="1" stopColor="#c837ab" />
                          </linearGradient>
                          <radialGradient id="instaC" cx="158.429" cy="578.088" r="65" href="#instaA" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.402 454.004)" fx="158.429" fy="578.088" />
                          <radialGradient id="instaD" cx="147.694" cy="473.455" r="65" href="#instaB" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.17394 .86872 -3.5818 .71718 1648.348 -458.493)" fx="147.694" fy="473.455" />
                        </defs>
                        <path fill="url(#instaC)" d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z" transform="translate(1.004 1)" />
                        <path fill="url(#instaD)" d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z" transform="translate(1.004 1)" />
                        <path fill="#fff" d="M66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C18.06 51.327 18 52.964 18 66s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C79.617 90.645 90.65 79.613 90.65 66S79.616 41.35 66.003 41.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z" />
                      </svg>
                      <span>Follow on Instagram</span>
                    </a>
                  </div>
                </div>

              <div className="border-t border-border pt-8 mt-10">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-caption text-muted-foreground">FAQs</p>
                    <h3 className="mt-2 font-serif text-3xl font-light">
                      Questions before you order
                    </h3>
                  </div>
                  <div className="hidden h-px min-w-24 flex-1 bg-gradient-to-r from-[#9b7a4a]/35 to-transparent sm:block" />
                </div>
                <div className="space-y-3">
                  {faqItems.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-[#e8dfd4] bg-[#fbfaf8] px-4 py-4 shadow-[0_10px_28px_rgba(24,18,14,0.05)] transition-all open:border-[#c9aa72] open:shadow-[0_16px_36px_rgba(24,18,14,0.08)] sm:px-5"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-sm sm:text-base">
                        <span>{faq.question}</span>
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d9c8ad] bg-background text-lg leading-none text-muted-foreground transition-transform duration-200 group-open:rotate-45 group-open:bg-[#15120f] group-open:text-[#d8b46d]">
                          +
                        </span>
                      </summary>
                      <div className="mt-3 border-t border-[#e8dfd4] pt-3">
                        <p className="text-body text-muted-foreground">{faq.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </motion.div>
        </div>
      </section>

      <ProductReviews
        productId={perfume.id}
        reviews={perfume.reviews}
        productName={perfume.name}
        inspiration={productSubtitle}
      />
      {relatedBlogs.length > 0 && (
        <section className="pb-16 md:pb-24">
          <div className="container-luxury">
            <div className="max-w-4xl border-t border-border pt-8">
              <article className="border border-border/60 bg-background/80 p-5 sm:p-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  {relatedBlogs[0].readTime} • {relatedBlogs[0].date}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl mb-4">{relatedBlogs[0].title}</h3>
                <p className="text-body text-muted-foreground mb-4">{relatedBlogs[0].excerpt}</p>
                <Link
                  href={`/blog/${relatedBlogs[0].slug}`}
                  className="inline-flex text-sm font-medium uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline"
                >
                  Read the guide
                </Link>
              </article>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
