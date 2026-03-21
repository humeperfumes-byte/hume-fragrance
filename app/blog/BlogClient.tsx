"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/data/blogPosts";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

export default function BlogClient({
  blogPosts,
  blogCategories,
}: {
  blogPosts: BlogPost[];
  blogCategories: string[];
}) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <section className="pt-32 md:pt-40 pb-16 md:pb-24">
      <div className="container-luxury">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-4">
            The Journal
          </h1>
          <p className="text-body text-muted-foreground max-w-xl mx-auto">
            Expert fragrance guides, comparisons, and tips to help you discover
            the perfect inspired perfume.
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {blogCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm tracking-wide transition-luxury border ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeCategory === "All" && (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {filtered
              .filter((p) => p.featured)
              .slice(0, 2)
              .map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group border border-border p-8 hover:border-foreground transition-luxury"
                >
                  <div className="mb-5 border border-border/70 bg-secondary/30 h-44 overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={withCloudinaryTransforms(post.imageUrl, { width: 720 })}
                        alt={post.title}
                        width={720}
                        height={176}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                        Add Image
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                    {post.category} · {post.readTime}
                  </span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light mt-3 mb-4 group-hover:opacity-70 transition-opacity">
                    {post.title}
                  </h2>
                  <p className="text-body text-muted-foreground mb-4">
                    {post.excerpt}
                  </p>
                  <span className="text-caption link-underline">
                    Read Article →
                  </span>
                </Link>
              ))}
            </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {(activeCategory === "All"
            ? filtered.filter((p) => !p.featured)
            : filtered
          ).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group border border-border p-6 hover:border-foreground transition-luxury"
            >
              <div className="mb-4 border border-border/70 bg-secondary/30 h-36 overflow-hidden">
                {post.imageUrl ? (
                  <Image
                    src={withCloudinaryTransforms(post.imageUrl, { width: 480 })}
                    alt={post.title}
                    width={480}
                    height={144}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                    Add Image
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                {post.category} · {post.readTime}
              </span>
              <h3 className="font-serif text-xl font-light mt-2 mb-3 group-hover:opacity-70 transition-opacity">
                {post.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
