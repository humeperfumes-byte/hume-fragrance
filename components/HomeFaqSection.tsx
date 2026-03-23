import { homeFaqItems } from "@/lib/seo";

export default function HomeFaqSection() {
  return (
    <section className="py-18 md:py-24">
      <div className="container-luxury">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-caption text-muted-foreground">Customer Questions</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl font-light tracking-wide">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-border" />
          <p className="mt-6 text-body text-muted-foreground">
            Everything customers usually want to know before choosing a HUME fragrance.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {homeFaqItems.map((item) => (
            <details
              key={item.question}
              className="group relative overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-b from-white to-secondary/20 p-5 shadow-[0_18px_45px_rgba(15,15,20,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-[0_24px_60px_rgba(15,15,20,0.08)]"
            >
              <div className="pointer-events-none absolute right-5 top-5 h-10 w-10 rounded-full bg-foreground/[0.04]" />
              <summary className="relative cursor-pointer list-none pr-12">
                <span className="block font-serif text-[1.35rem] font-light leading-snug text-foreground">
                  {item.question}
                </span>
                <span className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 text-lg text-muted-foreground transition-all duration-200 group-open:rotate-45 group-open:border-foreground/15 group-open:text-foreground">
                  +
                </span>
              </summary>
              <div className="mt-4 border-t border-border/60 pt-4">
                <p className="text-body leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
