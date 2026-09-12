import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, House, Sparkles, SprayCan, Wind } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SpacesCta, SpacesShell } from "@/components/spaces/SpacesShell";
import SpacesProductCard from "@/components/spaces/SpacesProductCard";
import { SPACE_SCENTS, SPACES_PRODUCTS } from "@/lib/spaces";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "HUME Spaces | Luxury Reed Diffusers, Room Fresheners & Scent Machines",
  description: "Shop luxury reed diffusers, ambient room freshener sprays, waterless cold-air scent machines and spatial oils for homes, hotels, offices & retail in India.",
  alternates: { canonical: `${SITE_URL}/spaces` },
};

const categories = [
  {
    title: "Reed Diffusers",
    eyebrow: "Passive & Decorative",
    description: "Cold-pressed scenting in weighted glass vessels for bedrooms, suites, and foyers.",
    href: "/spaces/reed-diffusers",
    icon: House,
    tag: "150ml & 300ml Vessels",
  },
  {
    title: "Room Fresheners & Mists",
    eyebrow: "Instant Ambient Refresh",
    description: "Fine-mist sprays for drapes, linens, guest arrivals, and instant atmosphere transformation.",
    href: "/spaces/room-fresheners",
    icon: SprayCan,
    tag: "100ml Fine Mist",
  },
  {
    title: "Waterless Scent Machines",
    eyebrow: "Controlled Diffusion",
    description: "Smart cold-air micro-nebulizers and HVAC integration for large open spaces and commercial properties.",
    href: "/spaces/scent-machines",
    icon: Wind,
    tag: "Up to 1,500 sq ft",
  },
  {
    title: "Spatial Fragrance Oils",
    eyebrow: "Refill Library",
    description: "Pure spatial oil concentrates designed for continuous diffusion without residue.",
    href: "/spaces/fragrance-oils",
    icon: Sparkles,
    tag: "100ml Refills",
  },
];

const industries = [
  "luxury-homes",
  "hotels",
  "corporate-offices",
  "retail-stores",
  "restaurants",
  "spas-and-salons",
  "real-estate",
  "events",
  "interior-designers",
];

export default function SpacesPage() {
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "HUME Spaces",
      provider: { "@type": "Organization", name: "HUME Fragrance", url: SITE_URL },
      areaServed: "India",
      serviceType: [
        "Luxury reed diffusers",
        "Ambient room fresheners",
        "Waterless scent machines",
        "Commercial scenting",
        "Signature scent design",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "HUME Spaces", item: `${SITE_URL}/spaces` },
      ],
    },
  ];

  return (
    <SpacesShell>
      <JsonLd data={schema} />

      {/* Hero Section: Immersive Clean Video Background */}
      <section className="relative h-[88svh] w-full overflow-hidden bg-[#171713] text-white">
        {/* Video Player with Fallback Image */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/spaces/hume-spaces-hero.png"
          className="absolute inset-0 h-full w-full object-cover object-center"
        >
          <source src="/videos/spaces-hero.mp4" type="video/mp4" />
          <source src="/videos/raksha-bandhan-hero.mp4" type="video/mp4" />
        </video>

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20 pointer-events-none" />

        {/* Minimal Floating Button */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex justify-center">
          <a
            href="#shop-collection"
            className="inline-flex items-center gap-2.5 rounded-full border border-white/50 bg-stone-950/70 px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white shadow-xl backdrop-blur-md transition-all hover:bg-white hover:text-black"
          >
            Explore <ArrowDown size={14} />
          </a>
        </div>
      </section>

      {/* Second Section: OUR SOLUTIONS - Diffusers & Scent Machines */}
      <section className="bg-[#F9F8F4] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#55524B]">
                  OUR SOLUTIONS
                </span>
                <span className="h-px w-10 bg-[#8C877D]/40" />
              </div>

              <h2 className="mt-3 font-serif text-4xl font-light leading-tight md:text-5xl text-[#171713]">
                Diffusers &amp; Scent Machines
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#55524B] font-normal">
                Advanced technology. Elegant design. Our diffusers and fragrance machines are built for performance, durability and seamless integration into any space.
              </p>
            </div>

            <div>
              <Link
                href="#shop-collection"
                className="inline-flex items-center gap-2 border border-[#33312B] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#171713] transition-colors hover:bg-[#171713] hover:text-white shrink-0"
              >
                VIEW ALL PRODUCTS <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* 2-Column Mobile & 4-Column Desktop Solutions Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Aroma Diffusers",
                description: "For homes, offices & small spaces.",
                href: "/spaces/scent-machines",
                image: "/images/spaces/aroma-diffuser.png",
              },
              {
                title: "Commercial Diffusers",
                description: "For large spaces & high-traffic areas.",
                href: "/spaces/for-business",
                image: "/images/spaces/commercial-diffuser.png",
              },
              {
                title: "HVAC Diffusers",
                description: "Whole building fragrance systems.",
                href: "/spaces/scent-machines",
                image: "/images/spaces/hvac-diffuser-v2.png",
              },
              {
                title: "Decorative Diffusers",
                description: "Luxury design for premium spaces.",
                href: "/spaces/reed-diffusers",
                image: "/images/spaces/decorative-diffuser.png",
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-black/8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all hover:border-black/20 hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F2EFE8]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
                  <div>
                    <h3 className="font-serif text-lg font-light leading-tight sm:text-2xl text-[#171713]">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-[#66635B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-6">
                    <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-black/10 text-[#171713] transition-all group-hover:bg-[#171713] group-hover:text-white group-hover:border-transparent">
                      <ArrowRight size={14} className="sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Third Section: WHERE IT CAN BE USED / SPATIAL ENVIRONMENTS */}
      <section className="bg-white px-5 py-16 md:px-10 md:py-24 border-t border-black/10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8C7654]">
                SPATIAL APPLICATIONS
              </span>
              <span className="h-px w-10 bg-[#8C7654]/40" />
            </div>

            <h2 className="mt-3 font-serif text-4xl font-light leading-tight md:text-5xl text-[#171713]">
              Where It Can Be Used
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-black/60">
              Tailored scenting plans for hospitality, wellness, commercial, and luxury residential environments. Click any environment to explore its custom setup.
            </p>
          </div>

          {/* Applications Grid: 2 columns mobile, 4 columns desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Hotels & Hospitality",
                tag: "Lobbies & Corridors",
                href: "/spaces/hotels",
                image: "/images/spaces/hotels-app.jpg",
              },
              {
                title: "Resorts & Retreats",
                tag: "Villas & Pavilions",
                href: "/spaces/resorts",
                image: "/images/spaces/resorts-app.jpg",
              },
              {
                title: "Gyms & Wellness",
                tag: "Studios & Lockers",
                href: "/spaces/gyms",
                image: "/images/spaces/gyms-app.png",
              },
              {
                title: "Bedrooms & Suites",
                tag: "Residential Rooms",
                href: "/spaces/rooms",
                image: "/images/spaces/rooms-app.png",
              },
              {
                title: "Bathrooms & Powder Rooms",
                tag: "Flameless Reeds",
                href: "/spaces/bathrooms",
                image: "/images/spaces/bathrooms-app.png",
              },
              {
                title: "Receptions & Lounges",
                tag: "Corporate Touches",
                href: "/spaces/receptions",
                image: "/images/spaces/receptions-app.jpg",
              },
              {
                title: "HVAC System Integration",
                tag: "Whole Building",
                href: "/spaces/hvac-integration",
                image: "/images/spaces/hvac-diffuser-v2.png",
              },
              {
                title: "Retail & Showrooms",
                tag: "Customer Journeys",
                href: "/spaces/retail-stores",
                image: "/images/spaces/retail-stores-app.jpg",
              },
            ].map((app) => (
              <Link
                key={app.title}
                href={app.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-[#FAF8F5] transition-all hover:border-black/25 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#EFECE6]">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3 backdrop-blur-md bg-black/60 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white rounded-md">
                    {app.tag}
                  </div>
                </div>

                <div className="flex flex-1 items-center justify-between p-4 sm:p-5">
                  <h3 className="font-serif text-base sm:text-xl font-light text-[#171713] leading-snug">
                    {app.title}
                  </h3>
                  <span className="shrink-0 text-[#171713] transition-transform group-hover:translate-x-1">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fourth Section: 100+ FRAGRANCES CONTINUOUS MARQUEE TICKER */}
      <section className="relative overflow-hidden bg-[#171713] py-20 md:py-28 text-white border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 md:px-10 mb-12 text-center">
          <h2 className="font-serif text-3xl font-light md:text-5xl text-white">
            100+ Fragrances
          </h2>
        </div>

        {/* Marquee Row 1 (Moving Left) */}
        <div className="relative flex overflow-hidden py-3">
          <div className="animate-marquee-custom flex shrink-0 items-center gap-4">
            {[
              { name: "Ivory Lobby", notes: "Bergamot · White Tea · Cedar" },
              { name: "Santal Residence", notes: "Sandalwood · Iris · Amber" },
              { name: "Verdant Courtyard", notes: "Neroli · Fig Leaf · Vetiver" },
              { name: "Midnight Suite", notes: "Saffron · Rosewood · Oud" },
              { name: "Coastal Gallery", notes: "Mineral Air · Sage · Driftwood" },
              { name: "Quiet Library", notes: "Black Tea · Leather · Suede" },
              { name: "Amber Horizon", notes: "Golden Amber · Bourbon Vanilla" },
              { name: "Tubéreuse Royale", notes: "White Tuberose · Night Jasmine" },
              { name: "Vétiver Architectural", notes: "Smoky Vetiver · Dry Cedarwood" },
              { name: "Cardamom Foyer", notes: "Green Cardamom · Italian Bergamot" },
              { name: "Tabac & Cuir", notes: "Blonde Tobacco · Aged Leather" },
              { name: "Neroli Botanical", notes: "Bitter Orange Blossom · Petals" },
            ].map((scent, i) => (
              <div
                key={`r1-a-${i}`}
                className="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-white/15 shrink-0"
              >
                <Sparkles size={13} className="text-amber-300 shrink-0" />
                <span className="font-serif text-lg font-light text-white">{scent.name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-mono">
                  {scent.notes}
                </span>
              </div>
            ))}
          </div>

          {/* Duplicate set for smooth infinite loop */}
          <div className="animate-marquee-custom flex shrink-0 items-center gap-4" aria-hidden="true">
            {[
              { name: "Ivory Lobby", notes: "Bergamot · White Tea · Cedar" },
              { name: "Santal Residence", notes: "Sandalwood · Iris · Amber" },
              { name: "Verdant Courtyard", notes: "Neroli · Fig Leaf · Vetiver" },
              { name: "Midnight Suite", notes: "Saffron · Rosewood · Oud" },
              { name: "Coastal Gallery", notes: "Mineral Air · Sage · Driftwood" },
              { name: "Quiet Library", notes: "Black Tea · Leather · Suede" },
              { name: "Amber Horizon", notes: "Golden Amber · Bourbon Vanilla" },
              { name: "Tubéreuse Royale", notes: "White Tuberose · Night Jasmine" },
              { name: "Vétiver Architectural", notes: "Smoky Vetiver · Dry Cedarwood" },
              { name: "Cardamom Foyer", notes: "Green Cardamom · Italian Bergamot" },
              { name: "Tabac & Cuir", notes: "Blonde Tobacco · Aged Leather" },
              { name: "Neroli Botanical", notes: "Bitter Orange Blossom · Petals" },
            ].map((scent, i) => (
              <div
                key={`r1-b-${i}`}
                className="flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-white/15 shrink-0"
              >
                <Sparkles size={13} className="text-amber-300 shrink-0" />
                <span className="font-serif text-lg font-light text-white">{scent.name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-mono">
                  {scent.notes}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Moving Right) */}
        <div className="relative flex overflow-hidden py-3 mt-3">
          <div className="animate-marquee-reverse flex shrink-0 items-center gap-4">
            {[
              { name: "Cacao & Saffron", notes: "Warm Spice · Dark Chocolate" },
              { name: "Oud Wood Villa", notes: "Rare Agarwood · Damask Rose" },
              { name: "Bergamot Horizon", notes: "Calabrian Bergamot · Lemon Leaf" },
              { name: "White Cedar Lounge", notes: "Pale Cedarwood · Cashmere Musk" },
              { name: "Figue Sauvage", notes: "Wild Fig · Green Leaves · Bark" },
              { name: "Iris & Powder", notes: "Florentine Orris · Violet Root" },
              { name: "Smoked Tonka", notes: "Roasted Tonka Bean · Oak Ash" },
              { name: "Patchouli Mineral", notes: "Earthy Terracotta · Wet Stone" },
              { name: "Palissandre Royal", notes: "Exotic Hardwoods · Warm Resin" },
              { name: "Linen & Cotton", notes: "Fresh Air Mist · Clean Accord" },
              { name: "Black Tea Estate", notes: "Darjeeling Leaves · Smoked Cardamom" },
              { name: "Soleil D'Or", notes: "Golden Citrus · Solar Musk" },
            ].map((scent, i) => (
              <div
                key={`r2-a-${i}`}
                className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-white/15 shrink-0"
              >
                <Wind size={13} className="text-amber-300 shrink-0" />
                <span className="font-serif text-lg font-light text-white">{scent.name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-mono">
                  {scent.notes}
                </span>
              </div>
            ))}
          </div>

          {/* Duplicate set for smooth infinite loop */}
          <div className="animate-marquee-reverse flex shrink-0 items-center gap-4" aria-hidden="true">
            {[
              { name: "Cacao & Saffron", notes: "Warm Spice · Dark Chocolate" },
              { name: "Oud Wood Villa", notes: "Rare Agarwood · Damask Rose" },
              { name: "Bergamot Horizon", notes: "Calabrian Bergamot · Lemon Leaf" },
              { name: "White Cedar Lounge", notes: "Pale Cedarwood · Cashmere Musk" },
              { name: "Figue Sauvage", notes: "Wild Fig · Green Leaves · Bark" },
              { name: "Iris & Powder", notes: "Florentine Orris · Violet Root" },
              { name: "Smoked Tonka", notes: "Roasted Tonka Bean · Oak Ash" },
              { name: "Patchouli Mineral", notes: "Earthy Terracotta · Wet Stone" },
              { name: "Palissandre Royal", notes: "Exotic Hardwoods · Warm Resin" },
              { name: "Linen & Cotton", notes: "Fresh Air Mist · Clean Accord" },
              { name: "Black Tea Estate", notes: "Darjeeling Leaves · Smoked Cardamom" },
              { name: "Soleil D'Or", notes: "Golden Citrus · Solar Musk" },
            ].map((scent, i) => (
              <div
                key={`r2-b-${i}`}
                className="flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3.5 backdrop-blur-md transition-all hover:border-amber-300 hover:bg-white/15 shrink-0"
              >
                <Wind size={13} className="text-amber-300 shrink-0" />
                <span className="font-serif text-lg font-light text-white">{scent.name}</span>
                <span className="text-[10px] uppercase tracking-[0.14em] text-white/60 font-mono">
                  {scent.notes}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gradient edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#171713] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#171713] to-transparent z-10" />
      </section>

      {/* Featured E-Commerce Shop Section */}
      <section id="shop-collection" className="bg-[#FAF7F2] py-20 md:py-28 border-y border-black/10">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-black/50">HUME Spaces Shop</p>
              <h2 className="mt-3 font-serif text-4xl font-light md:text-6xl text-[#171713]">
                Reed Diffusers, Room Fresheners & Machines
              </h2>
            </div>
            <Link
              href="/spaces/reed-diffusers"
              className="mt-4 md:mt-0 text-xs font-semibold uppercase tracking-[0.2em] text-[#19231E] border-b border-black/30 pb-1 hover:border-black"
            >
              View All Products &rarr;
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {SPACES_PRODUCTS.map((product) => (
              <SpacesProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Spatial Fragrance Library Highlight */}
      <section className="bg-[#19231E] px-5 py-20 text-[#F4F0E6] md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#B9C6BB]">The Spatial Fragrance Library</p>
          <h2 className="mt-4 font-serif text-4xl font-light md:text-6xl text-white">
            50+ Fragrance Oils for Every Machine &amp; Space
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-sm leading-relaxed text-white/75 font-light">
            Every HUME scent machine, aroma diffuser, and HVAC system can be customized with your choice from our collection of nearly 50 signature spatial fragrance oil refills.
          </p>
        </div>
      </section>

      {/* B2B Industry Solutions Grid */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/50">Designed for Commercial & Residential Properties</p>
          <h2 className="mt-3 font-serif text-4xl font-light md:text-6xl text-[#171713]">
            Scenting by Property Type
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {industries.map((slug) => (
            <Link
              href={`/spaces/${slug}`}
              key={slug}
              className="flex items-center justify-between border border-black/15 bg-white px-6 py-5 text-sm font-medium capitalize text-[#171713] transition-all hover:border-black/50 hover:bg-[#FAF8F5] hover:pl-8"
            >
              {slug.replaceAll("-", " ")}
              <ArrowUpRight size={14} className="text-black/50" />
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <SpacesCta />
    </SpacesShell>
  );
}
