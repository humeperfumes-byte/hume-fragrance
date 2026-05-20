import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountClient from "./AccountClient";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Account | HUME Fragrance",
  description:
    "View your saved HUME Fragrance checkout details, orders, and shipment tracking links.",
  alternates: {
    canonical: `${SITE_URL}/account`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <Header />
      <AccountClient />
      <Footer />
    </main>
  );
}
