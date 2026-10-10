import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/CheckoutClient";
import SecureCheckoutEntry from "@/components/SecureCheckoutEntry";
import { secureCheckoutEnabled } from "@/lib/secure-checkout";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  description:
    "Enter your delivery details and complete your HUME order with guided checkout and WhatsApp support.",
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      {secureCheckoutEnabled() ? <SecureCheckoutEntry /> : <CheckoutClient />}
      <Footer />
    </main>
  );
}
