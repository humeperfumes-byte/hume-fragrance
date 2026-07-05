"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { type NaturalProduct, type NaturalSizeOption } from "@/lib/naturals-data";

interface NaturalProductClientProps {
  product: NaturalProduct;
}

export default function NaturalProductClient({ product }: NaturalProductClientProps) {
  const { addItem, setIsCartOpen } = useCart();
  
  // Default to the first size option (e.g., 10ml)
  const [selectedSize, setSelectedSize] = useState<NaturalSizeOption>(product.sizes[0] ?? { ml: "10ml", price: product.price });
  const [isAdded, setIsAdded] = useState(false);

  // Compute price per ML
  const pricePerMl = useMemo(() => {
    if (selectedSize.ml === "Custom") return null;
    const mlValue = parseInt(selectedSize.ml);
    if (isNaN(mlValue) || mlValue === 0) return null;
    return Math.round(selectedSize.price / mlValue);
  }, [selectedSize]);

  const handleAddToBag = () => {
    if (selectedSize.ml === "Custom") {
      // Bespoke inquiry via WhatsApp
      const message = `Hello HUME, I am interested in a Custom Bespoke order for your Natural botanical oil:\n\n*${product.name}*\nOrigin: ${product.origin}\n\nPlease help me custom size this order.`;
      const whatsappUrl = `https://wa.me/919559024822?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
      return;
    }

    addItem({
      id: `${product.id}-${selectedSize.ml}`,
      name: `${product.name} (${selectedSize.ml})`,
      inspiration: product.scientificName,
      category: "Naturals",
      image: product.image,
      price: selectedSize.price,
      size: selectedSize.ml,
    });
    setIsAdded(true);
    setIsCartOpen(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Get sourcing city name
  const sourcingCity = useMemo(() => {
    return product.origin.split(",")[0] ?? "Origin";
  }, [product.origin]);

  return (
    <div className="bg-[#FAF9F6] text-stone-900 selection:bg-stone-900 selection:text-white font-sans min-h-screen">
      
      {/* 1. HERO SPLIT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Back Link */}
        <Link 
          href="/naturals" 
          className="inline-flex items-center gap-2.5 text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-stone-450 hover:text-stone-900 transition-colors mb-10 group"
        >
          <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-1" />
          The Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Image Container */}
          <div className="lg:col-span-6 sticky top-28">
            <div className="relative aspect-[0.98] w-full overflow-hidden bg-stone-100 rounded-lg border border-stone-200/40 shadow-sm">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold tracking-[0.2em] text-stone-400 px-1">
              <span>SINGLE ORIGIN CONCENTRATE</span>
              <span className="text-right text-stone-600 uppercase">BATCH TESTED & GC/MS PROVEN</span>
            </div>
          </div>

          {/* Right Column: Details Content */}
          <div className="lg:col-span-6 lg:pl-4 flex flex-col justify-start">
            
            {/* Tagline */}
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-stone-450 block mb-3.5">
              {product.tags}
            </span>

            {/* Title */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-[4.2rem] font-semibold leading-[1.05] text-stone-950 mb-3 tracking-tight">
              {product.name}
            </h1>

            {/* Scientific Name */}
            <p className="font-serif italic text-stone-500 text-lg sm:text-xl tracking-wide leading-none mb-7">
              {product.scientificName}
            </p>

            {/* Highlighted Quote */}
            <p className="font-serif italic text-stone-850 text-lg sm:text-xl leading-relaxed mb-6 border-l-2 border-stone-300 pl-4 py-0.5">
              {product.tagline}
            </p>

            {/* Description */}
            <p className="text-[14.5px] leading-7 text-stone-650 font-light mb-8 max-w-xl">
              {product.description}
            </p>

            {/* Origin Grid Table */}
            <div className="h-[0.5px] bg-stone-200/80 w-full" />
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 py-7 text-sm">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">ORIGIN</span>
                <span className="text-stone-900 font-medium">{product.origin}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">EXTRACTION</span>
                <span className="text-stone-900 font-medium">{product.extractionMethod}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">FAMILY</span>
                <span className="text-stone-900 font-medium">{product.tags.split(" · ")[0]}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-stone-400 mb-1">VOLUME</span>
                <span className="text-stone-900 font-medium">
                  {selectedSize.ml === "Custom" ? "Bespoke Request" : `${selectedSize.ml} · Amber Glass`}
                </span>
              </div>
            </div>
            <div className="h-[0.5px] bg-stone-200/80 w-full mb-8" />

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-400">CHOOSE SIZE</span>
                {pricePerMl && (
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                    ₹{pricePerMl}/ml at {selectedSize.ml}
                  </span>
                )}
              </div>
              
              {/* Buttons Grid */}
              <div className="grid grid-cols-5 gap-2.5">
                {product.sizes.map((sizeOption) => {
                  const isSelected = selectedSize.ml === sizeOption.ml;
                  return (
                    <button
                      key={sizeOption.ml}
                      type="button"
                      onClick={() => setSelectedSize(sizeOption)}
                      className={`flex flex-col items-center justify-center py-3.5 border rounded-lg transition-all duration-200 active:scale-[0.97] ${
                        isSelected
                          ? "bg-stone-950 border-stone-950 text-white shadow-sm"
                          : "bg-white border-stone-200 text-stone-900 hover:border-stone-400"
                      }`}
                    >
                      <span className="text-xs font-bold font-sans">{sizeOption.ml}</span>
                      <span className={`text-[9px] font-medium font-sans mt-0.5 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                        {sizeOption.label || `₹${sizeOption.price.toLocaleString("en-IN")}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkout Footer Block */}
            <div className="h-[0.5px] bg-stone-200/80 w-full mb-6" />
            <div className="flex items-center justify-between gap-6 pb-6">
              <div>
                <span className="font-serif text-3xl font-semibold text-stone-950">
                  {selectedSize.ml === "Custom" ? "Bespoke" : `₹${selectedSize.price.toLocaleString("en-IN")}`}
                </span>
                <span className="block text-[9.5px] font-bold uppercase tracking-[0.16em] text-stone-400 mt-1">
                  {selectedSize.ml.toUpperCase()} · FREE SHIPPING ACROSS INDIA
                </span>
              </div>
              
              <button
                onClick={handleAddToBag}
                className="h-13 px-8 bg-stone-950 text-white rounded-lg font-sans text-xs font-bold uppercase tracking-[0.24em] transition-all hover:bg-black active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
              >
                {selectedSize.ml === "Custom" ? "Inquire on WhatsApp" : "ADD TO CART"}
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* 2. AROMA PROFILE SECTION */}
      <section className="bg-white border-y border-stone-200/60 py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-14">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-stone-450 block mb-3.5">
              AROMA PROFILE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-stone-950 leading-none">
              How it wears on skin.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 pt-6">
            
            {/* Top Column */}
            <div className="flex flex-col border-t border-stone-200/85 pt-6">
              <span className="font-serif italic text-stone-400 text-sm mb-1.5 block">Nº 01</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 mb-3.5 block">
                TOP / OPENING
              </span>
              <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
                {product.aromaProfile.top}
              </p>
            </div>

            {/* Heart Column */}
            <div className="flex flex-col border-t border-stone-200/85 pt-6">
              <span className="font-serif italic text-stone-400 text-sm mb-1.5 block">Nº 02</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 mb-3.5 block">
                HEART
              </span>
              <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
                {product.aromaProfile.heart}
              </p>
            </div>

            {/* Base Column */}
            <div className="flex flex-col border-t border-stone-200/85 pt-6">
              <span className="font-serif italic text-stone-400 text-sm mb-1.5 block">Nº 03</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 mb-3.5 block">
                BASE / DRY-DOWN
              </span>
              <p className="font-serif text-lg sm:text-xl text-stone-900 leading-snug">
                {product.aromaProfile.base}
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. INGREDIENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Content column */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-stone-450 block mb-3.5">
              INGREDIENTS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold text-stone-950 leading-tight mb-4">
              One plant. Nothing else.
            </h2>
            <p className="font-serif italic text-stone-600 text-lg leading-relaxed mb-8">
              100% {product.scientificName} flower oil. Nothing else.
            </p>

            {/* Table Rows */}
            <div className="flex flex-col w-full">
              {product.ingredients.map((ing, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between py-4 border-b border-stone-200 text-sm"
                >
                  <span className="text-stone-500 font-light">{ing.name}</span>
                  <span className="font-serif italic text-stone-950 font-medium tracking-wide">{ing.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image column */}
          <div className="lg:col-span-6 relative aspect-[1.12] w-full overflow-hidden rounded-xl border border-stone-200/50 shadow-sm bg-stone-100">
            <Image
              src="/images/naturals/oil_pipette.png"
              alt="Golden botanical oil drop from glass pipette"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

        </div>
      </section>

      {/* 4. SOURCING & HARVEST SECTION */}
      <section className="bg-stone-100/35 border-t border-stone-250/40 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            
            {/* Left Image column */}
            <div className="lg:col-span-6 relative aspect-[1.15] w-full overflow-hidden rounded-xl border border-stone-200/50 shadow-sm bg-stone-100">
              <Image
                src="/images/naturals/kannauj_degs.png"
                alt="Traditional Indian copper steam distillation degs"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            {/* Right Content column */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.24em] text-stone-450 block mb-3.5">
                SOURCING & HARVEST
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold text-stone-950 leading-tight mb-8">
                From {sourcingCity}.
              </h2>

              {/* Three steps checklist */}
              <div className="flex flex-col gap-8">
                {product.sourcingSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 border-b border-stone-200/60 pb-6 last:border-0 last:pb-0">
                    <span className="font-serif italic text-stone-400 text-base shrink-0 mt-0.5">{step.num}</span>
                    <div>
                      <h4 className="font-serif italic text-stone-900 text-lg leading-none mb-2">
                        {step.title}
                      </h4>
                      <p className="text-[13.5px] leading-relaxed text-stone-600 font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
