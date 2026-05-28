"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, ShoppingBag, X } from "lucide-react";
import type { PerfumeData } from "@/data/perfumes";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  DISCOVERY_SET_CART_ITEM_PREFIX,
  DISCOVERY_SET_IMAGES,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SIZE,
  isDiscoverySetProductId,
} from "@/lib/discovery-set";

const SAMPLE_COUNT = 10;
const DISCOVERY_SET_HERO_IMAGE = "/images/bg/tester box.png";
const DISCOVERY_SET_HERO_GALLERY = [
  {
    src: DISCOVERY_SET_HERO_IMAGE,
    alt: "HUME Discovery Set tester box",
    priority: true,
  },
  {
    src: "/images/bg/tester1.png",
    alt: "HUME Discovery Set tester preview 1",
    priority: true,
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
function isEligibleSamplePerfume(perfume: PerfumeData) {
  const blockedCategories = new Set(["kit", "gift", "accessory", "discovery-set"]);
  return (
    !isDiscoverySetProductId(perfume.id) &&
    !perfume.badges?.soldOut &&
    !blockedCategories.has(perfume.categoryId?.toLowerCase()) &&
    !blockedCategories.has(perfume.category?.toLowerCase())
  );
}

export default function DiscoverySetBuilder() {
  const { addItem, setIsCartOpen } = useCart();
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [selected, setSelected] = useState<PerfumeData[]>([]);
  const [query, setQuery] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

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

  const handleAddDiscoverySet = () => {
    if (selected.length !== SAMPLE_COUNT) {
      toast({
        title: `Choose ${SAMPLE_COUNT} testers`,
        description: `${SAMPLE_COUNT - selected.length} more sample${SAMPLE_COUNT - selected.length === 1 ? "" : "s"} needed before adding the Discovery Set.`,
      });
      return;
    }

    const sampleSelections = selected.map((perfume) => ({
      id: perfume.id,
      name: perfume.name,
      inspiration: perfume.inspiration,
    }));
    const selectionKey = sampleSelections.map((sample) => sample.id).sort().join("-");

    addItem({
      id: `${DISCOVERY_SET_CART_ITEM_PREFIX}${selectionKey}`,
      name: "HUME Discovery Set",
      inspiration: "Build your own 10 perfume testers",
      category: "Discovery Set",
      image: DISCOVERY_SET_IMAGES[0],
      price: DISCOVERY_SET_PRICE,
      size: DISCOVERY_SET_SIZE,
      sampleSelections,
    });
    setIsCartOpen(true);
    toast({ title: "Discovery Set added to bag" });
  };

  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-[#070604] pt-20 text-[#f7efe3] md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(173,132,67,0.24),transparent_34%),linear-gradient(120deg,#070604_0%,#0d0b09_46%,#191510_100%)]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-[linear-gradient(90deg,rgba(7,6,4,0)_0%,rgba(7,6,4,0.44)_100%)] lg:block" />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-[1280px] items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:py-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52 }}
            className="max-w-xl"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-[#c08b3d] sm:text-[10px]">
              Discovery Collection
            </p>
            <p className="mt-3 inline-flex border border-[#d0a35b]/35 bg-[#2a2116] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#e8bd74]">
              Now available
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
                className="relative aspect-square overflow-hidden border border-white/12 bg-[#15110e] shadow-[0_22px_54px_rgba(0,0,0,0.38)]"
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
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,6,4,0.16),transparent_46%)]" />
              </motion.div>

              <div className="mt-2 grid grid-cols-5 gap-2">
                {DISCOVERY_SET_HERO_GALLERY.map((image, index) => (
                  <button
                    key={`mobile-thumb-${image.src}`}
                    type="button"
                    aria-label={`Show ${image.alt}`}
                    onClick={() => setActiveHeroIndex(index)}
                    className={`relative aspect-square overflow-hidden border bg-[#15110e] transition duration-300 ${
                      activeHeroIndex === index
                        ? "border-[#f7efe3] opacity-100 shadow-[0_10px_24px_rgba(247,239,227,0.12)]"
                        : "border-white/10 opacity-60"
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
                      <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#f7efe3] shadow-[0_0_12px_rgba(247,239,227,0.8)]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-5 max-w-[30rem] text-sm leading-6 text-[#b9ad9d] sm:text-base sm:leading-7">
              A 10-piece tester box for finding the scent that actually works on your skin before committing to a full bottle.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-x-5 gap-y-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8f8375]">Launch price</p>
                <p className="mt-1 text-2xl font-semibold">{formatINR(DISCOVERY_SET_PRICE)}</p>
              </div>
              <div className="h-10 w-px bg-white/14" aria-hidden="true" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#8f8375]">Includes</p>
                <p className="mt-1 text-base font-semibold">{DISCOVERY_SET_SIZE}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:max-w-[28rem] sm:grid-cols-2">
              <a
                href="#choose-testers"
                className="inline-flex h-11 items-center justify-center bg-[#f7efe3] px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#d9b979]"
              >
                Choose testers
              </a>
              <a
                href="#choose-testers"
                className="hidden h-11 items-center justify-center border border-white/14 bg-white/[0.04] px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#f7efe3] transition hover:bg-white/[0.09] sm:inline-flex"
              >
                Choose testers
              </a>
            </div>

            <div className="mt-7 hidden gap-3 sm:grid sm:grid-cols-2">
              {DISCOVERY_SET_FACTS.map((fact) => (
                <div key={fact.label} className="border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#8f8375]">
                    {fact.label}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-[#d9cebf]">
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
            className="relative hidden lg:block"
          >
            <div className="grid gap-3 lg:grid-cols-[5.6rem_minmax(0,1fr)] xl:grid-cols-[6rem_minmax(0,1fr)]">
              <div className="order-2 grid grid-cols-5 gap-2 lg:order-1 lg:grid-cols-1">
                {DISCOVERY_SET_HERO_GALLERY.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    aria-label={`Show ${image.alt}`}
                    onClick={() => setActiveHeroIndex(index)}
                    className={`relative aspect-square overflow-hidden border bg-[#15110e] transition duration-300 ${
                      activeHeroIndex === index
                        ? "border-[#f7efe3] opacity-100 shadow-[0_12px_28px_rgba(247,239,227,0.14)]"
                        : "border-white/10 opacity-60 hover:border-white/35 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority={image.priority}
                      loading={image.priority ? undefined : "lazy"}
                    />
                    {activeHeroIndex === index ? (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#f7efe3] shadow-[0_0_14px_rgba(247,239,227,0.85)]" />
                    ) : null}
                  </button>
                ))}
              </div>

              <motion.div
                key={activeHeroImage.src}
                initial={{ opacity: 0.55, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.48 }}
                className="order-1 relative aspect-square overflow-hidden border border-white/12 bg-[#15110e] shadow-[0_28px_70px_rgba(0,0,0,0.42)] lg:order-2 lg:ml-auto lg:max-w-[31rem] xl:max-w-[34rem]"
              >
                <Image
                  src={activeHeroImage.src}
                  alt={activeHeroImage.alt}
                  fill
                  sizes="(max-width: 1024px) 92vw, 540px"
                  className="object-cover"
                  priority={activeHeroImage.priority}
                  loading={activeHeroImage.priority ? undefined : "lazy"}
                />
                <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,6,4,0.18),transparent_46%)]" />
              </motion.div>
            </div>

            <div className="mt-3 border border-white/10 bg-[#0e0b08]/88 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.34)] backdrop-blur-md sm:p-4 lg:ml-[6.35rem] xl:ml-[6.75rem]">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#c08b3d]">
                    Sample ritual
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#cfc2b2] sm:text-sm">
                    Wear, compare, then choose your full bottle with confidence.
                  </p>
                </div>
                <div className="hidden grid-cols-5 gap-1.5 sm:grid">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <span
                      key={`hero-sample-${index}`}
                      className="h-7 w-5 border border-white/10 bg-[#f7efe3]"
                      style={{ opacity: 1 - index * 0.045 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="choose-testers" className="min-h-screen scroll-mt-20 bg-[#070604] pt-20 pb-9 text-[#f7efe3] md:pt-24 lg:h-screen lg:overflow-hidden lg:pb-5">
      <div className="mx-auto flex h-full w-full max-w-[1280px] flex-col px-4 sm:px-6 lg:px-8">
        <div className="grid min-h-0 flex-1 gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="min-h-0"
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#c08b3d] sm:text-[10px]">
              Discovery Set
            </p>
            <h1 className="mt-3 max-w-[31rem] font-serif text-[2.7rem] font-light leading-[0.9] tracking-tight sm:text-[4.1rem] lg:text-[4.25rem] xl:text-[4.55rem]">
              Build your 10 sample box
            </h1>
            <p className="mt-4 hidden max-w-[28rem] text-[0.95rem] leading-6 text-[#b3a696] sm:block lg:text-[0.92rem]">
              Pick any 10 available HUME fragrances as 3ml testers. Explore on skin
              before choosing your full bottle.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-[#f7efe3] sm:text-sm">
              <span>{formatINR(DISCOVERY_SET_PRICE)}</span>
              <span className="h-4 w-px bg-[#6e6254]" aria-hidden="true" />
              <span>{DISCOVERY_SET_SIZE}</span>
              <span className="border border-[#d0a35b]/35 bg-[#2a2116] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#e8bd74]">
                Now live
              </span>
            </div>

            <div className="mt-6 border border-white/8 bg-[#13100d] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.35)] sm:p-5 lg:mt-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#a99b8b] sm:text-[10px]">
                  Physical tray layout
                </p>
                <p className="text-[9px] font-semibold text-[#d3a24b] sm:text-[10px]">
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
                        ? "border-[#efe7dc]/80 bg-[#f7efe3] text-black shadow-[0_10px_20px_rgba(0,0,0,0.22)] hover:-translate-y-0.5"
                        : "border-white/6 bg-[#25221b] text-transparent"
                    }`}
                    aria-label={slot ? `Remove ${slot.name}` : `Empty sample slot ${index + 1}`}
                  >
                    {slot ? (
                      <span className="line-clamp-3 text-[0.55rem] font-bold uppercase leading-[0.85rem] tracking-[0.08em] sm:text-[0.62rem]">
                        {slot.name}
                      </span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div id="discovery-cart" className="mt-4 border border-white/10 bg-[#13100d] p-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#c08b3d]">
                Add to bag
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#b9ad9d]">
                Select exactly 10 scents and add the Discovery Set to checkout.
                Your sample choices travel with the order.
              </p>
              <button
                type="button"
                onClick={handleAddDiscoverySet}
                disabled={selected.length !== SAMPLE_COUNT}
                className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 border border-[#d0a35b]/25 bg-[#f7efe3] px-5 text-[10px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-[#d9b979] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[3.25rem]"
              >
                <ShoppingBag className="h-4 w-4" />
                {selected.length === SAMPLE_COUNT
                  ? `Add to bag - ${formatINR(DISCOVERY_SET_PRICE)}`
                  : `${selected.length}/${SAMPLE_COUNT} selected`}
              </button>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="min-h-0"
          >
            <div className="flex flex-col gap-3 border-b border-white/12 pb-3 sm:flex-row sm:items-start sm:justify-between">
              <h2 className="font-serif text-[1.8rem] font-light leading-none sm:text-[2.15rem] lg:text-[2.25rem]">
                Choose 10 testers
              </h2>

              <div className="flex w-full max-w-[16rem] items-center border-b border-[#6e6254] pb-1">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search samples"
                  className="h-7 min-w-0 flex-1 bg-transparent text-xs italic text-[#f7efe3] outline-none placeholder:text-[#8c8174]"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="inline-flex h-7 w-7 items-center justify-center text-[#c9b9a6]"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <Search className="h-3.5 w-3.5 text-[#c9b9a6]" />
                )}
              </div>
            </div>

            <div className="mt-3 flex min-h-0 flex-wrap gap-2 sm:min-h-7">
              {selected.map((perfume) => (
                <button
                  key={perfume.id}
                  type="button"
                  onClick={() => togglePerfume(perfume)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#2a2116] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#e2b66d] transition hover:bg-[#3a2b19]"
                >
                  {perfume.name}
                  <X className="h-3 w-3" />
                </button>
              ))}
            </div>

            <div
              data-lenis-prevent
              className="mt-5 min-h-0 touch-pan-y overscroll-contain lg:h-[calc(100vh-14.5rem)] lg:overflow-y-scroll lg:pr-2"
            >
              {loadingPerfumes ? (
                <div className="py-16 text-center text-sm text-[#b3a696]">Loading samples...</div>
              ) : filteredPerfumes.length === 0 ? (
                <div className="py-16 text-center text-sm text-[#b3a696]">No available samples found.</div>
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
                              ? "border-[#f2eee7] ring-2 ring-[#f2eee7]/55"
                              : "border-[#6a6257] ring-1 ring-[#b8afa2]/25 group-hover:border-[#aaa093] group-hover:ring-[#c9bdad]/45"
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
                          {isSelected ? (
                            <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-[#f7efe3] text-[0.72rem] font-bold text-black shadow-[0_8px_20px_rgba(20,16,12,0.22)]">
                              {selectedPosition}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-2 min-h-[3.1rem] sm:mt-3 sm:min-h-[3.35rem]">
                          <p className="line-clamp-1 text-[0.66rem] font-extrabold uppercase leading-tight tracking-[0.04em] text-[#f7efe3] sm:text-[0.84rem]">
                            {perfume.name}
                          </p>
                          <p className="mt-0.5 line-clamp-2 min-h-[1.5rem] text-[0.6rem] italic leading-3 text-[#b3a696] sm:mt-1 sm:min-h-[2rem] sm:text-[0.74rem] sm:leading-4">
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
