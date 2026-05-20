import type { Metadata } from "next";
import TrustPolicyPage from "@/components/TrustPolicyPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Return and Refund Policy",
  description:
    "HUME Fragrance return and refund policy for damaged, wrong, unavailable, or eligible orders.",
  alternates: { canonical: `${SITE_URL}/return-refund-policy` },
};

export default function ReturnRefundPolicyPage() {
  return (
    <TrustPolicyPage
      eyebrow="Returns"
      title="Return and Refund Policy"
      description="A simple policy for damaged parcels, wrong items, stock issues, and refund support."
      highlights={["Video proof helps faster support", "Refunds handled to original method", "No returns for used perfumes"]}
      sections={[
        {
          title: "Eligible cases",
          body: [
            "We support returns or resolutions for wrong items, damaged parcels, leakage in transit, missing items, or orders we cannot fulfill because of stock availability.",
            "Please contact us within 48 hours of delivery with your order number, photos, and an unboxing video where possible.",
          ],
        },
        {
          title: "Non-returnable cases",
          body: [
            "Perfumes that have been opened, sprayed, used, or damaged after delivery cannot be returned for preference-based reasons.",
            "Fragrance taste is personal, so we recommend trying smaller formats or asking us for guidance before blind buying if you are unsure.",
          ],
        },
        {
          title: "Refunds",
          body: [
            "Approved refunds are initiated to the original payment method through Razorpay or the payment route used for the order.",
            "Refund processing time depends on Razorpay, bank, card, UPI, or wallet timelines after the refund is initiated.",
          ],
        },
      ]}
    />
  );
}

