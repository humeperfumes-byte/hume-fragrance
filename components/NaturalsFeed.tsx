"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Volume2, VolumeX, ArrowRight } from "lucide-react";

type NaturalCategory = "Floral" | "Woody" | "Earthy" | "Green" | "Resinous";

interface NaturalProduct {
  id: string;
  number: string;
  name: string;
  scientificName: string;
  origin: string;
  category: NaturalCategory;
  price: number;
  size: string;
  image: string;
  videoUrl?: string;
}

const NATURALS_PRODUCTS: NaturalProduct[] = [
  {
    id: "rose-otto",
    number: "N\u00ba 01",
    name: "Rose Otto",
    scientificName: "Rosa damascena",
    origin: "KANNAUJ",
    category: "Floral",
    price: 2400,
    size: "5ML",
    image: "/images/naturals/rose_otto.jpg",
  },
  {
    id: "vetiver",
    number: "N\u00ba 02",
    name: "Vetiver",
    scientificName: "Chrysopogon zizanioides",
    origin: "MYSURU",
    category: "Earthy",
    price: 1650,
    size: "10ML",
    image: "/images/naturals/vetiver.jpg",
  },
  {
    id: "chandan",
    number: "N\u00ba 03",
    name: "Chandan (Sandalwood)",
    scientificName: "Santalum album",
    origin: "MARAYOOR",
    category: "Woody",
    price: 3200,
    size: "5ML",
    image: "/images/naturals/chandan.jpg",
  },
  {
    id: "bela",
    number: "N\u00ba 04",
    name: "Bela (Champa)",
    scientificName: "Michelia champaca",
    origin: "ODISHA",
    category: "Floral",
    price: 1850,
    size: "5ML",
    image: "/images/naturals/bela.jpg",
  },
  {
    id: "mehndi",
    number: "N\u00ba 05",
    name: "Mehndi (Henna)",
    scientificName: "Lawsonia inermis",
    origin: "SOJAT",
    category: "Green",
    price: 1400,
    size: "5ML",
    image: "/images/naturals/mehndi.jpg",
  },
  {
    id: "mogra",
    number: "N\u00ba 06",
    name: "Mogra",
    scientificName: "Jasminum sambac",
    origin: "MADURAI",
    category: "Floral",
    price: 2100,
    size: "3ML",
    image: "/images/naturals/mogra.jpg",
  },
  {
    id: "jasmine-grandiflorum",
    number: "N\u00ba 07",
    name: "Jasmine Grandiflorum",
    scientificName: "Jasminum grandiflorum",
    origin: "COIMBATORE",
    category: "Floral",
    price: 2400,
    size: "3ML",
    image: "/images/naturals/jasmine_grandiflorum.jpg",
  },
  {
    id: "kewra",
    number: "N\u00ba 08",
    name: "Kewra",
    scientificName: "Pandanus odorifer",
    origin: "GANJAM",
    category: "Green",
    price: 1200,
    size: "10ML",
    image: "/images/naturals/kewra.jpg",
  },
  {
    id: "khus",
    number: "N\u00ba 09",
    name: "Khus",
    scientificName: "Vetiveria zizanioides",
    origin: "BHARATPUR",
    category: "Earthy",
    price: 1750,
    size: "10ML",
    image: "/images/naturals/khus.jpg",
  },
];

const FILTERS: Array<"All" | NaturalCategory> = [
  "All",
  "Floral",
  "Woody",
  "Earthy",
  "Green",
  "Resinous",
];

export default function NaturalsFeed() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"All" | NaturalCategory>("All");
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const visibleProducts = useMemo(() => {
    if (activeFilter === "All") return NATURALS_PRODUCTS;
    return NATURALS_PRODUCTS.filter((product) => product.category === activeFilter);
  }, [activeFilter]);

  const handlePlayVideo = (id: string) => {
    const video = videoRefs.current[id];
    if (video) video.play().catch(() => {});
  };

  const handlePauseVideo = (id: string) => {
    const video = videoRefs.current[id];
    if (video) video.pause();
  };

  return (
    <section className="bg-stone-50 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 border-b border-stone-200 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="font-serif text-[2.15rem] font-semibold leading-none tracking-tight text-stone-950 sm:text-[2.45rem]">
              The Library
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-stone-600 sm:text-base">
              Every oil is traceable to a single grower and shipped in amber glass
              to preserve its molecular integrity.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`h-9 rounded-lg border px-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-stone-200 bg-white text-stone-950 hover:border-stone-400"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 pt-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20">
          {visibleProducts.map((prod, index) => {
            const hasVideo = Boolean(prod.videoUrl);
            const isCurrentlyHovered = hoveredCard === prod.id;

            return (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, delay: (index % 3) * 0.08 }}
                onMouseEnter={() => {
                  setHoveredCard(prod.id);
                  if (hasVideo) handlePlayVideo(prod.id);
                }}
                onMouseLeave={() => {
                  setHoveredCard(null);
                  if (hasVideo) handlePauseVideo(prod.id);
                }}
                className="group relative flex flex-col bg-stone-50"
              >
                <div className="relative aspect-[0.8] w-full overflow-hidden bg-stone-100 rounded-xl shadow-sm border border-stone-200/50">
                  {/* Top-Left White Rectangular Badge */}
                  <span className="absolute left-4 top-4 z-20 bg-white px-3 py-1.5 font-serif text-[12.5px] italic tracking-wider text-stone-900 shadow-sm">
                    {prod.number}
                  </span>

                  <Image
                    src={prod.image}
                    alt={prod.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] ${
                      hasVideo && isCurrentlyHovered ? "opacity-0" : "opacity-100"
                    }`}
                  />

                  {hasVideo ? (
                    <video
                      ref={(el) => {
                        videoRefs.current[prod.id] = el;
                      }}
                      src={prod.videoUrl}
                      loop
                      muted={isMuted}
                      playsInline
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        isCurrentlyHovered ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ) : null}

                  {hasVideo && isCurrentlyHovered ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsMuted(!isMuted);
                      }}
                      className="absolute bottom-4 right-4 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black/85"
                      aria-label={isMuted ? "Unmute product video" : "Mute product video"}
                    >
                      {isMuted ? (
                        <VolumeX className="h-3.5 w-3.5" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : null}
                </div>

                {/* Details Block below the Image */}
                <div className="mt-4 px-1 pb-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-[1.65rem] font-medium leading-none text-stone-950">
                      {prod.name}
                    </h3>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-stone-450 shrink-0">
                      {prod.origin}
                    </span>
                  </div>
                  
                  <p className="mt-2 font-serif italic text-stone-500 text-[13.5px] tracking-wide leading-none">
                    {prod.scientificName}
                  </p>
                  
                  {/* Bottom divider line */}
                  <div className="h-[0.5px] bg-stone-200 w-full mt-5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
