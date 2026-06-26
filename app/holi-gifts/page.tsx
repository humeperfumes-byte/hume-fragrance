import type { Metadata } from "next";
import GiftingPageContent from "@/app/corporate-gifting/GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Holi Celebration Gifts | HUME Fragrance",
  description:
    "Make the festival of colors memorable with premium Holi celebration gift boxes by HUME Fragrance. Long-lasting luxury scents and custom vibrant hampers.",
  alternates: { canonical: `${SITE_URL}/holi-gifts` },
};

export default function HoliGiftingPage() {
  return <GiftingPageContent occasion="holi" />;
}
