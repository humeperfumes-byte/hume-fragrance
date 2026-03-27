import Link from "next/link";
import { getAllBlogPosts } from "@/lib/db/blog";

const LatestJournal = async () => {
  const blogPosts = await getAllBlogPosts();
  const latest = blogPosts.slice(0, 6);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-luxury">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <span className="mb-3 block text-xs uppercase tracking-[0.2em] text-muted-foreground">
              The Journal
            </span>
            <h2 className="font-serif text-3xl font-light tracking-wide md:text-4xl">
              Latest Articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="hidden md:inline text-caption link-underline text-muted-foreground transition-luxury hover:text-foreground"
          >
            View All →
          </Link>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {latest.slice(0, 2).map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative overflow-hidden rounded-[34px] border border-border/60 bg-[linear-gradient(135deg,rgba(255,255,255,1)_0%,rgba(248,246,243,0.96)_56%,rgba(241,236,230,0.92)_100%)] p-10 shadow-[0_24px_70px_rgba(15,15,20,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-foreground/15 hover:shadow-[0_32px_90px_rgba(15,15,20,0.12)]"
            >
              <div className="absolute right-[-48px] top-[-48px] h-40 w-40 rounded-full bg-foreground/[0.04] transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border/70 bg-background/85 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {post.category}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {post.readTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-5xl leading-none text-foreground/10">
                      0{index + 1}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border/70 bg-background/85 text-lg text-foreground/45 transition-all duration-300 group-hover:translate-x-1 group-hover:border-foreground/15 group-hover:bg-foreground group-hover:text-background">
                      →
                    </span>
                  </div>
                </div>

                <h3 className="max-w-[18ch] font-serif text-[2rem] font-light leading-[1.18] tracking-[-0.02em] transition-opacity group-hover:opacity-75 md:text-[2.2rem]">
                  {post.title}
                </h3>

                <p className="mt-5 max-w-[42ch] text-base leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>

                <div className="mt-8 flex items-center justify-between gap-4 border-t border-border/60 pt-5">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    Featured Story
                  </span>
                  <span className="text-sm font-medium text-foreground transition-transform duration-300 group-hover:translate-x-1">
                    Read Article →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {latest.slice(2, 6).map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(248,246,243,0.95)_100%)] p-6 shadow-[0_16px_36px_rgba(15,15,20,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_22px_50px_rgba(15,15,20,0.09)]"
            >
              <div className="absolute right-[-28px] top-[-28px] h-24 w-24 rounded-full bg-foreground/[0.035] transition-transform duration-500 group-hover:scale-110" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-border/70 bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {post.category}
                  </span>
                  <span className="text-sm text-foreground/35 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground/75">
                    →
                  </span>
                </div>

                <h3 className="line-clamp-3 font-serif text-[1.38rem] font-light leading-[1.35] transition-opacity group-hover:opacity-75">
                  {post.title}
                </h3>

                <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
                    Journal
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/blog"
            className="text-caption link-underline text-muted-foreground transition-luxury hover:text-foreground"
          >
            View All Articles →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatestJournal;
