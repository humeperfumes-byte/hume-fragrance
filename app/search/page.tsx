import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { getAllPublicProducts } from "@/lib/db/products";
import { getRequestSiteUrl } from "@/lib/request-site";

type SearchPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = (params?.q || "").trim();
  const baseUrl = await getRequestSiteUrl();

  return {
    title: query ? `Search results for ${query} | HUME Fragrance` : "Search HUME Fragrance",
    description:
      "Search HUME Fragrance perfumes by name, inspiration, category, and gender.",
    alternates: {
      canonical: query ? `${baseUrl}/search?q=${encodeURIComponent(query)}` : `${baseUrl}/search`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalize(params?.q || "");
  const products = await getAllPublicProducts();

  const results = query
    ? products.filter((product) => {
        const searchable = normalize(
          [
            product.name,
            product.inspiration,
            product.inspirationBrand,
            product.category,
            product.gender,
          ].join(" "),
        );
        return query
          .split(/\s+/)
          .filter(Boolean)
          .every((term) => searchable.includes(term));
      })
    : products.slice(0, 8);

  return (
    <main className="min-h-screen bg-background">
      <Header />
      <section className="pt-28 pb-16">
        <div className="container-luxury">
          <p className="text-caption text-muted-foreground mb-3">
            Search HUME
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-4">
            {query ? `Search results for "${params?.q}"` : "Search Perfumes"}
          </h1>
          <p className="max-w-3xl text-body text-muted-foreground">
            Find HUME perfumes by product name, inspiration, category, or
            gender.
          </p>
          {!query ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {["sauvage", "imagine", "ombre", "ultra male", "unisex", "hume special"].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {term}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-20">
        <div className="container-luxury">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-caption text-muted-foreground mb-2">
                {results.length} result{results.length === 1 ? "" : "s"}
              </p>
              <h2 className="font-serif text-3xl">
                {query ? "Matching Perfumes" : "Popular Starting Points"}
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
            >
              Shop all
            </Link>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-7 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {results.map((product, index) => (
                <PerfumeCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  inspiration={product.inspiration}
                  inspirationBrand={product.inspirationBrand}
                  category={product.category}
                  categoryTags={product.categoryTags}
                  categoryIds={product.categoryIds}
                  image={product.images[0]}
                  price={product.price}
                  index={index}
                  bestSeller={product.badges?.bestSeller}
                  humeSpecial={product.badges?.humeSpecial}
                  limitedStock={product.badges?.limitedStock}
                  soldOut={product.badges?.soldOut}
                  disableEntranceAnimation
                />
              ))}
            </div>
          ) : (
            <div className="border border-border p-8">
              <p className="text-muted-foreground">
                No exact match found. Try a product name, inspiration, category,
                or gender such as Sauvage, Imagine, Ombre, or Unisex.
              </p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
