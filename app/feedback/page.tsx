import React from "react";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeedbackForm from "./FeedbackForm";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Customer Feedback & Experience | HUME Fragrance",
  description: "Share your experience with HUME. Rate our site flow, navigation, and tell us how you discovered our luxury fragrance collections.",
  alternates: { canonical: `${SITE_URL}/feedback` },
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 flex flex-col font-sans">
      <Header />
      <main className="flex-grow flex items-center justify-center pt-20 pb-8 md:py-16 px-4">
        <FeedbackForm />
      </main>
      <Footer />
    </div>
  );
}
