import Link from "next/link";
import PerfumeCard from "@/components/PerfumeCard";
import type { HomepagePerfumeCardData } from "@/types/homepage";

export default function HumeSpecialSection({
  perfumes,
}: {
  perfumes: HomepagePerfumeCardData[];
}) {
  const humeSpecialProducts = perfumes
    .filter((p) => p.badges?.humeSpecial)
    .slice(0, 5);

  if (humeSpecialProducts.length === 0) return null;

  return (
    <section className="pt-10 pb-3 md:pt-24 md:pb-10">
      <div className="container-luxury">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-4xl md:text-5xl font-light italic">
            HUME Special
          </h2>
          <Link
            href="/hume-special"
            className="text-[11px] md:text-caption uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground border-b border-border pb-1"
          >
            See All
          </Link>
        </div>

        <div className="flex touch-auto gap-6 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-proximity scrollbar-none pb-3">
          {humeSpecialProducts.map((perfume, index) => (
            <div
              key={perfume.id}
              className="min-w-[78%] sm:min-w-[48%] lg:min-w-[36%] xl:min-w-[30%] snap-start"
            >
              <PerfumeCard
                id={perfume.id}
                name={perfume.name}
                inspiration={perfume.inspiration}
                inspirationBrand={perfume.inspirationBrand}
                category={perfume.category}
                categoryTags={perfume.categoryTags}
                categoryIds={perfume.categoryIds}
                image={perfume.images[0]}
                price={perfume.price}
                index={index}
                bestSeller={perfume.badges?.bestSeller}
                humeSpecial={perfume.badges?.humeSpecial}
                limitedStock={perfume.badges?.limitedStock}
                soldOut={perfume.badges?.soldOut}
                prioritizeImage={false}
                disableEntranceAnimation
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
