"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sun, Star, Sparkles, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useRouter } from "next/navigation";
import { celebrityFavorites } from "@/lib/celebrity-favorites";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getClientCachedProducts } from "@/lib/client-products-cache";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";
import { PERFUME_MATURATION_PATH } from "@/lib/perfume-maturation";

type FilterType = "nature" | "gender" | "occasion" | "celebrity";

interface ShopItem {
  label: string;
  description: string;
  filterType: FilterType;
  image?: string;
  href?: string;
}

interface ShopSection {
  title: string;
  icon: React.ElementType;
  items: ShopItem[];
}

const shopSections: ShopSection[] = [
  {
    title: "Discover",
    icon: Sparkles,
    items: [
      {
        label: "Discovery Set",
        description: "Build your own 10 x 3ml sample set",
        filterType: "occasion",
        href: DISCOVERY_SET_PATH,
      },
      {
        label: "Scent Quiz (60s)",
        description: "Find your fragrance in one minute",
        filterType: "occasion",
        href: "/scent-quiz",
      },
      {
        label: "15 ml kit",
        description: "Create your own 5 x 15ml set",
        filterType: "occasion",
        href: "/kit-pack",
      },
      {
        label: "Fresh Perfume Guide",
        description: "Why perfumes mature over 2-4 weeks",
        filterType: "occasion",
        href: PERFUME_MATURATION_PATH,
      },
    ],
  },
  {
    title: "By Occasion",
    icon: Sun,
    items: [
      { label: "Gym", description: "Fresh and energetic", filterType: "occasion" },
      { label: "Daily Wear", description: "Clean and versatile", filterType: "occasion" },
      { label: "Office", description: "Subtle and sophisticated", filterType: "occasion" },
      { label: "Date Night", description: "Seductive and alluring", filterType: "occasion" },
      { label: "Party", description: "Bold and unforgettable", filterType: "occasion" },
      { label: "Formal", description: "Elegant and refined", filterType: "occasion" },
    ],
  },
  {
    title: "Celebrities' Favorite",
    icon: Star,
    items: celebrityFavorites.slice(0, 4).map((celebrity) => ({
      label: celebrity.label,
      description: celebrity.description,
      filterType: "celebrity" as const,
      image: celebrity.image,
    })),
  },
];

interface ShopMegaMenuProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const ShopMegaMenu = ({ isOpen, onOpen, onClose }: ShopMegaMenuProps) => {
  const router = useRouter();
  const [celebImageByLabel, setCelebImageByLabel] = useState<Record<string, string>>({});
  const [dbGenderItems, setDbGenderItems] = useState<ShopItem[]>([]);
  const [dbOccasionItems, setDbOccasionItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    let mounted = true;
    getClientCachedProducts()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const byId = new Map<string, { woreByImageUrl?: string }>(
          data.map((p: { id: string; woreByImageUrl?: string }) => [p.id, p])
        );

        const genderSet = new Set<string>();
        const occasionSet = new Set<string>();
        data.forEach((p: { gender?: string; longevity?: { occasion?: string[] } }) => {
          if (p.gender) genderSet.add(p.gender);
          (p.longevity?.occasion ?? []).forEach((o) => {
            const v = String(o || "").trim();
            if (v) occasionSet.add(v);
          });
        });

        const preferredGenderOrder = ["Men", "Women", "Unisex"];
        const genderItems = preferredGenderOrder
          .filter((g) => genderSet.has(g))
          .map((g) => ({ label: g, description: "", filterType: "gender" as const }));

        const preferredOccasionOrder = ["Gym", "Daily Wear", "Office", "Date Night", "Party", "Formal"];
        const preferredOccasions = preferredOccasionOrder.filter((o) => occasionSet.has(o));
        const remainingOccasions = Array.from(occasionSet)
          .filter((o) => !preferredOccasionOrder.includes(o))
          .sort((a, b) => a.localeCompare(b));
        const occasionItems = [...preferredOccasions, ...remainingOccasions]
          .slice(0, 6)
          .map((o) => ({ label: o, description: "", filterType: "occasion" as const }));

        const mapped = Object.fromEntries(
          celebrityFavorites.map((c) => [
            c.label,
            byId.get(c.perfumeIds[0])?.woreByImageUrl || c.image,
          ])
        );
        setDbGenderItems(genderItems);
        setDbOccasionItems(occasionItems);
        setCelebImageByLabel(mapped);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const renderedSections = useMemo(
    () =>
      shopSections.map((section) =>
        section.title === "Celebrities' Favorite"
          ? {
              ...section,
              items: section.items.map((item) => ({
                ...item,
                image: celebImageByLabel[item.label] || item.image,
              })),
            }
          : section
      ),
    [celebImageByLabel]
  );

  const genderItems =
    dbGenderItems.length > 0
      ? dbGenderItems
      : [
          { label: "Men", description: "", filterType: "gender" as const },
          { label: "Women", description: "", filterType: "gender" as const },
          { label: "Unisex", description: "", filterType: "gender" as const },
        ];

  const occasionItems =
    dbOccasionItems.length > 0
      ? dbOccasionItems
      : [
          { label: "Gym", description: "", filterType: "occasion" as const },
          { label: "Daily Wear", description: "", filterType: "occasion" as const },
          { label: "Office", description: "", filterType: "occasion" as const },
          { label: "Date Night", description: "", filterType: "occasion" as const },
          { label: "Party", description: "", filterType: "occasion" as const },
          { label: "Formal", description: "", filterType: "occasion" as const },
        ];

  const handleItemClick = (item: ShopItem) => {
    onClose();
    if (item.href) {
      showNavigationLoadingToast();
      router.push(item.href);
      return;
    }
    if (item.filterType === "celebrity") {
      showNavigationLoadingToast();
      router.push(`/celebrities-favorites?celebrity=${encodeURIComponent(item.label)}`);
      return;
    }
    showNavigationLoadingToast();
    router.push(`/shop?filter=${item.filterType}&value=${encodeURIComponent(item.label)}`);
  };

  return (
    <div className="relative" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        onClick={() => (isOpen ? onClose() : onOpen())}
        className="flex items-center gap-1 text-caption font-bold link-underline text-foreground hover:text-foreground transition-luxury cursor-pointer"
      >
        Shop
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-[72px] z-50 w-[min(1380px,calc(100vw-80px))] -translate-x-1/2 bg-background border border-border shadow-lg"
          >
            <div className="px-8 py-10">
              <div className="grid grid-cols-3 gap-10">
                {renderedSections.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 mb-5">
                      {section.title !== "Discover" && section.title !== "By Occasion" ? (
                        <section.icon size={16} className="text-muted-foreground" />
                      ) : null}
                      {section.title === "Celebrities' Favorite" ? (
                        <button
                          onClick={() => {
                            onClose();
                            showNavigationLoadingToast();
                            router.push("/celebrities-favorites");
                          }}
                          className="text-caption text-foreground hover:text-muted-foreground transition-luxury flex items-center gap-1.5 cursor-pointer group"
                        >
                          {section.title}
                          <ExternalLink size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                      ) : section.title === "Discover" || section.title === "By Occasion" ? null : (
                        <h3 className="text-caption text-foreground">{section.title}</h3>
                      )}
                    </div>
                    {section.title === "By Occasion" ? (
                      <div className="space-y-5">
                        <div>
                          <h4 className="mb-3 text-caption text-foreground">BY GENDER</h4>
                          <ul className="grid grid-cols-3 gap-3">
                            {genderItems.map((item) => (
                              <li key={`gender-${item.label}`}>
                                <button
                                  onClick={() => handleItemClick(item)}
                                  className="h-12 w-full border border-border bg-background text-sm font-light text-foreground hover:bg-secondary/30 transition-luxury cursor-pointer"
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="mb-3 text-caption text-foreground">BY OCCASION</h4>
                          <ul className="grid grid-cols-2 gap-3">
                            {occasionItems.map((item) => (
                              <li key={item.label}>
                                <button
                                  onClick={() => handleItemClick(item)}
                                  className="h-12 w-full border border-border bg-background text-sm font-light text-foreground hover:bg-secondary/30 transition-luxury cursor-pointer"
                                >
                                  {item.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : section.title === "Celebrities' Favorite" ? (
                      <ul className="grid grid-cols-2 gap-2.5">
                        {section.items.map((item) => (
                          <li key={item.label}>
                            <button
                              onClick={() => handleItemClick(item)}
                              className="group block w-full max-w-[150px] text-left cursor-pointer"
                            >
                              {item.image ? (
                                <ImageWithFallback
                                  src={withCloudinaryTransforms(item.image, { width: 320 })}
                                  fallbackSrc="/images/celebrities/srk.png"
                                  alt={item.label}
                                  width={320}
                                  height={427}
                                  sizes="150px"
                                  className="w-full aspect-[3/4] object-cover border border-border"
                                  loading="lazy"
                                />
                              ) : null}
                              <span className="mt-1.5 block text-[0.95rem] font-light text-foreground group-hover:text-muted-foreground transition-luxury">
                                {item.label}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div>
                        <ul className="space-y-3">
                          {section.items.map((item) => (
                            <li key={item.label}>
                            {item.href ? (
                              <button
                                onClick={() => handleItemClick(item)}
                                className="group flex w-full items-center justify-between border border-zinc-800 bg-zinc-950 px-4 py-3 text-left text-white cursor-pointer transition-luxury hover:bg-zinc-900"
                              >
                                <span className="font-serif text-[1.25rem] leading-none tracking-wide">
                                  {item.label === "15 ml kit" ? (
                                    <>
                                      15 ml kit{" "}
                                      <span className="text-[0.85rem] align-middle text-white/80">
                                        (pack of 5)
                                      </span>
                                    </>
                                  ) : (
                                    item.label
                                  )}
                                </span>
                                <span className="text-[2rem] leading-none text-white/85">
                                  →
                                </span>
                              </button>
                            ) : (
                                <button
                                  onClick={() => handleItemClick(item)}
                                  className="group block text-left w-full cursor-pointer"
                                >
                                  <span className="flex items-center gap-3">
                                    {item.image ? (
                                      <ImageWithFallback
                                        src={withCloudinaryTransforms(item.image, { width: 120 })}
                                        fallbackSrc="/images/celebrities/srk.png"
                                        alt={item.label}
                                        width={48}
                                        height={48}
                                        sizes="48px"
                                        className="w-12 h-12 rounded-sm object-cover border border-border"
                                        loading="lazy"
                                      />
                                    ) : null}
                                    <span>
                                      <span className="block text-sm font-light text-foreground group-hover:text-muted-foreground transition-luxury">
                                        {item.label}
                                      </span>
                                      <span className="block text-xs text-muted-foreground/70 font-light mt-0.5">
                                        {item.description}
                                      </span>
                                    </span>
                                  </span>
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>

                        {section.title === "Discover" ? (
                          <div className="mt-10 border-t border-border">
                            <button
                              onClick={() => {
                                onClose();
                                showNavigationLoadingToast();
                                router.push("/bestseller");
                              }}
                              className="block w-full border-b border-border py-3 text-left font-serif text-[1.5rem] leading-none text-foreground hover:text-muted-foreground transition-luxury"
                            >
                              Best Sellers
                            </button>
                            <button
                              onClick={() => {
                                onClose();
                                showNavigationLoadingToast();
                                router.push("/hume-special");
                              }}
                              className="block w-full border-b border-border py-3 text-left font-serif text-[1.5rem] leading-none text-foreground hover:text-muted-foreground transition-luxury"
                            >
                              HUME Specials
                            </button>
                            <button
                              onClick={() => {
                                onClose();
                                showNavigationLoadingToast();
                                router.push("/shop");
                              }}
                              className="block w-full py-3 text-left font-serif text-[1.5rem] leading-none text-foreground hover:text-muted-foreground transition-luxury"
                            >
                              Shop All
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { shopSections };
export type { FilterType };
export default ShopMegaMenu;

