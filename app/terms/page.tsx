import type { Metadata } from "next";
import TrustPolicyPage from "@/components/TrustPolicyPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "HUME Fragrance terms for website usage, checkout, product information, inspired fragrance descriptions, and support.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <TrustPolicyPage
      eyebrow="Terms"
      title="Terms of Service"
      description="The basic terms for using the HUME Fragrance website and placing orders."
      highlights={["Inspired fragrance descriptions", "Prices can change", "Support-first order handling"]}
      sections={[
        {
          title: "Product information",
          body: [
            "HUME Fragrance creates inspired perfume interpretations. Brand names mentioned on product pages are used to describe scent direction and customer search intent.",
            "HUME is not affiliated with designer brands referenced for inspiration. Our products are HUME formulations.",
          ],
        },
        {
          title: "Orders and pricing",
          body: [
            "Prices, availability, offers, coupons, and delivery timelines can change based on inventory, campaigns, and operational conditions.",
            "If an order cannot be fulfilled because of stock, address, payment, or courier issues, we will contact you to resolve it or initiate an eligible refund.",
          ],
        },
        {
          title: "Website usage",
          body: [
            "Please do not misuse the website, attempt unauthorized admin access, interfere with tracking systems, or submit false checkout information.",
            "By placing an order, you agree to provide accurate contact and delivery information so the parcel can reach you safely.",
          ],
        },
      ]}
    />
  );
}

