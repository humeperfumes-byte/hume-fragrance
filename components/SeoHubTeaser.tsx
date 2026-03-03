import Link from "next/link";

const featuredLinks = [
  { href: "/best-perfume-for-men-india", label: "Best Perfume For Men India" },
  { href: "/long-lasting-perfume-men-india", label: "Long Lasting Perfume Men India" },
  { href: "/perfume-for-office", label: "Perfume For Office" },
  { href: "/perfume-for-date-night", label: "Perfume For Date Night" },
  { href: "/perfume-for-diwali", label: "Perfume For Diwali" },
  { href: "/perfume-under-999", label: "Perfume Under 999" },
  { href: "/dior-sauvage-inspired-perfume", label: "Dior Sauvage Inspired Perfume" },
  { href: "/replica-jazz-club-inspired-perfume", label: "Replica Jazz Club Inspired Perfume" },
];

export default function SeoHubTeaser() {
  return (
    <section className="py-12 md:py-16 border-t border-border/60">
      <div className="container-luxury">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <p className="text-caption text-muted-foreground">Fragrance Guides</p>
            <h2 className="font-serif text-3xl md:text-4xl">Explore Search Guides</h2>
          </div>
          <Link
            href="/fragrance-guides"
            className="text-sm uppercase tracking-[0.16em] border-b border-foreground/20 pb-1 hover:border-foreground"
          >
            View All Guides
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featuredLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

