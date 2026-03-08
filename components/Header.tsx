"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ExternalLink, ChevronDown, Check } from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCart } from "@/context/CartContext";
import ShopMegaMenu from "./ShopMegaMenu";
import type { FilterType } from "./ShopMegaMenu";
import SearchOverlay from "./SearchOverlay";
import { celebrityFavorites } from "@/lib/celebrity-favorites";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  getRegionConfigFromPrefix,
  stripRegionPrefix,
  type RegionPrefix,
  withRegionPrefix,
} from "@/lib/region-routing";

const STOREFRONT_OPTIONS: Array<{ label: string; name: string; prefix: RegionPrefix }> = [
  { label: "IN", name: "India", prefix: "" },
  { label: "USA", name: "United States", prefix: "us" },
  { label: "CA", name: "Canada", prefix: "ca" },
  { label: "EU", name: "Europe", prefix: "eu" },
  { label: "AU", name: "Australia", prefix: "au" },
  { label: "UAE", name: "United Arab Emirates", prefix: "ae" },
  { label: "SA", name: "Saudi Arabia", prefix: "sa" },
];

const RegionSwitcher = ({
  value,
  onChange,
  compact = false,
}: {
  value: RegionPrefix;
  onChange: (prefix: RegionPrefix) => void;
  compact?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const selected = STOREFRONT_OPTIONS.find((opt) => opt.prefix === value) ?? STOREFRONT_OPTIONS[0];

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[11px] font-semibold tracking-[0.08em] text-foreground shadow-sm hover:bg-secondary/40 ${
          compact ? "h-8" : "h-8"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Choose storefront region"
      >
        {selected.label}
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+6px)] z-[120] min-w-[120px] overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          <ul className="max-h-64 overflow-auto py-1" role="listbox">
            {STOREFRONT_OPTIONS.map((option) => {
              const active = option.prefix === value;
              return (
                <li key={`region-${option.label}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onChange(option.prefix);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className={`ml-2 text-[11px] ${active ? "text-background/80" : "text-muted-foreground"}`}>
                      {option.name}
                    </span>
                    {active ? <Check size={13} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [celebImageByLabel, setCelebImageByLabel] = useState<Record<string, string>>({});
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const { prefix: selectedStorefront } = stripRegionPrefix(pathname || "/");

  const displayCartCount = totalItems > 99 ? "99+" : `${totalItems}`;

  useEffect(() => {
    let mounted = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const byId = new Map<string, { woreByImageUrl?: string }>(
          data.map((p: { id: string; woreByImageUrl?: string }) => [p.id, p])
        );
        const mapped = Object.fromEntries(
          celebrityFavorites.map((c) => [
            c.label,
            byId.get(c.perfumeIds[0])?.woreByImageUrl || c.image,
          ])
        );
        setCelebImageByLabel(mapped);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  const handleStorefrontChange = (prefix: RegionPrefix) => {
    const { pathWithoutPrefix } = stripRegionPrefix(pathname || "/");
    const targetPath = withRegionPrefix(pathWithoutPrefix || "/", prefix);
    const config = getRegionConfigFromPrefix(prefix);
    const expires = 60 * 60 * 24 * 30;
    document.cookie = `hf_region_prefix=${prefix}; path=/; max-age=${expires}; samesite=lax`;
    document.cookie = `hf_country=${config.country}; path=/; max-age=${expires}; samesite=lax`;
    document.cookie = `hf_region=${config.region}; path=/; max-age=${expires}; samesite=lax`;
    document.cookie = `hf_currency=${config.currency}; path=/; max-age=${expires}; samesite=lax`;
    document.cookie = `hf_manual_region=1; path=/; max-age=${expires}; samesite=lax`;
    setIsMenuOpen(false);
    router.push(targetPath);
  };

  const handleMobileFilterClick = (filterType: FilterType, value: string, href?: string) => {
    setIsMenuOpen(false);
    if (href) {
      router.push(href);
      return;
    }
    if (filterType === "celebrity") {
      router.push(`/celebrities-favorites?celebrity=${encodeURIComponent(value)}`);
      return;
    }
    router.push(`/shop?filter=${filterType}&value=${encodeURIComponent(value)}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container-luxury">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="hidden md:block">
              <ShopMegaMenu
                isOpen={isShopOpen}
                onOpen={() => setIsShopOpen(true)}
                onClose={() => setIsShopOpen(false)}
              />
            </div>
            <nav className="hidden md:flex items-center gap-5">
              <Link
                href="/hume-special"
                className="relative text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Hume Special
              </Link>
              <Link
                href="/bestseller"
                className="relative text-[11px] uppercase tracking-[0.22em] text-muted-foreground hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                Best Seller
              </Link>
            </nav>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl md:text-3xl font-light tracking-widest">
              HUME
            </span>
            <span className="text-caption text-muted-foreground hidden sm:inline">
              Fragrance
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <nav className="hidden md:flex items-center gap-5">
              <Link
                href="/kit-pack"
                className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-[40%] after:bg-current after:transition-all after:duration-300 hover:after:w-full"
              >
                Build Your Kit
              </Link>
              <Link
                href="/refill-subscription"
                className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-[40%] after:bg-current after:transition-all after:duration-300 hover:after:w-full"
              >
                Refill
              </Link>
            </nav>
            <div className="hidden md:block">
              <RegionSwitcher value={selectedStorefront} onChange={handleStorefrontChange} />
            </div>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("hume:tracking", {
                      detail: { eventType: "cart_open", payload: { source: "header" } },
                    })
                  );
                }
                setIsCartOpen(true);
              }}
              className="relative p-2 hover:bg-muted transition-colors"
              aria-label="Open cart"
            >
              <motion.span
                initial={{ x: 0, rotate: 0 }}
                animate={
                  totalItems > 0
                    ? {
                        x: [0, 0, 0, -2, 2, -1, 1, 0],
                        rotate: [0, 0, 0, -6, 6, -3, 3, 0],
                      }
                    : { x: 0, rotate: 0 }
                }
                transition={
                  totalItems > 0
                    ? {
                        duration: 2.4,
                        delay: 0.8,
                        repeat: Infinity,
                        repeatDelay: 0,
                        times: [0, 0.62, 0.74, 0.82, 0.88, 0.93, 0.97, 1],
                      }
                    : { duration: 0.2 }
                }
                className="inline-flex"
              >
                <HiOutlineShoppingBag size={18} />
              </motion.span>
              {totalItems > 0 && (
                <motion.span
                  key={`badge-desktop-${totalItems}`}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: [1, 1.24, 1] }}
                  transition={{ duration: 0.25 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[10px] font-semibold flex items-center justify-center shadow-[0_3px_10px_rgba(16,185,129,0.45)] ring-2 ring-background"
                >
                  {displayCartCount}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100dvh" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] md:hidden"
          >
            <div className="h-full overflow-y-auto bg-background text-foreground">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
                <span className="font-serif text-[1.65rem] leading-none tracking-[0.2em]">HUME</span>
                <RegionSwitcher value={selectedStorefront} onChange={handleStorefrontChange} compact />
              </div>

              <div className="px-6 py-5 space-y-6">
                <section>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/shop");
                      }}
                      className="w-full border-b border-border pb-2 text-left"
                    >
                      <span className="inline-flex w-full items-center justify-between font-serif text-[1.45rem] italic leading-none">
                        <span>Shop All</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/hume-special");
                      }}
                      className="w-full border-b border-border pb-2 text-left"
                    >
                      <span className="inline-flex w-full items-center justify-between font-serif text-[1.45rem] italic leading-none">
                        <span>HUME Specials</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/bestseller");
                      }}
                      className="w-full border-b border-border pb-2 text-left"
                    >
                      <span className="inline-flex w-full items-center justify-between font-serif text-[1.45rem] italic leading-none">
                        <span>Best Sellers</span>
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/refill-subscription");
                      }}
                      className="w-full border-b border-border pb-2 text-left"
                    >
                      <span className="inline-flex w-full items-center justify-between font-serif text-[1.45rem] italic leading-none">
                        <span>Refill Program</span>
                      </span>
                    </button>
                  </div>
                </section>

                <section>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/scent-quiz");
                      }}
                      className="w-full border border-foreground bg-foreground px-3 py-2 text-left text-background"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-[1.18rem]">
                          Scent Quiz <span className="text-[0.65em] italic opacity-80">(60s)</span>
                        </p>
                        <span className="text-[1.45rem] opacity-70">→</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/kit-pack");
                      }}
                      className="w-full border border-foreground/45 px-3 py-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-[1.18rem]">
                          Build Your Kit <span className="text-[0.65em] text-muted-foreground">Pack of 4</span>
                        </p>
                        <span className="text-[1.45rem] text-muted-foreground">→</span>
                      </div>
                    </button>
                  </div>
                </section>

                <section>
                  <p className="text-[11px] uppercase tracking-[0.38em] text-muted-foreground mb-2">
                    By Occasion
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {["Gym", "Daily Wear", "Office", "Date Night", "Party", "Formal"].map((occasion) => (
                      <button
                        key={occasion}
                        onClick={() => handleMobileFilterClick("occasion", occasion)}
                        className="inline-flex min-h-7 items-center justify-center border border-border px-2 text-center text-xs font-light tracking-tight hover:bg-muted/50"
                      >
                        {occasion}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/celebrities-favorites");
                    }}
                    className="mb-5 flex w-full  items-center justify-between text-left"
                    aria-label="Open celebrities favorite"
                  >
                    <p className="text-[11px] uppercase tracking-[0.38em] text-muted-foreground">
                      Celebrities&apos; Favorite
                    </p>
                    <span className="text-muted-foreground">
                      <ExternalLink size={16} />
                    </span>
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                    {celebrityFavorites.slice(0, 2).map((celeb) => (
                      <button
                        key={celeb.label}
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push(`/celebrities-favorites?celebrity=${encodeURIComponent(celeb.label)}`);
                        }}
                        className="text-left"
                      >
                        <img
                          src={withCloudinaryTransforms(celebImageByLabel[celeb.label] || celeb.image, { width: 320 })}
                          alt={celeb.label}
                          className="aspect-[3/4] w-full object-cover border border-border/60"
                          loading="lazy"
                          decoding="async"
                        />
                        <p className="mt-2 text-[14px] text-gray-700 leading-none">{celeb.label}</p>
                        <p className="mt-1 text-[5px] uppercase tracking-[0.14em] text-muted-foreground">
                          {celeb.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
};

export default Header;
