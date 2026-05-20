import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "../TrackOrderClient";

type TrackOrderByIdPageProps = {
  params: Promise<{ trackingNumber: string }>;
};

function cleanTrackingNumber(value: string) {
  return decodeURIComponent(value).trim().replace(/\s+/g, "").toUpperCase();
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: TrackOrderByIdPageProps): Promise<Metadata> {
  const { trackingNumber } = await params;
  const cleanNumber = cleanTrackingNumber(trackingNumber);

  return {
    title: cleanNumber ? `Track Order ${cleanNumber}` : "Track Your HUME Order",
    description: "Track your HUME order shipped with India Post Speed Post.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TrackOrderByIdPage({
  params,
}: TrackOrderByIdPageProps) {
  const { trackingNumber } = await params;

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-foreground">
      <Header />
      <TrackOrderClient initialTrackingNumber={cleanTrackingNumber(trackingNumber)} />
      <Footer />
    </main>
  );
}
