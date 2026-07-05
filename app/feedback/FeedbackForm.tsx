"use client";

import React, { useState } from "react";
import { Star, ArrowRight, Send, CheckCircle2, Share2, ShieldAlert } from "lucide-react";
import Link from "next/link";

const SOURCES = [
  { id: "ai", label: "AI Models (ChatGPT, Gemini, Claude)" },
  { id: "google", label: "Google Search" },
  { id: "social", label: "Instagram / Socials" },
  { id: "friend", label: "Word of mouth" },
  { id: "youtube", label: "YouTube / Twitter" },
  { id: "other", label: "Other Source" },
];

export default function FeedbackForm() {
  const [source, setSource] = useState("");
  const [sourceDetails, setSourceDetails] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source) {
      setError("Please select a source.");
      return;
    }
    if (rating === 0) {
      setError("Please provide a rating.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          sourceDetails: ["ai", "google", "other"].includes(source) ? sourceDetails : "",
          rating,
          feedbackText,
        }),
      });

      const result = await response.json();
      if (result.ok) {
        setSuccess(true);
      } else {
        setError(result.error || "Submission failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareOnWhatsApp = () => {
    const text = encodeURIComponent(
      "Help us build the future of fragrance. Share your HUME experience here: " +
        window.location.href
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="w-full max-w-2xl bg-transparent md:bg-white/90 md:backdrop-blur-xl border-0 md:border md:border-stone-200/50 p-0 md:p-12 shadow-none md:shadow-[0_32px_96px_rgba(0,0,0,0.04)] relative overflow-hidden rounded-none md:rounded-3xl font-satoshi">
      {/* Soft tech-startup background glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle modern layout grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {success ? (
        <div className="text-center py-12 animate-fade-in relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mb-6 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-clash text-2xl md:text-3xl font-bold text-stone-900 tracking-tight">
            Feedback Received
          </h1>
          <p className="mt-4 text-stone-500 max-w-md mx-auto text-xs md:text-sm leading-relaxed">
            Thank you for sharing your experience! We have logged your responses and will use them to continuously refine HUME.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 h-12 bg-stone-900 text-white text-xs font-bold tracking-wider uppercase transition-all duration-150 hover:bg-stone-850 active:scale-95 shadow-sm rounded-full"
            >
              Back to Shop <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <button
              onClick={handleShareOnWhatsApp}
              className="inline-flex items-center justify-center px-6 h-12 border border-stone-200 text-stone-700 bg-white text-xs font-bold tracking-wider uppercase transition-all duration-150 hover:bg-stone-50 active:scale-95 rounded-full"
            >
              <Share2 className="w-4 h-4 mr-2" /> Share Form
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight font-clash">
              Feedback
            </h1>
            <p className="hidden md:block text-stone-500 text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
              We process experience logs to optimize performance. Select source values and navigation rating below.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200/50 text-red-700 text-xs rounded-2xl leading-relaxed flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source Question */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
              Acquisition Source <span className="text-emerald-500">*</span>
            </label>
            <div className="flex flex-col md:grid md:grid-cols-3 gap-2">
              {SOURCES.map((item) => {
                const isSelected = source === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSource(item.id);
                      setError("");
                    }}
                    className={`flex items-center justify-center py-3 px-4 border text-center transition-all duration-200 rounded-2xl cursor-pointer text-xs font-bold tracking-wide ${
                      isSelected
                        ? "bg-stone-900 text-white border-stone-900 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                        : "bg-white border-stone-300 text-stone-850 shadow-sm hover:border-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Details input */}
          {["ai", "google", "other"].includes(source) && (
            <div className="space-y-2 animate-slide-down">
              <label className="block text-[11px] font-semibold text-stone-500">
                {source === "ai" && "What AI engine & prompt did you use? (e.g. engine / prompt details):"}
                {source === "google" && "What did you search on Google? (e.g. keywords used):"}
                {source === "other" && "Specify details here:"}
              </label>
              <input
                type="text"
                value={sourceDetails}
                onChange={(e) => setSourceDetails(e.target.value)}
                placeholder={
                  source === "ai"
                    ? "Gemini - best inspired perfumes in India"
                    : source === "google"
                    ? "best luxury perfumes in india"
                    : "Specify detail..."
                }
                className="w-full h-11 px-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all placeholder-stone-400"
              />
            </div>
          )}

          {/* Website Flow Rating */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
              Flow Process Rating <span className="text-emerald-500">*</span>
            </label>
            <div className="flex flex-col items-center justify-center py-2 md:py-4 space-y-2 md:space-y-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        setError("");
                      }}
                      className="p-0.5 transition-transform active:scale-95 duration-105 cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 md:w-10 md:h-10 transition-all duration-200 ${
                          isActive
                            ? "fill-amber-400 text-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                            : "text-stone-200 fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold tracking-widest text-amber-500 h-4 uppercase font-bold">
                {rating === 1 && "Needs Optimization 😐"}
                {rating === 2 && "Acceptable 🙂"}
                {rating === 3 && "Satisfactory 😄"}
                {rating === 4 && "Excellent 🌟"}
                {rating === 5 && "Flawless Flow 🔥"}
              </span>
            </div>
          </div>

          {/* Feedback text */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400">
              Detailed Feedback <span className="text-stone-300">(Optional)</span>
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter details, specific features, or fragrance note requests..."
              rows={3}
              className="w-full p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 focus:bg-white transition-all resize-none placeholder-stone-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 md:pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-6 h-12 bg-stone-900 hover:bg-stone-850 text-white text-xs font-bold tracking-widest uppercase transition-all duration-150 active:scale-95 disabled:opacity-50 cursor-pointer rounded-full shadow-sm"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Submit <Send className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
