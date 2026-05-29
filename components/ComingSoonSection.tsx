import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { UPCOMING_PRODUCTS, type UpcomingProduct } from "@/lib/upcoming-products";

function ComingSoonVisual({ product }: { product: UpcomingProduct }) {
  if (product.image) {
    return (
      <Image
        src={product.image}
        alt={product.name}
        fill
        sizes="(max-width: 640px) 78vw, (max-width: 1200px) 36vw, 30vw"
        className="object-cover transition-transform duration-700 md:group-hover:scale-105"
      />
    );
  }

  return (
    <div className={`absolute inset-0 ${product.visualClassName ?? "bg-secondary"}`}>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.16),transparent_46%)]" />
      <div className="absolute inset-x-8 top-8 border-t border-black/20" />
      <div className="absolute inset-x-8 bottom-8 border-b border-white/30" />
      <div className="flex h-full items-center justify-center px-8 text-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-black/45">
            HUME
          </p>
          <p className="mt-3 font-serif text-4xl font-light text-black/80">
            {product.visualLabel}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ComingSoonSection() {
  return (
    <section id="new-launches" className="pt-20 pb-8 md:pt-24 md:pb-10">
      <div className="container-luxury">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-4xl font-light italic md:text-5xl">
            Coming Soon
          </h2>
          <p className="hidden text-[11px] uppercase tracking-[0.3em] text-muted-foreground sm:block">
            Shop Live
          </p>
        </div>

        <div className="flex touch-auto snap-x snap-proximity gap-6 overflow-x-auto overscroll-x-contain scroll-smooth pb-3 scrollbar-none">
          {UPCOMING_PRODUCTS.map((product) => {
            const visual = (
              <div className="relative mb-4 overflow-hidden bg-secondary shadow-[0_12px_30px_rgba(12,14,18,0.12)] sm:mb-5">
                <div className="relative aspect-[3/4] w-full">
                  <ComingSoonVisual product={product} />
                </div>
                <span className="absolute bottom-3 right-3 z-10 inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/45 bg-white/18 text-white shadow-[0_18px_36px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/5 backdrop-blur-md backdrop-saturate-150 sm:h-12 sm:w-12">
                  <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.12)_38%,rgba(255,255,255,0.04)_100%)]" />
                  <span className="pointer-events-none absolute -left-5 -top-5 h-12 w-12 rounded-full bg-white/35 blur-xl" />
                  <Plus className="relative h-5 w-5 drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]" />
                </span>
              </div>
            );

            return (
              <article
                key={product.id}
                className="min-w-[78%] snap-start sm:min-w-[48%] lg:min-w-[36%] xl:min-w-[30%]"
              >
                <div className="group flex h-full flex-col">
                  <Link href={product.path} aria-label={`View ${product.name}`} className="block">
                    {visual}
                  </Link>

                  <p className="mb-1.5 text-[8px] font-light uppercase leading-[1.35] tracking-[0.14em] text-muted-foreground/75 sm:text-[9px]">
                    {product.category}
                  </p>
                  <h3 className="mb-0.5 line-clamp-2 font-serif text-base font-light leading-tight tracking-wide md:text-lg">
                    {product.name}
                  </h3>
                  <p className="line-clamp-2 text-[10px] font-light leading-snug text-muted-foreground/90 sm:text-[11px]">
                    Inspired by {product.inspiration}
                  </p>
                  <p className="mt-10 text-[1.28rem] font-light leading-none tracking-tight text-foreground/90 sm:text-[1.35rem]">
                    {product.priceLabel}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
