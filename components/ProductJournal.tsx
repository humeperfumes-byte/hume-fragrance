import Link from "next/link";
import { getRelatedBlogPostsByProductId } from "@/lib/db/blog";

export default async function ProductJournal({ productId }: { productId: string }) {
  const [post] = await getRelatedBlogPostsByProductId(productId, 3);
  if (!post) return null;
  return (
    <section className="pb-16 md:pb-24">
      <div className="container-luxury">
        <div className="max-w-4xl border-t border-border pt-8">
          <article className="border border-border/60 bg-background/80 p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">{post.readTime} • {post.date}</p>
            <h3 className="font-serif text-2xl sm:text-3xl mb-4">{post.title}</h3>
            <p className="text-body text-muted-foreground mb-4">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="inline-flex text-sm font-medium uppercase tracking-[0.18em] text-foreground underline-offset-4 hover:underline">Read the guide</Link>
          </article>
        </div>
      </div>
    </section>
  );
}
