"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import type { AccessoryData } from "@/data/accessories";
import { ShieldCheck, Truck } from "lucide-react";

export default function AccessoryDetailClient({ accessory }: { accessory: AccessoryData }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(accessory.images[0]);

  const handleAddToBag = () => {
    addItem({
      id: accessory.id,
      name: accessory.name,
      inspiration: accessory.shortDescription,
      category: "Accessory",
      image: accessory.images[0],
      price: accessory.price,
      size: "Accessory",
    });
    toast({
      title: "Added to bag",
      description: `${accessory.name} has been added to your bag.`,
    });
  };

  return (
    <section className="pt-20 pb-16 md:pt-20 md:pb-24">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="relative aspect-square border border-border bg-secondary/20">
              <Image
                src={activeImage}
                alt={accessory.name}
                fill
                sizes="(max-width: 768px) 90vw, 42vw"
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {accessory.images.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`relative aspect-square border ${img === activeImage ? "border-foreground" : "border-border"}`}
                >
                  <Image src={img} alt={accessory.name} fill className="object-cover" sizes="160px" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:pt-10">
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="inline-flex items-center border border-foreground/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground">
                Accessories
              </span>
              {accessory.isComplementary && (
                <span className="inline-flex items-center border border-emerald-400/50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-emerald-700">
                  Complimentary
                </span>
              )}
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground mb-2">
                HUME ACCESSORY
              </p>
              <h1 className="font-serif text-[2.5rem] md:text-5xl font-light italic tracking-tight mb-2">
                {accessory.name}
              </h1>
              <p className="text-[0.95rem] italic text-muted-foreground mb-4">
                {accessory.shortDescription}
              </p>
              <p className="text-[2.05rem] leading-none text-center font-light mb-8">{formatINR(accessory.price)}</p>
            </div>

            <p className="text-body text-muted-foreground leading-relaxed mb-8">{accessory.description}</p>

            {accessory.isComplementary ? (
              <p className="text-sm text-emerald-700 mb-4">
                Complimentary item. Also unlocks automatically at eligible cart totals.
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleAddToBag}
              className="w-full border border-border px-8 py-4 text-xs uppercase tracking-[0.3em] hover:bg-foreground hover:text-background transition-colors"
            >
              Add To Bag
            </button>

            <div className="border border-border/70 bg-secondary/20 p-4 sm:p-5 mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="mt-0.5 text-foreground/75" />
                  <p className="text-body">Quality checked and safely packed.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck size={16} className="mt-0.5 text-foreground/75" />
                  <p className="text-body">Dispatched within 24 hours on ready stock.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
