"use client";

import { motion } from "framer-motion";
import { LiaCartPlusSolid } from "react-icons/lia";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
}: PerfumeCardProps) => {
  const { addItem } = useCart();
  const router = useRouter();
  const productPath = getProductPath({
    id,
    name,
    inspirationBrand,
    inspiration,
  });
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";
  const cardImage = withCloudinaryTransforms(image, { width: 515 });
  const displayPrice = formatINR(price);
  const isPriorityCard = index === 0;

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

    return Array.from(labels).slice(0, 3).join(" • ");
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
        <div className="relative overflow-hidden bg-secondary mb-6">
          <Image
            src={cardImage}
            alt={name}
            width={400}
            height={533}
            sizes="(max-width: 640px) 90vw, (max-width: 1200px) 33vw, 25vw"
            quality={60}
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
            className="absolute bottom-2 right-2 z-10 inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
            aria-label={`Add ${name} to bag`}
          >
            <LiaCartPlusSolid className="h-[22px] w-[22px] sm:h-[22px] sm:w-[22px]" />
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
