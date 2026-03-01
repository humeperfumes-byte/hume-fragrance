import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CelebrityFavoriteCard from "@/components/CelebrityFavoriteCard";
import { getAllProducts } from "@/lib/db/products";

export const dynamic = "force-dynamic";

export default async function CelebritiesFavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ celebrity?: string }>;
}) {
  const { celebrity } = await searchParams;
  const allPerfumes = await getAllProducts();
  const favoritePerfumes = allPerfumes
    .filter((perfume) => Boolean(perfume.woreBy))
    .filter((perfume) =>
      celebrity
        ? (perfume.woreBy || "").toLowerCase().includes(celebrity.toLowerCase())
        : true
    );

  return (
    <main className="bg-background min-h-screen">
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-caption text-muted-foreground mb-4">Curated Picks</p>
            <h1 className="text-headline mb-4">
              Celebrities&apos; <span className="italic">Favorite Perfumes</span>
            </h1>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Signature-inspired picks worn and loved by icons.
            </p>
          </div>

          {favoritePerfumes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-12">
              {favoritePerfumes.map((perfume, index) => (
                <CelebrityFavoriteCard
                  key={perfume.id}
                  id={perfume.id}
                  name={perfume.name}
                  inspiration={perfume.inspiration}
                  inspirationBrand={perfume.inspirationBrand}
                  category={perfume.category}
                  categoryTags={perfume.categoryTags}
                  categoryIds={perfume.categoryIds}
                  image={perfume.images[0]}
                  price={perfume.price}
                  celebrityName={perfume.woreBy}
                  celebrityImage={perfume.woreByImageUrl}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No celebrity favorite perfumes found.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
