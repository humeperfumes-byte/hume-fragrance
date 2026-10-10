import { Sparkles } from "lucide-react";

/** Shared loading presentation; no timers, data requests or checkout state. */
export default function SiteLoading({ title = "Preparing your page", description = "Just a moment while we bring everything together.", compact = false, dark = false }: { title?: string; description?: string; compact?: boolean; dark?: boolean }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={`flex w-full items-center justify-center ${compact ? "px-5 py-10" : "min-h-[65vh] px-5 py-16"}`}>
      <div className={`w-full text-center ${compact ? "max-w-sm" : "max-w-md rounded-[28px] border px-7 py-10 sm:px-10 sm:py-12"} ${!compact ? dark ? "border-white/10 bg-white/[0.025]" : "border-[#e8e4dc] bg-white shadow-[0_20px_70px_-30px_rgba(40,30,15,0.18)]" : ""}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${dark ? "text-white/45" : "text-[#8e8272]"}`}>HUME · FRAGRANCE</p>
        <div className={`relative mx-auto my-6 flex items-center justify-center ${compact ? "h-14 w-14" : "h-20 w-20"}`} aria-hidden="true">
          <div className={`absolute inset-0 rounded-full border ${dark ? "border-white/10" : "border-[#ede8df]"}`} />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-[#c5b28f] border-t-[#b39b72] motion-reduce:animate-none" />
          <Sparkles className={`${compact ? "h-5 w-5" : "h-6 w-6"} text-[#b39b72]`} strokeWidth={1.3} />
        </div>
        <p className={`font-serif leading-tight ${compact ? "text-xl" : "text-3xl"} ${dark ? "text-white/90" : "text-[#28251f]"}`}>{title}</p>
        <p className={`mx-auto mt-3 max-w-xs text-sm leading-6 ${dark ? "text-white/45" : "text-[#80786e]"}`}>{description}</p>
        <div className={`relative mx-auto mt-6 h-1 w-36 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-[#eeeae3]"}`} aria-hidden="true"><span className="hume-checkout-loading-bar absolute inset-y-0 w-16 rounded-full bg-[#b39b72]" /></div>
      </div>
    </div>
  );
}
