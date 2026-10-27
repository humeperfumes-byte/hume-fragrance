import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { BEGINNER_PERFUME_GUIDES, BEGINNER_GUIDES_PATH, beginnerGuidePath, getBeginnerGuide } from "@/lib/beginner-perfume-guides";
import { getBeginnerGuideProducts } from "@/lib/beginner-guide-products";
import { DISCOVERY_SET_IMAGES, DISCOVERY_SET_PATH, DISCOVERY_SET_PRICE, DISCOVERY_SET_SIZE, DISCOVERY_SET_STATUS } from "@/lib/discovery-set";
import { getAllProducts } from "@/lib/db/products";
import { getProductPath } from "@/lib/product-route";
import { getRequestSiteUrl } from "@/lib/request-site";
import { formatINR } from "@/lib/currency";
import { getBreadcrumbSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return BEGINNER_PERFUME_GUIDES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getBeginnerGuide((await params).slug);
  if (!guide) notFound();
  const base = await getRequestSiteUrl();
  const url = `${base}${beginnerGuidePath(guide.slug)}`;
  const description = guide.answer.split(/(?<=\.) /).slice(0, 2).join(" ");
  return { title: { absolute: `${guide.title} | HUME` }, description, alternates: { canonical: url }, openGraph: { title: guide.title, description, url, type: "article", images: [{ url: `${base}${DISCOVERY_SET_IMAGES[0]}`, alt: "HUME perfume discovery set" }] }, twitter: { card: "summary_large_image", title: guide.title, description, images: [`${base}${DISCOVERY_SET_IMAGES[0]}`] } };
}

export default async function BeginnerGuidePage({ params }: Props) {
  const guide = getBeginnerGuide((await params).slug);
  if (!guide) notFound();
  const [base, catalogue] = await Promise.all([getRequestSiteUrl(), guide.productIds.length > 0 ? getAllProducts() : Promise.resolve([])]);
  const products = getBeginnerGuideProducts(guide, catalogue);
  const related = BEGINNER_PERFUME_GUIDES.filter(item => item.group === guide.group && item.slug !== guide.slug);
  const index = BEGINNER_PERFUME_GUIDES.indexOf(guide);
  const relatedGuides = [...related.slice(index % Math.max(related.length, 1)), ...related.slice(0, index % Math.max(related.length, 1))].slice(0, 3);
  const next = { quiz: { href: "/scent-quiz", label: "Explore your scent preferences" }, samples: { href: DISCOVERY_SET_PATH, label: "Choose your discovery samples" }, shop: { href: "/shop", label: "Explore HUME perfumes" } }[guide.nextStep];
  const url = `${base}${beginnerGuidePath(guide.slug)}`;
  const schema = [
    { "@context": "https://schema.org", "@type": "Article", "@id": `${url}#article`, headline: guide.title, description: guide.answer, mainEntityOfPage: url, image: `${base}${DISCOVERY_SET_IMAGES[0]}`, author: { "@type": "Organization", name: "HUME Fragrance", url: base }, publisher: { "@type": "Organization", name: "HUME Fragrance", url: base }, articleSection: guide.group, articleBody: [guide.answer, ...guide.sections.map(section => `${section.title}. ${section.body}`), guide.exercise, guide.humeTip].join("\n\n") },
    getBreadcrumbSchema([{ name: "Home", url: base }, { name: "First perfume guides", url: `${base}${BEGINNER_GUIDES_PATH}` }, { name: guide.title, url }]),
  ];
  return <>
    <Header />
    <main className="bg-background pt-28 text-foreground">
      <JsonLd data={schema} />
      <article className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <nav aria-label="Article breadcrumb" className="text-xs leading-6 text-muted-foreground"><Link href={BEGINNER_GUIDES_PATH} className="underline underline-offset-4">First perfume guides</Link><span aria-hidden="true"> / </span><span>{guide.group}</span></nav>
        <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <header>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">{guide.group}</p>
            <h1 className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">{guide.title}</h1>
            <p className="mt-6 text-base leading-8 text-muted-foreground">{guide.answer}</p>
            <p className="mt-5 text-xs text-muted-foreground">A HUME Fragrance buying guide</p>
          </header>
          <figure><Image src={DISCOVERY_SET_IMAGES[0]} alt="HUME discovery set for comparing perfume samples" width={600} height={600} priority className="h-auto w-full border border-border object-contain" /><figcaption className="mt-2 text-xs leading-6 text-muted-foreground">Explore different HUME fragrances before choosing a full bottle.</figcaption></figure>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.5fr]">
          <div>{guide.sections.map((section, index) => <section id={`step-${index}`} key={section.title} className="mb-9 scroll-mt-28"><h2 className="font-serif text-2xl font-light sm:text-3xl">{section.title}</h2><p className="mt-4 text-sm leading-8 text-muted-foreground">{section.body}</p></section>)}
            {guide.chart && <section className="mb-9"><h2 className="font-serif text-2xl">At a glance</h2><div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left text-xs leading-6"><caption className="sr-only">{guide.title}: comparison chart</caption><thead className="bg-secondary"><tr>{guide.chart.headers.map(header => <th key={header} scope="col" className="border-b border-border p-3 font-semibold">{header}</th>)}</tr></thead><tbody>{guide.chart.rows.map(row => <tr key={row[0]}>{row.map((cell, index) => index === 0 ? <th key={index} scope="row" className="border-b border-border p-3 font-semibold">{cell}</th> : <td key={index} className="border-b border-border p-3 text-muted-foreground">{cell}</td>)}</tr>)}</tbody></table></div></section>}
            <section className="border-l-2 border-gold bg-secondary p-5"><h2 className="font-serif text-2xl">Try this before you buy</h2><p className="mt-3 text-sm leading-8">{guide.exercise}</p></section>
            {guide.sources && <section className="mt-8"><h2 className="text-sm font-semibold">Further reading</h2><ul className="mt-3 space-y-2 text-xs leading-6">{guide.sources.map(source => <li key={source.url}><a href={source.url} className="underline underline-offset-4">{source.title}</a></li>)}</ul></section>}
          </div>
          <aside className="h-fit border border-border bg-secondary p-5">
            <h2 className="font-serif text-2xl">Your next step with HUME</h2>
            <p className="mt-4 text-sm leading-8 text-muted-foreground">{guide.humeTip}</p>
            <Link href={next.href} className="mt-5 inline-block bg-foreground px-4 py-3 text-sm font-semibold text-background">{next.label}</Link>
            <div className="mt-6 border-t border-border pt-5"><h3 className="text-sm font-semibold">Build your own discovery set</h3><p className="mt-3 text-sm leading-7">{DISCOVERY_SET_SIZE} · {formatINR(DISCOVERY_SET_PRICE)} · {DISCOVERY_SET_STATUS}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">Choose from available HUME fragrances. These are HUME perfumes, including inspired interpretations, rather than original designer-brand decants. Review current availability and the final checkout total.</p><Link href={DISCOVERY_SET_PATH} className="mt-3 inline-block text-xs font-semibold underline underline-offset-4">See the kit and available samples</Link></div>
            <nav aria-label="Purchase information" className="mt-6 flex flex-wrap gap-4 text-xs underline underline-offset-4"><Link href="/shipping-policy">Shipping</Link><Link href="/return-refund-policy">Returns</Link><Link href="/contact">Ask HUME</Link></nav>
          </aside>
        </div>
        {products.length > 0 && <section className="mt-12 border-t border-border pt-10"><h2 className="font-serif text-3xl font-light">HUME fragrances to explore</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Examples for comparing the scent directions discussed here. Notes below come from the current catalogue; they are not a personal-fit or performance guarantee.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{products.map(product => <Link key={product.id} href={getProductPath(product)} className="border border-border bg-secondary p-5 hover:border-gold"><h3 className="font-serif text-2xl">HUME {product.name}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">Listed notes: {[...product.notes.top, ...product.notes.heart, ...product.notes.base].join(", ")}</p><p className="mt-3 text-sm">{product.size} · {formatINR(product.price)}</p><span className="mt-4 inline-block text-xs font-semibold underline underline-offset-4">View fragrance details</span></Link>)}</div></section>}
        <section className="mt-14 border-t border-border pt-10"><h2 className="font-serif text-3xl font-light">Continue exploring</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{relatedGuides.map(item => <Link key={item.slug} href={beginnerGuidePath(item.slug)} className="border border-border p-5 text-sm leading-7 hover:border-gold">{item.title}</Link>)}</div><Link href={BEGINNER_GUIDES_PATH} className="mt-6 inline-block text-sm underline underline-offset-4">All beginner perfume guides</Link></section>
      </article>
    </main>
    <Footer />
  </>;
}
