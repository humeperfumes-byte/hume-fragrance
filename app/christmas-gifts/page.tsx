import type { Metadata } from "next";
import GiftingPageContent from "@/app/corporate-gifting/GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Christmas Holiday Gifts & Hampers | HUME Fragrance",
  description:
    "Spread festive cheer with luxury Christmas gifts and hampers by HUME Fragrance. Premium fragrance sets wrapped in silk ribbons and holiday packaging.",
  alternates: { canonical: `${SITE_URL}/christmas-gifts` },
};

export default function ChristmasGiftingPage() {
  return <GiftingPageContent occasion="christmas" />;
}
