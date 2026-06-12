"use client";

import { useEffect, useState } from "react";
import ImageWithFallback from "@/components/ImageWithFallback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, Search, Sparkles, ExternalLink, UserRound } from "lucide-react";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useCart } from "@/context/CartContext";
import ShopMegaMenu from "./ShopMegaMenu";
import type { FilterType } from "./ShopMegaMenu";
import SearchOverlay from "./SearchOverlay";
import { celebrityFavorites } from "@/lib/celebrity-favorites";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import { DISCOVERY_SET_PATH } from "@/lib/discovery-set";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();

  const displayCartCount = totalItems > 99 ? "99+" : `${totalItems}`;

  const navigateTo = (href: string) => {
    showNavigationLoadingToast();
    router.push(href);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMenuOpen]);

  const handleMobileFilterClick = (filterType: FilterType, value: string, href?: string) => {
    setIsMenuOpen(false);
    if (href) {
      navigateTo(href);
      return;
    }
    if (filterType === "celebrity") {
      navigateTo(`/celebrities-favorites?celebrity=${encodeURIComponent(value)}`);
      return;
    }
    navigateTo(`/shop?filter=${filterType}&value=${encodeURIComponent(value)}`);
  };

  const genderMenuItems = [
    { label: "Men", className: "bg-[#f4f8ff]", icon: "/images/icons/men-icon.png" },
    { label: "Women", className: "bg-[#fff6f7]", icon: "/images/icons/women-icon.png" },
    { label: "Unisex", className: "bg-[#f8fbf6]" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="container-luxury">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center md:hidden"
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

          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 leading-none">
            <span className="font-serif text-2xl md:text-3xl font-light leading-none tracking-widest">
              HUME
            </span>
            <span className="text-caption text-muted-foreground hidden leading-none sm:inline">
              Fragrance
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <nav className="hidden md:flex items-center gap-5">
              <Link
                href={DISCOVERY_SET_PATH}
                className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-[40%] after:bg-current after:transition-all after:duration-300 hover:after:w-full"
              >
                DISCOVERY SET
              </Link>
              <Link
                href="/kit-pack"
                className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-[40%] after:bg-current after:transition-all after:duration-300 hover:after:w-full"
              >
                15 ml kit
              </Link>
            </nav>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => navigateTo("/account")}
              className="hidden h-9 w-9 items-center justify-center hover:bg-muted transition-colors md:inline-flex"
              aria-label="Open account"
            >
              <UserRound size={18} />
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("hume:tracking", {
                      detail: { eventType: "cart_open", payload: { source: "header", itemCount: totalItems } },
                    })
                  );
                }
                setIsCartOpen(true);
              }}
              className="relative inline-flex h-9 w-9 items-center justify-center hover:bg-muted transition-colors"
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
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigateTo("/account");
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center"
                  aria-label="Open account"
                >
                  <UserRound size={19} />
                </button>
              </div>

              <div className="px-4 py-5 space-y-6">
                <section>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo("/shop");
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
                        navigateTo("/hume-special");
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
                        navigateTo("/bestseller");
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
                        navigateTo(DISCOVERY_SET_PATH);
                      }}
                      className="w-full border border-[#2a2116] bg-[#2a2116] px-3 py-2 text-left text-[#f7d79b]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-[1.18rem]">
                          Discovery Set <span className="text-[0.65em] text-[#f7d79b]/70">10 testers</span>
                        </p>
                        <span className="text-[1.45rem] opacity-75">→</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo("/kit-pack");
                      }}
                      className="w-full border border-[#2a2116] bg-[#2a2116] px-3 py-2 text-left text-[#f7d79b]"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-serif text-[1.18rem]">
                          15 ml kit <span className="text-[0.65em] text-[#f7d79b]/70">Pack of 5</span>
                        </p>
                        <span className="text-[1.45rem] opacity-75">→</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigateTo("/scent-quiz");
                      }}
                      className="mt-3 flex w-full items-center justify-between rounded-full border border-[#e5ddd1] bg-[#fbf8f2] px-3 py-2.5 text-left text-foreground shadow-[0_8px_18px_rgba(42,33,22,0.06)] transition-luxury hover:border-[#2a2116]/25 hover:bg-white"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a2116] text-[#f7d79b]">
                          <Sparkles size={13} />
                        </span>
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em]">
                          Scent Quiz
                        </p>
                        <span className="rounded-full border border-[#e1d7c8] bg-white/70 px-2 py-0.5 text-[10px] font-medium lowercase tracking-normal text-muted-foreground">
                          60s
                        </span>
                      </div>
                      <ArrowRight size={16} className="shrink-0 text-[#8b806f]" />
                    </button>
                  </div>
                </section>

                <section>
                  <div className="grid grid-cols-3 gap-2">
                    {genderMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleMobileFilterClick("gender", item.label)}
                        className={`group flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border border-[#e6e0d8] ${item.className} px-2 text-[#1f2933] transition-luxury hover:border-foreground/30 hover:bg-white max-[400px]:gap-1 max-[400px]:px-1.5 max-[350px]:gap-0.5 max-[350px]:px-1`}
                      >
                        {item.icon ? (
                          <ImageWithFallback
                            src={item.icon}
                            fallbackSrc={item.icon}
                            alt=""
                            width={500}
                            height={500}
                            sizes="26px"
                            className="pointer-events-none h-6 w-6 shrink-0 object-contain opacity-90 transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : null}
                        <span className="truncate text-[12px] font-medium leading-none tracking-[0.01em]">
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigateTo("/celebrities-favorites");
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
                          navigateTo(`/celebrities-favorites?celebrity=${encodeURIComponent(celeb.label)}`);
                        }}
                        className="text-left"
                      >
                        <ImageWithFallback
                          src={withCloudinaryTransforms(celeb.image, { width: 320 })}
                          fallbackSrc="/images/celebrities/srk.png"
                          alt={celeb.label}
                          width={320}
                          height={427}
                          sizes="50vw"
                          className="aspect-[3/4] w-full object-cover border border-border/60"
                          loading="lazy"
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
