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
  hidePrice?: boolean;
  prioritizeImage?: boolean;
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
  hidePrice = false,
  prioritizeImage,
}: PerfumeCardProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const [upgradeImage, setUpgradeImage] = useState(false);
  const productPath = getProductPath({
    id,
    name,
    inspirationBrand,
    inspiration,
  });
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";
  const cardImage = withCloudinaryTransforms(image, { width: upgradeImage ? 1200 : 720 });
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

    return Array.from(labels).slice(0, 3).join("  |  ");
  })();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, inspiration, category, image, price, size: "50ml" });
    toast({
      title: "Added to bag",
      description: `${name} has been added to your bag.`,
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full"
    >
      <Link
        href={productPath}
        className="block h-full"
        onMouseEnter={() => router.prefetch(productPath)}
        onClick={handleProductClick}
      >
        <div className="relative mb-6 overflow-hidden bg-secondary shadow-[0_12px_30px_rgba(12,14,18,0.12)]">
          <Image
            src={cardImage}
            alt={name}
            width={400}
            height={533}
            sizes="(max-width: 640px) 90vw, (max-width: 1200px) 33vw, 25vw"
            quality={upgradeImage ? 92 : 75}
            priority={isPriorityCard}
            fetchPriority={isPriorityCard ? "high" : "auto"}
            className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-105"
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
          {(bestSeller || humeSpecial || limitedStock) && (
            <div className="absolute left-3 top-3 flex flex-col gap-2">
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
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all duration-500" />
          <button
            onClick={handleAddToCart}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-[14px] border border-[#1f2a36]/75 bg-[#1f2a36] text-white ring-1 ring-white/65 shadow-[0_16px_32px_rgba(20,26,35,0.42)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-[#253445] hover:shadow-[0_20px_36px_rgba(20,26,35,0.5)]"
            aria-label={`Add ${name} to bag`}
          >
            <span className="text-[2rem] leading-none font-light -mt-[2px]">+</span>
          </button>
        </div>
        <div className="flex flex-col h-[170px]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/80 mb-2">
            {categoryLine}
          </p>
          <h3 className="font-serif text-[1.25rem] md:text-2xl font-light tracking-wide mb-1">
            {name}
          </h3>
          <p className="h-14 overflow-hidden text-[0.86rem] sm:text-[clamp(0.92rem,0.95vw,1.25rem)] italic text-muted-foreground/90">
            Inspired by {inspiration}
          </p>
          {!hidePrice && (
            <div className="flex items-center justify-between gap-3 ">
              <p
                className="text-[1.35rem] leading-none font-light tracking-tight text-foreground/90"
              >
                {displayPrice}
              </p>
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
};

export default PerfumeCard;

