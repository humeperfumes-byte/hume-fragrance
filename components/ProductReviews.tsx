"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { User } from "lucide-react";
import Image from "next/image";
import { Review, getAverageRating } from "@/data/perfumes";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

interface ProductReviewsProps {
  reviews: Review[];
  productName: string;
  inspiration?: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"}
        />
      ))}
    </div>
  );
};

const ProductReviews = ({ reviews, productName, inspiration }: ProductReviewsProps) => {
  if (reviews.length === 0) return null;

  const averageRating = getAverageRating(reviews);
  const totalReviews = reviews.length;

  const formatDate = (dateString: string) => {
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
    const [yearRaw, monthRaw] = dateString.split("-");
    const monthIndex = Number(monthRaw) - 1;
    const year = Number(yearRaw);
    if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
      return dateString;
    }
    return `${months[monthIndex]} ${year}`;
  };

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-10">
            <p className="text-caption text-muted-foreground mb-4">Customer Reviews</p>
            <h2 className="text-headline mb-3">Real Buyers, Real Feedback</h2>
            <p className="text-body text-muted-foreground">
              {averageRating} / 5 ({totalReviews} reviews)
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map((review, index) => (
              <motion.article
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-border/60 bg-gradient-to-b from-white to-secondary/20 p-5 shadow-[0_18px_45px_rgba(15,15,20,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,15,20,0.10)]"
                itemScope
                itemType="https://schema.org/Review"
              >
                <meta itemProp="itemReviewed" content={productName} />
                <meta itemProp="author" content={review.author} />
                <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                  <meta itemProp="ratingValue" content={String(review.rating)} />
                  <meta itemProp="bestRating" content="5" />
                </div>

                <div className="mb-4 flex items-center justify-between gap-3">
                  <StarRating rating={review.rating} />
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                    Verified
                  </span>
                </div>

                <p className="text-body text-muted-foreground mb-5 leading-relaxed" itemProp="reviewBody">
                  &ldquo;{review.content}&rdquo;
                </p>

                <div className="mt-6 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between gap-4 text-caption text-muted-foreground">
                  <div className="flex min-w-0 items-center gap-3">
                    {review.avatarUrl ? (
                      <div className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-border/70">
                        <Image
                          src={withCloudinaryTransforms(review.avatarUrl, { width: 96 })}
                          alt={`${review.author} profile`}
                          fill
                          sizes="36px"
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-secondary/70 text-muted-foreground">
                        <User size={14} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-base text-foreground">{review.author}</p>
                      <p className="truncate text-[10px] font-light uppercase tracking-[0.14em] text-muted-foreground/80">
                        {review.reviewerCity
                          ? `${formatDate(review.date)} • ${review.reviewerCity}`
                          : formatDate(review.date)}
                      </p>
                    </div>
                  </div>
                  <time className="sr-only" dateTime={review.date} itemProp="datePublished">
                    {formatDate(review.date)}
                  </time>
                  </div>

                  <div className="mt-4 rounded-2xl bg-background/80 p-3 ring-1 ring-border/50">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Reviewed</p>
                    <p className="mt-1 font-serif text-2xl font-light">{productName}</p>
                    {inspiration ? (
                      <p className="mt-1 text-sm italic text-muted-foreground">Inspired by {inspiration}</p>
                    ) : null}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductReviews;

