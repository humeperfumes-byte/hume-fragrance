import type { Metadata } from "next";
import GiftingPageContent from "@/app/corporate-gifting/GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New Year Celebration Gifts | HUME Fragrance",
  description:
    "Start the year with luxury. Explore HUME Fragrance's New Year celebration gift hampers, featuring signature perfumes, custom greeting cards, and premium boxes.",
  alternates: { canonical: `${SITE_URL}/new-years-gifts` },
};

export default function NewYearsGiftingPage() {
  return <GiftingPageContent occasion="new-year" />;
}
