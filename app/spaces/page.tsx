import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Building2, House, Wind } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SpacesCta, SpacesShell } from "@/components/spaces/SpacesShell";
import { SPACE_SCENTS } from "@/lib/spaces";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "HUME Spaces | Luxury Home Fragrance & Professional Scenting India",
  description: "Luxury reed diffusers, waterless scent machines, commercial scenting and signature scent design for homes, hotels, offices, retail and hospitality in India.",
  alternates: { canonical: `${SITE_URL}/spaces` },
};

const uses = [
  ["For the residence", "Reed diffusers and controlled systems for considered homes.", "/spaces/home", House],
  ["For business", "Managed scenting for hospitality, workplaces and retail.", "/spaces/for-business", Building2],
  ["Signature studio", "A bespoke olfactive identity, developed around your property.", "/spaces/signature-scent-studio", Wind],
] as const;

const industries = ["luxury-homes", "hotels", "corporate-offices", "retail-stores", "restaurants", "spas-and-salons", "real-estate", "events", "interior-designers"];

export default function SpacesPage() {
  const schema = [{ "@context": "https://schema.org", "@type": "Service", name: "HUME Spaces", provider: { "@type": "Organization", name: "HUME Fragrance", url: SITE_URL }, areaServed: "India", serviceType: ["Luxury home scenting", "Commercial scenting", "Signature scent design", "Scent diffuser installation"] }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "HUME Spaces", item: `${SITE_URL}/spaces` }] }];
  return <SpacesShell>
    <JsonLd data={schema}/>
    <section className="relative min-h-[92svh] overflow-hidden bg-[#171713] text-white">
      <Image src="/images/spaces/hume-spaces-hero.png" alt="Luxury residence with a discreet ambient scent diffuser" fill priority sizes="100vw" className="object-cover object-center opacity-75"/>
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/15 to-transparent"/>
      <div className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-end px-5 pb-14 pt-36 md:px-10 md:pb-20">
        <p className="mb-6 text-[10px] uppercase tracking-[.42em] text-white/70">HUME Spaces · Spatial fragrance</p>
        <h1 className="max-w-4xl font-serif text-6xl font-light leading-[.86] md:text-[7.5rem]">The invisible layer<br/><em>of a beautiful space.</em></h1>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-sm leading-7 text-white/75 md:text-base">Scent identities, diffusion systems and continuing care for distinguished homes, hospitality, workplaces and retail environments.</p>
          <Link href="#begin" className="inline-flex items-center gap-3 text-xs uppercase tracking-[.22em]">Explore the collection <ArrowDown size={15}/></Link>
        </div>
      </div>
    </section>

    <section id="begin" className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
      <div className="grid gap-14 md:grid-cols-[.8fr_1.2fr]">
        <p className="text-[10px] uppercase tracking-[.35em] text-black/50">A new division of HUME</p>
        <div><h2 className="font-serif text-4xl font-light leading-tight md:text-6xl">Not an air freshener.<br/>An atmosphere, designed.</h2><p className="mt-7 max-w-2xl text-sm leading-7 text-black/65">HUME Spaces selects fragrance, equipment, placement and intensity as one system. Reed diffusers belong in intimate rooms. Programmable waterless and HVAC-compatible systems serve larger, connected or high-traffic properties.</p></div>
      </div>
    </section>

    <section className="grid border-y border-black/10 md:grid-cols-3">
      {uses.map(([title, copy, href, Icon], i) => <Link href={href} key={title} className="group min-h-[340px] border-black/10 p-8 hover:bg-[#e7e2d8] md:border-r md:p-12">
        <div className="flex items-start justify-between"><span className="text-xs text-black/45">0{i+1}</span><Icon strokeWidth={1} size={26}/></div>
        <div className="mt-24"><h3 className="font-serif text-4xl font-light">{title}</h3><p className="mt-4 max-w-xs text-sm leading-6 text-black/60">{copy}</p><span className="mt-7 inline-flex items-center gap-2 text-[10px] uppercase tracking-[.22em]">Discover <ArrowUpRight size={13}/></span></div>
      </Link>)}
    </section>

    <section className="bg-[#d9d1c4] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl"><p className="text-[10px] uppercase tracking-[.35em] text-black/50">The first spatial collection</p><h2 className="mt-6 max-w-3xl font-serif text-5xl font-light md:text-7xl">Six moods. One architectural language.</h2>
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3">{SPACE_SCENTS.map((s, i) => <div key={s.name} className="border-t border-black/20 py-7 md:p-7 md:first:pl-0"><span className="text-[10px] text-black/40">0{i+1}</span><h3 className="mt-8 font-serif text-3xl">{s.name}</h3><p className="mt-2 text-xs uppercase tracking-[.18em] text-black/50">{s.family}</p><p className="mt-5 text-sm text-black/70">{s.notes}</p><p className="mt-1 text-sm italic text-black/50">{s.mood}</p></div>)}</div>
        <p className="mt-10 text-xs leading-6 text-black/55">Collection names and formulas are launch concepts. Final specifications, safety documentation and availability will be confirmed before sale.</p>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32"><p className="text-[10px] uppercase tracking-[.35em] text-black/50">Designed for the property</p><div className="mt-10 grid gap-x-10 md:grid-cols-3">{industries.map(slug => <Link href={`/spaces/${slug}`} key={slug} className="flex items-center justify-between border-t border-black/20 py-6 text-sm capitalize hover:pl-2">{slug.replaceAll("-", " ")}<ArrowUpRight size={14}/></Link>)}</div></section>
    <SpacesCta/>
  </SpacesShell>;
}
