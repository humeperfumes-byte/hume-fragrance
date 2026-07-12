"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Search, ShoppingBag, Sparkles, X, Plus } from "lucide-react";
import type { PerfumeData } from "@/data/perfumes";
import { useSiteControls } from "@/hooks/use-site-controls";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SIZE,
  isDiscoverySetProductId,
} from "@/lib/discovery-set";
import { useCart } from "@/context/CartContext";

const DOTS: Record<string, number[][]> = {
  "0": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "1": [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [1,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0]
  ],
  "2": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1]
  ],
  "3": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "4": [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0]
  ],
  "5": [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "6": [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "7": [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0]
  ],
  "8": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0]
  ],
  "9": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0]
  ],
  ":": [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  " ": [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ]
};

function DotMatrixChar({ char }: { char: string }) {
  const matrix = DOTS[char] || DOTS[" "];
  return (
    <div className="grid grid-cols-5 gap-[1px] bg-[#141414] p-[2.5px] rounded-[3px]">
      {matrix.map((row, rIdx) =>
        row.map((val, cIdx) => (
          <span
            key={`${rIdx}-${cIdx}`}
            className={`h-[3px] w-[3px] rounded-[0.8px] transition-colors duration-200 ${
              val === 1 ? "bg-white shadow-[0_0_4px_rgba(255,255,255,0.95)]" : "bg-[#242424]"
            }`}
          />
        ))
      )}
    </div>
  );
}

function DotMatrixString({ text }: { text: string }) {
  return (
    <div className="flex gap-[3.5px] items-center">
      {text.split("").map((char, index) => (
        <DotMatrixChar key={index} char={char} />
      ))}
    </div>
  );
}

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
function MagicPrice() {
  const [step, setStep] = useState<"initial" | "slashed" | "spark" | "final">("initial");
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    setMounted(true);
    if (!isInView) return;

    // 1.5s: Start drawing the laser slash
    const tSlash = setTimeout(() => setStep("slashed"), 1500);
    // 2.3s: Trigger sparkles and pulse explosion
    const tSpark = setTimeout(() => setStep("spark"), 2300);
    // 3.4s: Final reveal of ₹799 with staggered numbers spring animation
    const tFinal = setTimeout(() => setStep("final"), 3400);

    return () => {
      clearTimeout(tSlash);
      clearTimeout(tSpark);
      clearTimeout(tFinal);
    };
  }, [isInView]);

  if (!mounted) {
    return (
      <div className="mt-2.5 flex items-center justify-center gap-3.5 h-[2.5rem]">
        <span className="text-[1.45rem] font-semibold italic text-stone-850 font-sans">
          ₹999 INR
        </span>
      </div>
    );
  }

  // Generate physics-based sparks for the magic burst phase
  const sparks = Array.from({ length: 10 }).map((_, i) => {
    const angle = -Math.PI / 6 - (i * Math.PI) / 8; // upward burst direction
    const distance = 40 + Math.random() * 35;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 10,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 0.1,
    };
  });

  const charVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.1 + i * 0.05,
        type: "spring" as const,
        stiffness: 120,
        damping: 10,
      },
    }),
  };

  return (
    <div ref={ref} className="mt-2.5 flex items-center justify-center gap-3.5 h-[2.5rem] relative select-none">
      {step !== "final" ? (
        <div className="relative inline-block py-1">
          {/* Main Price Text (₹999) */}
          <motion.span
            animate={
              step === "spark"
                ? {
                    scale: [1, 1.08, 0.95],
                    textShadow: ["0 0 0px rgba(239, 68, 68, 0)", "0 0 15px rgba(251, 191, 36, 0.6)", "0 0 0px rgba(251, 191, 36, 0)"],
                  }
                : {}
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="text-[1.45rem] font-bold italic text-stone-900 font-sans tracking-tight"
          >
            ₹999 INR
          </motion.span>

          {/* Laser Slash Line */}
          {(step === "slashed" || step === "spark") && (
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2.5px]">
              {/* Slasher Path */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-red-500 via-red-600 to-amber-500 relative"
              >
                {/* Laser Glowing Spark Head */}
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white rounded-full -translate-x-1/2"
                  style={{
                    boxShadow: "0 0 8px #fff, 0 0 15px #f59e0b, 0 0 25px #ef4444",
                  }}
                />
              </motion.div>
            </div>
          )}

          {/* Spark Explosion */}
          {step === "spark" && (
            <div className="absolute inset-0 pointer-events-none">
              {sparks.map((sp) => (
                <motion.div
                  key={sp.id}
                  initial={{ x: 20, y: 0, opacity: 1, scale: 0.4 }}
                  animate={{ x: sp.x, y: sp.y, opacity: 0, scale: 1.3 }}
                  transition={{ duration: 0.85, delay: sp.delay, ease: "easeOut" }}
                  className="absolute bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full"
                  style={{
                    width: sp.size,
                    height: sp.size,
                    boxShadow: "0 0 6px #fbbf24, 0 0 12px #f59e0b",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="flex items-center gap-4"
        >
          {/* Staggered character reveal for new price */}
          <span className="flex items-center text-[1.55rem] font-extrabold italic text-stone-900 font-sans tracking-tight">
            {"₹799 INR".split("").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={charVariants}
                style={{ display: char === " " ? "inline-block" : "inline-block" }}
                className={char === " " ? "w-1.5" : ""}
              >
                {char}
              </motion.span>
            ))}
          </span>

          {/* Final Slashed Price */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="relative inline-block"
          >
            <span className="text-[1.15rem] text-stone-500 font-normal font-sans line-through decoration-red-600 decoration-[2px]">
              ₹999
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default function DiscoverySetBuilder() {
  const { addItem, setIsCartOpen } = useCart();
  const controls = useSiteControls();
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [selected, setSelected] = useState<PerfumeData[]>([]);
  const [query, setQuery] = useState("");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [sampleCount, setSampleCount] = useState<10 | 15>(15);

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    const targetTime = new Date("2026-07-18T23:59:59+05:30").getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Strictly force 15 testers set
    setSampleCount(15);
    if (selected.length > 15) {
      setSelected(selected.slice(0, 15));
    }
  }, [selected]);

  const activePrice = 799;
  const activeOriginalPrice = 900;
  const activeSizeLabel = "15 x 3ml";

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
      value: `${sampleCount} perfume testers of 3ml each`,
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

  const handleSampleCountChange = (count: 10 | 15) => {
    setSampleCount(count);
    if (selected.length > count) {
      setSelected(selected.slice(0, count));
    }
  };

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
      const { perfumes: localPerfumes } = require("@/data/perfumes");
      const localRecIds = new Set(
        localPerfumes
          .filter((p: any) => p.badges?.recommendedSample === true)
          .map((p: any) => p.id)
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
      image: "/images/bg/tester_box1.png",
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
      <section className="hidden lg:block relative overflow-hidden bg-background pt-16 text-foreground md:min-h-screen md:pt-24">
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
                  {mounted ? timeLeft.days : 10} days left
                </span>
              </div>

              <div className="mt-3.5 flex h-14 w-full items-center justify-center rounded-[1.1rem] bg-[#161618] px-4 shadow-inner">
                <DotMatrixString text={mounted ? `${timeLeft.days.toString().padStart(2, "0")}:${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes.toString().padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}` : "00:00:00:00"} />
              </div>
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.32em] text-gold sm:text-[10px]">
              Discovery Collection
            </p>
            <h1 className="mt-3 font-serif text-[2.65rem] font-light leading-[0.92] tracking-tight sm:mt-4 sm:text-[4.7rem] lg:text-[5.3rem]">
              Discovery Set
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
                <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400/90 font-sans leading-none">15 Testers Set</span>
                <MagicPrice />
                <span className="block text-[12px] font-medium text-stone-500 font-sans mt-2">15 x 3ml Testers</span>
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
            <div className="block lg:hidden w-full space-y-4">
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
                    {mounted ? timeLeft.days : 10} days left
                  </span>
                </div>

                <div className="mt-3.5 flex h-14 w-full items-center justify-center rounded-[1.1rem] bg-[#161618] px-4 shadow-inner">
                  <DotMatrixString text={mounted ? `${timeLeft.days.toString().padStart(2, "0")}:${timeLeft.hours.toString().padStart(2, "0")}:${timeLeft.minutes.toString().padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}` : "00:00:00:00"} />
                </div>
              </div>

              <h1 className="mt-1 font-serif text-[2.6rem] font-light leading-none tracking-tight text-stone-900">
                Discovery Set
              </h1>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                A curated sequence of {sampleCount} olfactory studies. Build your personal archive from the HUME fragrance library and find the scent that actually works on your skin.
              </p>
              <div className="mt-4 border-y border-stone-200/40 py-3.5 flex items-center justify-center gap-6">
                <div className="text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400/90 font-sans leading-none">15 Testers Set</span>
                  <MagicPrice />
                  <span className="block text-[12px] font-medium text-stone-500 font-sans mt-2">15 x 3ml Testers</span>
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
              <h1 className="mt-2 max-w-[31rem] font-serif text-[2.15rem] font-light leading-[0.92] tracking-tight sm:mt-3 sm:text-[4.1rem] lg:text-[4.25rem] xl:text-[4.55rem]">
                Build your {sampleCount} sample box
              </h1>
              <p className="mt-4 max-w-[28rem] text-[0.95rem] leading-6 text-muted-foreground">
                Pick any {sampleCount} available HUME fragrances as 3ml testers. Explore on skin
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
