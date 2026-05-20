import type { Metadata } from "next";
import TrustPolicyPage from "@/components/TrustPolicyPage";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How HUME Fragrance collects and uses customer information for orders, checkout, support, analytics, and service improvement.",
  alternates: { canonical: `${SITE_URL}/privacy-policy` },
};

export default function PrivacyPolicyPage() {
  return (
    <TrustPolicyPage
      eyebrow="Privacy"
      title="Privacy Policy"
      description="How we collect, protect, and use customer information while running HUME Fragrance."
      highlights={["Order data used for fulfillment", "Analytics used to improve site flow", "Payment data handled by Razorpay"]}
      sections={[
        {
          title: "Information we collect",
          body: [
            "We collect information you submit during checkout, including name, phone number, email, address, pincode, order notes, cart items, coupons, and payment status.",
            "We also collect basic analytics such as page visits, cart events, checkout progress, source, device details, and consent choices to improve the store experience.",
          ],
        },
        {
          title: "How we use it",
          body: [
            "We use your information to process orders, accept payments, share tracking, provide support, prevent fraud, understand checkout issues, and improve HUME Fragrance.",
            "Payment details are processed through Razorpay. We do not store your card, UPI PIN, or bank credentials on our website.",
          ],
        },
        {
          title: "Support and deletion",
          body: [
            "You can contact us to correct customer details, request support, or ask questions about your stored order information.",
            "Some records may be retained for accounting, fraud prevention, payment dispute handling, and legal compliance.",
          ],
        },
      ]}
    />
  );
}

