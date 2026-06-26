import type { Metadata } from "next";
import GiftingPageContent from "./GiftingPageContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Gifting | HUME Fragrance",
  description:
    "Elevate your B2B gifting with HUME's luxury custom-branded perfume sets, discovery kits, and premium corporate packaging. Custom laser engraving available.",
  alternates: { canonical: `${SITE_URL}/corporate-gifting` },
};

export default function CorporateGiftingPage() {
  return <GiftingPageContent occasion="corporate" />;
}