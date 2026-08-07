import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SpacesCta, SpacesShell } from "@/components/spaces/SpacesShell";
import { getSpacePage, SPACE_PAGES, SPACE_SCENTS } from "@/lib/spaces";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() { return SPACE_PAGES.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const page = getSpacePage(slug); if (!page) return {}; return { title: `${page.title} | HUME Spaces`, description: page.summary, alternates: { canonical: `${SITE_URL}/spaces/${slug}` } }; }

export default async function SpaceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const page = getSpacePage(slug); if (!page) notFound();
  const faq = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <SpacesShell><JsonLd data={[faq, { "@context": "https://schema.org", "@type": "Service", name: page.title, description: page.summary, provider: { "@type": "Organization", name: "HUME Fragrance" }, areaServed: "India" }]}/>
    <section className="bg-[#19231e] px-5 pb-24 pt-40 text-[#f4f0e6] md:px-10 md:pb-32 md:pt-52"><div className="mx-auto max-w-7xl"><p className="text-[10px] uppercase tracking-[.4em] text-[#b9c6bb]">{page.eyebrow}</p><h1 className="mt-7 max-w-5xl font-serif text-6xl font-light leading-[.9] md:text-[7rem]">{page.title}</h1><p className="mt-10 max-w-2xl text-sm leading-7 text-white/65 md:text-base">{page.summary}</p><Link href="/spaces/selector" className="mt-10 inline-flex items-center gap-3 border-b border-white/40 pb-2 text-xs uppercase tracking-[.2em]">Request a recommendation <ArrowUpRight size={14}/></Link></div></section>
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28"><div className="grid gap-10 md:grid-cols-[.45fr_1fr]"><p className="text-[10px] uppercase tracking-[.35em] text-black/45">Quick answer</p><p className="font-serif text-3xl leading-tight md:text-5xl">{page.answer}</p></div></section>
    <section className="border-y border-black/10 bg-[#e5dfd4]"><div className="mx-auto grid max-w-7xl md:grid-cols-3">{page.recommendations.map((item, i) => <article key={item.title} className="min-h-[300px] border-black/10 p-8 md:border-r md:p-10"><span className="text-[10px] text-black/40">0{i+1}</span><h2 className="mt-20 font-serif text-3xl">{item.title}</h2><p className="mt-4 text-sm leading-6 text-black/60">{item.text}</p></article>)}</div></section>
    {slug === "fragrance-oils" && <section className="mx-auto max-w-7xl px-5 py-20 md:px-10"><div className="grid gap-5 md:grid-cols-2">{SPACE_SCENTS.map(s => <div key={s.name} className="border border-black/15 p-7"><h3 className="font-serif text-3xl">{s.name}</h3><p className="mt-3 text-sm">{s.notes}</p></div>)}</div></section>}
    <section className="mx-auto max-w-7xl px-5 py-24 md:px-10"><div className="grid gap-12 md:grid-cols-2"><div><p className="text-[10px] uppercase tracking-[.35em] text-black/45">How HUME approaches it</p><h2 className="mt-6 font-serif text-5xl font-light">Measured, subtle and serviceable.</h2></div><div className="space-y-6">{["Review the space, airflow and experience", "Select scent direction and diffusion method", "Trial and calibrate on site where available", "Maintain with approved oil and scheduled care"].map(x => <p key={x} className="flex gap-4 border-t border-black/15 pt-5 text-sm"><Check size={16}/>{x}</p>)}</div></div></section>
    <section className="mx-auto max-w-4xl px-5 py-20 md:py-28"><p className="mb-10 text-center text-[10px] uppercase tracking-[.35em] text-black/45">Questions, answered</p>{page.faqs.map(x => <details key={x.question} className="group border-t border-black/15 py-6"><summary className="cursor-pointer list-none font-serif text-2xl">{x.question}</summary><p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">{x.answer}</p></details>)}</section>
    <SpacesCta compact/>
  </SpacesShell>;
}
