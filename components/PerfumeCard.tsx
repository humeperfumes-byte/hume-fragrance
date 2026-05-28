"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-route";
import { DISCOVERY_SET_PATH, isDiscoverySetProductId } from "@/lib/discovery-set";

interface PerfumeCardProps {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  category: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  image: string;
  price: number;
  index: number;
  bestSeller?: boolean;
  humeSpecial?: boolean;
  limitedStock?: boolean;
  soldOut?: boolean;
  hidePrice?: boolean;
  prioritizeImage?: boolean;
  disableEntranceAnimation?: boolean;
}

const PerfumeCard = ({
  id,
  name,
  inspiration,
  inspirationBrand = "",
  category,
  categoryTags = [],
  categoryIds = [],
  image,
  price,
  index,
  bestSeller,
  humeSpecial,
  limitedStock,
  soldOut,
  hidePrice = false,
  prioritizeImage,
  disableEntranceAnimation = false,
}: PerfumeCardProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [upgradeImage, setUpgradeImage] = useState(false);
  const isDiscoverySet = isDiscoverySetProductId(id);
  const productPath = getProductPath({
    id,
    name,
    inspirationBrand,
    inspiration,
  });
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";
  const cardImage = withCloudinaryTransforms(image, {
    width: upgradeImage ? 1200 : 720,
  });
  const displayPrice = formatINR(price);
  const isPriorityCard = prioritizeImage ?? index === 0;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUpgradeImage(true);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, []);

  const categoryLine = (() => {
    const labels = new Set<string>();

    categoryTags.forEach((tag) => {
      const value = (tag.label || tag.id || "").trim();
      if (value) labels.add(value);
    });

    categoryIds.forEach((id) => {
      const value = id
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
      if (value) labels.add(value);
    });

    if (labels.size === 0 && category) labels.add(category);

    return Array.from(labels).slice(0, 3).join(" / ");
  })();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDiscoverySet) {
      router.push(DISCOVERY_SET_PATH);
      return;
    }
    if (soldOut) {
      toast({
        title: "Currently sold out",
      });
      return;
    }
    addItem({ id, name, inspiration, category, image, price, size: "50ml" });
    toast({
      title: "Product added to cart",
    });
  };

  const handleProductClick = () => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "product_click",
          payload: {
            productId: id,
            productName: name,
            inspiration,
            productPath,
          },
        },
      }),
    );
  };

  return (
    <motion.article
      initial={disableEntranceAnimation ? false : { opacity: 0, y: 30 }}
      whileInView={disableEntranceAnimation ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={
        disableEntranceAnimation
          ? undefined
          : { duration: 0.6, delay: index * 0.1 }
      }
      className="group h-full"
    >
      <div className="flex h-full flex-col">
        <div className="relative mb-4 overflow-hidden bg-secondary shadow-[0_12px_30px_rgba(12,14,18,0.12)] sm:mb-5">
          <Link
            href={productPath}
            className="block"
            onMouseEnter={() => router.prefetch(productPath)}
            onClick={handleProductClick}
          >
            <Image
              src={cardImage}
              alt={name}
              width={400}
              height={533}
              sizes="(max-width: 640px) 90vw, (max-width: 1200px) 33vw, 25vw"
              quality={upgradeImage ? 92 : 75}
              priority={isPriorityCard}
              fetchPriority={isPriorityCard ? "high" : "auto"}
              className="w-full aspect-[3/4] object-cover transition-transform duration-700 md:group-hover:scale-105"
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-500" />
          </Link>
          {(isDiscoverySet || bestSeller || humeSpecial || limitedStock || soldOut) && (
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {isDiscoverySet && (
                <span className="inline-flex items-center bg-[#2a2116] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f7d79b]">
                  Discovery Set
                </span>
              )}
              {soldOut && (
                <span className="inline-flex items-center bg-red-600 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white">
                  Sold Out
                </span>
              )}
              {bestSeller && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-foreground text-background">
                  Best Seller
                </span>
              )}
              {humeSpecial && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-emerald-100 text-emerald-800">
                  HUME Special
                </span>
              )}
              {limitedStock && (
                <span className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-amber-200/90 text-amber-900">
                  Limited Stock
                </span>
              )}
            </div>
          )}
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/45 bg-white/18 text-white shadow-[0_18px_36px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/5 backdrop-blur-md backdrop-saturate-150 transition-all duration-300 active:translate-y-0 sm:h-12 sm:w-12 ${
              soldOut
                ? "cursor-not-allowed opacity-60"
                : "md:hover:-translate-y-0.5 md:hover:border-white/60 md:hover:bg-white/24 md:hover:shadow-[0_24px_46px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,0.68)]"
            }`}
            aria-label={
              isDiscoverySet
                ? "Build Discovery Set"
                : soldOut
                  ? `${name} is sold out`
                  : `Add ${name} to bag`
            }
            title={isDiscoverySet ? "Build Discovery Set" : soldOut ? "Sold out" : "Add to bag"}
          >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.12)_38%,rgba(255,255,255,0.04)_100%)]" />
            <span className="pointer-events-none absolute -left-5 -top-5 h-12 w-12 rounded-full bg-white/35 blur-xl" />
            <span className="relative text-[1.85rem] font-light leading-none -mt-[3px] drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]">
              {soldOut ? "×" : "+"}
            </span>
          </button>
        </div>

        <div className="flex flex-1 flex-col">
          <Link
            href={productPath}
            className="block min-h-[8rem] sm:min-h-[8.45rem]"
            onMouseEnter={() => router.prefetch(productPath)}
            onClick={handleProductClick}
          >
            <p className="mb-2 min-h-[2rem] text-[9px] uppercase leading-[1.45] tracking-[0.18em] text-muted-foreground/75 sm:text-[10px]">
              {categoryLine}
            </p>
            <h3 className="mb-1 line-clamp-2 font-serif text-[1.22rem] font-light leading-tight tracking-wide md:text-2xl">
              {name}
            </h3>
            <p className="line-clamp-2 text-[0.86rem] italic leading-snug text-muted-foreground/90 sm:text-[0.95rem]">
              Inspired by {inspiration}
            </p>
          </Link>
          {!hidePrice && (
            <div className="mt-3">
              <p className="text-[1.28rem] leading-none font-light tracking-tight text-foreground/90 sm:text-[1.35rem]">
                {displayPrice}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default PerfumeCard;
