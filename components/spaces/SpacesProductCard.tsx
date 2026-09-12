import Image from "next/image";
import Link from "next/link";
import { Wind } from "lucide-react";
import type { SpacesProduct } from "@/lib/spaces";
import SpacesProductInterest from "./SpacesProductInterest";

export default function SpacesProductCard({ product }: { product: SpacesProduct }) {
  const productHref = `/spaces/products/${product.id}`;

  return <article className="group flex h-full flex-col border border-black/10 bg-[#FAF8F5] transition-all duration-300 hover:border-black/30 hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)]">
    <Link href={productHref} aria-label={`View ${product.name}`} className="block overflow-hidden">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#EFECE6]"><Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 md:group-hover:scale-105" /><div className="absolute bottom-3 left-3 z-10"><span className="inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white/90 backdrop-blur-md"><Wind size={11} className="text-amber-300" /> {product.coverage}</span></div></div>
    </Link>
    <div className="flex flex-1 flex-col p-6">
      <Link href={productHref} className="block"><span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/50">{product.categoryLabel} · {product.size}</span><h3 className="mt-2 font-serif text-2xl font-light leading-snug text-[#171713]">{product.name}</h3><p className="mt-1 line-clamp-2 text-xs text-black/60">{product.description}</p></Link>
      <div className="mt-auto flex items-center justify-between pt-6"><div><span className="text-xl font-light tracking-tight text-[#171713]">₹{product.price.toLocaleString("en-IN")} INR</span>{product.originalPrice && <span className="ml-2 text-xs text-black/40 line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>}</div><SpacesProductInterest product={product} /></div>
    </div>
  </article>;
}
