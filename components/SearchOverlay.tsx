"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PerfumeData, getAverageRating } from "@/data/perfumes";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { getProductPath } from "@/lib/product-route";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<PerfumeData[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        setProducts(data);
      })
      .catch(() => {
        if (mounted) setProducts([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 60);
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.inspiration.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.gender.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.notes.top.some((n) => n.toLowerCase().includes(q)) ||
        p.notes.heart.some((n) => n.toLowerCase().includes(q)) ||
        p.notes.base.some((n) => n.toLowerCase().includes(q)) ||
        p.longevity.occasion.some((o) => o.toLowerCase().includes(q)) ||
        p.longevity.season.some((s) => s.toLowerCase().includes(q))
    );
  }, [query, products]);

  const topPicks = useMemo(() => products.slice(0, 6), [products]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-background"
        >
          <div className="container-luxury h-full flex flex-col">
            <div className="flex items-center gap-3 py-3 border-b border-border">
              <Search size={20} className="text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances, notes, occasions..."
                className="flex-1 bg-transparent text-lg md:text-xl font-light tracking-wide text-foreground placeholder:text-muted-foreground/50 outline-none"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted transition-colors shrink-0"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-1  min-h-80 pb-4">
              {query.trim().length > 0 ? (
                results.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                      {results.map((p) => (
                        <SearchResultCard key={p.id} perfume={p} onClose={onClose} query={query} />
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <p className="text-subheadline text-muted-foreground mb-2">No fragrances found</p>
                    <p className="text-body text-muted-foreground/70">Try another keyword</p>
                  </motion.div>
                )
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                    {topPicks.map((p) => (
                      <SearchResultCard key={p.id} perfume={p} onClose={onClose} />
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-caption text-muted-foreground mb-2">Popular Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {["Woody", "Fresh", "Oud", "Unisex", "Date Night", "Vanilla"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1.5 border border-border text-xs font-light text-foreground hover:bg-muted transition-luxury"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SearchResultCard = ({
  perfume,
  onClose,
  query,
}: {
  perfume: PerfumeData;
  onClose: () => void;
  query?: string;
}) => {
  const router = useRouter();
  const blurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjQyIiBmaWxsPSIjZWVlY2VjIi8+PC9zdmc+";
  const avgRating = getAverageRating(perfume.reviews);
  const productPath = getProductPath(perfume);
  const cardImage = withCloudinaryTransforms(perfume.images[0], { width: 320 });

  const highlightMatch = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="bg-accent text-accent-foreground">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <Link
      href={productPath}
      onClick={onClose}
      onMouseEnter={() => router.prefetch(productPath)}
      className="group flex gap-4 p-4 border border-border bg-background hover:bg-muted/50 transition-luxury"
    >
      <div className="w-20 h-24 md:w-24 md:h-32 shrink-0 overflow-hidden bg-secondary relative">
        <Image
          src={cardImage}
          alt={perfume.name}
          fill
          sizes="96px"
          quality={55}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium border border-border px-1.5 py-0.5">
            {perfume.gender}
          </span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium">
            {perfume.category}
          </span>
        </div>
        <h4 className="font-serif text-lg font-light tracking-wide text-foreground">{highlightMatch(perfume.name)}</h4>
        <p className="text-xs text-muted-foreground font-light mt-0.5">Inspired by {highlightMatch(perfume.inspiration)}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-light text-foreground">{formatINR(perfume.price)}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">* {avgRating}</span>
            <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchOverlay;
