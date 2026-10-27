import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DiscoveryGuideLinks from "@/components/DiscoveryGuideLinks";
import { JsonLd } from "@/components/JsonLd";
import { DISCOVERY_GUIDES, discoveryGuidePath, getDiscoveryGuide } from "@/lib/discovery-guides";
import { DISCOVERY_SET_IMAGES, DISCOVERY_SET_PATH, DISCOVERY_SET_PRICE, DISCOVERY_SET_SIZE, DISCOVERY_SET_STATUS } from "@/lib/discovery-set";
import { getRequestSiteUrl } from "@/lib/request-site";
import { siteUrlForBase } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return DISCOVERY_GUIDES.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getDiscoveryGuide((await params).slug);
  if (!guide) notFound();
  const base = await getRequestSiteUrl();
  const url = siteUrlForBase(base, discoveryGuidePath(guide.slug));
  return {
    title: { absolute: `${guide.title} | HUME` },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: "article", images: [{ url: siteUrlForBase(base, DISCOVERY_SET_IMAGES[0]) }] },
  };
}

export default async function DiscoveryGuidePage({ params }: Props) {
  const guide = getDiscoveryGuide((await params).slug);
  if (!guide) notFound();
  const base = await getRequestSiteUrl();
  const url = siteUrlForBase(base, discoveryGuidePath(guide.slug));
  return (
    <>
      <Header />
      <main className="bg-background pt-28 text-foreground">
        <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: url, image: siteUrlForBase(base, DISCOVERY_SET_IMAGES[0]), author: { "@type": "Organization", name: "HUME Fragrance", url: base }, about: { "@type": "Product", name: "HUME Discovery Set", url: siteUrlForBase(base, DISCOVERY_SET_PATH) } }} />
        <article className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-foreground"><Link href={DISCOVERY_SET_PATH} className="underline underline-offset-4">Discovery set</Link><span aria-hidden="true"> / </span><span>{guide.title}</span></nav>
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">HUME discovery guide</p>
              <h1 className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">{guide.title}</h1>
              <p className="mt-6 text-base leading-8 text-muted-foreground">{guide.intro}</p>
              <p className="mt-4 text-sm font-semibold">{DISCOVERY_SET_SIZE} · ₹{DISCOVERY_SET_PRICE} · {DISCOVERY_SET_STATUS}</p>
              <Link href={DISCOVERY_SET_PATH} className="mt-6 inline-block bg-foreground px-6 py-3 text-sm font-semibold text-background">Choose your fragrances</Link>
            </div>
            <Image src={DISCOVERY_SET_IMAGES[0]} alt="HUME discovery set with fifteen 3ml fragrance samples" width={900} height={900} priority className="h-auto w-full border border-border object-contain" />
          </div>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_0.5fr]">
            <div className="space-y-9">{guide.sections.map((section) => <section key={section.title}><h2 className="font-serif text-3xl font-light">{section.title}</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{section.body}</p></section>)}</div>
            <aside className="h-fit border border-border bg-secondary p-6">
              <h2 className="font-serif text-2xl">Your checklist</h2>
              <ul className="mt-5 list-disc space-y-4 pl-5 text-sm leading-7">{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
              <p className="mt-6 text-xs leading-6 text-muted-foreground">See the builder for current fragrance choices and availability. Review delivery charges and the final total at checkout.</p>
              <Link href={DISCOVERY_SET_PATH} className="mt-5 inline-block text-sm font-semibold underline underline-offset-4">Build your sample set</Link>
            </aside>
          </div>
        </article>
        <DiscoveryGuideLinks exclude={guide.slug} />
      </main>
      <Footer />
    </>
  );
}
