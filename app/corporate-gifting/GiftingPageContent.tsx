import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CorporateGiftingForm from "./CorporateGiftingForm";
import { formatINR } from "@/lib/currency";

// Define pricing structure matching schema
const DISCOVERY_SET_PRICE = 999;

interface GiftingPageContentProps {
  occasion: "corporate" | "wedding" | "diwali" | "holi" | "new-year" | "christmas";
}

export default function GiftingPageContent({ occasion }: GiftingPageContentProps) {
  // Dynamic page content based on occasion
  const tagline = {
    corporate: "HUME FRAGRANCE • B2B CORPORATE GIFTS",
    wedding: "HUME FRAGRANCE • BESPOKE WEDDING FAVORS",
    diwali: "HUME FRAGRANCE • DIWALI FESTIVE HAMPERS",
    holi: "HUME FRAGRANCE • HOLI CELEBRATION GIFTS",
    "new-year": "HUME FRAGRANCE • NEW YEAR CELEBRATION GIFTS",
    christmas: "HUME FRAGRANCE • CHRISTMAS HOLIDAY GIFTS",
  }[occasion];

  const title = {
    corporate: "Scented Statements",
    wedding: "Love in the Air",
    diwali: "Festival of Lights & Luxury",
    holi: "Fragrant Colors of Celebration",
    "new-year": "Fresh Beginnings",
    christmas: "Holiday Warmth & Cheer",
  }[occasion];

  const subtitle = {
    corporate: "Luxury Gifting for Modern Enterprises",
    wedding: "Bespoke Gifting for Your Special Day",
    diwali: "Luxury Festive Hampers & Sweet Pairings",
    holi: "Luxury Fragrant Favors for Friends & Family",
    "new-year": "Signature Perfumes & New Year Celebrations",
    christmas: "Luxury Holiday Gift Boxes & Silk Linings",
  }[occasion];

  const description = {
    corporate: "Leave a lasting impression with HUME's high-performance Eau de Parfums. Tailored for Indian conditions, our bespoke gifting collections offer custom branding, tailored fragrance pairings, and elegant presentations designed for appreciation.",
    wedding: "Elevate your special day with bespoke wedding favors. From personalized bottles with custom initials to silk-wrapped gift hampers containing signature scents and premium sweets, create memories that linger long after the vows.",
    diwali: "Celebrate the festival of lights with the ultimate expression of luxury. Pair our signature long-lasting Indian EDPs with premium sweets, presented in custom festive packaging designed to show your deepest appreciation.",
    holi: "Make this festival of colors truly memorable with our vibrant fragrance hampers. Gift your loved ones the fresh, uplifting scents of nature, combined with premium treats and elegant presentation.",
    "new-year": "Step into the new year with a fresh signature scent. Show your partners, employees, or loved ones your appreciation with a custom perfume box designed for a sophisticated beginning.",
    christmas: "Warm up the holiday season with the gift of signature scent. Our Christmas hampers offer a selection of rich woody and amber perfumes, paired with premium delicacies and beautifully wrapped in festive ribbons.",
  }[occasion];

  const formTitle = {
    corporate: "Corporate Inquiry Form",
    wedding: "Wedding Gifting Inquiry",
    diwali: "Diwali Gifting Inquiry",
    holi: "Holi Gifting Inquiry",
    "new-year": "New Year Gifting Inquiry",
    christmas: "Holiday Gifting Inquiry",
  }[occasion];

  const customBrandingTitle = {
    corporate: "Bespoke Personalization",
    wedding: "Custom Initials & Engraving",
    diwali: "Bespoke Festive Sleeves",
    holi: "Custom Celebration Hampers",
    "new-year": "Brand & New Year Greetings",
    christmas: "Bespoke Holiday Ribbons",
  }[occasion];

  const customBrandingDesc = {
    corporate: "At HUME, we believe corporate gifting is an art form. We work closely with brand teams, HR personnel, and executive assistants to provide custom branding solutions that feel authentic, premium, and sophisticated.",
    wedding: "Make your gifts as unique as your love. We work with couples and wedding planners to print custom wedding tags, engrave initials on bottles, and craft silk ribbons matching your wedding theme.",
    diwali: "Elevate your festive greetings. We offer custom laser-printed gold tags, logo box sleeves, and personalized greeting cards enclosed inside each premium sweet and scent box.",
    holi: "Celebrate with color and scent. Our team crafts customized occasion sleeves, colorful hampers, and personalized fragrance selections that reflect the joy of the festival.",
    "new-year": "Begin the year with recognition. We print custom new year cards, company logo bands, and personalized relationship manager notes inside every gift box.",
    christmas: "Spread holiday joy with bespoke details. Choose holiday-themed silk bows, custom laser-etched messages on perfume bottles, and tailor-made mist assortments.",
  }[occasion];

  const customizationPillars = [
    {
      title: "Laser Engraved Bottles",
      desc: "Precision etch your custom initials, logo, or message directly onto the glass bottle for a premium permanent finish.",
    },
    {
      title: "Bespoke Outer Packaging",
      desc: "Incorporate custom colors, silk ribbons, or personalized message card envelopes inside the presentation box.",
    },
    {
      title: "Fragrance Curation",
      desc: "Our fragrance consultants help select notes (citrus, woody, fresh, or amber) suited to your specific demographic.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fbfaf8] text-[#171717]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 text-[#fffaf2] md:py-36">
        <Image
          src="/images/occasions/corporate-gifting-hero-new.jpg"
          alt="HUME Fragrance Gifting Presentation"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-stone-500/10 blur-[80px]" />

        <div className="container-luxury relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#d8b46d] md:text-xs">
            {tagline}
          </p>
          <h1 className="mt-6 font-serif text-4xl font-light italic leading-tight tracking-tight sm:text-6xl md:text-7xl">
            {title}
          </h1>
          <h2 className="mt-2 font-serif text-2xl font-light tracking-wide text-zinc-300 sm:text-3xl">
            {subtitle}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base hidden md:block">
            {description}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="#inquire"
              className="inline-flex h-11 items-center bg-[#d8b46d] px-6 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-[#c9aa72]"
            >
              Inquire Now
            </a>
            <a
              href={`https://wa.me/919559024822?text=Hello%20HUME%2C%20I%20am%20interested%20in%20gifting%20options%20for%20${occasion}.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center border border-white/20 bg-white/5 px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10"
            >
              WhatsApp Team
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
              Select from our pre-configured gift sets or work with our specialists to design a custom fragrance box.
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
                A premium pairing of a signature 50ml Eau de Parfum and artisanal Kaju Katli (kaju barfi), presented in an elegant gift box. Perfect for modern occasions.
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
                  <span>Custom Box Sleeve Print</span>
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
                A curated trio featuring a signature 50ml Eau de Parfum, pure Rose Water (Gulab Jal) daily face mist, and artisanal Kaju Katli. A comprehensive luxury experience.
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
                A fully custom-made luxury hamper tailored to your requirements. Select and combine multiple premium perfumes, car fragrances, mist sprays, and assortments of premium dry fruits.
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
              <h3 className="font-serif text-2xl font-light mb-6">{formTitle}</h3>
              <CorporateGiftingForm occasion={occasion} />
            </div>

            <div className="order-2 lg:order-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b45309]">
                End-To-End Bespoke Support
              </p>
              <h3 className="mt-3 font-serif text-3xl font-light tracking-wide sm:text-4xl">
                {customBrandingTitle}
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {customBrandingDesc}
              </p>
              <div className="mt-8 space-y-4">
                {customizationPillars.map((item, i) => (
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
