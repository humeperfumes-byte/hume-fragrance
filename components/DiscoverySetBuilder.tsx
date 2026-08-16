"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, X, Plus } from "lucide-react";
import { perfumes as localPerfumes, type PerfumeData } from "@/data/perfumes";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  DISCOVERY_SET_IMAGES,
  DISCOVERY_SET_ORIGINAL_PRICE,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SAMPLE_SIZE_ML,
  DISCOVERY_SET_SIZE,
  DISCOVERY_SET_STATUS,
  isDiscoverySetProductId,
} from "@/lib/discovery-set";
import { useCart } from "@/context/CartContext";

function isEligibleSamplePerfume(perfume: PerfumeData) {
  const blockedCategories = new Set(["kit", "gift", "accessory", "discovery-set"]);
  return (
    !isDiscoverySetProductId(perfume.id) &&
    !perfume.badges?.soldOut &&
    !perfume.badges?.comingSoon &&
    !blockedCategories.has(perfume.categoryId?.toLowerCase()) &&
    !blockedCategories.has(perfume.category?.toLowerCase())
  );
}

const DISCOVERY_SET_HERO_GALLERY = DISCOVERY_SET_IMAGES.map((src, index) => ({
  src,
  alt: "HUME Discovery Set with 15 3ml perfume testers",
  priority: index === 0,
}));

const PREORDER_COUNTDOWN_DURATION_MS = 5 * 24 * 60 * 60 * 1000;
const PREORDER_COUNTDOWN_STORAGE_KEY = "hume_discovery_preorder_countdown_v1";

function getPreorderCountdownTarget(now: number) {
  const storedTarget = Number(window.localStorage.getItem(PREORDER_COUNTDOWN_STORAGE_KEY));
  let target = Number.isFinite(storedTarget) && storedTarget > 0
    ? storedTarget
    : now + PREORDER_COUNTDOWN_DURATION_MS;

  if (target <= now) {
    const completedCycles = Math.floor((now - target) / PREORDER_COUNTDOWN_DURATION_MS) + 1;
    target += completedCycles * PREORDER_COUNTDOWN_DURATION_MS;
  }

  window.localStorage.setItem(PREORDER_COUNTDOWN_STORAGE_KEY, String(target));
  return target;
}

function PreorderCountdown() {
  const [remainingMs, setRemainingMs] = useState(PREORDER_COUNTDOWN_DURATION_MS);

  useEffect(() => {
    let target = getPreorderCountdownTarget(Date.now());

    const updateCountdown = () => {
      const now = Date.now();
      if (target <= now) {
        target = getPreorderCountdownTarget(now);
      }
      setRemainingMs(Math.max(0, target - now));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, []);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const units = [
    [days, "DAYS"],
    [hours, "HRS"],
    [minutes, "MIN"],
    [seconds, "SEC"],
  ] as const;

  return (
    <div
      className="flex w-full items-center justify-center gap-3 sm:gap-5"
      aria-label={`${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining in the current pre-order offer cycle`}
    >
      {units.map(([value, label], index) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          {index > 0 ? <span className="mb-3 text-base text-white/30">:</span> : null}
          <span className="min-w-9 text-center font-sans">
            <strong className="block text-lg font-semibold leading-none tracking-[0.08em] text-white sm:text-xl">
              {String(value).padStart(2, "0")}
            </strong>
            <small className="mt-1.5 block text-[7px] font-semibold tracking-[0.18em] text-white/45">
              {label}
            </small>
          </span>
        </div>
      ))}
    </div>
  );
}

function MagicPrice() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-2.5 flex h-[2.5rem] select-none items-center justify-center gap-3.5"
    >
      <span className="text-[1.55rem] font-extrabold italic tracking-tight text-stone-900">
        {formatINR(DISCOVERY_SET_PRICE)}
      </span>
      <span className="text-[1.15rem] font-normal text-stone-500 line-through decoration-red-600 decoration-2">
        {formatINR(DISCOVERY_SET_ORIGINAL_PRICE)}
      </span>
    </motion.div>
  );
}

export default function DiscoverySetBuilder({ customH1 }: { customH1?: string }) {
  const { addItem, setIsCartOpen } = useCart();
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [selected, setSelected] = useState<PerfumeData[]>([]);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const sampleCount = DISCOVERY_SET_SAMPLE_COUNT;
  const activePrice = DISCOVERY_SET_PRICE;
  const activeSizeLabel = DISCOVERY_SET_SIZE;

  const formatSlotName = (name: string) => {
    return name
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const activeFacts = useMemo(() => [
    {
      label: "What you get",
      value: `${sampleCount} perfume testers of ${DISCOVERY_SET_SAMPLE_SIZE_ML}ml each`,
    },
    {
      label: "Best for",
      value: "First-time buyers, gifting, travel and scent comparison",
    },
    {
      label: "How it works",
      value: `Choose any ${sampleCount} available HUME fragrances, then add the box to your bag`,
    },
    {
      label: "Why it helps",
      value: "Test projection, longevity and dry-down before choosing a full bottle",
    },
  ], [sampleCount]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % DISCOVERY_SET_HERO_GALLERY.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPerfumes = async () => {
      try {
        const response = await fetch("/api/products?forDiscoverySet=1", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`);
        const data = (await response.json()) as PerfumeData[];
        if (active) setAllPerfumes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load discovery set products:", error);
      } finally {
        if (active) setLoadingPerfumes(false);
      }
    };

    loadPerfumes();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (selected.length !== sampleCount) {
      setShowComingSoon(false);
    }
  }, [selected.length, sampleCount]);

  const eligiblePerfumes = useMemo(
    () => allPerfumes.filter(isEligibleSamplePerfume),
    [allPerfumes],
  );

  const filteredPerfumes = eligiblePerfumes;

  const selectedIds = useMemo(() => new Set(selected.map((perfume) => perfume.id)), [selected]);
  const previewSlots = useMemo(
    () => Array.from({ length: sampleCount }, (_, index) => selected[index] ?? null),
    [selected, sampleCount],
  );
  const activeHeroImage =
    DISCOVERY_SET_HERO_GALLERY[activeHeroIndex] ?? DISCOVERY_SET_HERO_GALLERY[0];

  const togglePerfume = (perfume: PerfumeData) => {
    setSelected((current) => {
      if (current.some((item) => item.id === perfume.id)) {
        return current.filter((item) => item.id !== perfume.id);
      }

      if (current.length >= sampleCount) {
        toast({ title: `Your discovery set already has ${sampleCount} samples` });
        return current;
      }

      return [...current, perfume];
    });
  };

  const selectRecommendedKit = () => {
    let recommended = eligiblePerfumes.filter((p) => p.badges?.recommendedSample === true);

    if (recommended.length === 0) {
      const localRecIds = new Set(
        localPerfumes
          .filter((p) => p.badges?.recommendedSample === true)
          .map((p) => p.id)
      );
      recommended = eligiblePerfumes.filter((p) => localRecIds.has(p.id));
    }

    const toSelect = recommended.slice(0, sampleCount);
    setSelected(toSelect);
    toast({
      title: "Recommended Kit Selected",
      description: `Automatically selected ${toSelect.length} expert-recommended samples.`,
    });
  };

  const clearSelection = () => {
    setSelected([]);
    toast({
      title: "Selection Cleared",
      description: "All selected testers have been removed.",
    });
  };

  const handleDiscoverySetCta = () => {
    if (selected.length !== sampleCount) {
      toast({
        title: `Choose ${sampleCount} testers`,
        description: `${sampleCount - selected.length} more sample${sampleCount - selected.length === 1 ? "" : "s"} needed before continuing.`,
      });
      return;
    }

    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "add_to_cart",
          payload: {
            source: "discovery_set_builder",
            productId: "hume-discovery-set",
            productName: `Discovery Set (${sampleCount} Samples - Pre-Order)`,
            price: activePrice,
            quantity: 1,
            sampleCount: sampleCount,
            samples: selected.map((perfume, index) => ({
              position: index + 1,
              id: perfume.id,
              name: perfume.name,
              inspiration: perfume.inspiration,
            })),
          },
        },
      }),
    );

    const uniqueId = `discovery-set-${selected.map((p) => p.id).sort().join("-")}`;

    addItem({
      id: uniqueId,
      name: `Discovery Set (${sampleCount} Samples - Pre-Order)`,
      inspiration: `Choose ${sampleCount} Samples`,
      category: "discovery-set",
      image: DISCOVERY_SET_IMAGES[0],
      price: activePrice,
      size: activeSizeLabel,
      sampleSelections: selected.map((perfume) => ({
        id: perfume.id,
        name: perfume.name,
        inspiration: perfume.inspiration || undefined,
      })),
    });

    setIsCartOpen(true);
    toast({
      title: "Pre-order added to bag",
      description: "Your Discovery Set has been added to your shopping bag.",
    });
  };

  const isSelectionComplete = selected.length === sampleCount;
  const discoveryCtaLabel = isSelectionComplete
    ? `Pre-Order Now - ${formatINR(activePrice)}`
    : `${selected.length}/${sampleCount} selected`;

  return (
    <>
      <section className="relative overflow-hidden bg-background pt-16 text-foreground md:min-h-screen md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,hsl(42_35%_55%_/_0.14),transparent_34%),linear-gradient(120deg,hsl(30_10%_98%)_0%,hsl(0_0%_100%)_46%,hsl(30_5%_96%)_100%)]" />

        <div className="relative mx-auto grid w-full max-w-[1280px] items-center gap-7 px-4 py-6 sm:px-6 md:min-h-[calc(100vh-5rem)] md:gap-10 md:py-10 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52 }}
            className="max-w-xl"
          >
            {/* Nothing OS Style Pre-order Widget (Dark) */}
            <div className="w-full max-w-[26rem] bg-[#0c0c0d] border border-stone-850 p-3.5 rounded-[1.8rem] shadow-[0_12px_40px_rgba(0,0,0,0.15)] mb-6 text-white">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ff2f4b] pl-2.5 pr-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(255,47,75,0.45)] font-sans">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                  </span>
                  <span>pre order</span>
                </div>
                <span className="text-xs font-semibold text-stone-350 font-sans tracking-tight">
                  {DISCOVERY_SET_SIZE}
                </span>
              </div>

              <div className="mt-3.5 flex h-16 w-full items-center justify-center rounded-[1.1rem] bg-[#161618] px-4 shadow-inner">
                <PreorderCountdown />
              </div>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-gold sm:text-[10px]">
              Discovery Collection
            </p>
            <h1 className="mt-3 font-serif text-[2.65rem] font-light leading-[0.92] tracking-tight sm:mt-4 sm:text-[4.7rem] lg:text-[5.3rem]">
              {customH1 || "Discovery Set"}
            </h1>

            <div className="mt-4 lg:hidden">
              <motion.div
                key={`mobile-${activeHeroImage.src}`}
                initial={{ opacity: 0.55, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.42 }}
                className="relative aspect-square overflow-hidden border border-border bg-secondary shadow-[0_22px_54px_rgba(12,14,18,0.08)]"
              >
                <Image
                  src={activeHeroImage.src}
                  alt={activeHeroImage.alt}
                  fill
                  sizes="92vw"
                  className="object-cover"
                  priority={activeHeroImage.priority}
                  loading={activeHeroImage.priority ? undefined : "lazy"}
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.08),transparent_46%)]" />
              </motion.div>

              <div className="mt-2 grid grid-cols-5 gap-2">
                {DISCOVERY_SET_HERO_GALLERY.map((image, index) => (
                  <button
                    key={`mobile-thumb-${image.src}`}
                    type="button"
                    aria-label={`Show ${image.alt}`}
                    onClick={() => setActiveHeroIndex(index)}
                    className={`relative aspect-square overflow-hidden border bg-secondary transition duration-300 ${
                      activeHeroIndex === index
                        ? "border-foreground opacity-100 shadow-[0_10px_24px_rgba(12,14,18,0.1)]"
                        : "border-border opacity-60"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="20vw"
                      className="object-cover"
                      priority={image.priority}
                      loading={image.priority ? undefined : "lazy"}
                    />
                    {activeHeroIndex === index ? (
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-foreground shadow-[0_0_12px_rgba(12,14,18,0.2)]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 max-w-[30rem] text-[0.95rem] leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">
              A custom {sampleCount}-piece tester box for finding the scent that actually works on your skin before committing to a full bottle.
            </p>

            <div className="mt-5 border-y border-stone-200/40 py-4 flex items-center justify-center gap-6 sm:mt-6">
              <div className="text-center">
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400/90 font-sans leading-none">{DISCOVERY_SET_STATUS}</span>
                <MagicPrice />
                <span className="block text-[12px] font-medium text-stone-500 font-sans mt-2">{DISCOVERY_SET_SIZE} Testers</span>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:mt-8 sm:max-w-[28rem] sm:grid-cols-2">
              <a
                href="#sample-grid"
                className="inline-flex h-11 items-center justify-center bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
              >
                Choose testers
              </a>
              <a
                href="#sample-grid"
                className="hidden h-11 items-center justify-center border border-border bg-secondary px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-muted sm:inline-flex"
              >
                Choose testers
              </a>
            </div>

            <div className="mt-7 hidden gap-3 sm:grid sm:grid-cols-2">
              {activeFacts.map((fact) => (
                <div key={fact.label} className="border border-border bg-secondary p-3">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    {fact.label}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-foreground/80">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.58, delay: 0.08 }}
            className="relative hidden lg:flex lg:justify-end"
          >
            <div className="flex w-full max-w-[30rem] flex-col gap-2.5 xl:max-w-[32rem]">
              <motion.div
                key={activeHeroImage.src}
                initial={{ opacity: 0.55, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.48 }}
                className="relative aspect-square w-full overflow-hidden border border-border bg-secondary shadow-[0_28px_70px_rgba(12,14,18,0.1)]"
              >
                <Image
                  src={activeHeroImage.src}
                  alt={activeHeroImage.alt}
                  fill
                  sizes="(max-width: 1280px) 32vw, 480px"
                  className="object-cover"
                  priority={activeHeroImage.priority}
                  loading={activeHeroImage.priority ? undefined : "lazy"}
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.1),transparent_46%)]" />
              </motion.div>

            <div className="border border-border bg-card/90 p-3 shadow-[0_18px_48px_rgba(12,14,18,0.06)] backdrop-blur-md sm:p-4">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold">
                    Sample ritual
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                    Wear, compare, then choose your full bottle with confidence.
                  </p>
                </div>
                <div className="hidden grid-cols-5 gap-1.5 sm:grid">
                  {Array.from({ length: DISCOVERY_SET_SAMPLE_COUNT }).map((_, index) => (
                    <span
                      key={`hero-sample-${index}`}
                      className="h-7 w-5 border border-border bg-foreground/85"
                      style={{ opacity: 1 - index * 0.045 }}
                    />
                  ))}
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="choose-testers"
        className="scroll-mt-20 border-t-0 lg:border-t lg:border-border bg-background pt-20 pb-12 text-foreground md:pt-24 md:pb-20"
      >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 md:gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-10">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:sticky lg:top-24 lg:self-start lg:pr-1 w-full"
          >
            {/* Mobile Layout (lg:hidden) */}
            <div className="hidden">
              {/* Nothing OS Style Pre-order Widget (Dark) */}
              <div className="w-full bg-[#0c0c0d] border border-stone-850 p-3.5 rounded-[1.8rem] shadow-[0_12px_40px_rgba(0,0,0,0.15)] mb-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ff2f4b] pl-2.5 pr-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(255,47,75,0.45)] font-sans">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                    </span>
                    <span>pre order</span>
                  </div>
                  <span className="text-xs font-semibold text-stone-355 font-sans tracking-tight">
                    {DISCOVERY_SET_SIZE}
                  </span>
                </div>

                <div className="mt-3.5 flex h-16 w-full items-center justify-center rounded-[1.1rem] bg-[#161618] px-4 shadow-inner">
                  <PreorderCountdown />
                </div>
              </div>

              <h2 className="mt-1 font-serif text-[2.6rem] font-light leading-none tracking-tight text-stone-900">
                {customH1 || "Discovery Set"}
              </h2>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                A curated sequence of {sampleCount} olfactory studies. Build your personal archive from the HUME fragrance library and find the scent that actually works on your skin.
              </p>
              <div className="mt-4 border-y border-stone-200/40 py-3.5 flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400/90 font-sans leading-none">{DISCOVERY_SET_STATUS}</span>
                  <MagicPrice />
                  <span className="block text-[12px] font-medium text-stone-500 font-sans mt-2">{DISCOVERY_SET_SIZE} Testers</span>
                </div>
              </div>

              {/* Main Product Image (mobile) */}
              <motion.div
                key={`mobile-hero-${activeHeroImage.src}`}
                initial={{ opacity: 0.55, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.42 }}
                className="relative aspect-square w-full overflow-hidden border border-stone-200 bg-stone-50 mt-4 rounded-lg"
              >
                <Image
                  src={activeHeroImage.src}
                  alt={activeHeroImage.alt}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={activeHeroImage.priority}
                  loading={activeHeroImage.priority ? undefined : "lazy"}
                />
              </motion.div>

              {/* Apothecary Drawer Preview Grid */}
              <div className="mt-6">
                <div className="grid grid-cols-5 gap-2.5">
                  {previewSlots.map((slot, index) => (
                    <button
                      key={`mobile-sample-slot-${index}`}
                      type="button"
                      onClick={() => {
                        if (slot) togglePerfume(slot);
                      }}
                      className={`relative flex aspect-[0.95] items-center justify-center overflow-hidden rounded-xl border px-1.5 text-center transition ${
                        slot
                          ? "border-stone-900 bg-[#faf9f6]/95 text-stone-900 shadow-sm hover:-translate-y-0.5"
                          : "border-dashed border-stone-300 bg-[#fdfdfc] text-stone-350 hover:border-stone-400"
                      }`}
                    >
                      {slot ? (
                        <span className="line-clamp-3 px-0.5 text-[8.5px] font-cormorant italic font-medium leading-[1.1] tracking-normal">
                          {formatSlotName(slot.name)}
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-sans font-light tracking-wider text-stone-400">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Layout (hidden lg:block) */}
            <div className="hidden lg:block">
              <h2 className="mt-2 max-w-[31rem] font-serif text-[2.15rem] font-light leading-[0.92] tracking-tight sm:mt-3 sm:text-[4.1rem] lg:text-[4.25rem] xl:text-[4.55rem]">
                Build your {sampleCount} sample box
              </h2>
              <p className="mt-4 max-w-[28rem] text-[0.95rem] leading-6 text-muted-foreground">
                Pick any {sampleCount} available HUME fragrances as {DISCOVERY_SET_SAMPLE_SIZE_ML}ml testers. Explore on skin
                before choosing your full bottle.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-foreground sm:mt-4 sm:text-sm">
                <span>{formatINR(activePrice)}</span>
                <span className="h-4 w-px bg-border" aria-hidden="true" />
                <span>{activeSizeLabel}</span>
              </div>

              <div className="mt-5 border border-border bg-secondary p-3.5 shadow-[0_22px_70px_rgba(12,14,18,0.06)] sm:mt-6 sm:p-5 lg:mt-7">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                    Physical tray layout
                  </p>
                  <p className="text-[9px] font-semibold text-gold sm:text-[10px]">
                    {selected.length}/{sampleCount} selected
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-5 gap-2.5 sm:gap-3 lg:gap-2.5">
                  {previewSlots.map((slot, index) => (
                    <button
                      key={`sample-slot-${index}`}
                      type="button"
                      onClick={() => {
                        if (slot) togglePerfume(slot);
                      }}
                      className={`relative flex aspect-[0.86] min-h-[3.65rem] items-center justify-center overflow-hidden rounded-lg border px-1.5 text-center transition sm:min-h-[4.2rem] lg:min-h-[3.45rem] xl:min-h-[3.8rem] ${
                        slot
                          ? "border-stone-900 bg-[#faf9f6]/95 text-stone-900 shadow-sm hover:-translate-y-0.5"
                          : "border-dashed border-stone-300 bg-[#fdfdfc] text-stone-350 hover:border-stone-400"
                      }`}
                    >
                      {slot ? (
                        <span className="line-clamp-4 px-0.5 text-[8.5px] font-cormorant italic font-medium leading-[1.1] tracking-normal sm:text-[10px]">
                          {formatSlotName(slot.name)}
                        </span>
                      ) : (
                        <span className="text-[9.5px] font-sans font-light tracking-wider text-stone-400">
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div id="discovery-cart" className="mt-4 border border-border bg-secondary p-3">
                <button
                  type="button"
                  onClick={handleDiscoverySetCta}
                  disabled={!isSelectionComplete || showComingSoon}
                  className={`inline-flex h-12 w-full items-center justify-center gap-2 border px-5 text-[10px] font-bold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed sm:h-[3.25rem] ${
                    showComingSoon
                      ? "border-border bg-muted text-muted-foreground"
                      : "border-gold/25 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  }`}
                >
                  {!showComingSoon ? <ShoppingBag className="h-4 w-4" /> : null}
                  {discoveryCtaLabel}
                </button>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="flex items-baseline gap-2.5">
                <h2 className="font-serif text-[1.8rem] font-light leading-none sm:text-[2.15rem] lg:text-[2.25rem]">
                  Choose {sampleCount} testers
                </h2>
                <span className="text-[10px] sm:text-[11.5px] font-sans font-medium text-stone-400 tracking-wider uppercase leading-none">
                  ({eligiblePerfumes.length} available)
                </span>
              </div>
            </div>

            <div className="mt-3 flex min-h-0 flex-wrap gap-2 sm:min-h-7">
              {selected.map((perfume) => (
                <button
                  key={perfume.id}
                  type="button"
                  onClick={() => togglePerfume(perfume)}
                  className="group inline-flex items-center gap-1 rounded-full bg-stone-50 border border-stone-200/80 px-2 py-0.5 text-[8px] sm:px-3.5 sm:py-1 sm:text-[9px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 active:scale-[0.97]"
                >
                  <span>{perfume.name}</span>
                  <X className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-stone-400 transition-colors group-hover:text-stone-650" />
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={selectRecommendedKit}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-md transition-all duration-300 hover:bg-stone-850 hover:shadow-lg active:scale-[0.98]"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-amber-400/20" />
                Select Recommended Kit
              </button>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border border-stone-250 bg-white text-stone-600 shadow-sm transition hover:bg-stone-50 hover:text-stone-950 active:scale-[0.95]"
                  title="Clear selection"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div id="sample-grid" className="mt-5 scroll-mt-20 md:scroll-mt-24">
              {loadingPerfumes ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading samples...</div>
              ) : filteredPerfumes.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No available samples found.</div>
              ) : (
                <div className="grid grid-cols-3 items-start gap-x-2.5 gap-y-5 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-7 lg:gap-y-6">
                  {filteredPerfumes.map((perfume) => {
                    const isSelected = selectedIds.has(perfume.id);
                    const isDisabled = !isSelected && selected.length >= sampleCount;
                    const selectedPosition = selected.findIndex((item) => item.id === perfume.id) + 1;

                    return (
                      <button
                        key={perfume.id}
                        type="button"
                        onClick={() => togglePerfume(perfume)}
                        disabled={isDisabled}
                        className={`group text-left transition-all duration-300 ${
                          isDisabled ? "opacity-35" : "hover:-translate-y-1.5"
                        }`}
                      >
                        <div
                          className={`relative aspect-square w-full overflow-hidden bg-stone-50 rounded-2xl border transition-all duration-300 ${
                            isSelected
                              ? "border-stone-900 ring-2 ring-stone-900/10 shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                              : "border-stone-200/60 shadow-[0_8px_24px_rgba(0,0,0,0.03)] group-hover:border-stone-300/80 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.06)]"
                          }`}
                        >
                          <Image
                            src={withCloudinaryTransforms(perfume.images?.[0] || "/images/logo.png", {
                              width: 420,
                            })}
                            alt={perfume.name}
                            fill
                            sizes="(max-width: 640px) 33vw, 25vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                          <span
                            className={`absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-355 backdrop-blur-md sm:right-2.5 sm:top-2.5 sm:h-8.5 sm:w-8.5 ${
                              isSelected
                                ? "bg-stone-900 border border-stone-900 text-white shadow-sm"
                                : "bg-white/40 border border-white/60 text-stone-850 opacity-90 group-hover:opacity-100 group-hover:bg-white/60 shadow-sm"
                            }`}
                          >
                            {isSelected ? (
                              <span className="font-sans text-[9px] font-bold sm:text-xs leading-none">
                                {selectedPosition}
                              </span>
                            ) : (
                              <Plus className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-stone-850 transition-transform duration-300 ease-out group-hover:rotate-90" />
                            )}
                          </span>
                        </div>

                        <div className="mt-2.5 px-0.5">
                          <p className="font-serif italic font-semibold uppercase text-stone-900 text-[11px] sm:text-[13px] tracking-wider leading-tight group-hover:text-stone-600 transition-colors">
                            {perfume.name}
                          </p>
                          <p className="mt-1 text-[8.5px] font-sans font-light tracking-wide text-stone-400 sm:text-[9.5px] leading-relaxed">
                            Inspired by <span className="text-stone-850 font-medium">{perfume.inspiration}</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="lg:hidden fixed bottom-6 left-5 right-5 z-50 bg-white/70 backdrop-blur-xl border border-stone-200/40 pl-6 pr-2 py-2 flex items-center justify-between rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-baseline gap-1 font-sans">
          <span className="text-xl font-semibold text-stone-900 leading-none">
            {selected.length.toString().padStart(2, "0")}
          </span>
          <span className="text-xs font-medium text-stone-400 leading-none">
            / {sampleCount}
          </span>
        </div>

        <button
          type="button"
          onClick={handleDiscoverySetCta}
          disabled={!isSelectionComplete}
          className={`h-9 px-5 text-[9.5px] font-bold uppercase tracking-[0.15em] transition-all duration-200 rounded-full flex items-center justify-center gap-1.5 ${
            isSelectionComplete
              ? "bg-stone-900 hover:bg-stone-800 text-white active:scale-[0.97] shadow-sm"
              : "bg-stone-50 border border-stone-200/30 text-stone-300 cursor-not-allowed"
          }`}
        >
          <span>PRE-ORDER</span>
          <ShoppingBag className={`h-3.5 w-3.5 ${isSelectionComplete ? "text-white" : "text-stone-300"}`} />
        </button>
      </motion.div>
    </>
  );
}
