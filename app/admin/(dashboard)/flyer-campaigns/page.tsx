import type { Metadata } from "next";
import FlyerAnalyticsView from "./FlyerAnalyticsView";

export const metadata: Metadata = {
  title: "QR & Flyer Campaigns Analytics | HUME Admin",
  description: "Track QR scan performance, coupon conversion ratios, and flyer revenue by city.",
};

export const dynamic = "force-dynamic";

export default function AdminFlyerCampaignsPage() {
  return <FlyerAnalyticsView />;
}
