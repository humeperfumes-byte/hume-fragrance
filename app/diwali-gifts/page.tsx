import type { Metadata } from "next";
import GiftingPageContent from "@/app/corporate-gifting/GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diwali Gifts & Festive Hampers | HUME Fragrance",
  description:
    "Celebrate the festival of lights with luxury Diwali gift hampers by HUME Fragrance. Premium perfume sets, gourmet pairings, and custom festive packaging.",
  alternates: { canonical: `${SITE_URL}/diwali-gifts` },
};

export default function DiwaliGiftingPage() {
  return <GiftingPageContent occasion="diwali" />;
}
