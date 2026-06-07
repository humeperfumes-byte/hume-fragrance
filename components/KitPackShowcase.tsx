"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ShoppingBag, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import type { PerfumeData } from "@/data/perfumes";

const KIT_COUNT = 5;
const KIT_SIZE = "15ml";
const KIT_TOTAL = 999;

const KIT_HERO_FACTS = [
  { label: "Format", value: `${KIT_COUNT} perfumes` },
  { label: "Bottle size", value: `${KIT_SIZE} each` },
  { label: "Kit price", value: formatINR(KIT_TOTAL) },
  { label: "Best for", value: "Rotation, gifting, travel" },
];

const KIT_HERO_IMAGES = [
  "/images/15ml/image1.png",
  "/images/15ml/image2.png",
  "/images/15ml/image3.png",
  "/images/15ml/image4.png",
  "/images/15ml/image5.png",
];

function isKitEligible(perfume: PerfumeData) {
  const blockedCategories = new Set(["kit", "gift", "accessory", "discovery-set"]);
  return (
    !perfume.badges?.soldOut &&
    !blockedCategories.has(perfume.categoryId?.toLowerCase()) &&
    !blockedCategories.has(perfume.category?.toLowerCase())
  );
}

export default function KitPackShowcase() {
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [query, setQuery] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [slots, setSlots] = useState<Array<PerfumeData | null>>(
    Array.from({ length: KIT_COUNT }, () => null),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % KIT_HERO_IMAGES.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPerfumes = async () => {
      try {
        const response = await fetch("/api/products?purpose=kit", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to fetch kit products: ${response.status}`);
        const data = (await response.json()) as PerfumeData[];
        if (active) setAllPerfumes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load perfumes:", error);
      } finally {
        if (active) setLoadingPerfumes(false);
      }
    };

    loadPerfumes();
    return () => {
      active = false;
    };
  }, []);

  const selected = useMemo(
    () => slots.filter((slot): slot is PerfumeData => Boolean(slot)),
    [slots],
  );
  const selectedIds = useMemo(() => new Set(selected.map((perfume) => perfume.id)), [selected]);
  const isComplete = selected.length === KIT_COUNT;

  useEffect(() => {
    if (!isComplete) setShowComingSoon(false);
  }, [isComplete]);

  const kitPerfumes = useMemo(() => allPerfumes.filter(isKitEligible), [allPerfumes]);
  const filteredPerfumes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return kitPerfumes;

    return kitPerfumes.filter((perfume) =>
      [perfume.name, perfume.inspiration, perfume.inspirationBrand, perfume.category]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [kitPerfumes, query]);
  const activeHeroImage = KIT_HERO_IMAGES[activeHeroIndex] ?? KIT_HERO_IMAGES[0];

  const removePerfume = (perfumeId: string) => {
    setSlots((current) => current.map((slot) => (slot?.id === perfumeId ? null : slot)));
  };

  const togglePerfume = (perfume: PerfumeData) => {
    if (perfume.badges?.soldOut) {
      toast({ title: "This perfume is currently sold out" });
      return;
    }

    if (selectedIds.has(perfume.id)) {
      removePerfume(perfume.id);
      return;
    }

    const emptyIndex = slots.findIndex((slot) => !slot);
    if (emptyIndex === -1) {
      toast({
        title: "Your kit already has 5 perfumes",
        description: "Remove one perfume before adding another.",
      });
      return;
    }

    setSlots((current) => {
      const next = [...current];
      next[emptyIndex] = perfume;
      return next;
    });
  };

  const clearSlot = (index: number) => {
    setSlots((current) => {
      const next = [...current];
      next[index] = null;
      return next;
    });
  };

  const handleAddKitToCart = () => {
    if (showComingSoon) return;

    if (!isComplete) {
      toast({
        title: `Choose ${KIT_COUNT} perfumes`,
        description: `${KIT_COUNT - selected.length} more perfume${KIT_COUNT - selected.length === 1 ? "" : "s"} needed.`,
      });
      return;
    }

    setShowComingSoon(true);
    toast({
      title: "Coming soon",
      description: "The 5 x 15ml kit is launching soon. Your selections are saved on this page only.",
    });
  };

  return (
    <main className="bg-background text-foreground">
      <section className="relative min-h-screen overflow-hidden border-b border-border bg-[#f8f7f4] pt-16 md:pt-28">
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.92)_0%,rgba(245,243,238,0.96)_42%,rgba(226,221,212,0.72)_100%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1360px] items-center gap-10 px-5 py-5 sm:px-8 md:min-h-[calc(100vh-6rem)] md:py-10 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8d6b32]">
              Build your signature rotation
            </p>
            <h1 className="mt-4 max-w-[42rem] font-serif text-[3.3rem] font-light leading-[0.9] tracking-tight sm:text-[5rem] lg:text-[5.8rem]">
              Build Your Kit
            </h1>

            <div className="mt-6 lg:hidden">
              <div className="flex w-full flex-col gap-2">
                <motion.div
                  key={`mobile-${activeHeroImage}`}
                  initial={{ opacity: 0.55, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.45 }}
                  className="relative aspect-square w-full overflow-hidden border border-border bg-[#f8f7f4] shadow-[0_20px_52px_rgba(12,14,18,0.1)]"
                >
                  <Image
                    src={activeHeroImage}
                    alt="Build Your Kit perfume preview"
                    fill
                    sizes="92vw"
                    className="object-cover"
                    priority
                  />
                </motion.div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {KIT_HERO_IMAGES.map((image, index) => (
                    <button
                      key={`mobile-thumb-${image}`}
                      type="button"
                      aria-label={`Show Build Your Kit preview ${index + 1}`}
                      onClick={() => setActiveHeroIndex(index)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden border bg-[#f8f7f4] transition duration-300 ${
                        activeHeroIndex === index
                          ? "border-foreground opacity-100 shadow-[0_10px_24px_rgba(12,14,18,0.1)]"
                          : "border-border opacity-60"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Build Your Kit preview thumbnail ${index + 1}`}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-5 hidden max-w-[34rem] text-base leading-7 text-zinc-600 sm:text-lg lg:block">
              Choose any {KIT_COUNT} HUME perfumes in compact {KIT_SIZE} bottles. A refined set for daily rotation,
              travel, office bags, and gifting.
            </p>

            <div className="mt-7 flex flex-wrap items-end gap-x-5 gap-y-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                  Kit price
                </p>
                <p className="mt-1 text-3xl font-semibold">{formatINR(KIT_TOTAL)}</p>
              </div>
              <div className="h-10 w-px bg-zinc-300" aria-hidden="true" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                  Includes
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {KIT_COUNT} x {KIT_SIZE}
                </p>
              </div>
            </div>

            <a
              href="#build-kit"
              className="mt-8 inline-flex h-12 items-center justify-center bg-[#151515] px-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black"
            >
              Start building
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative hidden lg:block"
          >
            <div className="ml-auto flex w-full max-w-[34rem] flex-col gap-2 sm:gap-3 lg:flex-row lg:items-start">
              <motion.div
                key={activeHeroImage}
                initial={{ opacity: 0.55, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="relative aspect-[4/5] max-h-[31rem] min-w-0 flex-1 overflow-hidden border border-border bg-[#f8f7f4] shadow-[0_26px_70px_rgba(12,14,18,0.12)]"
              >
                <Image
                  src={activeHeroImage}
                  alt="Build Your Kit perfume preview"
                  fill
                  sizes="(max-width: 768px) 92vw, 30vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.08),transparent_52%)]" />
              </motion.div>

              <div className="flex shrink-0 flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {KIT_HERO_IMAGES.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    aria-label={`Show Build Your Kit preview ${index + 1}`}
                    onClick={() => setActiveHeroIndex(index)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden border bg-[#f8f7f4] transition duration-300 sm:h-16 sm:w-16 lg:h-16 lg:w-16 ${
                      activeHeroIndex === index
                        ? "border-foreground opacity-100 shadow-[0_12px_34px_rgba(12,14,18,0.12)]"
                        : "border-border opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Build Your Kit preview thumbnail ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="build-kit" className="scroll-mt-20 border-b border-border bg-background py-16 md:py-20">
        <div className="mx-auto grid w-full max-w-[1360px] gap-9 px-5 sm:px-8 lg:grid-cols-[0.76fr_1.24fr] lg:px-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8d6b32]">
              Kit tray
            </p>
            <h2 className="mt-3 font-serif text-[2.8rem] font-light leading-[0.9] sm:text-[4rem]">
              Pick your 5
            </h2>
            <p className="mt-4 hidden max-w-[28rem] text-sm leading-6 text-muted-foreground sm:block">
              Each slot becomes one {KIT_SIZE} perfume. Select exactly {KIT_COUNT}, then add the completed kit to your bag.
            </p>

            <div className="mt-6 border border-border bg-secondary p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                  Selected perfumes
                </p>
                <p className="text-[10px] font-semibold text-[#8d6b32]">
                  {selected.length}/{KIT_COUNT}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2.5 sm:gap-2">
                {slots.map((slot, index) => (
                  <button
                    key={`kit-slot-${index}`}
                    type="button"
                    onClick={() => {
                      if (slot) clearSlot(index);
                    }}
                    className={`relative flex aspect-[0.82] min-h-[4.8rem] items-center justify-center overflow-hidden rounded-md border px-1 text-center transition sm:aspect-[0.78] sm:min-h-[4.4rem] sm:rounded-none ${
                      slot
                        ? "border-[#d0a35b]/35 bg-[#151515] text-white shadow-[0_10px_22px_rgba(12,14,18,0.12)] sm:border-foreground sm:bg-foreground sm:text-background"
                        : "border-border bg-white text-muted-foreground sm:bg-muted"
                    }`}
                    aria-label={slot ? `Remove ${slot.name}` : `Empty kit slot ${index + 1}`}
                  >
                    {slot ? (
                      <span className="line-clamp-4 px-1 text-[8px] uppercase leading-[1.08] tracking-[0.04em]">
                        {slot.name}
                      </span>
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 border border-border bg-background p-3">
              <button
                type="button"
                onClick={handleAddKitToCart}
                disabled={!isComplete}
                className="inline-flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {!showComingSoon ? <ShoppingBag className="h-4 w-4" /> : null}
                {showComingSoon
                  ? "Coming Soon"
                  : isComplete
                  ? `Add kit - ${formatINR(KIT_TOTAL)}`
                  : `${selected.length}/${KIT_COUNT} selected`}
              </button>
            </div>

            <div className="mt-5 hidden grid-cols-2 gap-2 sm:grid">
              {KIT_HERO_FACTS.map((fact) => (
                <div key={fact.label} className="border border-border bg-secondary p-3">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {fact.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-foreground/80">{fact.value}</p>
                </div>
              ))}
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                  Available HUME perfumes
                </p>
                <h3 className="mt-2 font-serif text-3xl font-light">Choose from the collection</h3>
              </div>
              <div className="flex w-full max-w-[18rem] items-center border-b border-border pb-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search perfumes"
                  className="h-8 min-w-0 flex-1 bg-transparent text-sm italic text-foreground outline-none placeholder:text-muted-foreground"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {selected.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.map((perfume) => (
                  <button
                    key={`selected-${perfume.id}`}
                    type="button"
                    onClick={() => removePerfume(perfume.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#2a2116] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#f7d79b]"
                  >
                    {perfume.name}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6">
              {loadingPerfumes ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading perfumes...</div>
              ) : filteredPerfumes.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No perfumes found.</div>
              ) : (
                <div className="grid grid-cols-3 gap-x-2.5 gap-y-5 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-8">
                  {filteredPerfumes.map((perfume) => {
                    const isSelected = selectedIds.has(perfume.id);
                    const isDisabled = !isSelected && selected.length >= KIT_COUNT;
                    const selectedPosition = selected.findIndex((item) => item.id === perfume.id) + 1;

                    return (
                      <button
                        key={perfume.id}
                        type="button"
                        onClick={() => togglePerfume(perfume)}
                        disabled={isDisabled}
                        className={`group text-left transition duration-300 ${
                          isDisabled ? "opacity-45" : "hover:-translate-y-1"
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden border border-border bg-secondary">
                          <Image
                            src={withCloudinaryTransforms(perfume.images?.[0] || "/images/logo.png", { width: 520 })}
                            alt={perfume.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <span
                            className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[1.25rem] font-light leading-none shadow-[0_10px_22px_rgba(12,14,18,0.22),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md backdrop-saturate-150 transition sm:right-2.5 sm:top-2.5 sm:h-10 sm:w-10 sm:rounded-xl sm:text-[1.55rem] ${
                              isSelected
                                ? "bg-foreground text-background"
                                : "border border-white/65 bg-black/28 text-white ring-1 ring-black/10"
                            }`}
                          >
                            <span className={isSelected ? "text-xs font-semibold sm:text-sm" : "-mt-0.5 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"}>
                              {isSelected ? selectedPosition : "+"}
                            </span>
                          </span>
                        </div>
                        <p className="mt-2 font-serif text-[1rem] leading-tight sm:text-lg">{perfume.name}</p>
                        <p className="mt-1 line-clamp-2 text-[0.68rem] leading-4 text-muted-foreground sm:text-xs">
                          Inspired by {perfume.inspiration}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
