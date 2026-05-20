import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact HUME Fragrance",
  description:
    "Contact HUME Fragrance for order support, fragrance help, tracking, returns, refunds, and business queries.",
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <Header />
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Contact
          </p>
          <h1 className="mt-4 font-serif text-4xl font-light tracking-wide sm:text-6xl">
            Talk to HUME
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
            Need help with an order, tracking ID, refund, or fragrance choice? WhatsApp is the fastest way to reach us.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <a
              href="https://wa.me/919559024822"
              target="_blank"
              rel="noreferrer"
              className="rounded-[1.5rem] border border-[#25D366]/25 bg-[#25D366]/10 p-6 text-[#128C7E] shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">WhatsApp</p>
              <p className="mt-3 text-2xl font-semibold">+91 95590 24822</p>
              <p className="mt-3 text-sm leading-6">Best for order help, perfume suggestions, and tracking support.</p>
            </a>
            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Email</p>
              <p className="mt-3 text-2xl font-semibold">hello@humefragrance.com</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Use email for detailed support, refund records, and business messages.</p>
            </div>
            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Self Serve</p>
              <p className="mt-3 text-2xl font-semibold">Track order</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">Use your Speed Post tracking ID to check parcel movement.</p>
              <Link href="/track-order" className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4">
                Open tracking
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

