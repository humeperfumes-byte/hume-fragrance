"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PerfumeData } from "@/data/perfumes";

export default function KitPackShowcase() {
  const { addItem } = useCart();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [allPerfumes, setAllPerfumes] = useState<PerfumeData[]>([]);
  const [loadingPerfumes, setLoadingPerfumes] = useState(true);
  const [slots, setSlots] = useState<Array<PerfumeData | null>>(
    Array.from({ length: 4 }, () => null)
  );

  useEffect(() => {
    let active = true;
    const loadPerfumes = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to load perfumes");
        const data = (await response.json()) as PerfumeData[];
        if (active) setAllPerfumes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load perfumes:", error);
      } finally {
        if (active) setLoadingPerfumes(false);
      }
    };
    loadPerfumes();
    return () => {
      active = false;
    };
  }, []);

  const kitPerfumes = useMemo(() => allPerfumes, [allPerfumes]);
  const kitTotal = 799;
  const isComplete = slots.every(Boolean);

  const openPickerForSlot = (index: number) => {
    setActiveSlotIndex(index);
    setIsPickerOpen(true);
  };

  const handleSelectPerfume = (perfume: PerfumeData) => {
    if (activeSlotIndex === null) return;
    setSlots((prev) => {
      const updated = [...prev];
      updated[activeSlotIndex] = perfume;
      return updated;
    });
    setIsPickerOpen(false);
  };

  const handleClearSlot = (index: number) => {
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  };

  const handleAddKitToCart = () => {
    if (!isComplete) return;
    const selected = slots.filter(Boolean) as PerfumeData[];
    const kitId = `kit-4pack-${selected.map((p) => p.id).join("-")}`;
    addItem({
      id: kitId,
      name: "Custom 4 x 20ml Kit",
      inspiration: selected.map((p) => p.name).join(", "),
      category: "Kit",
      image: "/images/kit.png",
      price: kitTotal,
      size: "20ml",
    });
    toast({
      title: "Kit added to bag",
      description: "Your 4 x 20ml kit has been added to your bag.",
    });
  };

  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-24">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-caption text-muted-foreground mb-3">Special Offer</p>
          <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
            Build Your Kit
          </h1>
          <p className="hidden md:block text-body text-muted-foreground max-w-2xl mx-auto">
            Create your own pack of 4 perfumes in 20ml size. Great for daily rotation,
            travel, and gifting.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative overflow-hidden border border-border p-8 md:p-12 bg-gradient-to-br from-zinc-900 text-white to-zinc-700"
        >
          <motion.div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10"
            animate={{ y: [0, 10, 0], x: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10"
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] mb-3 opacity-80">
                Limited-Time Kit
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-light mb-4">
                4 x 20ml Perfume Pack
              </h2>
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div
                  key={`slot-${index}`}
                  className="flex items-center justify-between gap-4 border border-white/25 bg-white/5 px-4 py-3"
                >
                  <button
                    type="button"
                    onClick={() => openPickerForSlot(index)}
                    className="flex items-center gap-3 text-left text-white"
                  >
                    <div className="h-10 w-10 border border-white/30 bg-white/10 flex items-center justify-center">
                      {slot ? (
                        <Image
                          src={withCloudinaryTransforms(slot.images?.[0] || "/images/logo.png?v=2", { width: 80 })}
                          alt={slot.name}
                          width={40}
                          height={40}
                          sizes="40px"
                          className="h-10 w-10 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Plus size={16} className="text-white/70" />
                      )}
                    </div>
                    <div>
                      {!slot && (
                        <p className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                          Slot {index + 1}
                        </p>
                      )}
                      <p className="font-serif text-base">
                        {slot ? slot.name : "Add 20ml perfume"}
                      </p>
                      {slot && (
                        <p className="text-xs text-white/60">
                          Inspired by {slot.inspiration}
                        </p>
                      )}
                    </div>
                  </button>
                  <div className="flex items-center gap-3">
                    {slot && (
                      <button
                        type="button"
                        onClick={() => handleClearSlot(index)}
                        className="w-8 h-8 flex items-center justify-center border border-white/30 hover:bg-white/10 transition-colors"
                        aria-label={`Remove slot ${index + 1}`}
                      >
                        <X size={14} className="text-white/80" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {isComplete && (
          <motion.button
            type="button"
            onClick={handleAddKitToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-8 w-full max-w-xl mx-auto py-4 bg-primary text-primary-foreground text-caption tracking-widest hover:bg-primary/90 transition-colors"
          >
            Add Kit to Bag
            {" "}— {formatINR(kitTotal)}
          </motion.button>
        )}
      </div>

      <Dialog open={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Choose a 20ml perfume</DialogTitle>
            <DialogDescription>Pick one perfume to fill this slot.</DialogDescription>
          </DialogHeader>

          {loadingPerfumes ? (
            <div className="py-10 text-center text-sm text-muted-foreground">Loading perfumes...</div>
          ) : kitPerfumes.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No perfumes available right now.
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {kitPerfumes.map((perfume) => (
                <button
                  key={perfume.id}
                  type="button"
                  onClick={() => handleSelectPerfume(perfume)}
                  className="text-left border border-border/60 bg-background hover:bg-secondary/20 transition-colors p-3"
                >
                  <Image
                    src={withCloudinaryTransforms(perfume.images?.[0] || "/images/logo.png?v=2", { width: 320 })}
                    alt={perfume.name}
                    width={320}
                    height={320}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    className="aspect-square w-full object-cover bg-secondary"
                    loading="lazy"
                  />
                  <div className="mt-3">
                    <p className="font-serif text-base">{perfume.name}</p>
                    <p className="text-xs text-muted-foreground">{perfume.category}</p>
                  </div>
                </button>
              ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
