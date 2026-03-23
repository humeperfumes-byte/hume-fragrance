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
    <section className="py-14 md:py-18 border-t border-border/60">
      <div className="container-luxury">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-caption text-muted-foreground">Fragrance Guides</p>
            <h2 className="mt-3 font-serif text-3xl md:text-4xl">Explore Search Guides</h2>
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
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-white to-secondary/20 px-4 py-4 text-sm text-muted-foreground shadow-[0_14px_32px_rgba(15,15,20,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:text-foreground hover:shadow-[0_18px_40px_rgba(15,15,20,0.08)]"
            >
              <span className="block text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70 mb-2">
                Guide
              </span>
              <span className="block pr-5 leading-snug">{link.label}</span>
              <span className="absolute bottom-4 right-4 text-base text-foreground/35 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-foreground/65">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
