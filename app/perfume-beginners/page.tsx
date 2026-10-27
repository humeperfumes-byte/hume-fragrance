import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BEGINNER_PERFUME_GUIDES, BEGINNER_GUIDES_PATH, beginnerGuidePath } from "@/lib/beginner-perfume-guides";
import { getRequestSiteUrl } from "@/lib/request-site";

export async function generateMetadata(): Promise<Metadata> {
  return { title: { absolute: "Your First Perfume: Beginner Guides | HUME" }, description: "Start with your preferences, compare perfume samples and buy with confidence. Practical HUME guides for your first fragrance and everyday wear.", alternates: { canonical: `${await getRequestSiteUrl()}${BEGINNER_GUIDES_PATH}` } };
}

export default function BeginnerGuidesHub() {
  const groups = [...new Set(BEGINNER_PERFUME_GUIDES.map(guide => guide.group))];
  return <>
    <Header />
    <main className="bg-background px-4 pb-16 pt-28 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px] py-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">HUME fragrance guides</p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl font-light sm:text-5xl">Your first perfume starts with you.</h1>
        <p className="mt-6 max-w-2xl text-sm leading-8 text-muted-foreground">Learn what you enjoy, choose for your own routine and compare before committing. Start with a question below or <Link href="/scent-quiz" className="underline underline-offset-4">take the scent quiz</Link> to explore a direction.</p>
        <nav aria-label="Guide categories" className="mt-8 flex flex-wrap gap-3">{groups.map((group, index) => <a key={group} href={`#category-${index}`} className="border border-border px-4 py-2 text-xs hover:border-gold">{group}</a>)}</nav>
        {groups.map((group, index) => <section key={group} id={`category-${index}`} className="mt-14 scroll-mt-28">
          <h2 className="font-serif text-3xl font-light">{group}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{BEGINNER_PERFUME_GUIDES.filter(guide => guide.group === group).map(guide => <Link key={guide.slug} href={beginnerGuidePath(guide.slug)} className="border border-border bg-secondary p-5 transition-colors hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
            <h3 className="font-serif text-xl sm:text-2xl">{guide.title}</h3><p className="mt-3 text-sm leading-7 text-muted-foreground">{guide.answer}</p><span className="mt-4 inline-block text-xs font-semibold underline underline-offset-4">Read the guide</span>
          </Link>)}</div>
        </section>)}
      </div>
    </main>
    <Footer />
  </>;
}
