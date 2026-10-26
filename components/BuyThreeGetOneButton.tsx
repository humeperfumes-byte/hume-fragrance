"use client";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

// Revert to the saved normal design after November 9 in India.
const DIWALI_END = Date.parse("2026-11-10T00:00:00+05:30");
export default function BuyThreeGetOneButton({ onNavigate }: { onNavigate?: () => void }) {
  const [diwali, setDiwali] = useState(false);
  useEffect(() => {
    const sync = () => setDiwali(Date.now() < DIWALI_END);
    sync();
    const timer = window.setInterval(sync, 30000);
    return () => window.clearInterval(timer);
  }, []);
  return <Link href="/buy-3-get-1" onClick={onNavigate ? event => { event.preventDefault(); onNavigate(); } : undefined}
    className={"group flex min-h-12 w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[#d9b773]/60 bg-[linear-gradient(110deg,#173e30_0%,#24543d_65%,#173e30_100%)] px-4 py-3 text-left text-[#fff8eb] shadow-[0_5px_18px_rgba(23,62,48,0.16)] transition duration-300 hover:border-[#eacb8a] hover:shadow-[0_7px_24px_rgba(23,62,48,0.25)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88b41] focus-visible:ring-offset-2 relative " + (diwali ? "hume-diwali-offer" : "")}>
    {diwali && <>
      <span className="hume-diwali-shine pointer-events-none absolute inset-0" aria-hidden="true" />
      <span className="hume-diwali-rangoli pointer-events-none absolute -right-7 -top-8 h-32 w-32" aria-hidden="true" />
      <span className="hume-diwali-lights pointer-events-none absolute inset-x-5 top-1 flex justify-between" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5, 6].map(light => <span key={light} style={{ animationDelay: (light * 0.35) + "s" }} />)}
      </span>
    </>}
    <span className="relative flex min-w-0 items-center gap-3">
      <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e8ce9c]/30 bg-[#e8ce9c]/10 text-[#f2d69f] " + (diwali ? "hume-diwali-flame" : "")}>
        {diwali ? <svg viewBox="0 0 48 48" className="h-9 w-9 overflow-visible" aria-hidden="true">
          <ellipse cx="24" cy="38" rx="18" ry="3" fill="#ffb534" opacity=".15" />
          <path className="hume-diwali-wick" d="M24 5C31 14 32 19 24 25C16 21 17 14 24 5Z" fill="#ffb62e" />
          <path d="M24 14C27 19 28 22 24 25C20 22 21 19 24 14Z" fill="#fff2b0" />
          <path d="M7 27H41C38 39 12 39 7 27Z" fill="#dc722f" stroke="#ffdc88" strokeWidth="1.4" />
          <ellipse cx="24" cy="27" rx="17" ry="3.5" fill="#8c3024" stroke="#ffdc88" strokeWidth="1.4" />
          <path d="M14 32Q24 38 34 32" fill="none" stroke="#ffdc88" strokeWidth="1.5" strokeDasharray="2 3" />
        </svg> : <Gift className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" aria-hidden="true" />}
      </span>
      <span>
        {diwali && <span className="pointer-events-none absolute -right-1 -top-1 text-[#ffe2a1]" aria-hidden="true"><Sparkles className="h-3 w-3 hume-diwali-sparkle" /></span>}
        {diwali && <span className="hume-diwali-title mb-1 block font-serif text-[19px] italic leading-none tracking-[0.02em]">Diwali Offer</span>}
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">Buy 3, Get <span className={(diwali ? "hume-diwali-free " : "") + "rounded-md bg-[#f2d69f] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#173e30]"}>1 FREE</span></span>
        {!diwali && <span className="mt-1 block text-[11px] font-normal text-[#fff8eb]/75">Pick your four fragrances</span>}
      </span>
    </span>
    <ArrowRight className="relative h-4 w-4 shrink-0 text-[#f2d69f] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
  </Link>;
}
