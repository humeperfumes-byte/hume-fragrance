import Link from "next/link";
import ProductReviews from "@/components/ProductReviews";
import type { Review } from "@/data/perfumes";
import type { DiscoverySetSeoPage } from "@/lib/discovery-set-seo";
import {
  DISCOVERY_SET_PATH,
  DISCOVERY_SET_PRICE,
  DISCOVERY_SET_SAMPLE_COUNT,
  DISCOVERY_SET_SAMPLE_SIZE_ML,
  DISCOVERY_SET_SIZE,
} from "@/lib/discovery-set";
import { formatINR } from "@/lib/currency";

type DiscoverySetAeoContentProps = {
  page?: DiscoverySetSeoPage;
  reviews: Review[];
};

const comparisonRows = [
  ["Choice", `Choose any ${DISCOVERY_SET_SAMPLE_COUNT} available HUME fragrances`, "One fragrance only"],
  ["Testing time", "Multiple wears from each 3ml spray tester", "Commit before testing the dry-down"],
  ["Best use", "Compare scent families, performance and occasions", "Buy when you already know the fragrance"],
  ["Purchase risk", `Lower entry price at ${formatINR(DISCOVERY_SET_PRICE)}`, "Higher commitment for one scent"],
];

const testingSteps = [
  ["Choose with variety", "Include fresh, woody, sweet, floral and evening options instead of selecting fifteen similar scents."],
  ["Test one at a time", "Spray on clean skin and avoid testing too many perfumes together, which can make the scents difficult to compare."],
  ["Wear through the dry-down", "Check the opening, the scent after a few hours, projection and comfort in your normal weather and routine."],
  ["Shortlist before full size", "Note the perfumes you naturally reach for again, then use that shortlist for a future full-bottle decision."],
];

const rememberedCustomerFeedback = [
  "I have now tried all of the world-famous perfumes. Good concept by HUME.",
  "I found three or four of the best perfumes from these 15 perfume testers. Now I can buy the big bottle freely.",
];

function getQueryLabel(page?: DiscoverySetSeoPage) {
  return page?.keywords[0] ?? "perfume trial kit India";
}

export default function DiscoverySetAeoContent({
  page,
  reviews,
}: DiscoverySetAeoContentProps) {
  const query = getQueryLabel(page);
  const heading = page?.h1 ?? "A Perfume Trial Kit Made for Real Wear Tests";
  const directAnswer = page?.description ??
    `The HUME Discovery Set is a build-your-own perfume trial kit in India with ${DISCOVERY_SET_SIZE} spray testers for ${formatINR(DISCOVERY_SET_PRICE)}. It is designed for comparing fragrances on skin before choosing a full bottle.`;
  const relatedKeywords = page?.keywords ?? [
    "perfume samples India",
    "best perfume trial kit India",
    "perfume tester pack",
    "try before you buy perfume",
  ];

  return (
    <>
      <section className="border-t border-border bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
              Customer feedback
            </p>
            <h2 className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl">
              What customers told HUME
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Feedback shared directly with HUME. Customer names and star ratings
              were not recorded, so none have been added here.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {rememberedCustomerFeedback.map((feedback) => (
              <figure key={feedback} className="border border-black/10 bg-[#f8f5ef] p-6 sm:p-8">
                <blockquote className="font-serif text-2xl font-light leading-relaxed text-foreground/85">
                  &ldquo;{feedback}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/50">
                  HUME Discovery Set customer
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <ProductReviews
        productId="hume-discovery-set"
        reviews={reviews}
        productName="HUME Discovery Set"
        inspiration={`${DISCOVERY_SET_SIZE} build-your-own perfume sample kit`}
      />

      <section
        aria-labelledby="discovery-set-guide-title"
        className="border-t border-border bg-[#f8f5ef] px-4 py-16 text-foreground sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1120px]">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
              Buyer&apos;s guide · India
            </p>
            <h2
              id="discovery-set-guide-title"
              className="mt-4 font-serif text-4xl font-light leading-tight sm:text-5xl"
            >
              {heading}
            </h2>
            <p className="mt-5 text-base font-medium leading-8 text-foreground/85">
              {directAnswer}
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              For shoppers searching for {query}, the useful question is not only how
              many samples are included. A good trial should provide enough fragrance
              for repeat wear, let you choose scents that match your taste, and help
              you compare how each perfume develops in Indian heat, humidity and
              everyday indoor conditions.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-2" aria-label="Related discovery set topics">
            {relatedKeywords.map((keyword) => (
              <span
                key={keyword}
                className="border border-black/10 bg-white px-3 py-2 text-[11px] text-foreground/70"
              >
                {keyword}
              </span>
            ))}
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <article>
              <h3 className="font-serif text-3xl font-light">
                What makes this a practical perfume sample set?
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Each HUME Discovery Set contains {DISCOVERY_SET_SAMPLE_COUNT} spray
                testers of {DISCOVERY_SET_SAMPLE_SIZE_ML}ml each. You select the
                fragrances yourself, so the set can focus on men&apos;s, women&apos;s or
                unisex profiles—or mix scent families for broader comparison. The
                current price is {formatINR(DISCOVERY_SET_PRICE)}.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                A 3ml spray is intended for more than a paper-strip impression. It
                gives you multiple opportunities to evaluate the opening, dry-down,
                longevity and whether the scent suits work, travel, daily wear or an
                occasion. Performance varies by skin, application and environment,
                which is why personal wear testing matters.
              </p>
            </article>

            <div className="overflow-x-auto border border-black/10 bg-white">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <caption className="border-b border-black/10 px-5 py-4 text-left font-semibold">
                  Discovery set vs buying one full bottle first
                </caption>
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.025] text-xs uppercase tracking-wider text-foreground/60">
                    <th className="px-5 py-3 font-medium">Decision</th>
                    <th className="px-5 py-3 font-medium">HUME Discovery Set</th>
                    <th className="px-5 py-3 font-medium">Full bottle first</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, discovery, bottle]) => (
                    <tr key={label} className="border-b border-black/10 last:border-0">
                      <th className="px-5 py-4 font-semibold">{label}</th>
                      <td className="px-5 py-4 leading-6 text-foreground/70">{discovery}</td>
                      <td className="px-5 py-4 leading-6 text-foreground/70">{bottle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="font-serif text-3xl font-light">
              How to get a useful result from perfume trials
            </h3>
            <ol className="mt-7 grid gap-4 sm:grid-cols-2">
              {testingSteps.map(([title, body], index) => (
                <li key={title} className="border border-black/10 bg-white p-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold">
                    Step {index + 1}
                  </span>
                  <h4 className="mt-3 font-semibold">{title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-16 grid gap-5 border-t border-black/10 pt-10 md:grid-cols-3">
            <article>
              <h3 className="font-semibold">Who is it best for?</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                First-time buyers, fragrance collectors comparing new directions,
                gift shoppers, travellers and anyone who wants to reduce the risk of
                a blind full-bottle purchase.
              </p>
            </article>
            <article>
              <h3 className="font-semibold">Are these original designer decants?</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                No. The set contains HUME Fragrance perfumes, including HUME&apos;s own
                inspired scent interpretations. It is not a collection of liquid
                decanted from designer-brand bottles.
              </p>
            </article>
            <article>
              <h3 className="font-semibold">Where can I see every option?</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Use the builder above to see the currently available sample choices,
                or browse the <Link href="/shop" className="underline underline-offset-4">HUME perfume collection</Link>{" "}
                before building your set.
              </p>
            </article>
          </div>

          {page ? (
            <div className="mt-12 border border-black/10 bg-white p-6 sm:p-8">
              <h3 className="font-serif text-2xl font-light">Ready to compare on skin?</h3>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
                Return to the builder above and select exactly {DISCOVERY_SET_SAMPLE_COUNT}
                fragrances. For the main product facts and latest availability, visit
                the canonical <Link href={DISCOVERY_SET_PATH} className="font-medium underline underline-offset-4">HUME Discovery Set page</Link>.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
