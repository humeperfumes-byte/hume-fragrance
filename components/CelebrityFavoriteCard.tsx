"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-route";

interface CelebrityFavoriteCardProps {
  id: string;
  name: string;
  inspiration: string;
  inspirationBrand?: string;
  category: string;
  categoryTags?: Array<{ id: string; label?: string }>;
  categoryIds?: string[];
  image: string;
  price: number;
  celebrityName?: string;
  celebrityImage?: string;
  index?: number;
}

function getStyleTags(category: string, inspiration: string) {
  const tags = [category.toUpperCase()];
  const spicyKeywords = ["spice", "pepper", "khamrah", "viking"];
  const source = `${category} ${inspiration}`.toLowerCase();
  if (spicyKeywords.some((token) => source.includes(token)) && !tags.includes("SPICY")) {
    tags.push("SPICY");
  }
  return tags;
}

function getDisplayCategories(
  category: string,
  categoryTags: Array<{ id: string; label?: string }> = [],
  categoryIds: string[] = []
) {
  const labelSet = new Set<string>();

  categoryTags.forEach((tag) => {
    const value = (tag.label || tag.id || "").trim();
    if (value) labelSet.add(value.toUpperCase());
  });

  categoryIds.forEach((id) => {
    const value = id
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
    if (value) labelSet.add(value.toUpperCase());
  });

  if (labelSet.size === 0 && category) {
    labelSet.add(category.toUpperCase());
  }

  return Array.from(labelSet).slice(0, 3);
}

export default function CelebrityFavoriteCard({
  id,
  name,
  inspiration,
  inspirationBrand = "",
  category,
  categoryTags = [],
  categoryIds = [],
  image,
  price,
  celebrityName,
  celebrityImage,
  index = 0,
}: CelebrityFavoriteCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const mappedTags = getDisplayCategories(category, categoryTags, categoryIds);
  const tags = mappedTags.length > 0 ? mappedTags : getStyleTags(category, inspiration);
  const productFirst = index % 2 === 0;
  const productPath = getProductPath({ id, name, inspirationBrand, inspiration });
  const productImage = withCloudinaryTransforms(image, { width: index === 0 ? 560 : 480 });
  const celebPortrait = withCloudinaryTransforms(celebrityImage || "https://placehold.co/600x600?text=Celeb", {
    width: index === 0 ? 560 : 480,
  });
  const displayPrice = formatINR(price);
  const prioritizeMedia = index === 0;

  const handleAddToCart = () => {
    addItem({ id, name, inspiration, category, image, price, size: "50ml" });
    toast({
      title: "Added to bag",
      description: `${name} has been added to your bag.`,
    });
  };

  return (
    <article
      className="w-full max-w-[360px] mx-auto cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={() => router.push(productPath)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(productPath);
        }
      }}
    >
      {celebrityName && <p className="mb-3 font-serif text-[1.2rem] leading-none">{celebrityName}</p>}

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className={`relative block aspect-[3/4] bg-[#efefef] ${productFirst ? "order-1" : "order-2"}`}>
          <Image
            src={productImage}
            alt={name}
            fill
            sizes="(max-width: 640px) 44vw, 180px"
            priority={prioritizeMedia}
            fetchPriority={prioritizeMedia ? "high" : "auto"}
            quality={55}
            className="object-cover"
          />
        </div>

        <div className={`relative aspect-[3/4] bg-[#efefef] ${productFirst ? "order-2" : "order-1"}`}>
          <Image
            src={celebPortrait}
            alt={celebrityName || "Celebrity"}
            fill
            sizes="(max-width: 640px) 44vw, 180px"
            quality={55}
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground/80">
          {tags.join(" • ")}
        </p>

        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="font-serif text-[2.05rem] leading-none font-light">{name}</p>
          <p className="text-[2rem] leading-none font-light">
            {displayPrice}
          </p>
        </div>

        <p className="mt-2 text-[0.96rem] italic leading-snug text-muted-foreground/90">
          Inspired by {inspiration}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          className="mt-6 w-full border border-border bg-transparent py-5 text-[13px] tracking-[0.35em] uppercase transition-colors hover:bg-foreground hover:text-background"
        >
          Add To Bag
        </button>
      </div>
    </article>
  );
}
