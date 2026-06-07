import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import KitPackShowcase from "@/components/KitPackShowcase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Build Your Kit - 5 x 15ml",
  description: "Create a custom 5 x 15ml perfume kit from our inspired fragrance collection.",
};

export default function KitPackPage() {
  return (
    <main className="bg-background min-h-screen">
      <Header />
      <KitPackShowcase />
      <Footer />
    </main>
  );
}
