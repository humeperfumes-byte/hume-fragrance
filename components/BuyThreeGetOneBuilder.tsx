"use client";

import Image from "next/image";
import { Check, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { PerfumeData } from "@/data/perfumes";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";

const REQUIRED_SELECTIONS = 4;

export default function BuyThreeGetOneBuilder({ products }: { products: PerfumeData[] }) {
  const { addItem, setIsCartOpen } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => products.find((product) => product.id === id)).filter(Boolean) as PerfumeData[],
    [products, selectedIds],
  );
  const freeProduct = selectedProducts.length === REQUIRED_SELECTIONS
    ? selectedProducts.reduce((lowest, product) => product.price < lowest.price ? product : lowest)
    : null;
  const retailTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);
  const offerTotal = retailTotal - (freeProduct?.price ?? 0);

  const toggleProduct = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((selectedId) => selectedId !== id);
      if (current.length >= REQUIRED_SELECTIONS) {
        toast({ title: "Your box already has four perfumes" });
        return current;
      }
      return [...current, id];
    });
  };

  const addOfferItemsToCart = () => {
    if (selectedProducts.length !== REQUIRED_SELECTIONS || !freeProduct) return;

    selectedProducts.forEach((product) => {
      addItem({
        id: product.id,
        name: product.name,
        inspiration: product.inspiration,
        category: product.category,
        image: product.images[0],
        price: product.price,
        size: "50ml",
      });
    });
    window.localStorage.setItem("hume_applied_coupon_code", "BUY3GET1");
    window.dispatchEvent(
      new CustomEvent("hume:apply-coupon", {
        detail: { code: "BUY3GET1" },
      }),
    );
    toast({
      title: "BUY3GET1 applied",
      description: `${freeProduct.name} is now free in your cart.`,
    });
    setIsCartOpen(true);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[#20130f] pb-20 pt-32 text-[#fff8ec] md:pb-28 md:pt-40">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_18%_20%,#8f362d_0,transparent_32%),radial-gradient(circle_at_84%_72%,#826326_0,transparent_30%)]" />
        <div className="absolute -right-24 top-16 h-72 w-72 rounded-full border border-[#d5ac63]/20" />
        <div className="absolute -right-8 top-32 h-52 w-52 rounded-full border border-[#d5ac63]/20" />
        <div className="container-luxury relative text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8c884]/40 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#e8c884]">
            <Sparkles className="h-3.5 w-3.5" /> Mix. Match. Save.
          </div>
          <h1 className="font-serif text-5xl font-light leading-[0.95] sm:text-6xl md:text-8xl">
            Buy 3. <span className="italic text-[#e8c884]">Get 1 Free.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm font-light leading-7 text-white/70 md:text-base">
            Choose four different HUME 50ml fragrances. The lowest-priced perfume in your box is on us.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 border-y border-white/15 py-5 text-center">
            <div><p className="font-serif text-2xl text-[#e8c884]">4</p><p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/55">Perfumes</p></div>
            <div className="border-x border-white/15"><p className="font-serif text-2xl text-[#e8c884]">50ml</p><p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/55">Each bottle</p></div>
            <div><p className="font-serif text-2xl text-[#e8c884]">1 Free</p><p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-white/55">Lowest priced</p></div>
          </div>
        </div>
      </section>

      <section className="pb-40 pt-14 md:pb-36 md:pt-20">
        <div className="container-luxury">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8e5429]">Build your box</p>
              <h2 className="font-serif text-4xl font-light md:text-5xl">Choose any four</h2>
            </div>
            <div className="flex items-center gap-2" aria-label={`${selectedIds.length} of 4 perfumes selected`}>
              {Array.from({ length: REQUIRED_SELECTIONS }).map((_, index) => (
                <span key={index} className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-colors ${index < selectedIds.length ? "border-[#7a2d25] bg-[#7a2d25] text-white" : "border-black/15 bg-white text-black/40"}`}>
                  {index < selectedIds.length ? <Check className="h-4 w-4" /> : index + 1}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-7 xl:grid-cols-4">
            {products.map((product, index) => {
              const isSelected = selectedIds.includes(product.id);
              const selectionNumber = selectedIds.indexOf(product.id) + 1;
              const isFree = freeProduct?.id === product.id;
              return (
                <button key={product.id} type="button" onClick={() => toggleProduct(product.id)} className="group text-left" aria-pressed={isSelected}>
                  <div className={`relative aspect-[3/4] overflow-hidden bg-[#ece7df] transition-all duration-300 ${isSelected ? "ring-2 ring-[#7a2d25] ring-offset-4 ring-offset-[#f7f3ed]" : ""}`}>
                    <Image
                      src={withCloudinaryTransforms(product.images[0], { width: 720 })}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      priority={index < 4}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <span className={`absolute right-3 top-3 flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-semibold shadow-sm transition-colors ${isSelected ? "border-[#7a2d25] bg-[#7a2d25] text-white" : "border-white/80 bg-white/85 text-black"}`}>
                      {isSelected ? selectionNumber : "+"}
                    </span>
                    {isFree ? <span className="absolute bottom-3 left-3 bg-[#e8c884] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#301a13]">Free after coupon</span> : null}
                  </div>
                  <p className="mt-4 text-[9px] uppercase tracking-[0.2em] text-black/45">{product.gender} • {product.category}</p>
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <div><h3 className="font-serif text-lg leading-tight md:text-xl">{product.name}</h3><p className="mt-1 line-clamp-1 text-[11px] text-black/50">Inspired by {product.inspiration}</p></div>
                    <p className="shrink-0 text-sm">{formatINR(product.price)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#fffdf9]/95 px-4 py-3 shadow-[0_-10px_30px_rgba(35,20,15,0.12)] backdrop-blur-xl md:bottom-5 md:left-1/2 md:right-auto md:w-[min(860px,calc(100%-40px))] md:-translate-x-1/2 md:rounded-2xl md:border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Gift className="h-4 w-4 text-[#8e5429]" /><p className="text-xs font-semibold">{selectedIds.length}/4 selected</p></div>
            {freeProduct ? <p className="mt-1 truncate text-[11px] text-[#66733d]">BUY3GET1 auto-applies • save {formatINR(freeProduct.price)}</p> : <p className="mt-1 text-[11px] text-black/45">Select {REQUIRED_SELECTIONS - selectedIds.length} more to unlock your free bottle</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {freeProduct ? <div className="hidden text-right sm:block"><p className="text-[10px] text-black/40 line-through">{formatINR(retailTotal)}</p><p className="font-serif text-xl">{formatINR(offerTotal)}</p></div> : null}
            <button type="button" onClick={addOfferItemsToCart} disabled={!freeProduct} className="inline-flex h-12 items-center gap-2 bg-[#24150f] px-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#7a2d25] disabled:cursor-not-allowed disabled:bg-black/20 sm:px-7">
              <ShoppingBag className="h-4 w-4" /> {freeProduct ? "Add 4 to cart" : "Complete box"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
