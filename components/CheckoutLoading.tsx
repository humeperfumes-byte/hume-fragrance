"use client";
import { useEffect, useState } from "react";
import { LockKeyhole, ShoppingBag } from "lucide-react";

export default function CheckoutLoading({ title = "Preparing your checkout", description = "Getting your bag ready for a smooth checkout." }: { title?: string; description?: string }) {
  const [takingLonger, setTakingLonger] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setTakingLonger(true), 8000); return () => clearTimeout(timer); }, []);
  return <section className="flex min-h-[65vh] items-center justify-center bg-[#faf9f6] px-5 py-12 sm:py-20" aria-busy="true">
    <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e8e4dc] bg-white shadow-[0_20px_70px_-30px_rgba(40,30,15,0.18)]">
      <div className="px-7 pb-8 pt-10 text-center sm:px-12 sm:pt-12">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8e8272]">HUME · CHECKOUT</p>
        <div className="relative mx-auto mb-8 mt-7 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#ede8df]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-[#c5b28f] border-t-[#302b24] motion-reduce:animate-none" aria-hidden="true" />
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[#f6f3ed]"><ShoppingBag className="h-7 w-7 text-[#51483c]" strokeWidth={1.35} aria-hidden="true" /></div>
          <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#302b24]"><LockKeyhole className="h-3 w-3 text-white" aria-hidden="true" /></span>
        </div>
        <div role="status" aria-live="polite"><h1 className="font-serif text-3xl leading-tight text-[#28251f] sm:text-4xl">{title}</h1><p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#80786e]">{takingLonger ? "This is taking a little longer. Please keep this page open while we finish this step." : description}</p></div>
        <div className="relative mx-auto mt-7 h-1 w-44 overflow-hidden rounded-full bg-[#eeeae3]" aria-hidden="true"><span className="hume-checkout-loading-bar absolute inset-y-0 w-20 rounded-full bg-[#b39b72]" /></div>
        <p className="mt-5 text-[11px] text-[#9c9387]">Your bag stays saved while you wait.</p>
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-[#eeeae3] bg-[#fcfbf8] px-5 py-4 text-[11px] text-[#827969]"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout · Please keep this page open</div>
    </div>
  </section>;
}
