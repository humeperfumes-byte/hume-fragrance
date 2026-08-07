"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { Camera, ChevronRight, HelpCircle, PenLine, Send, Star, User, X, ZoomIn } from "lucide-react";
import { Review, getAverageRating } from "@/data/perfumes";
import { withCloudinaryTransforms } from "@/lib/cloudinary";

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  productName: string;
  inspiration?: string;
}

const StarRating = ({
  rating,
  interactive = false,
  onChange,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => {
      const icon = (
        <Star
          size={interactive ? 20 : 14}
          className={star <= rating ? "fill-primary text-primary" : "fill-muted text-muted"}
        />
      );

      if (!interactive) {
        return <span key={star}>{icon}</span>;
      }

      return (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
          className="rounded-sm p-0.5 transition-transform hover:scale-110"
        >
          {icon}
        </button>
      );
    })}
  </div>
);

const isQuestionEntry = (review: Review) =>
  review.reviewerLanguage === "question" || review.title?.toLowerCase() === "question";
const isResponseEntry = (review: Review) =>
  review.reviewerLanguage === "response" ||
  review.title?.toLowerCase() === "response" ||
  review.title?.toLowerCase().startsWith("response:");
const getResponseParentId = (review: Review) =>
  review.title?.toLowerCase().startsWith("response:")
    ? review.title.slice("Response:".length)
    : null;

const ProductReviews = ({ productId, reviews, productName, inspiration }: ProductReviewsProps) => {
  const [reviewItems, setReviewItems] = useState<Review[]>(reviews);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"review" | "question">("review");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyStatus, setReplyStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [author, setAuthor] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const ratingReviews = useMemo(
    () =>
      reviewItems.filter(
        (review) => !isQuestionEntry(review) && !isResponseEntry(review),
      ),
    [reviewItems],
  );
  const averageRating = useMemo(() => getAverageRating(ratingReviews), [ratingReviews]);
  const totalReviews = ratingReviews.length;

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

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    return `${months[monthIndex]} ${year}`;
  };

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    const availableSlots = 4 - selectedPhotos.length;
    const validFiles = filesArray.slice(0, availableSlots);

    if (validFiles.length === 0) return;

    setSelectedPhotos((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      const urlToRemove = prev[index];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      let uploadedPhotoUrls: string[] = [];

      // If user selected photos, upload them first
      if (selectedPhotos.length > 0) {
        const formData = new FormData();
        selectedPhotos.forEach((file) => formData.append("file", file));

        const uploadRes = await fetch("/api/reviews/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData?.error || "Failed to upload review photos.");
        }
        if (Array.isArray(uploadData.urls)) {
          uploadedPhotoUrls = uploadData.urls;
        }
      }

      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author,
          reviewerCity: city || undefined,
          rating: formMode === "review" ? rating : 5,
          reviewerLanguage: formMode,
          content,
          images: uploadedPhotoUrls,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Review could not be posted.");
      }

      setReviewItems((current) => [data as Review, ...current]);
      setAuthor("");
      setCity("");
      setRating(5);
      setContent("");
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      setStatus("success");
      setMessage(
        formMode === "question"
          ? "Thank you. Your question has been posted."
          : "Thank you. Your review has been posted with your photos!",
      );
      setIsFormOpen(false);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Review could not be posted.");
    }
  };

  const handleReplySubmit = async () => {
    if (replyContent.trim().length < 5) {
      setReplyStatus("error");
      setMessage("Please write a little more before sending your response.");
      return;
    }

    setReplyStatus("submitting");
    setMessage("");

    try {
      const response = await fetch(`/api/products/${encodeURIComponent(productId)}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "HUME Customer",
          rating: 5,
          reviewerLanguage: "response",
          replyTo: activeReplyId,
          content: replyContent.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Response could not be posted.");
      }

      setReviewItems((current) => [data as Review, ...current]);
      setReplyContent("");
      setActiveReplyId(null);
      setReplyStatus("idle");
      setMessage("Thank you. Your response has been posted.");
    } catch (error) {
      setReplyStatus("error");
      setMessage(error instanceof Error ? error.message : "Response could not be posted.");
    }
  };

  return (
    <section className="border-t border-border py-16 md:py-24">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-10 text-center">
            <p className="text-caption mb-4 text-muted-foreground">Customer Reviews</p>
            <h2 className="text-headline mb-3">Real Buyers, Real Feedback</h2>
            <p className="text-body text-muted-foreground">
              {totalReviews > 0
                ? `${averageRating} / 5 (${totalReviews} reviews)`
                : "Be the first to review this product"}
            </p>
          </div>

          <div className="mx-auto mb-8 max-w-md overflow-hidden rounded-lg border border-[#e8dfd4] bg-background shadow-[0_18px_48px_rgba(24,18,14,0.08)]">
            <div className="relative p-5">
              <button
                type="button"
                onClick={() => {
                  setFormMode("review");
                  setIsFormOpen((open) => !open);
                }}
                className="absolute right-4 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#f8f4ed] hover:text-foreground"
                aria-label="Open review form"
              >
                <ChevronRight size={18} />
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Overall Rating
              </p>
              <p className="mt-2 font-serif text-5xl font-light leading-none">
                {totalReviews > 0 ? averageRating : "0.0"}
              </p>
              <div className="mt-3">
                <StarRating rating={Math.round(averageRating)} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Based on {totalReviews} review{totalReviews === 1 ? "" : "s"}
              </p>
            </div>

            <div className="border-t border-[#e8dfd4] p-3">
              <button
                type="button"
                onClick={() => {
                  setFormMode("review");
                  setIsFormOpen((open) => (formMode === "review" ? !open : true));
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-[#15120f] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#fffaf2] transition-colors hover:bg-[#2a211a]"
              >
                <PenLine size={14} />
                {isFormOpen ? "Close Review Form" : "Write A Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormMode("question");
                  setIsFormOpen((open) => (formMode === "question" ? !open : true));
                }}
                className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-sm border border-[#e8dfd4] bg-background px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-[#f8f4ed]"
              >
                <HelpCircle size={14} />
                {isFormOpen && formMode === "question" ? "Close Question Form" : "Ask A Question"}
              </button>
            </div>

            {isFormOpen ? (
              <form onSubmit={handleSubmit} className="border-t border-[#e8dfd4] p-4 sm:p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm text-foreground">
                    Name
                    <input
                      value={author}
                      onChange={(event) => setAuthor(event.target.value)}
                      required
                      minLength={2}
                      maxLength={80}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#9b7a4a]"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="text-sm text-foreground">
                    City <span className="text-muted-foreground">(optional)</span>
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      maxLength={255}
                      className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#9b7a4a]"
                      placeholder="City"
                    />
                  </label>
                </div>

                {formMode === "review" ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm text-foreground">Your rating</span>
                    <StarRating rating={rating} interactive onChange={setRating} />
                  </div>
                ) : null}

                <label className="mt-4 block text-sm text-foreground">
                  {formMode === "question" ? "Question" : "Review"}
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    required
                    minLength={formMode === "review" ? 20 : 5}
                    maxLength={1200}
                    rows={4}
                    className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-[#9b7a4a]"
                    placeholder={
                      formMode === "question"
                        ? "Ask your question about the product, delivery, usage, or fragrance profile."
                        : "Tell us how it smelled, how long it lasted, and when you wore it."
                    }
                  />
                </label>

                {/* PHOTO ATTACHMENT SECTION */}
                <div className="mt-4">
                  <label className="block text-sm text-foreground font-medium mb-1.5">
                    Attach Photos <span className="text-xs text-muted-foreground font-normal">(optional, up to 4 photos)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    {photoPreviews.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted shadow-sm group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                    {selectedPhotos.length < 4 ? (
                      <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 transition-colors hover:border-[#9b7a4a] hover:bg-[#f8f4ed]">
                        <Camera size={18} className="text-muted-foreground" />
                        <span className="mt-1 text-[9px] font-semibold uppercase text-muted-foreground">Add</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/gif"
                          multiple
                          onChange={handlePhotoSelect}
                          className="hidden"
                        />
                      </label>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formMode === "question"
                      ? "Questions appear in the same customer section with a Question badge."
                      : "Reviews appear as customer reviews with your attached photos."}
                  </p>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#15120f] px-6 text-sm font-medium text-[#fffaf2] transition-colors hover:bg-[#2a211a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting"
                      ? "Posting..."
                      : formMode === "question"
                        ? "Submit question"
                        : "Submit review"}
                  </button>
                </div>
              </form>
            ) : null}

            {message ? (
              <p className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
                {message}
              </p>
            ) : null}
          </div>

          {reviewItems.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {reviewItems
                .filter((review) => !isResponseEntry(review))
                .map((review, index) => {
                const isQuestion = isQuestionEntry(review);
                const isResponse = isResponseEntry(review);
                const responses = isQuestion
                  ? reviewItems.filter(
                      (item) =>
                        isResponseEntry(item) && getResponseParentId(item) === review.id,
                    )
                  : [];

                return (
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
                      {isQuestion ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c8ad] bg-[#fbfaf8] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[#9b7a4a]">
                          <HelpCircle size={12} />
                          Question
                        </span>
                      ) : isResponse ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-sky-700">
                          <PenLine size={12} />
                          Response
                        </span>
                      ) : (
                        <StarRating rating={review.rating} />
                      )}
                      {review.verified ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                          Verified Buyer
                        </span>
                      ) : isQuestion || isResponse ? null : (
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                          Review
                        </span>
                      )}
                    </div>

                    <p className="text-body mb-4 leading-relaxed text-muted-foreground" itemProp="reviewBody">
                      &ldquo;{review.content}&rdquo;
                    </p>

                    {/* REVIEW PHOTOS THUMBNAIL GALLERY */}
                    {Array.isArray(review.images) && review.images.length > 0 ? (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {review.images.map((photoUrl, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setLightboxPhoto(photoUrl)}
                            className="group/photo relative h-16 w-16 overflow-hidden rounded-xl border border-border/80 bg-black/5 transition-transform hover:scale-105"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={withCloudinaryTransforms(photoUrl, { width: 300 })}
                              alt={`Customer photo ${pIdx + 1}`}
                              className="h-full w-full object-cover transition-opacity group-hover/photo:opacity-90"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/photo:opacity-100">
                              <ZoomIn size={14} className="text-white drop-shadow" />
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {isQuestion ? (
                      <div className="mb-2">
                        {activeReplyId === review.id ? (
                          <div className="rounded-2xl border border-[#e8dfd4] bg-background/90 p-2">
                            <div className="flex items-center gap-2">
                              <input
                                value={replyContent}
                                onChange={(event) => setReplyContent(event.target.value)}
                                minLength={5}
                                maxLength={1200}
                                className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[#9b7a4a]"
                                placeholder="Write your answer..."
                              />
                              <button
                                type="button"
                                onClick={handleReplySubmit}
                                disabled={replyStatus === "submitting"}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#15120f] text-[#fffaf2] transition-colors hover:bg-[#2a211a] disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label="Send response"
                              >
                                <Send size={15} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyId(review.id);
                              setReplyContent("");
                            }}
                            className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-full border border-[#d9c8ad] bg-background px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-[#f8f4ed]"
                          >
                            <PenLine size={13} />
                            Reply
                          </button>
                        )}
                      </div>
                    ) : null}

                    {responses.length > 0 ? (
                      <div className="mb-4 space-y-3">
                        {responses.map((response) => (
                          <div
                            key={response.id}
                            className="rounded-2xl border border-sky-100 bg-sky-50/60 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-700">
                                <User size={10} />
                                {response.author}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(response.date)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-700">
                              {response.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-3 text-xs text-muted-foreground border-t border-border/40">
                      <span className="font-medium text-foreground">
                        {review.author}
                        {review.reviewerCity ? `, ${review.reviewerCity}` : ""}
                      </span>
                      <span>{formatDate(review.date)}</span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-black shadow-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110"
              aria-label="Close photo"
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto}
              alt="Review full size photo"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default ProductReviews;
