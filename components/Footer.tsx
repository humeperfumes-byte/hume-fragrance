import Link from "next/link";
import { getAllPublicProducts } from "@/lib/db/products";
import { isVisibleNatureCategory } from "@/lib/nature-categories";

function prettyCategory(label: string) {
  return label
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default async function Footer() {
  const products = await getAllPublicProducts();

  const categoryMap = new Map<string, string>();
  products.forEach((product) => {
    (product.dbCategoryTags ?? product.categoryTags ?? []).forEach((tag) => {
      if (!tag?.id) return;
      if (!isVisibleNatureCategory(tag.id) || !isVisibleNatureCategory(tag.label || tag.id)) return;
      categoryMap.set(tag.id, tag.label || prettyCategory(tag.id));
    });
    (product.dbCategoryIds ?? product.categoryIds ?? []).forEach((id) => {
      if (!id || categoryMap.has(id)) return;
      if (!isVisibleNatureCategory(id)) return;
      categoryMap.set(id, prettyCategory(id));
    });
  });

  const categoryLinks = Array.from(categoryMap.entries())
    .map(([, label]) => ({
      href: `/shop?filter=nature&value=${encodeURIComponent(label)}`,
      label: `${label} Fragrances`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 8);

  const shopLinks = [
    { href: "/shop", label: "Shop All Perfumes" },
    { href: "/kit-pack", label: "Build Your Kit" },
    { href: "/celebrities-favorites", label: "Celebrities' Favorites" },
  ];

  const discoverLinks = [
    { href: "/fragrance-guides", label: "Fragrance Guides Hub" },
    { href: "/blog", label: "Journal" },
    { href: "/scent-quiz", label: "Scent Quiz" },
    { href: "/alternatives/creed-aventus", label: "Perfume Alternatives" },
    { href: "/alternatives/ombre-nomade", label: "Oud Alternatives" },
  ];

  const companyLinks = [
    { href: "/#about", label: "About HUME" },
    { href: "/#craft", label: "Our Craft" },
    { href: "/#collection", label: "Best Sellers" },
    { href: "/sitemap.xml", label: "Sitemap" },
  ];

  return (
    <footer id="contact" className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="container-luxury">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">
          <div className="col-span-2">
            <Link href="/" className="flex items-baseline gap-1 mb-5">
              <span className="font-serif text-2xl md:text-3xl font-light tracking-widest">HUME</span>
              <span className="text-caption opacity-60">FRAGRANCE</span>
            </Link>
            <p className="text-body opacity-70 max-w-sm">
              Premium inspired perfumes crafted for modern luxury, long wear, and signature presence.
            </p>
            <div className="space-y-2 text-body opacity-70 mt-5">
              <p>hello@humefragrance.com</p>
              <p>WhatsApp: +91 95590 24822</p>
              <p>Kannauj, India&apos;s City of Scent</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://wa.me/919559024822"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#25D366] px-4 text-xs font-medium text-white hover:bg-[#20c15a] transition-colors"
              >
                Queries on WhatsApp
              </a>
              <a
                href="https://www.instagram.com/hume.perfume/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-md border border-primary-foreground/20 bg-white/90 px-4 text-xs font-medium text-black hover:bg-white transition-colors"
              >
                Follow on Instagram
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-caption mb-5">Shop</h4>
            <nav className="flex flex-col gap-2.5">
              {shopLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-body opacity-70 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-caption mb-5">Categories</h4>
            <nav className="flex flex-col gap-2.5">
              {categoryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-body opacity-70 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-caption mb-5">Discover</h4>
            <nav className="flex flex-col gap-2.5">
              {discoverLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-body opacity-70 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-caption mb-5">Company</h4>
            <nav className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-body opacity-70 hover:opacity-100 transition-opacity">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption opacity-50">© 2026 HUME Fragrance. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/shop" className="text-caption opacity-50 hover:opacity-100 transition-opacity">
              Shop
            </Link>
            <Link href="/blog" className="text-caption opacity-50 hover:opacity-100 transition-opacity">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
