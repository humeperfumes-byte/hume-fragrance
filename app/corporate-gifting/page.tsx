import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CorporateGiftingForm from "./CorporateGiftingForm";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Gifting | HUME Fragrance",
  description:
    "Elevate your B2B gifting with HUME's luxury custom-branded perfume sets, discovery kits, and premium corporate packaging. Custom laser engraving available.",
  alternates: { canonical: `${SITE_URL}/corporate-gifting` },
};

export default function CorporateGiftingPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#171717]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 text-[#fffaf2] md:py-36">
        <Image
          src="/images/occasions/corporate-gifting-hero.jpg"
          alt="HUME Fragrance Gifting Presentation"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-stone-500/10 blur-[80px]" />

        <div className="container-luxury relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d8b46d] md:text-xs">
            HUME FRAGRANCE • B2B CORPORATE GIFTS
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light italic leading-tight tracking-tight sm:text-6xl md:text-7xl">
            Scented Statements
          </h1>
          <h2 className="mt-2 font-serif text-2xl font-light tracking-wide text-zinc-300 sm:text-3xl">
            Luxury Gifting for Modern Enterprises
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base hidden md:block">
            Leave a lasting impression with HUME's high-performance Eau de Parfums. Tailored for Indian conditions, our bespoke gifting collections offer custom branding, tailored fragrance pairings, and elegant presentations designed for appreciation.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#inquire"
              className="inline-flex h-11 items-center bg-[#d8b46d] px-6 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-[#c9aa72]"
            >
              Inquire Now
            </a>
            <a
              href="https://wa.me/919559024822?text=Hello%20HUME%2C%20I%20am%20interested%20in%20corporate%20gifting%20options."
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center border border-white/20 bg-white/5 px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              WhatsApp B2B Team
            </a>
          </div>
        </div>
      </section>

      {/* Bespoke Gift Sets */}
      <section className="py-20 md:py-28">
        <div className="container-luxury mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b45309]">
              The Collections
            </p>
            <h3 className="mt-3 font-serif text-3xl font-light tracking-wide sm:text-4xl">
              Curated Gift Configurations
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
              Select from our pre-configured corporate gift sets or work with our specialists to design a custom fragrance box.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {/* Package 1 */}
            <div className="group rounded-[1.6rem] border border-[#e8dfd4] bg-white p-6 shadow-[0_12px_36px_rgba(24,18,14,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,18,14,0.08)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src="/images/occasions/executive-box.jpg"
                  alt="The Executive Box"
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mt-6 font-serif text-xl font-medium">The Executive Box</h4>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground hidden md:block">
                A premium pairing of a signature 50ml Eau de Parfum and artisanal Kaju Katli (kaju barfi), presented in an elegant gift box. Perfect for modern corporate rewards.
              </p>
              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-[11px] text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>1 x 50ml Premium EDP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Kaju ki Barfi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Custom Logo Sleeve Print</span>
                </li>
              </ul>
            </div>

            {/* Package 2 */}
            <div className="group rounded-[1.6rem] border border-[#e8dfd4] bg-white p-6 shadow-[0_12px_36px_rgba(24,18,14,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,18,14,0.08)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src="/images/occasions/ambassador-box.jpg"
                  alt="The Ambassador Box"
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mt-6 font-serif text-xl font-medium">The Ambassador Box</h4>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground hidden md:block">
                A curated trio featuring a signature 50ml Eau de Parfum, pure Rose Water (Gulab Jal) daily face mist, and artisanal Kaju Katli. A comprehensive luxury experience for key partners.
              </p>
              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-[11px] text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>1 x 50ml Premium EDP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>100ml Pure Rose Water Gulab Jal</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Kaju ki Barfi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Custom Greeting & Ribbon Branding</span>
                </li>
              </ul>
            </div>

            {/* Package 3 */}
            <div className="group rounded-[1.6rem] border border-[#e8dfd4] bg-white p-6 shadow-[0_12px_36px_rgba(24,18,14,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(24,18,14,0.08)]">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src="/images/occasions/elite-box.png"
                  alt="The Elite Box"
                  fill
                  className="object-cover"
                />
              </div>
              <h4 className="mt-6 font-serif text-xl font-medium">The Elite Box</h4>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground hidden md:block">
                A fully custom-made luxury hamper tailored to your brand. Select and combine multiple premium perfumes, car fragrances, mist sprays, and assortments of premium dry fruits.
              </p>
              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 text-[11px] text-zinc-500">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Multiple Signature Fragrances</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Car Diffusers & Premium Mists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Premium Dry Fruits & Sweets Assortment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Bespoke Laser Engraving & Silk Linings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✔</span>
                  <span>Dedicated B2B Relationship Manager</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Customization Details */}
      <section className="bg-[#fcfaf7] py-20 border-y border-[#e8dfd4]">
        <div className="container-luxury mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div id="inquire" className="order-1 lg:order-2 rounded-3xl border border-[#d9c8ad] bg-[#fbfaf8] p-6 shadow-[0_24px_50px_rgba(24,18,14,0.06)] md:p-8">
              <h3 className="font-serif text-2xl font-light mb-6">Corporate Inquiry Form</h3>
              <CorporateGiftingForm />
            </div>

            <div className="order-2 lg:order-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b45309]">
                End-To-End Bespoke Support
              </p>
              <h3 className="mt-3 font-serif text-3xl font-light tracking-wide sm:text-4xl">
                Bespoke Personalization
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                At HUME, we believe corporate gifting is an art form. We work closely with brand teams, HR personnel, and executive assistants to provide custom branding solutions that feel authentic, premium, and sophisticated.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Laser Engraved Bottles",
                    desc: "Precision etch your company logo or message directly onto the glass bottle for a premium permanent finish.",
                  },
                  {
                    title: "Bespoke Outer Packaging",
                    desc: "Incorporate corporate brand colors, silk ribbons, or custom message card envelopes inside the presentation box.",
                  },
                  {
                    title: "Fragrance Curation",
                    desc: "Our fragrance consultants help select notes (citrus, woody, fresh, or amber) suited to your specific demographic.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[10px] font-bold text-[#d8b46d]">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}