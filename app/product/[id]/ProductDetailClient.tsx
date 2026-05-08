"use client";

import { motion } from "framer-motion";
import { MessageCircle, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import type { PerfumeData } from "@/data/perfumes";
import { formatINR } from "@/lib/currency";

export default function ProductDetailClient({ perfume }: { perfume: PerfumeData }) {
  const { addItem } = useCart();
  const whatsappMessage = encodeURIComponent(
    `Hello HUME Fragrance, I am interested in ${perfume.name} (${perfume.size}) inspired by ${perfume.inspirationBrand} ${perfume.inspiration}. Please help me order it.`,
  );

  const handleAddToCart = () => {
    addItem({
      id: perfume.id,
      name: perfume.name,
      inspiration: perfume.inspiration,
      category: perfume.category,
      image: perfume.images[0],
      price: perfume.price,
      size: perfume.size || "50ml",
    });
    toast({
      title: "Added to bag",
      description: `${perfume.name} has been added to your bag.`,
    });
  };

  return (
    <div className="mb-3 space-y-4 pb-10 md:mb-12 md:space-y-5 md:pb-0">
      <motion.button
        onClick={handleAddToCart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.28em] hover:opacity-90 transition-opacity"
      >
        Add to Bag
      </motion.button>

      <a
        href={`https://wa.me/919559024822?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366]/35 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/15"
      >
        <MessageCircle className="h-4 w-4" />
        Order or ask on WhatsApp
      </a>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-secondary/20 p-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            24h dispatch
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <ShieldCheck className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            IFRA safe
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <WalletCards className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            UPI / cards
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price</p>
            <p className="font-serif text-xl">{formatINR(perfume.price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="inline-flex min-w-[9rem] items-center justify-center bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.28em] text-background"
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
}
