"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Check, ChevronDown, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { type NaturalProduct } from "@/lib/naturals-data";

interface NaturalProductClientProps {
  product: NaturalProduct;
}

export default function NaturalProductClient({ product }: NaturalProductClientProps) {
  const { addItem, setIsCartOpen } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"sourcing" | "olfactory" | "usage">("sourcing");

  const handleAddToBag = () => {
    addItem({
      id: product.id,
      name: product.name,
      inspiration: product.scientificName,
      category: "Naturals",
      image: product.image,
      price: product.price,
      size: product.size,
    });
    setIsAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleWhatsAppCheckout = () => {
    const message = `Hello HUME, I want to order your Natural botanical oil:\n\n*${product.name} (${product.size})* - ₹${product.price}\nOrigin: ${product.origin}\n\nPlease confirm availability and payment details.`;
    const whatsappUrl = `https://wa.me/919559024822?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-stone-900 selection:text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Sleek Breadcrumb/Back link */}
        <Link 
          href="/naturals" 
          className="inline-flex items-center gap-2.5 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-stone-500 hover:text-stone-900 transition-colors py-2 mb-8 group"
        >
          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1" />
          The Library
        </Link>

        {/* Dynamic Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-18 items-start">
          
          {/* Left Media Column - Sticky on Desktop */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="relative aspect-[0.82] w-full overflow-hidden bg-stone-100 rounded-2xl border border-stone-200/50 shadow-[0_12px_40px_rgba(27,24,20,0.04)]">
              {/* Product Number Badge */}
              <span className="absolute left-6 top-6 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 font-serif text-sm italic tracking-widest text-stone-900 shadow-sm border border-stone-200/30">
                {product.number}
              </span>

              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            
            {/* Origin Caption */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-stone-400 px-1">
              <span>EXTRACTION METHOD</span>
              <span className="text-right text-stone-600 uppercase">{product.extractionMethod}</span>
            </div>
          </div>

          {/* Right Details Copy Column */}
          <div className="lg:col-span-6 lg:pl-4 flex flex-col justify-start">
            
            {/* Header Area */}
            <div className="border-b border-stone-200/80 pb-6 mb-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-stone-500 block mb-3">
                BOTANICAL ESSENCE
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] text-stone-950 mb-3.5 tracking-tight">
                {product.name}
              </h1>
              <p className="font-serif italic text-stone-500 text-lg sm:text-xl tracking-wide leading-none">
                {product.scientificName}
              </p>
            </div>

            {/* Price & Size Info */}
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-3xl font-medium tracking-tight text-stone-950 font-sans">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-stone-500 ml-1.5 uppercase font-sans font-semibold tracking-wider">
                  INR
                </span>
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500 bg-white/80 border border-stone-200 px-3 py-1.5 rounded-md">
                Volume: {product.size}
              </span>
            </div>

            {/* Description */}
            <p className="text-[15px] leading-7 text-stone-700 font-light mb-8">
              {product.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={handleAddToBag}
                className="flex-1 h-14 bg-stone-950 text-white rounded-xl font-sans text-xs font-bold uppercase tracking-[0.22em] transition-all hover:bg-black active:scale-[0.985] flex items-center justify-center gap-2 shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
              >
                {isAdded ? (
                  <>
                    <Check size={14} />
                    Added to bag
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    Add to bag — ₹{product.price.toLocaleString("en-IN")}
                  </>
                )}
              </button>
              
              <button
                onClick={handleWhatsAppCheckout}
                className="h-14 px-8 border border-emerald-500/35 bg-white text-emerald-800 rounded-xl font-sans text-xs font-bold uppercase tracking-[0.22em] transition-colors hover:bg-emerald-50/40 active:scale-[0.985] flex items-center justify-center gap-2"
              >
                Order via WhatsApp
              </button>
            </div>

            {/* Premium Accordion details */}
            <div className="border border-stone-200 bg-white/50 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Tab Headers */}
              <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-100/40">
                <button
                  onClick={() => setActiveTab("sourcing")}
                  className={`py-3.5 text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    activeTab === "sourcing" ? "bg-white text-stone-950 border-b border-stone-950 font-extrabold" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Sourcing
                </button>
                <button
                  onClick={() => setActiveTab("olfactory")}
                  className={`py-3.5 text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    activeTab === "olfactory" ? "bg-white text-stone-950 border-b border-stone-950 font-extrabold" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Sensory
                </button>
                <button
                  onClick={() => setActiveTab("usage")}
                  className={`py-3.5 text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    activeTab === "usage" ? "bg-white text-stone-950 border-b border-stone-950 font-extrabold" : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  Profile
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6 sm:p-8 bg-white min-h-[160px]">
                {activeTab === "sourcing" && (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">GROWER TRACEABILITY</span>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{product.sourcing}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">ORIGIN</span>
                      <p className="text-sm text-stone-800 font-medium tracking-wide">{product.origin}</p>
                    </div>
                  </div>
                )}
                {activeTab === "olfactory" && (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">OLFACTORY PROFILE</span>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{product.sensoryNotes}</p>
                    </div>
                    <div>
                      <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">RECOMMENDED USE</span>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">Best worn neat on pulse points, or blended sparingly with carrier oils to extend longevity.</p>
                    </div>
                  </div>
                )}
                {activeTab === "usage" && (
                  <div className="space-y-4">
                    <div>
                      <span className="block text-[9px] font-sans font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">MOLECULAR DESIGN</span>
                      <p className="text-sm text-stone-700 font-light leading-relaxed">{product.profile}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50/50 border border-amber-200/40 rounded-lg p-3">
                      <Sparkles size={13} className="shrink-0" />
                      <span className="text-[10px] font-sans font-bold uppercase tracking-[0.12em]">100% Pure & GC/MS Batch Tested</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
