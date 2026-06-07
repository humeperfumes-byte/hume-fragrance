"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ShoppingBag, X } from "lucide-react";
import type { PerfumeData } from "@/data/perfumes";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SIZE,
  isDiscoverySetProductId,
} from "@/lib/discovery-set";

function isEligibleSamplePerfume(perfume: PerfumeData) {
  const blockedCategories = new Set(["kit", "gift", "accessory", "discovery-set"]);
  return (
    !isDiscoverySetProductId(perfume.id) &&
    !perfume.badges?.soldOut &&
    !blockedCategories.has(perfume.categoryId?.toLowerCase()) &&
    !blockedCategories.has(perfume.category?.toLowerCase())
  );
}

const SAMPLE_COUNT = 10;
const DISCOVERY_SET_HERO_IMAGE = "/images/bg/tester_box1.png";
const DISCOVERY_SET_HERO_GALLERY = [
  {
    src: DISCOVERY_SET_HERO_IMAGE,
    alt: "HUME Discovery Set tester box",
    priority: true,
  },
  {
    src: "/images/bg/tester_box.png",
    alt: "HUME Discovery Set tester box preview",
    priority: true,
  },
  {
    src: "/images/bg/tester1.png",
    alt: "HUME Discovery Set tester preview 1",
    priority: false,
  },
  {
    src: "/images/bg/tester2.png",
    alt: "HUME Discovery Set tester preview 2",
    priority: false,
  },
  {
    src: "/images/bg/tester3.png",
    alt: "HUME Discovery Set tester preview 3",
    priority: false,
  },
  {
    src: "/images/bg/tester4.png",
    alt: "HUME Discovery Set tester preview 4",
    priority: false,
  },
];
const DISCOVERY_SET_FACTS = [
  {
    label: "What you get",
    value: "10 perfume testers of 3ml each",
  },
  {
    label: "Best for",
    value: "First-time buyers, gifting, travel and scent comparison",
  },
  {
    label: "How it works",
    value: "Choose any 10 available HUME fragrances, then add the box to your bag",
  },
  {
    label: "Why it helps",
    value: "Test projection, longevity and dry-down before choosing a full bottle",
  },
];
export default function DiscoverySetBuilder() {
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [selected, setSelected] = useState<PerfumeData[]>([]);
  const [query, setQuery] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % DISCOVERY_SET_HERO_GALLERY.length);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPerfumes = async () => {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
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
    if (selected.length !== SAMPLE_COUNT) {
      setShowComingSoon(false);
    }
  }, [selected.length]);

  const eligiblePerfumes = useMemo(
    () => allPerfumes.filter(isEligibleSamplePerfume),
    [allPerfumes],
  );

  const filteredPerfumes = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return eligiblePerfumes;

    return eligiblePerfumes.filter((perfume) =>
      [perfume.name, perfume.inspiration, perfume.inspirationBrand, perfume.category]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [eligiblePerfumes, query]);

  const selectedIds = useMemo(() => new Set(selected.map((perfume) => perfume.id)), [selected]);
  const previewSlots = useMemo(
    () => Array.from({ length: SAMPLE_COUNT }, (_, index) => selected[index] ?? null),
    [selected],
  );
  const activeHeroImage =
    DISCOVERY_SET_HERO_GALLERY[activeHeroIndex] ?? DISCOVERY_SET_HERO_GALLERY[0];

  const togglePerfume = (perfume: PerfumeData) => {
    setSelected((current) => {
      if (current.some((item) => item.id === perfume.id)) {
        return current.filter((item) => item.id !== perfume.id);
      }

      if (current.length >= SAMPLE_COUNT) {
        toast({ title: "Your discovery set already has 10 samples" });
        return current;
      }

      return [...current, perfume];
    });
  };

  const handleDiscoverySetCta = () => {
    if (showComingSoon) return;

    if (selected.length !== SAMPLE_COUNT) {
      toast({
        title: `Choose ${SAMPLE_COUNT} testers`,
        description: `${SAMPLE_COUNT - selected.length} more sample${SAMPLE_COUNT - selected.length === 1 ? "" : "s"} needed before continuing.`,
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
            productName: "HUME Discovery Set",
            price: DISCOVERY_SET_PRICE,
            quantity: 1,
            sampleCount: SAMPLE_COUNT,
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

    setShowComingSoon(true);
    toast({
      title: "Coming soon",
      description: "The Discovery Set is launching soon. Your selections are saved on this page only.",
    });
  };

  const isSelectionComplete = selected.length === SAMPLE_COUNT;
  const discoveryCtaLabel = showComingSoon
    ? "Coming Soon"
    : isSelectionComplete
      ? `Add to bag - ${formatINR(DISCOVERY_SET_PRICE)}`
      : `${selected.length}/${SAMPLE_COUNT} selected`;

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-background pt-20 text-foreground md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,hsl(42_35%_55%_/_0.14),transparent_34%),linear-gradient(120deg,hsl(30_10%_98%)_0%,hsl(0_0%_100%)_46%,hsl(30_5%_96%)_100%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[1280px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52 }}
            className="max-w-xl"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-gold sm:text-[10px]">
              Discovery Collection
            </p>
            <p className="mt-3 inline-flex border border-[#d0a35b]/35 bg-[#2a2116] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#e8bd74]">
              Coming soon
            </p>
            <h1 className="mt-4 font-serif text-[3.1rem] font-light leading-[0.92] tracking-tight sm:text-[4.7rem] lg:text-[5.3rem]">
              HUME Discovery Set
            </h1>

            <div className="mt-5 lg:hidden">
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

            <p className="mt-5 max-w-[30rem] text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              A 10-piece tester box for finding the scent that actually works on your skin before committing to a full bottle.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Launch price</p>
                <p className="mt-1 text-2xl font-semibold">{formatINR(DISCOVERY_SET_PRICE)}</p>
              </div>
              <div className="h-10 w-px bg-border" aria-hidden="true" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted-foreground">Includes</p>
                <p className="mt-1 text-base font-semibold">{DISCOVERY_SET_SIZE}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:max-w-[28rem] sm:grid-cols-2">
              <a
                href="#choose-testers"
                className="inline-flex h-11 items-center justify-center bg-primary px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
              >
                Choose testers
              </a>
              <a
                href="#choose-testers"
                className="hidden h-11 items-center justify-center border border-border bg-secondary px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground transition hover:bg-muted sm:inline-flex"
              >
                Choose testers
              </a>
            </div>

            <div className="mt-7 hidden gap-3 sm:grid sm:grid-cols-2">
              {DISCOVERY_SET_FACTS.map((fact) => (
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
              <div className="flex items-start gap-2">
                <div className="flex shrink-0 flex-col gap-1.5">
                  {DISCOVERY_SET_HERO_GALLERY.map((image, index) => (
                    <button
                      key={image.src}
                      type="button"
                      aria-label={`Show ${image.alt}`}
                      onClick={() => setActiveHeroIndex(index)}
                      className={`relative h-11 w-11 shrink-0 overflow-hidden border bg-secondary transition duration-300 xl:h-12 xl:w-12 ${
                        activeHeroIndex === index
                          ? "border-foreground opacity-100 shadow-[0_8px_20px_rgba(12,14,18,0.1)]"
                          : "border-border opacity-60 hover:border-foreground/35 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="48px"
                        className="object-cover"
                        priority={image.priority}
                        loading={image.priority ? undefined : "lazy"}
                      />
                      {activeHeroIndex === index ? (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-foreground shadow-[0_0_10px_rgba(12,14,18,0.2)]" />
                      ) : null}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activeHeroImage.src}
                  initial={{ opacity: 0.55, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.48 }}
                  className="relative aspect-square min-w-0 flex-1 overflow-hidden border border-border bg-secondary shadow-[0_28px_70px_rgba(12,14,18,0.1)]"
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
              </div>

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
                  {Array.from({ length: 10 }).map((_, index) => (
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
        className="scroll-mt-20 border-t border-border bg-background pt-20 pb-16 text-foreground md:pt-24 md:pb-20"
      >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-10">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:sticky lg:top-24 lg:self-start lg:pr-1"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gold sm:text-[10px]">
              Discovery Set
            </p>
            <h1 className="mt-3 max-w-[31rem] font-serif text-[2.7rem] font-light leading-[0.9] tracking-tight sm:text-[4.1rem] lg:text-[4.25rem] xl:text-[4.55rem]">
              Build your 10 sample box
            </h1>
            <p className="mt-4 hidden max-w-[28rem] text-[0.95rem] leading-6 text-muted-foreground sm:block lg:text-[0.92rem]">
              Pick any 10 available HUME fragrances as 3ml testers. Explore on skin
              before choosing your full bottle.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-foreground sm:text-sm">
              <span>{formatINR(DISCOVERY_SET_PRICE)}</span>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span>{DISCOVERY_SET_SIZE}</span>
              <span className="border border-[#d0a35b]/35 bg-[#2a2116] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#e8bd74]">
                Coming soon
              </span>
            </div>

            <div className="mt-6 border border-border bg-secondary p-4 shadow-[0_22px_70px_rgba(12,14,18,0.06)] sm:p-5 lg:mt-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:text-[10px]">
                  Physical tray layout
                </p>
                <p className="text-[9px] font-semibold text-gold sm:text-[10px]">
                  {selected.length}/{SAMPLE_COUNT} selected
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
                    className={`relative flex aspect-[0.86] min-h-[3.65rem] items-center justify-center overflow-hidden rounded-[0.22rem] border px-1.5 text-center transition sm:min-h-[4.2rem] lg:min-h-[3.45rem] xl:min-h-[3.8rem] ${
                      slot
                        ? "border-foreground/80 bg-foreground text-background shadow-[0_10px_20px_rgba(12,14,18,0.12)] hover:-translate-y-0.5"
                        : "border-border bg-muted text-transparent"
                    }`}
                    aria-label={slot ? `Remove ${slot.name}` : `Empty sample slot ${index + 1}`}
                  >
                    {slot ? (
                      <span className="line-clamp-4 px-0.5 text-[7px] font-light uppercase leading-[1.05] tracking-[0.04em] sm:text-[8px]">
                        {slot.name}
                      </span>
                    ) : (
                      <span>{index + 1}</span>
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
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
          >
            <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="font-serif text-[1.8rem] font-light leading-none sm:text-[2.15rem] lg:text-[2.25rem]">
                Choose 10 testers
              </h2>

              <div className="flex w-full max-w-[16rem] items-center border-b border-border pb-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search samples"
                  className="h-7 min-w-0 flex-1 bg-transparent text-xs italic text-foreground outline-none placeholder:text-muted-foreground"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="inline-flex h-7 w-7 items-center justify-center text-muted-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="mt-3 flex min-h-0 flex-wrap gap-2 sm:min-h-7">
              {selected.map((perfume) => (
                <button
                  key={perfume.id}
                  type="button"
                  onClick={() => togglePerfume(perfume)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2a2116] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#f7d79b] transition hover:bg-[#3a2b19]"
                >
                  {perfume.name}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>

            <div className="mt-5">
              {loadingPerfumes ? (
                <div className="py-16 text-center text-sm text-muted-foreground">Loading samples...</div>
              ) : filteredPerfumes.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">No available samples found.</div>
              ) : (
                <div className="grid grid-cols-3 items-start gap-x-2.5 gap-y-5 sm:grid-cols-4 sm:gap-x-5 sm:gap-y-7 lg:gap-y-6">
                  {filteredPerfumes.map((perfume) => {
                    const isSelected = selectedIds.has(perfume.id);
                    const isDisabled = !isSelected && selected.length >= SAMPLE_COUNT;
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
                        <div
                          className={`relative aspect-square w-full overflow-hidden border transition ${
                            isSelected
                              ? "border-foreground ring-2 ring-foreground/30"
                              : "border-border ring-1 ring-border/80 group-hover:border-foreground/30 group-hover:ring-foreground/15"
                          }`}
                        >
                          <Image
                            src={withCloudinaryTransforms(perfume.images?.[0] || "/images/logo.png", {
                              width: 420,
                            })}
                            alt={perfume.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 30vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
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

                        <div className="mt-1.5 sm:mt-2">
                          <p className="line-clamp-2 text-[8px] font-light uppercase leading-[1.15] tracking-[0.05em] text-foreground sm:text-[9px]">
                            {perfume.name}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-[7px] font-light leading-[1.2] text-muted-foreground sm:text-[8px]">
                            Inspired by {perfume.inspiration}
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
    </>
  );
}
