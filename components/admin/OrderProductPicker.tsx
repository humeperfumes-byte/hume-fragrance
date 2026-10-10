"use client";
import { useState } from "react";
import Image from "next/image";
import type { Product } from "@/db/schema";
import { DISCOVERY_SET_IMAGES, DISCOVERY_SET_SAMPLE_COUNT, isDiscoverySetProductId } from "@/lib/discovery-set";

export function OrderProductPicker({ products, onAdd }: { products: Product[]; onAdd: (product: Product, samples: Product[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [samples, setSamples] = useState<Product[]>([]);
  const discovery = selected && isDiscoverySetProductId(selected.id);
  const visible = products.filter(product => (!discovery || !isDiscoverySetProductId(product.id)) && `${product.name} ${product.inspiration} ${product.visibility}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="rounded-2xl border border-white/15 bg-black/20 p-3">
    <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm font-semibold text-white"><span>{discovery ? `Choose discovery samples (${samples.length}/${DISCOVERY_SET_SAMPLE_COUNT})` : "Add a product"}</span><span>{open ? "−" : "+"}</span></button>
    {open && <div className="mt-3 space-y-3">
      {discovery && <div className="text-sm text-purple-200">{selected.name}<button type="button" onClick={() => { setSelected(null); setSamples([]); }} className="ml-3 underline">Back to products</button><p className="mt-2 text-xs text-white/60">{samples.map(sample => sample.name).join(", ") || "Choose the fragrances to pack in this set."}</p></div>}
      <input aria-label="Search order products" placeholder="Search perfume, inspiration or SEO-only…" value={search} onChange={event => setSearch(event.target.value)} className="w-full rounded-xl border border-white/15 px-3 py-3 text-sm" />
      <p className="text-xs text-white/55">{visible.length} products · Public and SEO-only products included. Stock labels are shown for packing.</p>
      <div className="grid max-h-80 gap-2 overflow-y-auto overscroll-contain sm:grid-cols-2">
        {visible.map(product => {
          const chosen = discovery ? samples.some(sample => sample.id === product.id) : selected?.id === product.id;
          const image = isDiscoverySetProductId(product.id) ? DISCOVERY_SET_IMAGES[0] : product.images?.[0];
          return <button type="button" key={product.id} aria-pressed={chosen} disabled={!!discovery && !chosen && samples.length >= DISCOVERY_SET_SAMPLE_COUNT} onClick={() => {
            if (discovery) setSamples(current => chosen ? current.filter(sample => sample.id !== product.id) : [...current, product]);
            else { setSelected(product); setSamples([]); if (isDiscoverySetProductId(product.id)) setSearch(""); }
          }} className={`flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-40 ${chosen ? "border-purple-300 bg-purple-300/10" : "border-white/10 hover:border-purple-300/50 hover:bg-white/5"}`}>
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">{image ? <Image src={image} alt={product.name} fill unoptimized sizes="56px" className="object-cover" /> : <span className="flex h-full items-center justify-center text-[9px] text-white/50">No image</span>}</span>
            <span className="min-w-0"><span className="block text-sm font-medium text-white">{product.name}</span><span className="mt-1 block text-xs text-white/55">{product.inspiration}</span><span className="mt-1 block text-xs text-purple-200">₹{Number(product.price).toLocaleString("en-IN")} · {product.visibility === "seo_only" ? "SEO only" : "Public"}{product.badges?.soldOut ? " · Out of stock" : product.badges?.comingSoon ? " · Coming soon" : ""}</span></span>
          </button>;
        })}
        {!visible.length && <p className="p-3 text-sm text-white/60">No matching products.</p>}
      </div>
      <button type="button" disabled={!selected || (!!discovery && samples.length !== DISCOVERY_SET_SAMPLE_COUNT)} onClick={() => { if (selected) onAdd(selected, samples); setSelected(null); setSamples([]); setSearch(""); setOpen(false); }} className="w-full rounded-xl bg-purple-300 px-4 py-3 text-sm font-semibold text-black disabled:opacity-40">{discovery ? `Add discovery set (${samples.length}/${DISCOVERY_SET_SAMPLE_COUNT})` : selected ? `Add ${selected.name}` : "Select a product"}</button>
    </div>}
  </div>;
}
