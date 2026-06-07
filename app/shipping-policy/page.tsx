import type { Metadata } from "next";
import TrustPolicyPage from "@/components/TrustPolicyPage";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "HUME Fragrance shipping policy for India orders, dispatch timelines, tracking, and delivery support.",
  alternates: { canonical: `${SITE_URL}/shipping-policy` },
};

export default function ShippingPolicyPage() {
  return (
    <TrustPolicyPage
      eyebrow="Shipping"
      title="Shipping Policy"
      description="Clear delivery expectations for HUME Fragrance orders across India."
      highlights={["Dispatch target: 24 to 48 hours", "Tracking shared after booking", "Speed Post support available"]}
      sections={[
        {
          title: "Dispatch timeline",
          body: [
            "Ready-stock orders are usually packed and dispatched within 24 to 48 business hours after payment confirmation.",
            "During launches, festive traffic, or unexpected stock checks, dispatch can take slightly longer. If that happens, we will update you on WhatsApp or email.",
          ],
        },
        {
          title: "Delivery partners",
          body: [
            "We primarily use India Post Speed Post for broad Indian coverage. We may also use Delhivery or Blue Dart when they are faster or more reliable for a specific pincode.",
            "Once your parcel is booked, the tracking ID can be checked from our Track Order page.",
          ],
        },
        {
          title: "Delivery support",
          body: [
            "Please enter a reachable phone number, complete address, landmark, city, state, and pincode at checkout.",
            "If a shipment is delayed, marked undelivered, or needs help, contact HUME support with your order number and tracking ID.",
          ],
        },
      ]}
    />
  );
}
