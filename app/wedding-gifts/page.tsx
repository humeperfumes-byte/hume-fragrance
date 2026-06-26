import type { Metadata } from "next";
import GiftingPageContent from "@/app/corporate-gifting/GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wedding Gifts & Favors | HUME Fragrance",
  description:
    "Elevate your special day with bespoke wedding favors by HUME Fragrance. Premium silk-wrapped gift hampers, custom engraved perfume bottles, and luxury presentation sets.",
  alternates: { canonical: `${SITE_URL}/wedding-gifts` },
};

export default function WeddingGiftingPage() {
  return <GiftingPageContent occasion="wedding" />;
}
