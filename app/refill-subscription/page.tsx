import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Home, ShoppingBag, Sparkles, User, MoreHorizontal } from "lucide-react";
import { getAllPublicProducts } from "@/lib/db/products";
import FragranceCardScroller from "@/components/refill/FragranceCardScroller";

export const metadata: Metadata = {
  title: "Refill Subscription | HUME Fragrance",
  description:
    "The HUME Refill Program. Refill your used HUME perfume bottle for ₹800 with sustainable premium service.",
};

export const revalidate = 300;

const steps = [
  {
    id: "01",
    title: "Request Your Essence",
    description: "Select your preferred fragrance and initiate a refill request through digital concierge.",
  },
  {
    id: "02",
    title: "The Vessel Exchange",
    description: "Share your original bottle and we prepare it with the same parfum concentration profile.",
  },
];

export default async function RefillSubscriptionPage() {
  const products = await getAllPublicProducts();
  const refillOptions = products.map((product) => ({
    id: product.id,
    name: product.name,
    inspiration: product.inspiration,
    image: product.images[0] || "/logo.png",
  }));

  return (
    <main className="min-h-screen bg-[#050608] text-white lg:h-screen lg:overflow-hidden">
      <section className="mx-auto max-w-[460px] lg:max-w-[1180px] border-x border-white/10 min-h-screen bg-[#07090c] lg:h-screen lg:min-h-0">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06080c]/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4">
            <Link href="/" className="inline-flex h-8 w-8 items-center justify-center text-white/90">
              <ArrowLeft size={20} />
            </Link>
            <p className="text-[0.98rem] uppercase tracking-[0.2em] text-white/95">Hume Refill</p>
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center text-white/90">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </header>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_420px] lg:h-[calc(100vh-73px)]">
          <div className="min-w-0 lg:h-[calc(100vh-73px)] lg:overflow-hidden">
            <section className="relative h-[500px] overflow-hidden border-b border-white/10 lg:h-[36vh]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/bg-refill.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/85" />
              <div className="absolute inset-x-0 bottom-0 p-7 lg:p-6">
                <p className="mb-3 text-[0.72rem] uppercase tracking-[0.34em] text-white/70">Sustainable Luxury</p>
                <h1 className="font-serif text-[3.45rem] leading-[0.92] italic lg:text-[2.85rem]">
                  The Refill
                  <br />
                  Program
                </h1>
              </div>
            </section>

            <section className="px-7 py-12 border-b border-white/10 bg-[#05070b] lg:px-8 lg:py-6">
              <h2 className="font-serif text-[2.5rem] italic font-medium leading-[0.95] mb-11 text-white/95 lg:text-[2rem] lg:mb-5">
                How It Works
              </h2>
              <div className="space-y-11 lg:space-y-5">
                {steps.map((step) => (
                  <article key={step.id} className="grid grid-cols-[52px_1fr] gap-3 lg:grid-cols-[50px_1fr] lg:gap-3">
                    <p className="font-serif text-[2rem] italic font-medium leading-none text-[#ddb04d] pt-0.5 lg:text-[1.5rem]">
                      {step.id}.
                    </p>
                    <div>
                      <h3 className="font-sans text-[1rem] uppercase tracking-[0.005em] leading-none mb-3 font-medium text-white/95 lg:text-[1.1rem] lg:mb-2">
                        {step.title}
                      </h3>
                      <p className="max-w-[300px] text-[0.9rem] leading-[1.62] text-white/42 lg:max-w-[520px] lg:text-[0.84rem] lg:leading-[1.45]">
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="px-7 py-10 border-b border-white/10 lg:border-b-0 lg:border-l lg:border-white/10 lg:px-8 lg:py-8 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] lg:overflow-hidden">
            <div className="relative border border-white/20 bg-[#080a0e] px-5 py-8">
              <div className="absolute -top-px left-1/2 h-px w-20 -translate-x-1/2 bg-[#b58b36]" />
              <div className="absolute -bottom-px left-1/2 h-px w-20 -translate-x-1/2 bg-[#b58b36]" />

              <p className="text-center text-[0.72rem] uppercase tracking-[0.44em] text-[#e1b652] mb-5">
                Exclusive Invitation
              </p>
              <h3 className="text-center font-serif text-[2.8rem] italic leading-none">The Signature Duo</h3>

              <div className="mt-8 space-y-4">
                <FragranceCardScroller title="Select Fragrance 01" options={refillOptions} />
                <FragranceCardScroller title="Select Fragrance 02" options={refillOptions} />
              </div>

              <div className="mt-8 text-center">
                <p className="font-serif text-[3.3rem] italic leading-none">
                  800<span className="ml-1 text-[1.9rem] not-italic">INR</span>
                </p>
                <p className="mt-2 text-[0.72rem] uppercase tracking-[0.18em] text-white/45">Valued at 1200 INR</p>
              </div>
            </div>

            <Link
              href="https://wa.me/919559024822?text=Hi%20HUME%2C%20I%20want%20to%20book%20The%20Refill%20Program%20for%20%E2%82%B9800."
              className="mt-8 inline-flex h-14 w-full items-center justify-center bg-white text-[0.85rem] uppercase tracking-[0.36em] text-black hover:bg-white/90"
            >
              Book Your Refill
            </Link>

            <p className="mt-6 text-center text-[0.62rem] uppercase tracking-[0.18em] text-white/35">
              Elegance without obligation. Revoke membership at your discretion.
            </p>
          </section>
        </div>

        <footer className="sticky bottom-0 border-t border-white/10 bg-[#06080c]/95 backdrop-blur lg:hidden">
          <div className="grid grid-cols-4">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 py-3 text-white/65">
              <Home size={16} />
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">Home</span>
            </Link>
            <Link href="/shop" className="flex flex-col items-center justify-center gap-1 py-3 text-white/65">
              <ShoppingBag size={16} />
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">Shop</span>
            </Link>
            <Link href="/refill-subscription" className="flex flex-col items-center justify-center gap-1 py-3 text-[#e1b652]">
              <Sparkles size={16} />
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">Program</span>
            </Link>
            <button type="button" className="flex flex-col items-center justify-center gap-1 py-3 text-white/65">
              <User size={16} />
              <span className="text-[0.58rem] uppercase tracking-[0.2em]">Profile</span>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
