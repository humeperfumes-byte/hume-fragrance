"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
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
}: {
  perfume: PerfumeData;
  relatedBlogs?: BlogPost[];
}) {
  const averageRating = getAverageRating(perfume.reviews);
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
  const faqItems = getProductFaqItems(perfume);

  const renderNoteGroup = (title: string, notes: string[]) => (
    <div className="px-1 sm:px-0">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-caption text-muted-foreground">{title}</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground/70">
          {notes.length} notes
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4 sm:gap-5">
          {notes.map((note) => {
            const key = note.trim().toLowerCase();
            const image = noteImageLookup.get(key);
            return (
              <div key={note} className="flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-secondary/40 shadow-[0_8px_22px_rgba(39,112,255,0.16)]">
                  {image?.url ? (
                    <Image
                      src={withCloudinaryTransforms(image.url, { width: 320 })}
                      alt={`${note} note`}
                      fill
                      sizes="(min-width: 768px) 220px, 30vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground border border-border/50">
                      {note}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center font-semibold text-[8px] uppercase tracking-[0.18em] text-foreground/80">
                  {note}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );

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
                  <span className="inline-flex items-center border border-amber-500/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-800">
                    Limited Stock
                  </span>
                )}
              </div>

              <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">
                HUME {perfume.size.toUpperCase()}
              </p>
              <h1 className="font-serif text-[2.75rem] md:text-5xl lg:text-6xl font-light italic tracking-tight mb-2">
                {perfume.name}
              </h1>
              <p className="text-[clamp(0.9rem,1vw,1rem)] italic text-muted-foreground mb-4">
                Inspired by {perfume.inspirationBrand} {perfume.inspiration}
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
                  {averageRating} ({perfume.reviews.length} reviews)
                </span>
              </div>

              <p className="text-[2.05rem] leading-none text-center font-light mb-8">{formatINR(perfume.price)}</p>
              </div>

              <p className="text-body text-muted-foreground leading-relaxed mb-10">{perfume.description}</p>

              <ProductDetailClient perfume={perfume} />

              <div className="border-t border-border pt-8 mb-10">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                  <div>
                    <p className="text-caption text-muted-foreground">Fragrance Notes</p>
                    <h2 className="font-serif text-2xl font-light tracking-wide">A layered composition</h2>
                  </div>
                  <div className="hidden sm:block h-px w-20 bg-foreground/20" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {renderNoteGroup("Top Notes", perfume.notes.top)}
                  {renderNoteGroup("Heart Notes", perfume.notes.heart)}
                  {renderNoteGroup("Base Notes", perfume.notes.base)}
                </div>
              </div>

              <div className="border-t border-border pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-4 sm:mb-6">
                  <div>
                    <p className="text-caption text-muted-foreground">Performance & Character</p>
                    <h2 className="font-serif text-2xl font-light tracking-wide">A quiet, composed trail</h2>
                  </div>
                  <div className="hidden sm:block h-px w-20 bg-foreground/20" />
                </div>

                <div className="grid grid-cols-2 gap-0 border border-border/60 bg-background/80">
                  <div className="min-h-[86px] sm:min-h-[120px] border-r border-b border-border/60 p-3 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] sm:text-caption uppercase tracking-[0.2em] text-muted-foreground">Longevity</p>
                      <Clock size={12} className="text-muted-foreground/80 sm:h-[14px] sm:w-[14px]" />
                    </div>
                    <p className="font-serif text-[1.05rem] sm:text-[2.05rem] leading-snug sm:leading-tight">
                      {perfume.longevity.duration}
                    </p>
                  </div>

                  <div className="min-h-[86px] sm:min-h-[120px] border-b border-border/60 p-3 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] sm:text-caption uppercase tracking-[0.2em] text-muted-foreground">Projection</p>
                      <Wind size={12} className="text-muted-foreground/80 sm:h-[14px] sm:w-[14px]" />
                    </div>
                    <p className="font-serif text-[1.05rem] sm:text-[2.05rem] leading-snug sm:leading-tight">
                      {perfume.longevity.sillage}
                    </p>
                  </div>

                  <div className="min-h-[86px] sm:min-h-[120px] border-r border-border/60 p-3 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] sm:text-caption uppercase tracking-[0.2em] text-muted-foreground">Best Season</p>
                      <Sun size={12} className="text-muted-foreground/80 sm:h-[14px] sm:w-[14px]" />
                    </div>
                    <p className="font-serif text-[1.05rem] sm:text-[2.05rem] leading-snug sm:leading-tight">
                      {perfume.longevity.season.join(", ")}
                    </p>
                  </div>

                  <div className="min-h-[86px] sm:min-h-[120px] p-3 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[10px] sm:text-caption uppercase tracking-[0.2em] text-muted-foreground">Occasion</p>
                      <Calendar size={12} className="text-muted-foreground/80 sm:h-[14px] sm:w-[14px]" />
                    </div>
                    <p className="font-serif text-[1.05rem] sm:text-[2.05rem] leading-snug sm:leading-tight">
                      {perfume.longevity.occasion.join(" / ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8 mt-10">
                <div className="border border-border/70 bg-background/80 p-4 sm:p-5 mb-6">
                  <p className="text-caption text-muted-foreground mb-2">Scent Story</p>
                  <p className="text-body text-muted-foreground">{story}</p>
                </div>

                <div className="border border-border/70 bg-background/80 p-4 sm:p-5">
                  <p className="text-caption text-muted-foreground mb-3">Pairing & Occasion Tips</p>
                  <div className="space-y-2">
                    {tips.map((tip) => (
                      <p key={tip} className="text-body text-muted-foreground">
                        {tip}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="border border-border/70 bg-secondary/20 p-4 sm:p-5 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-caption text-muted-foreground">Why HUME?</p>
                    <div className="h-px w-10 bg-foreground/15" />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {["Secured Payment", "UPI", "Cards"].map((method) => (
                      <span
                        key={method}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
                      >
                        <WalletCards size={12} />
                        {method}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck size={16} className="mt-0.5 text-foreground/75" />
                      <p className="text-body">100% authentic ingredients.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <FlaskConical size={16} className="mt-0.5 text-foreground/75" />
                      <p className="text-body">Formulated following IFRA rules.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <RotateCcw size={16} className="mt-0.5 text-foreground/75" />
                      <p className="text-body">
                        Made in our own manufacturing facility.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <Truck size={16} className="mt-0.5 text-foreground/75" />
                      <p className="text-body">Dispatched within 24 hours on ready stock.</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href="https://wa.me/919559024822"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 text-sm font-medium text-white hover:bg-[#20c15a] transition-colors"
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
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-pink-50 px-5 text-sm font-medium text-foreground hover:bg-[#ededed] transition-colors"
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
              </div>

              <div className="border-t border-border pt-8 mt-10">
                <p className="text-caption text-muted-foreground mb-4">FAQs</p>
                <div className="space-y-3">
                  {faqItems.map((faq) => (
                    <details key={faq.question} className="border border-border/70 bg-background/80 p-4 sm:p-5">
                      <summary className="cursor-pointer list-none font-medium text-sm sm:text-base">
                        {faq.question}
                      </summary>
                      <p className="mt-3 text-body text-muted-foreground">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ProductReviews reviews={perfume.reviews} productName={perfume.name} />
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
                <div className="text-body text-muted-foreground whitespace-pre-line leading-relaxed">
                  {relatedBlogs[0].content}
                </div>
              </article>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
