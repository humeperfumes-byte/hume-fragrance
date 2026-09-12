import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrackOrderClient from "./TrackOrderClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Order is On Its Way | Track Your HUME Order",
  description: "We've packed your order with care and it's now on its way to you. Track your shipment for real-time updates.",
  openGraph: {
    title: "Your Order is On Its Way | HUME Fragrance",
    description: "We've packed your order with care and it's now on its way to you. Track your shipment for real-time updates.",
    type: "website",
    images: [
      {
        url: "/images/track-order-og.jpg",
        width: 1200,
        height: 675,
        alt: "HUME Fragrance - Your Order is On Its Way",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Order is On Its Way | HUME Fragrance",
    description: "We've packed your order with care and it's now on its way to you. Track your shipment for real-time updates.",
    images: ["/images/track-order-og.jpg"],
  },
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
