import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutClient from "@/components/CheckoutClient";

export const metadata = {
  title: "Checkout",
  description: "Enter your delivery details and complete your HUME order via WhatsApp.",
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
