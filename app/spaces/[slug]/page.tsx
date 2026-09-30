import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SpacesCta, SpacesShell } from "@/components/spaces/SpacesShell";
import SpacesProductCard from "@/components/spaces/SpacesProductCard";
import { getSpacePage, SPACE_PAGES, SPACES_PRODUCTS, type SpacesProduct } from "@/lib/spaces";
import { HOTEL_SEO_PAGES } from "@/lib/hotel-seo-pages";
import { GYM_SEO_PAGES } from "@/lib/gym-seo-pages";
import { OFFICE_SEO_PAGES } from "@/lib/office-seo-pages";
import { AEO_PAGES } from "@/lib/aeo-pages";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return SPACE_PAGES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getSpacePage(slug);
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | HUME Spaces`,
    description: page.metaDescription || page.summary,
    alternates: { canonical: `${SITE_URL}/spaces/${slug}` },
  };
}

function ReedDiffuserCollection({ products }: { products: SpacesProduct[] }) {
  return (
    <>
      <section className="overflow-hidden bg-[#1a2922] text-[#f6f1e8]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-[1.05fr_.95fr]">
          <div className="flex min-h-[520px] flex-col justify-between px-5 pb-12 pt-36 md:min-h-[680px] md:px-10 md:pb-16 md:pt-44">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.38em] text-[#c8b18a]">HUME Spaces · Reed diffuser collection</p>
              <h1 className="mt-7 max-w-xl font-serif text-5xl font-light leading-[.9] md:text-7xl">A room, <em>held softly.</em></h1>
              <p className="mt-7 max-w-md text-sm leading-7 text-white/70 md:text-base">Flameless fragrance for the intimate spaces that make a home feel considered—crafted in a quietly proportioned format.</p>
              <Link href="#collection" className="mt-8 inline-flex items-center gap-3 border-b border-white/35 pb-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white transition-colors hover:border-white">Explore the collection <ArrowDown size={14} /></Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-[10px] font-semibold uppercase tracking-[.2em] text-white/70">
              <span>50ml · Personal spaces</span>
            </div>
          </div>
          <div className="relative min-h-[400px] bg-[#d9d0c1] md:min-h-0">
            <Image src="/images/spaces/decorative-diffuser.png" alt="HUME reed diffuser in a considered interior" fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
            <p className="absolute bottom-7 left-7 max-w-[15rem] text-[10px] font-medium uppercase leading-5 tracking-[.18em] text-white/80">An enduring gesture for the rooms closest to you</p>
          </div>
        </div>
      </section>

      <section id="collection" className="bg-[#f8f5ef] px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 border-b border-black/10 pb-10 md:grid-cols-[.65fr_1.35fr] md:items-end">
            <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-black/45">The Vessel</p>
            <div>
              <h2 className="font-serif text-4xl font-light leading-[.95] text-[#171713] md:text-6xl">Designed for quiet,<br /><em>daily living.</em></h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-black/60">Uses natural rattan reeds and gradual, alcohol-free diffusion for intimate personal spaces.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-7 sm:grid-cols-2 lg:grid-cols-3 md:gap-10">
            {products.map((product, index) => (
              <div key={product.id}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.25em] text-black/40">0{index + 1} · For intimate rituals</p>
                <SpacesProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#e9e2d7] px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.85fr_1.15fr] md:items-center">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.32em] text-black/45">The first 24 hours</p><h2 className="mt-4 font-serif text-4xl font-light leading-none md:text-5xl">Let the room<br /><em>find its rhythm.</em></h2></div>
          <div className="grid gap-5 sm:grid-cols-3">
            {["Uncap the vessel and arrange the reeds.", "Begin with four reeds; add to increase presence.", "Turn the reeds every one to two weeks."].map((step, index) => <div key={step} className="border-t border-black/20 pt-4"><span className="text-[10px] font-mono text-black/40">0{index + 1}</span><p className="mt-7 text-sm leading-6 text-black/70">{step}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-[.65fr_1.35fr]"><div><p className="text-[10px] font-semibold uppercase tracking-[.32em] text-black/45">Placement, considered</p><h2 className="mt-5 font-serif text-4xl font-light leading-[.95] md:text-5xl">The right surface makes the scent.</h2></div><div className="grid gap-px bg-black/10 sm:grid-cols-2">{[["50ml Format", "Bedside tables, powder rooms, wardrobes and intimate work desks."], ["Always", "Keep away from direct sun, strong AC vents, children and pets on a stable surface."]].map(([title, text]) => <div key={title} className="bg-white p-6"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-black/45">{title}</p><p className="mt-7 text-sm leading-6 text-black/70">{text}</p></div>)}</div></div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20 md:pb-28"><p className="mb-8 text-center text-[10px] font-semibold uppercase tracking-[.32em] text-black/45">Questions, answered</p>{["How long will a reed diffuser last?", "Can I adjust the fragrance intensity?", "Where should I not place a diffuser?"].map((question, index) => <details key={question} className="group border-t border-black/15 py-5"><summary className="cursor-pointer list-none font-serif text-2xl">{question}</summary><p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">{index === 0 ? "Longevity depends on room temperature, airflow and the number of reeds used. The 50ml format is designed for smaller personal spaces and gradual evaporation over several weeks." : index === 1 ? "Yes. Start with four reeds and add one or two at a time when you would like a stronger presence. Turning the reeds provides a gentler refresh." : "Avoid direct sunlight, heat sources, strong AC vents and any surface where spills could damage a finish. Keep the vessel out of reach of children and pets."}</p></details>)}</section>
      <SpacesCta compact />
    </>
  );
}

export default async function SpaceDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSpacePage(slug);
  if (!page) notFound();

  // Filter e-commerce products matching the category slug
  const matchingProducts = SPACES_PRODUCTS.filter((p) => {
    if (slug === "reed-diffusers") return p.category === "reed-diffuser";
    if (slug === "room-fresheners") return p.category === "room-freshener";
    if (slug === "scent-machines") return p.category === "scent-machine";
    if (slug === "fragrance-oils") return p.category === "fragrance-oil";
    return true; // Return all for home, for-business, or industry pages
  });

  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  if (slug === "reed-diffusers") {
    return <SpacesShell><JsonLd data={[faq, { "@context": "https://schema.org", "@type": "ProductGroup", name: "HUME Reed Diffusers", description: page.summary, hasVariant: matchingProducts.map((product) => ({ "@type": "Product", name: product.name, sku: product.id, size: product.size, offers: { "@type": "Offer", price: product.price, priceCurrency: "INR", availability: "https://schema.org/InStock" } })) }]} /><ReedDiffuserCollection products={matchingProducts} /></SpacesShell>;
  }

  return (
    <SpacesShell>
      <JsonLd
        data={[
          faq,
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: page.title,
            description: page.summary,
            provider: { "@type": "Organization", name: "HUME Fragrance" },
            areaServed: "India",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "HUME Spaces",
                item: `${SITE_URL}/spaces`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: page.title,
                item: `${SITE_URL}/spaces/${slug}`,
              },
            ],
          },
        ]}
      />

      {/* Hero Section */}
      <section className="bg-[#19231E] px-5 pb-24 pt-32 text-[#F4F0E6] md:px-10 md:pb-28 md:pt-40">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb Links */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/spaces" className="text-[#c8b18a] hover:underline font-semibold">HUME Spaces</Link>
            <span>/</span>
            <span className="text-white/80 truncate max-w-[280px] sm:max-w-none">{page.title}</span>
          </nav>

          <p className="text-[10px] uppercase tracking-[0.4em] text-[#B9C6BB] font-medium">
            {page.eyebrow}
          </p>
          <h1 className="mt-5 max-w-5xl font-serif text-5xl font-light leading-[0.92] md:text-[6.5rem]">
            {page.title}
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-white/75 md:text-base font-light">
            {page.summary}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 bg-[#8C7654] px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
            >
              Explore HUME Spaces <ArrowUpRight size={14} />
            </Link>
            <Link
              href="/spaces/selector"
              className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-colors"
            >
              Get Custom Recommendation <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Answer / Insight Section */}
      <section className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-8 md:grid-cols-[0.4fr_1fr] items-center border-b border-black/10 pb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-black/50 font-semibold">
            Spatial Guidance
          </p>
          <p className="font-serif text-2xl leading-tight md:text-4xl text-[#171713]">
            {page.answer}
          </p>
        </div>
      </section>

      {/* Key Takeaways Section for SEO & Hospitality Decision Makers */}
      {page.keyTakeaways && page.keyTakeaways.length > 0 && (
        <section className="bg-[#FAF7F2] border-b border-black/10 py-12 px-5 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl border border-black/10 bg-white p-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8C7654]">
                  Key Strategic Insights
                </span>
                <span className="h-px flex-1 bg-black/10" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {page.keyTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check size={18} className="text-[#8C7654] shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-black/75 leading-relaxed">{takeaway}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Deep Content Sections for In-Depth Hospitality Scenting */}
      {page.contentSections && page.contentSections.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 py-16 md:px-10 md:py-20 border-b border-black/10">
          <div className="space-y-12">
            {page.contentSections.map((section, idx) => (
              <article key={idx} className="border-b border-black/10 pb-12 last:border-b-0 last:pb-0">
                <h2 className="font-serif text-2xl md:text-3xl text-[#171713] leading-snug">
                  {section.heading}
                </h2>
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-black/70 font-light">
                  {section.body}
                </p>
              </article>
            ))}
          </div>

          {/* Direct Internal Link Box to HUME Spaces Overview */}
          <div className="mt-14 rounded-2xl bg-[#F4EFE6] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[#8C7654]/30 shadow-sm">
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#8C7654] font-semibold">HUME Spaces Architecture</p>
              <h3 className="mt-1 font-serif text-xl sm:text-2xl text-[#171713]">Explore the Complete HUME Spaces Collection</h3>
              <p className="mt-1.5 text-xs text-black/65 leading-relaxed">
                Discover cold-air micro-nebulizers, whole-building central HVAC scenting, and over 50 IFRA-certified spatial fragrance oils engineered for Indian hospitality.
              </p>
            </div>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-2 bg-[#171713] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#8C7654] transition-colors shrink-0 rounded-none"
            >
              Back to HUME Spaces <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* Products Grid for this Category */}
      {matchingProducts.length > 0 && (
        <section className="bg-[#FAF7F2] py-20 border-y border-black/10">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-black/50">
                  Featured Products
                </p>
                <h2 className="mt-2 font-serif text-3xl font-light md:text-5xl text-[#171713]">
                  Available for Direct Order
                </h2>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {matchingProducts.map((product) => (
                <SpacesProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommendations & Placement Cards */}
      <section className="border-b border-black/10 bg-[#E5DFD4]">
        <div className="mx-auto grid max-w-7xl md:grid-cols-3">
          {page.recommendations.map((item, i) => (
            <article
              key={item.title}
              className="min-h-[280px] border-black/10 p-8 md:border-r md:p-10 flex flex-col justify-between"
            >
              <span className="text-[10px] font-mono text-black/40">0{i + 1}</span>
              <div>
                <h2 className="font-serif text-2xl text-[#171713]">{item.title}</h2>
                <p className="mt-3 text-xs leading-6 text-black/65">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Spatial Scents List if Fragrance Oils */}
      {slug === "fragrance-oils" && (
        <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
          <div className="mb-10">
            <p className="text-[10px] uppercase tracking-[0.35em] text-black/50">
              Scent Catalog
            </p>
            <h2 className="mt-2 font-serif text-4xl">50+ Spatial Fragrance Oils Library</h2>
            <p className="mt-2 text-xs text-black/60">Choose from nearly 50 signature scent formulations designed for continuous cold-air and HVAC diffusion.</p>
          </div>
        </section>
      )}

      {/* Execution Standards */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-black/45">
              The HUME Standard
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light text-[#171713]">
              Measured, subtle and continuous.
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "Review the space, volume, airflow, and occupancy",
              "Select vessel format: Reeds vs. Room Spray vs. Cold-Air Machine",
              "Calibrate intensity and placement for optimum sillage",
              "Maintain with approved spatial refills and scheduled care",
            ].map((x) => (
              <p key={x} className="flex items-center gap-3 border-t border-black/15 pt-4 text-xs font-medium text-black/80">
                <Check size={16} className="text-emerald-800 shrink-0" /> {x}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-4xl px-5 py-20 md:py-28">
        <p className="mb-10 text-center text-[10px] uppercase tracking-[0.35em] text-black/45">
          Frequently Asked Questions
        </p>
        {page.faqs.map((x) => (
          <details key={x.question} className="group border-t border-black/15 py-6">
            <summary className="cursor-pointer list-none font-serif text-2xl text-[#171713]">
              {x.question}
            </summary>
            <p className="mt-4 max-w-2xl text-xs leading-6 text-black/65">{x.answer}</p>
          </details>
        ))}
      </section>

      {/* Related Topic Cluster Guides */}
      {(page.kind === "seo" || slug === "hotels" || slug === "resorts" || slug === "gyms" || slug === "corporate-offices" || slug === "scent-machines") && (
        <section className="bg-[#19231E] px-5 py-16 md:px-10 md:py-24 text-white border-t border-white/10">
          <div className="mx-auto max-w-7xl">
            {AEO_PAGES.some((p) => p.slug === slug) ? (
              <>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B9C6BB]">AEO Knowledge Base</p>
                    <h2 className="mt-2 font-serif text-3xl md:text-5xl text-white font-light">
                      Scent Architecture &amp; Engineering Answers
                    </h2>
                    <p className="mt-2 text-xs text-white/60">
                      Authoritative, data-backed answers to essential commercial scenting, HVAC micro-nebulization, and olfactory branding questions.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/spaces/scent-machines"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b18a] hover:underline shrink-0"
                    >
                      Scent Machines &rarr;
                    </Link>
                    <Link
                      href="/spaces"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:underline shrink-0"
                    >
                      HUME Spaces Hub &rarr;
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {AEO_PAGES.filter((p) => p.slug !== slug).map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/spaces/${guide.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#c8b18a] hover:bg-white/10"
                    >
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#c8b18a] font-semibold">{guide.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-lg text-white group-hover:text-[#c8b18a] transition-colors leading-snug">
                          {guide.title}
                        </h3>
                        <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {guide.summary}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80 group-hover:text-white">
                        Read Answer <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            ) : slug.includes("gym") || slug.includes("fitness") ? (
              <>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B9C6BB]">Topic Cluster</p>
                    <h2 className="mt-2 font-serif text-3xl md:text-5xl text-white font-light">
                      Gym &amp; Fitness Scenting Guides
                    </h2>
                    <p className="mt-2 text-xs text-white/60">
                      Explore commercial diffuser specs, active sweat odor control, and member retention strategies for fitness clubs.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/spaces/gyms"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b18a] hover:underline shrink-0"
                    >
                      HUME Gym Solutions &rarr;
                    </Link>
                    <Link
                      href="/spaces"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:underline shrink-0"
                    >
                      HUME Spaces Hub &rarr;
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {GYM_SEO_PAGES.filter((p) => p.slug !== slug).map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/spaces/${guide.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#c8b18a] hover:bg-white/10"
                    >
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#c8b18a] font-semibold">{guide.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-lg text-white group-hover:text-[#c8b18a] transition-colors leading-snug">
                          {guide.title}
                        </h3>
                        <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {guide.summary}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80 group-hover:text-white">
                        Read Guide <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            ) : slug.includes("office") || slug === "corporate-offices" || slug.includes("workplace") ? (
              <>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B9C6BB]">Topic Cluster</p>
                    <h2 className="mt-2 font-serif text-3xl md:text-5xl text-white font-light">
                      Office &amp; Workplace Scenting Guides
                    </h2>
                    <p className="mt-2 text-xs text-white/60">
                      Explore corporate HVAC scenting, reception olfactory branding, productivity science, and employee comfort protocols.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/spaces/corporate-offices"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b18a] hover:underline shrink-0"
                    >
                      HUME Office Solutions &rarr;
                    </Link>
                    <Link
                      href="/spaces"
                      className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 hover:underline shrink-0"
                    >
                      HUME Spaces Hub &rarr;
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {OFFICE_SEO_PAGES.filter((p) => p.slug !== slug).map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/spaces/${guide.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#c8b18a] hover:bg-white/10"
                    >
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#c8b18a] font-semibold">{guide.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-lg text-white group-hover:text-[#c8b18a] transition-colors leading-snug">
                          {guide.title}
                        </h3>
                        <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {guide.summary}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80 group-hover:text-white">
                        Read Guide <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B9C6BB]">Topic Cluster</p>
                    <h2 className="mt-2 font-serif text-3xl md:text-5xl text-white font-light">
                      Hospitality &amp; Hotel Scenting Guides
                    </h2>
                    <p className="mt-2 text-xs text-white/60">
                      Explore specialized architectural guides for hotel lobbies, luxury resorts, and bespoke olfactory branding.
                    </p>
                  </div>
                  <Link
                    href="/spaces"
                    className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c8b18a] hover:underline shrink-0"
                  >
                    View HUME Spaces Overview &rarr;
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {HOTEL_SEO_PAGES.filter((p) => p.slug !== slug).map((guide) => (
                    <Link
                      key={guide.slug}
                      href={`/spaces/${guide.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-[#c8b18a] hover:bg-white/10"
                    >
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#c8b18a] font-semibold">{guide.eyebrow}</span>
                        <h3 className="mt-2 font-serif text-lg text-white group-hover:text-[#c8b18a] transition-colors leading-snug">
                          {guide.title}
                        </h3>
                        <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                          {guide.summary}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-white/80 group-hover:text-white">
                        Read Guide <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <SpacesCta compact />
    </SpacesShell>
  );
}
