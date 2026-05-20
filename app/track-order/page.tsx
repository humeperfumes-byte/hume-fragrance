import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track Your HUME Order",
  description: "Track HUME orders shipped with India Post Speed Post.",
};

type TrackOrderPageProps = {
  searchParams?: Promise<{ id?: string; tracking?: string; trackingNumber?: string }>;
};

export default async function TrackOrderPage({ searchParams }: TrackOrderPageProps) {
  const params = await searchParams;
  const initialTrackingNumber = params?.trackingNumber || params?.tracking || params?.id || "";

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-foreground">
      <Header />
      <TrackOrderClient initialTrackingNumber={initialTrackingNumber} />
      <Footer />
    </main>
  );
}
