import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScentQuiz from "@/components/ScentQuiz";
import { getAllPublicProducts } from "@/lib/db/products";

export const metadata: Metadata = {
  title: "Scent Quiz - Find Your Fragrance in 60s",
  description: "Answer a few quick questions and discover the best HUME fragrance matches for your style.",
};

export const dynamic = "force-dynamic";

export default async function ScentQuizPage() {
  const perfumes = await getAllPublicProducts();

  return (
    <main className="bg-background min-h-screen">
      <Header />
      <ScentQuiz perfumes={perfumes} />
      <Footer />
    </main>
  );
}
