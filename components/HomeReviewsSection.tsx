import Link from "next/link";
import { Star } from "lucide-react";
import { getProductSeoSlug } from "@/lib/product-route";
import type { HomepagePerfumeCardData } from "@/types/homepage";

type ReviewCard = {
  id: string;
  author: string;
  rating: number;
  date: string;
  content: string;
  productName: string;
  productSlug: string;
  inspiration: string;
};

function formatReviewDate(dateString: string) {
  const [yearRaw, monthRaw] = dateString.split("-");
  const month = Number(monthRaw);
  const year = Number(yearRaw);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (!Number.isFinite(month) || !Number.isFinite(year) || month < 1 || month > 12) {
    return dateString;
  }

  return `${months[month - 1]} ${year}`;
}

function getReviewProductSlug(perfume: HomepagePerfumeCardData) {
  if (!perfume.inspirationBrand) {
    return perfume.id;
  }

  return getProductSeoSlug({
    id: perfume.id,
    name: perfume.name,
    inspiration: perfume.inspiration,
    inspirationBrand: perfume.inspirationBrand,
  });
}

function getHomeReviewCards(perfumes: HomepagePerfumeCardData[]): ReviewCard[] {
  return perfumes
    .flatMap((perfume) =>
      (perfume.reviews ?? []).map((review) => ({
        id: `${perfume.id}-${review.id}`,
        author: review.author,
        rating: review.rating,
        date: review.date,
        content: review.content,
        productName: perfume.name,
        productSlug: getReviewProductSlug(perfume),
        inspiration: perfume.inspiration,
      }))
    )
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 8);
}

export default function HomeReviewsSection({
  perfumes,
}: {
  perfumes: HomepagePerfumeCardData[];
}) {
  const reviewCards = getHomeReviewCards(perfumes);

  if (reviewCards.length === 0) return null;

  return (
    <section className="py-18 md:py-24">
      <div className="container-luxury">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="text-caption text-muted-foreground">Customer Love</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl font-light tracking-wide">
            What Our Buyers Say
          </h2>
          <div className="mx-auto mt-6 h-px w-16 bg-border" />
          <p className="mt-6 text-body text-muted-foreground">
            Real feedback from HUME customers across fresh, woody, gourmand, and signature profiles.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {reviewCards.map((review) => (
            <article
              key={review.id}
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-b from-white to-secondary/20 p-5 shadow-[0_18px_45px_rgba(15,15,20,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,15,20,0.10)]"
            >
              <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.04] font-serif text-2xl text-foreground/30">
                &quot;
              </div>

              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${review.id}-star-${index}`}
                        size={14}
                        className={index < review.rating ? "fill-primary text-primary" : "text-border"}
                      />
                    ))}
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                    Verified
                  </span>
                </div>

                <p className="text-body leading-relaxed text-foreground/85">
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>

              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{review.author}</p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      {formatReviewDate(review.date)}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-[13px] font-medium text-background shadow-sm">
                    {review.author.charAt(0)}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-background/80 p-3 ring-1 ring-border/50">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Reviewed
                  </p>
                  <Link
                    href={`/product/${review.productSlug}`}
                    className="mt-1 block font-serif text-xl font-light transition-opacity hover:opacity-70"
                  >
                    {review.productName}
                  </Link>
                  <p className="mt-1 text-sm italic text-muted-foreground">
                    Inspired by {review.inspiration}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
