"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useMemo, useState, type FormEvent, type ChangeEvent } from "react";
import { Camera, Check, ChevronRight, HelpCircle, PenLine, Send, ShieldCheck, Star, User, X, ZoomIn } from "lucide-react";
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
  size = 14,
}: {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: number;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => {
      const icon = (
        <Star
          size={interactive ? 24 : size}
          className={
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-zinc-200 text-zinc-300"
          }
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
          className="rounded-lg p-1 transition-all hover:scale-125 focus:outline-none"
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

  // Rating count breakdown (5 stars to 1 star)
  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingReviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded as keyof typeof counts] = (counts[rounded as keyof typeof counts] || 0) + 1;
    });
    return counts;
  }, [ratingReviews]);

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
    <section className="border-t border-zinc-200 py-16 md:py-24 bg-gradient-to-b from-white via-zinc-50/50 to-white">
      <div className="container-luxury">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* SECTION TITLE */}
          <div className="mb-10 text-center">
            <p className="text-caption mb-3 text-zinc-500 uppercase tracking-[0.2em] font-semibold text-xs">
              Customer Reviews
            </p>
            <h2 className="text-headline mb-3 text-3xl font-serif font-light sm:text-4xl text-zinc-900">
              Real Buyers, Real Feedback
            </h2>
            <p className="text-body text-zinc-500 text-sm max-w-md mx-auto">
              {totalReviews > 0
                ? `${averageRating} / 5 Rating based on ${totalReviews} verified customer review${totalReviews === 1 ? "" : "s"}`
                : "Be the first fragrance lover to review this scent"}
            </p>
          </div>

          {/* REDESIGNED LUXURY NEUTRAL REVIEW CARD & HERO */}
          <div className="mx-auto mb-12 max-w-3xl overflow-hidden rounded-3xl border border-zinc-200/80 bg-gradient-to-b from-white via-[#FAF9F6] to-[#F4F3EF] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-sm transition-all duration-300">
            
            {/* RATING OVERVIEW & SUMMARY GRID */}
            <div className="grid gap-6 sm:grid-cols-12 sm:items-center">
              
              {/* Left Column: Rating & Stars */}
              <div className="sm:col-span-6 flex flex-col items-center text-center sm:items-start sm:text-left sm:border-r sm:border-zinc-200/80 sm:pr-8">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Overall Rating
                </span>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-serif text-5xl font-light leading-none text-zinc-900">
                    {totalReviews > 0 ? averageRating : "5.0"}
                  </span>
                  <span className="text-sm text-zinc-400 font-serif">/ 5</span>
                </div>

                <div className="mt-3">
                  <StarRating rating={totalReviews > 0 ? Math.round(averageRating) : 5} size={18} />
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>
                    {totalReviews > 0
                      ? `Based on ${totalReviews} review${totalReviews === 1 ? "" : "s"}`
                      : "Verified Buyer Guarantee"}
                  </span>
                </div>
              </div>

              {/* Right Column: Rating Breakdown Bars / Hidden Prompt on Mobile */}
              <div className="sm:col-span-6 flex flex-col justify-center space-y-2">
                {totalReviews > 0 ? (
                  ([5, 4, 3, 2, 1] as const).map((num) => {
                    const count = ratingCounts[num];
                    const percent = Math.round((count / totalReviews) * 100);
                    return (
                      <div key={num} className="flex items-center gap-3 text-xs text-zinc-600">
                        <span className="w-8 font-mono text-[11px] text-right font-medium">{num} ★</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 font-mono text-[10px] text-zinc-400">{count}</span>
                      </div>
                    );
                  })
                ) : (
                  /* PROMPT BOX - HIDE ON MOBILE (hidden sm:block) */
                  <div className="hidden sm:block rounded-2xl border border-zinc-200/80 bg-white/80 p-4 text-left shadow-sm">
                    <p className="text-xs font-semibold text-zinc-900">
                      Have you experienced this fragrance?
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                      Share your thoughts on longevity, sillage, and notes to inspire fragrance lovers!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SEPARATE LOOKING ACTION BUTTONS */}
            <div className="mt-8 border-t border-zinc-200/80 pt-6">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                
                {/* STANDALONE SEPARATE BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setFormMode("review");
                      setIsFormOpen((open) => (formMode === "review" ? !open : true));
                    }}
                    className={`inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-sm ${
                      isFormOpen && formMode === "review"
                        ? "bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-2"
                        : "bg-zinc-900 text-white hover:bg-black"
                    }`}
                  >
                    <PenLine size={15} className="text-amber-400" />
                    <span>{isFormOpen && formMode === "review" ? "Close Review Form" : "Write A Review"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormMode("question");
                      setIsFormOpen((open) => (formMode === "question" ? !open : true));
                    }}
                    className={`inline-flex items-center justify-center gap-2.5 rounded-2xl border px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-200 shadow-sm ${
                      isFormOpen && formMode === "question"
                        ? "border-zinc-900 bg-zinc-100 text-zinc-900 ring-2 ring-zinc-900 ring-offset-2"
                        : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 hover:border-zinc-400"
                    }`}
                  >
                    <HelpCircle size={15} className="text-zinc-600" />
                    <span>{isFormOpen && formMode === "question" ? "Close Question" : "Ask A Question"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-400 hidden sm:block italic font-serif">
                  {formMode === "question" ? "Fast response from HUME team" : "Takes under 1 minute"}
                </p>
              </div>
            </div>

            {/* EXPANDABLE FORM WITH REORDERED FIELDS */}
            <AnimatePresence>
              {isFormOpen && (
                <motion.form
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  onSubmit={handleSubmit}
                  className="overflow-hidden border-t border-zinc-200/80 pt-6 space-y-5"
                >
                  {/* ROW 1: NAME & RATING SCORE */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 mb-1.5">
                        Your Name <span className="text-amber-600">*</span>
                      </label>
                      <input
                        value={author}
                        onChange={(event) => setAuthor(event.target.value)}
                        required
                        minLength={2}
                        maxLength={80}
                        className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 shadow-sm"
                        placeholder="e.g. Priyanshu Mehta"
                      />
                    </div>

                    {formMode === "review" ? (
                      <div className="rounded-xl border border-zinc-200 bg-white p-3 flex flex-col justify-center shadow-sm">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-700 mb-1">
                          Rating Score
                        </span>
                        <div className="flex items-center gap-2">
                          <StarRating rating={rating} interactive onChange={setRating} size={20} />
                          <span className="font-serif text-base font-medium text-zinc-900">{rating}.0</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* ROW 2: PHOTO ATTACHMENT DROPZONE (MOVED ABOVE TEXTAREA) */}
                  <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/90 p-4 transition-colors hover:border-zinc-400">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-800">
                          <Camera size={15} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-800 block">
                            Attach Photos <span className="text-[11px] text-zinc-400 font-normal lowercase">(optional)</span>
                          </label>
                          <span className="text-[10px] text-zinc-500">Upload up to 4 real photos of your bottle or packaging</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-400">{selectedPhotos.length}/4</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {photoPreviews.map((url, idx) => (
                        <div key={idx} className="relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900/80 text-white backdrop-blur-sm transition-transform hover:scale-110"
                            title="Remove photo"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}

                      {selectedPhotos.length < 4 && (
                        <label className="flex h-16 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white transition-all hover:border-zinc-400 shadow-sm group">
                          <Camera size={18} className="text-zinc-600 transition-transform group-hover:scale-110" />
                          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">Add Photo</span>
                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/webp, image/gif"
                            multiple
                            onChange={handlePhotoSelect}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* ROW 3: REVIEW / QUESTION TEXTAREA */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 mb-1.5">
                      {formMode === "question" ? "Your Question" : "Your Review"} <span className="text-amber-600">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      required
                      minLength={formMode === "review" ? 20 : 5}
                      maxLength={1200}
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 shadow-sm"
                      placeholder={
                        formMode === "question"
                          ? "Ask your question about fragrance notes, projection, longevity, delivery, or packaging..."
                          : "How does it smell on your skin? How many hours did it last? Describe the opening and dry down..."
                      }
                    />
                  </div>

                  {/* ROW 4: CITY INPUT (MOVED DOWN BELOW TEXTAREA) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 mb-1.5">
                      City <span className="text-zinc-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      maxLength={255}
                      className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 shadow-sm"
                      placeholder="e.g. Mumbai, Ahmedabad"
                    />
                  </div>

                  {/* ROW 5: SUBMIT BUTTONS & ALERTS */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-zinc-500">
                      {formMode === "question"
                        ? "Questions appear publicly to help other buyers."
                        : "Verified buyer badges automatically attach to confirmed customer orders."}
                    </p>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="flex-1 sm:flex-initial h-11 rounded-xl border border-zinc-300 bg-white px-5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="flex-1 sm:flex-initial inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-7 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {status === "submitting" ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Posting...</span>
                          </>
                        ) : (
                          <>
                            <Send size={13} className="text-amber-400" />
                            <span>{formMode === "question" ? "Submit Question" : "Publish Review"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 rounded-xl p-3 text-xs font-medium ${
                  status === "error"
                    ? "border border-red-200 bg-red-50 text-red-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {message}
              </motion.div>
            )}
          </div>

          {/* REVIEWS GRID LIST */}
          {reviewItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white p-6 shadow-[0_14px_40px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(0,0,0,0.07)]"
                      itemScope
                      itemType="https://schema.org/Review"
                    >
                      <meta itemProp="itemReviewed" content={productName} />
                      <meta itemProp="author" content={review.author} />
                      <div itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                        <meta itemProp="ratingValue" content={String(review.rating)} />
                        <meta itemProp="bestRating" content="5" />
                      </div>

                      <div>
                        {/* CARD BADGES */}
                        <div className="mb-4 flex items-center justify-between gap-3">
                          {isQuestion ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800">
                              <HelpCircle size={12} />
                              Question
                            </span>
                          ) : isResponse ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/60 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-800">
                              <PenLine size={12} />
                              Response
                            </span>
                          ) : (
                            <StarRating rating={review.rating} size={13} />
                          )}

                          {review.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                              <Check size={11} /> Verified Buyer
                            </span>
                          ) : isQuestion || isResponse ? null : (
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                              Review
                            </span>
                          )}
                        </div>

                        {/* CONTENT */}
                        <p className="text-body mb-5 leading-relaxed text-zinc-700 font-light" itemProp="reviewBody">
                          &ldquo;{review.content}&rdquo;
                        </p>

                        {/* PHOTO THUMBNAILS */}
                        {Array.isArray(review.images) && review.images.length > 0 && (
                          <div className="mb-5 flex flex-wrap gap-2">
                            {review.images.map((photoUrl, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => setLightboxPhoto(photoUrl)}
                                className="group/photo relative h-16 w-16 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 shadow-sm transition-transform hover:scale-105"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={withCloudinaryTransforms(photoUrl, { width: 300 })}
                                  alt={`Customer photo ${pIdx + 1}`}
                                  className="h-full w-full object-cover transition-opacity group-hover/photo:opacity-90"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover/photo:opacity-100">
                                  <ZoomIn size={15} className="text-white drop-shadow" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {isQuestion && (
                          <div className="mb-3">
                            {activeReplyId === review.id ? (
                              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2.5">
                                <div className="flex items-center gap-2">
                                  <input
                                    value={replyContent}
                                    onChange={(event) => setReplyContent(event.target.value)}
                                    minLength={5}
                                    maxLength={1200}
                                    className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 text-xs outline-none focus:border-zinc-900"
                                    placeholder="Write your answer..."
                                  />
                                  <button
                                    type="button"
                                    onClick={handleReplySubmit}
                                    disabled={replyStatus === "submitting"}
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white transition-colors hover:bg-black disabled:opacity-60"
                                    aria-label="Send response"
                                  >
                                    <Send size={14} />
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
                                className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-full border border-zinc-300 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-900 shadow-sm transition-all hover:bg-zinc-50"
                              >
                                <PenLine size={12} />
                                Reply
                              </button>
                            )}
                          </div>
                        )}

                        {responses.length > 0 && (
                          <div className="mb-4 space-y-2.5">
                            {responses.map((response) => (
                              <div
                                key={response.id}
                                className="rounded-2xl border border-sky-100 bg-sky-50/50 p-3.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-white px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-sky-800">
                                    <User size={10} />
                                    {response.author}
                                  </span>
                                  <span className="text-[10px] text-zinc-400">
                                    {formatDate(response.date)}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs leading-relaxed text-slate-700">
                                  {response.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER */}
                      <div className="flex items-center justify-between border-t border-zinc-200/60 pt-3 text-xs text-zinc-500">
                        <span className="font-medium text-zinc-900">
                          {review.author}
                          {review.reviewerCity ? `, ${review.reviewerCity}` : ""}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400">{formatDate(review.date)}</span>
                      </div>
                    </motion.article>
                  );
                })}
            </div>
          ) : null}
        </motion.div>
      </div>

      {/* FULLSCREEN PHOTO LIGHTBOX */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-3xl bg-black shadow-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-transform hover:scale-110"
              aria-label="Close photo"
            >
              <X size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto}
              alt="Review full size photo"
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
