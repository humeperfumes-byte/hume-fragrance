import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PerfumeCard from "@/components/PerfumeCard";
import { JsonLd } from "@/components/JsonLd";
import { getAllProducts, getProductById } from "@/lib/db/products";
import { getAlternativeToBySlug } from "@/lib/programmatic-seo";
import { getRequestSiteUrl } from "@/lib/request-site";

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export const dynamic = "force-dynamic";

async function resolveMappedProduct(
  item: NonNullable<ReturnType<typeof getAlternativeToBySlug>>,
) {
  const byId = await getProductById(item.humeProduct.slug);
  if (byId) return byId;

  const allProducts = await getAllProducts();
  const target = item.originalName.toLowerCase();
  return (
    allProducts.find((p) =>
      `${p.inspirationBrand} ${p.inspiration}`.toLowerCase().includes(target),
    ) ?? null
  );
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getAlternativeToBySlug(slug);
  if (!item) return { title: "Not Found" };

  const product = await resolveMappedProduct(item);
  if (!product) return { title: "Not Found" };

  const baseUrl = await getRequestSiteUrl();

  return {
    title: `Best Alternative to ${item.originalName} in India | HUME`,
    description: `Looking for a ${item.originalName} alternative? Compare notes, pricing and performance with HUME ${product.name}.`,
    alternates: {
      canonical: `${baseUrl}/alternatives-to/${item.slug}`,
    },
    openGraph: {
      title: `${item.originalName} Alternative - HUME ${product.name}`,
      description: `Save ${formatPrice(item.savings)} with a similar ${item.scent_profile.family} profile.`,
      url: `${baseUrl}/alternatives-to/${item.slug}`,
      images: product.images?.[0] ? [product.images[0]] : [],
    },
  };
}

export default async function AlternativesToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getAlternativeToBySlug(slug);
  if (!item) notFound();
  const baseUrl = await getRequestSiteUrl();

  const [primary, products] = await Promise.all([
    resolveMappedProduct(item),
    getAllProducts(),
  ]);
  if (!primary) notFound();

  const related = products
    .filter((p) => p.id !== primary.id)
    .filter((p) =>
      (p.dbCategoryIds ?? p.categoryIds ?? [p.categoryId]).some((id) =>
        (
          primary.dbCategoryIds ??
          primary.categoryIds ?? [primary.categoryId]
        ).includes(id),
      ),
    )
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Best Alternative to ${item.originalName}`,
    url: `${baseUrl}/alternatives-to/${item.slug}`,
    description: item.why_inspired,
  };

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <section className="pt-28 pb-20 md:pt-36 md:pb-24">
        <div className="container-luxury space-y-10">
          <div className="max-w-3xl">
            <p className="text-caption text-muted-foreground mb-3">
              Alternatives Guide
            </p>
            <h1 className="font-serif text-4xl md:text-5xl font-light mb-4">
              Best Alternative to {item.originalName} in India
            </h1>
            <p className="text-body text-muted-foreground">
              {item.why_inspired}
            </p>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Quick Answer
            </p>
            <p className="text-sm text-muted-foreground">
              If you want a {item.originalName}-style profile with better daily
              value in India, choose{" "}
              <span className="font-medium text-foreground">
                HUME {primary.name}
              </span>{" "}
              for{" "}
              <span className="font-medium text-foreground">
                {formatPrice(primary.price)}
              </span>
              . It keeps the same {item.scent_profile.family.toLowerCase()}{" "}
              direction with practical{" "}
              {item.characteristics.longevity.toLowerCase()} wear.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-sm border border-border p-4 bg-secondary/10 max-w-md">
              <PerfumeCard
                id={primary.id}
                name={primary.name}
                inspiration={primary.inspiration}
                inspirationBrand={primary.inspirationBrand}
                category={primary.category}
                categoryTags={primary.categoryTags}
                categoryIds={primary.categoryIds}
                image={primary.images[0]}
                price={primary.price}
                index={0}
                bestSeller={primary.badges?.bestSeller}
                humeSpecial={primary.badges?.humeSpecial}
                limitedStock={primary.badges?.limitedStock}
                soldOut={primary.badges?.soldOut}
              />
            </div>
            <div className="border border-border p-6 max-w-md">
              <h2 className="font-serif text-2xl mb-2">{item.originalName}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Signature family: {item.scent_profile.family}
              </p>
              <p className="text-xl font-semibold">
                {formatPrice(item.original_price)}
              </p>
            </div>
          </div>

          <div className="border border-border p-6">
            <h3 className="font-serif text-2xl mb-3">Why Buyers Switch</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {item.what_makes_original_iconic}
            </p>
            <p className="text-sm text-muted-foreground">
              {item.how_hume_captures_essence}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">Scent Notes</h3>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Top:</span>{" "}
                {item.scent_profile.top_notes.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Heart:</span>{" "}
                {item.scent_profile.heart_notes.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Base:</span>{" "}
                {item.scent_profile.base_notes.join(", ")}
              </p>
            </div>
            <div className="border border-border p-6">
              <h3 className="font-serif text-2xl mb-3">Best Use Cases</h3>
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Seasons:</span>{" "}
                {item.characteristics.seasons.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Occasions:</span>{" "}
                {item.characteristics.occasions.join(", ")}
              </p>
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <h3 className="font-serif text-3xl mb-6">Related Alternatives</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map((itemProduct, idx) => (
                  <PerfumeCard
                    key={itemProduct.id}
                    id={itemProduct.id}
                    name={itemProduct.name}
                    inspiration={itemProduct.inspiration}
                    inspirationBrand={itemProduct.inspirationBrand}
                    category={itemProduct.category}
                    categoryTags={itemProduct.categoryTags}
                    categoryIds={itemProduct.categoryIds}
                    image={itemProduct.images[0]}
                    price={itemProduct.price}
                    index={idx}
                    bestSeller={itemProduct.badges?.bestSeller}
                    limitedStock={itemProduct.badges?.limitedStock}
                    soldOut={itemProduct.badges?.soldOut}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Looking for more options? Explore all inspired fragrances in our
              shop.
            </p>
            <Link
              href="/shop"
              className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium hover:bg-secondary/30"
            >
              Browse All Fragrances
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
