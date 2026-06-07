import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/CheckoutClient";

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
      <CheckoutClient />
      <Footer />
    </main>
  );
}
