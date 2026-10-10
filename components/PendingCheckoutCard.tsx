"use client";
import Link from "next/link";
import { useActiveCheckout } from "@/hooks/use-active-checkout";
import { formatINR } from "@/lib/currency";
import ImageWithFallback from "./ImageWithFallback";
export default function PendingCheckoutCard() {
  const { checkout } = useActiveCheckout();
  if (!checkout) return null;
  return <section className="mb-6 rounded-2xl border border-[#d7b76e] bg-[#fff7df] p-5" aria-label="Your unfinished checkout">
    <h2 className="font-serif text-2xl">Complete your order</h2>
    <p className="mt-2 text-sm text-stone-600">{checkout.status === "payment_pending" ? "Your order is saved. Continue to check its payment." : "Your selection is saved. Continue where you left off."}</p>
    <div className="mt-4 flex flex-wrap gap-3">{checkout.items.map(item => <div key={item.id} className="flex items-center gap-2"><div className="relative h-12 w-12 overflow-hidden rounded-lg"><ImageWithFallback src={item.image || "/images/logo.png"} fallbackSrc="/images/logo.png" alt={item.name} fill sizes="48px" className="object-cover" /></div><span className="text-sm">{item.name} × {item.quantity}</span></div>)}</div>
    <p className="mt-3 text-sm font-semibold">{formatINR(checkout.grandTotal)}</p>
    <Link href={checkout.path} referrerPolicy="no-referrer" className="mt-4 inline-block rounded-full bg-[#082c21] px-5 py-3 text-sm font-semibold text-white">Continue checkout</Link>
  </section>;
}
