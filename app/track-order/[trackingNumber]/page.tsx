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
  const title = cleanNumber
    ? `Your Order (#${cleanNumber}) is On Its Way | HUME Fragrance`
    : "Your Order is On Its Way | HUME Fragrance";
  const description = "We've packed your order with care and it's now on its way to you. Track your shipment for real-time updates.";

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
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
      title,
      description,
      images: ["/images/track-order-og.jpg"],
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
