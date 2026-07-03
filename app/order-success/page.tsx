import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MessageCircle, PackageSearch, ShoppingBag, UserRound } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Order Confirmed | HUME Fragrance",
  description:
    "Your HUME Fragrance order has been received. Track shipping updates or contact HUME support on WhatsApp.",
  alternates: {
    canonical: `${SITE_URL}/order-success`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

type OrderSuccessPageProps = {
  searchParams?: Promise<{ order?: string; channel?: string }> | { order?: string; channel?: string };
};

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params?.order?.trim();
  const channel = params?.channel === "whatsapp" ? "WhatsApp" : "Razorpay";

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <Header />
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_38%),linear-gradient(180deg,#ffffff_0%,#f6fff9_100%)] px-6 py-8 text-center sm:px-10 sm:py-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_16px_34px_rgba(16,185,129,0.28)]">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Order Confirmed
            </p>
            <h1 className="mt-3 font-serif text-4xl font-light tracking-wide sm:text-5xl">
              We received your order
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-600">
              Thank you for choosing HUME Fragrance. We will pack your perfume carefully and share tracking once it is dispatched.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6 sm:px-10 sm:py-8">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Order ID</p>
                  <p className="mt-1 text-lg font-semibold">{orderNumber || "Saved with HUME"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Payment flow</p>
                  <p className="mt-1 text-lg font-semibold">{channel}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <Link
                href="/account"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                <UserRound className="h-4 w-4" />
                My Account
              </Link>
              <Link
                href="/track-order"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                <PackageSearch className="h-4 w-4" />
                Track Order
              </Link>
              <a
                href="https://wa.me/919559024822"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#25D366]/30 bg-[#25D366]/10 px-4 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/15"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-zinc-50"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop More
              </Link>
            </div>

            {/* Feedback Invitation */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 text-center space-y-3">
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-medium text-zinc-900">How was your shopping experience?</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-md mx-auto">
                  Rate our website flow and let us know how you heard about us to unlock customized future rewards!
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href="/feedback"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-zinc-900 hover:bg-zinc-800 px-6 text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95 shadow-sm"
                >
                  Share Your Experience
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
