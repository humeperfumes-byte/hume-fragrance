"use client";

import { FormEvent, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import type { SpacesProduct } from "@/lib/spaces";

export default function SpacesProductInterest({ product, fullWidth = false }: { product: SpacesProduct; fullWidth?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = encodeURIComponent(`Hello HUME, I am ${name.trim()} (${phone.trim()}) and I am interested in the ${product.name} (${product.size}, ₹${product.price.toLocaleString("en-IN")}). Please share availability and details.`);
    window.open(`https://wa.me/919559024822?text=${message}`, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  }

  return <>
    <button type="button" onClick={() => setIsOpen(true)} className={`inline-flex h-10 items-center justify-center gap-2 bg-[#19231E] px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black ${fullWidth ? "w-full h-12" : ""}`}>
      <MessageCircle size={14} /> Interested
    </button>
    {isOpen && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <form onSubmit={submit} className="w-full max-w-md bg-[#FAF8F5] p-6 text-[#171713] shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/50">Product enquiry</p><h3 className="mt-1 font-serif text-2xl leading-tight">Interested in {product.name}?</h3></div><button type="button" onClick={() => setIsOpen(false)} aria-label="Close enquiry form" className="p-1 text-black/55 hover:text-black"><X size={18} /></button></div>
        <label className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/65">Name<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#19231E]" placeholder="Your name" /></label>
        <label className="mt-3 block text-[10px] font-semibold uppercase tracking-[0.14em] text-black/65">Mobile number<input required type="tel" inputMode="tel" minLength={10} value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-1.5 w-full border border-black/20 bg-white px-3 py-2.5 text-sm font-normal normal-case tracking-normal outline-none focus:border-[#19231E]" placeholder="+91 98765 43210" /></label>
        <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[#19231E] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-black"><MessageCircle size={14} /> Continue on WhatsApp</button>
      </form>
    </div>}
  </>;
}
