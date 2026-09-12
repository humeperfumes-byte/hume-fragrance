import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Wind } from "lucide-react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import SpacesProductInterest from "@/components/spaces/SpacesProductInterest";
import { SpacesCta, SpacesShell } from "@/components/spaces/SpacesShell";
import { getSpacesProduct, SPACES_PRODUCTS } from "@/lib/spaces";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return SPACES_PRODUCTS.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = getSpacesProduct(id);
  if (!product) return {};
  return { title: `${product.name} | HUME Spaces`, description: product.description, alternates: { canonical: `${SITE_URL}/spaces/products/${product.id}` } };
}

export default async function SpacesProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getSpacesProduct(id);
  if (!product) notFound();

  const productSchema = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: `${SITE_URL}${product.image}`, sku: product.id, brand: { "@type": "Brand", name: "HUME Spaces" }, offers: { "@type": "Offer", price: product.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${SITE_URL}/spaces/products/${product.id}` } };

  return <SpacesShell>
    <JsonLd data={productSchema} />
    <main className="bg-[#faf8f4] pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-5 pb-12 md:px-10"><Link href="/spaces/reed-diffusers#collection" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-black/55 transition hover:text-black"><ArrowLeft size={14} /> Back to reed diffusers</Link></div>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 md:grid-cols-2 md:px-10 md:pb-28">
        <div className="relative min-h-[460px] overflow-hidden bg-[#e7e0d4] md:min-h-[680px]"><Image src={product.image} alt={product.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /><div className="absolute bottom-5 left-5 bg-black/65 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white backdrop-blur"><Wind size={13} className="mr-2 inline text-[#d6b273]" /> {product.coverage}</div></div>
        <div className="flex flex-col justify-center py-2 md:py-10"><p className="text-[10px] font-semibold uppercase tracking-[.35em] text-[#8c7654]">HUME Spaces · {product.categoryLabel}</p><h1 className="mt-5 font-serif text-5xl font-light leading-[.9] text-[#171713] md:text-7xl">{product.name}</h1><p className="mt-5 text-sm uppercase tracking-[.16em] text-black/45">{product.size} · {product.coverage}</p><p className="mt-8 max-w-lg text-base leading-8 text-black/65">{product.description}</p><div className="mt-8 border-y border-black/10 py-6"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-black/45">Fragrance character</p><p className="mt-3 font-serif text-2xl leading-tight text-[#171713]">{product.mood}</p><p className="mt-3 text-sm leading-7 text-black/60">{product.notes}</p></div><div className="mt-7 flex items-end justify-between gap-5"><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-black/45">Starting at</p><p className="mt-2 font-serif text-3xl text-[#171713]">₹{product.price.toLocaleString("en-IN")} <span className="text-sm text-black/45">INR</span></p>{product.originalPrice && <p className="mt-1 text-xs text-black/40 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</p>}</div></div><div className="mt-7"><SpacesProductInterest product={product} fullWidth /></div><p className="mt-3 text-center text-[10px] leading-5 text-black/45">Share your details and our team will confirm availability and the right fragrance for your space.</p></div>
      </section>
      <section className="border-y border-black/10 bg-[#e8e1d6] px-5 py-16 md:px-10 md:py-20"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[.75fr_1.25fr]"><div><p className="text-[10px] font-semibold uppercase tracking-[.32em] text-black/45">Made for</p><h2 className="mt-5 font-serif text-4xl font-light leading-[.92]">The spaces<br /><em>closest to you.</em></h2></div><div className="grid gap-px bg-black/10 sm:grid-cols-2">{product.roomSuitability.map((space, index) => <div key={space} className="bg-[#e8e1d6] p-6"><span className="text-[10px] font-mono text-black/40">0{index + 1}</span><p className="mt-8 text-sm text-black/75">{space}</p></div>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-20 md:px-10"><div className="grid gap-10 md:grid-cols-3">{[["01", "Open gently", "Remove the stopper and arrange the reeds only once the vessel is on its final surface."], ["02", "Set the intensity", "Start with four reeds. Add more once the fragrance has had time to settle into the room."], ["03", "Refresh the presence", "Turn the reeds every one to two weeks, and wipe the vessel before moving it."]].map(([number, title, text]) => <div key={title} className="border-t border-black/15 pt-5"><p className="text-[10px] font-mono text-black/40">{number}</p><h2 className="mt-10 font-serif text-3xl">{title}</h2><p className="mt-4 text-sm leading-7 text-black/60">{text}</p></div>)}</div></section>
      <SpacesCta compact />
    </main>
  </SpacesShell>;
}
