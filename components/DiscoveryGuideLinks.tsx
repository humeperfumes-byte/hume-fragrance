import Link from "next/link";
import { DISCOVERY_GUIDES, discoveryGuidePath } from "@/lib/discovery-guides";

export default function DiscoveryGuideLinks({ exclude }: { exclude?: string }) {
  return (
    <section className="border-t border-border bg-[#f8f5ef] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">Explore the discovery set</p>
        <h2 className="mt-4 font-serif text-3xl font-light sm:text-4xl">Find your way to a favorite fragrance.</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {DISCOVERY_GUIDES.filter((guide) => guide.slug !== exclude).map((guide) => (
            <Link key={guide.slug} href={discoveryGuidePath(guide.slug)} className="border border-border bg-background p-5 transition-colors hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
              <h3 className="font-serif text-2xl">{guide.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.description}</p>
              <span className="mt-4 inline-block text-xs font-semibold underline underline-offset-4">Read the guide</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
