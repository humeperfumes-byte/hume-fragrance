import Header from "@/components/Header";
import Footer from "@/components/Footer";

type PolicySection = {
  title: string;
  body: string[];
};

type TrustPolicyPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  sections: PolicySection[];
};

export default function TrustPolicyPage({
  eyebrow,
  title,
  description,
  highlights = [],
  sections,
}: TrustPolicyPageProps) {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <Header />
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-light leading-tight tracking-wide text-zinc-950 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
              {description}
            </p>
          </div>

          {highlights.length > 0 ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-sm font-medium text-zinc-800 shadow-[0_12px_34px_rgba(15,23,42,0.05)]"
                >
                  {highlight}
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-10 grid gap-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-7"
              >
                <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

