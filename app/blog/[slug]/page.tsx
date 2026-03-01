import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { getBreadcrumbSchema } from "@/lib/seo";
import { getBlogPostBySlug, getAllBlogPosts } from "@/lib/db/blog";
import { getAllProducts } from "@/lib/db/products";
import { getProductPath } from "@/lib/product-route";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  const canonicalUrl = `https://humefragrance.com/blog/${post.slug}`;
  return {
    title: post.seoTitle,
    description: post.seoDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.seoTitle,
      description: post.seoDescription,
      url: canonicalUrl,
      images: post.imageUrl ? [post.imageUrl] : [],
      type: "article",
    },
  };
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();
  const allProducts = await getAllProducts();
  const related = allPosts
    .filter((p) => p.id !== post.id)
    .slice(0, 3);

  const searchablePostText = `${post.title} ${post.excerpt} ${post.content} ${post.seoKeywords.join(" ")}`.toLowerCase();
  const relatedProducts = allProducts
    .map((product) => {
      const terms = [
        product.name,
        product.inspiration,
        product.inspirationBrand,
        `${product.inspirationBrand} ${product.inspiration}`,
      ];
      let score = 0;
      for (const term of terms) {
        if (searchablePostText.includes(term.toLowerCase())) score += 1;
      }
      return { product, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => x.product);
  const explicitProduct = post.relatedProductId
    ? allProducts.find((p) => p.id === post.relatedProductId)
    : undefined;

  const linkTargets = relatedProducts.slice(0, 3).flatMap((product) => [
    {
      term: product.inspiration,
      href: getProductPath(product),
    },
    {
      term: `${product.inspirationBrand} ${product.inspiration}`,
      href: getProductPath(product),
    },
  ]);

  function linkifyContent(text: string): string {
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    for (const target of linkTargets) {
      if (!target.term.trim()) continue;
      const pattern = new RegExp(`\\b${escapeRegExp(target.term)}\\b`, "i");
      if (pattern.test(html)) {
        html = html.replace(
          pattern,
          `<a href="${target.href}" class="underline underline-offset-4">$&</a>`
        );
      }
    }
    return html;
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription,
    url: `https://humefragrance.com/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "HUME Perfumes",
      url: "https://humefragrance.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://humefragrance.com/blog/${post.slug}`,
    },
  };

  const jsonLd = [
    articleSchema,
    getBreadcrumbSchema([
      { name: "Home", url: "https://humefragrance.com" },
      { name: "Blog", url: "https://humefragrance.com/blog" },
      {
        name: post.title,
        url: `https://humefragrance.com/blog/${post.slug}`,
      },
    ]),
  ];

  return (
    <main className="bg-background min-h-screen">
      <JsonLd data={jsonLd} />
      <Header />

      <article className="pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="container-luxury max-w-3xl mx-auto">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{post.title}</span>
          </nav>

          <header className="mb-12">
            <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
              {post.category}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light tracking-wide mt-3 mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>·</span>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
          </header>

          {post.imageUrl ? (
            <div className="mb-10 border border-border overflow-hidden bg-secondary/30">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-[360px] object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="mb-10 border border-border bg-secondary/30 h-[240px] flex items-center justify-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              Add Image
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-light prose-headings:tracking-wide prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-foreground prose-a:underline prose-a:underline-offset-4">
            {post.content.split("\n").map((line, i) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("## "))
                return (
                  <h2 key={i} className="text-2xl mt-10 mb-4">
                    {trimmed.slice(3)}
                  </h2>
                );
              if (trimmed.startsWith("### "))
                return (
                  <h3 key={i} className="text-xl mt-8 mb-3">
                    {trimmed.slice(4)}
                  </h3>
                );
              if (trimmed.startsWith("| "))
                return (
                  <p key={i} className="font-mono text-sm">
                    {trimmed}
                  </p>
                );
              if (trimmed.startsWith("- **"))
                return (
                  <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{
                    __html: linkifyContent(trimmed.slice(2)),
                  }} />
                );
              if (trimmed.startsWith("1. ") || trimmed.startsWith("2. ") || trimmed.startsWith("3. "))
                return (
                  <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{
                    __html: linkifyContent(trimmed.replace(/^\d+\.\s/, "")),
                  }} />
                );

              return (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: linkifyContent(trimmed),
                }} />
              );
            })}
          </div>

          {explicitProduct ? (
            <section className="mt-12 border border-border p-8">
              <h2 className="font-serif text-2xl font-light mb-4">
                Featured Perfume For This Guide
              </h2>
              <Link
                href={getProductPath(explicitProduct)}
                className="group border border-border p-4 hover:border-foreground transition-luxury inline-block"
              >
                <p className="text-xs text-muted-foreground uppercase tracking-[0.12em]">
                  Inspired by {explicitProduct.inspirationBrand} {explicitProduct.inspiration}
                </p>
                <p className="font-serif text-lg mt-1 group-hover:opacity-70 transition-opacity">
                  {explicitProduct.name}
                </p>
              </Link>
            </section>
          ) : null}

          {relatedProducts.length > 0 ? (
            <section className="mt-16 border border-border p-8">
              <h2 className="font-serif text-2xl font-light mb-4">
                Products Mentioned In This Guide
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={getProductPath(product)}
                    className="group border border-border p-4 hover:border-foreground transition-luxury"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.12em]">
                      Inspired by {product.inspirationBrand} {product.inspiration}
                    </p>
                    <p className="font-serif text-lg mt-1 group-hover:opacity-70 transition-opacity">
                      {product.name}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-16 p-8 border border-border text-center">
            <h3 className="font-serif text-2xl font-light mb-3">
              Explore Our Collection
            </h3>
            <p className="text-muted-foreground mb-6">
              Discover premium inspired fragrances from INR 42. Free shipping above INR 799.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-foreground text-background px-8 py-3 text-caption tracking-wider hover:opacity-90 transition-opacity"
            >
              Shop All Perfumes
            </Link>
            <Link
              href="/alternatives/best-dior-sauvage-alternative"
              className="block mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore intent pages: best Dior Sauvage alternatives
            </Link>
          </div>

          <section className="mt-20">
            <h2 className="font-serif text-2xl font-light mb-8">
              More from the Journal
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group border border-border p-5 hover:border-foreground transition-luxury"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                    {r.category}
                  </span>
                  <h3 className="font-serif text-lg font-light mt-2 mb-2 group-hover:opacity-70 transition-opacity">
                    {r.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {r.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </article>

      <Footer />
    </main>
  );
}



