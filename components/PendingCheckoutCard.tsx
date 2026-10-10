"use client";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { useActiveCheckout } from "@/hooks/use-active-checkout";
import { formatINR } from "@/lib/currency";
import ImageWithFallback from "./ImageWithFallback";
export default function PendingCheckoutCard() {
  const { checkout } = useActiveCheckout();
  if (!checkout) return null;
  return <section className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_4px_24px_rgba(28,25,23,0.04)]" aria-label="Your unfinished checkout">
    <div className="flex items-start gap-3 px-5 py-5 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5f2eb] text-[#746447]"><ShoppingBag className="h-4 w-4" aria-hidden="true" /></div>
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">Your saved bag</p>
        <h2 className="font-serif text-2xl leading-tight text-stone-900">Complete your order</h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{checkout.status === "payment_pending" ? "Your order is saved. Resume checkout to check your payment status." : "Your fragrances are saved. Pick up where you left off."}</p>
      </div>
    </div>
    <div className="mx-5 border-t border-stone-100 py-4 sm:mx-6">
      <div className="grid gap-3 sm:grid-cols-2">{checkout.items.map(item => <div key={item.id} className="flex min-w-0 items-center gap-3"><div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50"><ImageWithFallback src={item.image || "/images/logo.png"} fallbackSrc="/images/logo.png" alt={item.name} fill sizes="64px" className="object-cover" /></div><div className="min-w-0"><p className="break-words text-sm font-medium text-stone-900">{item.name}</p><p className="mt-1 text-xs text-stone-500">Quantity {item.quantity}</p></div></div>)}</div>
    </div>
    <div className="flex flex-col gap-4 border-t border-stone-100 bg-[#faf9f6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div><p className="text-[10px] font-medium uppercase tracking-[0.15em] text-stone-500">Order total</p><p className="mt-1 text-lg font-semibold tracking-tight text-stone-900">{formatINR(checkout.grandTotal)}</p></div>
      <Link href={checkout.path} referrerPolicy="no-referrer" className="inline-flex min-h-12 items-center justify-center gap-5 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-900">Continue checkout<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </div>
  </section>;
}
