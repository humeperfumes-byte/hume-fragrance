import { savedCodFee } from "@/lib/cod-policy";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { checkoutDrafts, orders } from "@/db/schema";
import { resolveCustomerLink } from "@/lib/customer-access-links";
import { freshResumeCatalogue } from "@/lib/fresh-resume-catalogue";
import { buildResumeCart } from "@/lib/checkout-resume-cart";
import CheckoutResumePreview from "@/components/CheckoutResumePreview";
import { reportServerError } from "@/lib/server-error-monitoring";
import { secureSessionByToken, ownsPageSession } from "@/lib/secure-checkout";
import { deriveOrderToken } from "@/lib/secure-checkout-capability";
import OwnedCheckout from "@/components/OwnedCheckout";
import SharedCheckoutSelection from "@/components/SharedCheckoutSelection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { redirect } from "next/navigation";
import { storedPaymentMinor } from "@/lib/secure-checkout-pricing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Continue your HUME checkout", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function ResumeCheckoutPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ resume?: string }> }) {
  const { token } = await params;
  const resumed = (await searchParams).resume === "1";
  const automatic = await secureSessionByToken(token).catch(() => { reportServerError("CHECKOUT_RESUME_FAILED"); return null; });
  if (automatic) {
    if (await ownsPageSession(automatic.ownerHash)) {
      const [savedOrder] = await db.select().from(orders).where(eq(orders.id, automatic.orderId)).limit(1);
      const captured = savedOrder?.paymentCapturedAt && Math.round(Number(savedOrder.capturedPaymentAmount) * 100) === storedPaymentMinor(automatic.expectedPaymentMinor, Number(savedOrder.grandTotal), /Prepaid.*Cash on Delivery/i.test(savedOrder.paymentMethod || ""));
      if (savedOrder && (captured || savedOrder.checkoutChannel === "whatsapp")) redirect(`/order/${deriveOrderToken(token)}`);
      // Stored carts were canonicalized when saved. Render them immediately;
      // availability and authoritative pricing are checked again before payment.
      const cart = automatic.cart;
      if (!cart) return <main className="mx-auto max-w-xl space-y-5 px-5 py-20"><h1 className="text-2xl font-semibold">Please update your saved selection</h1><p>A saved product is unavailable or needs updated selections. Your bag is preserved.</p><Link href="/shop" className="inline-block underline">Return to the collection</Link></main>;
      return <main className="min-h-screen bg-background"><Header /><OwnedCheckout session={{ token, id: automatic.id, orderId: automatic.orderId, orderNumber: automatic.orderNumber, cart, details: automatic.details, paymentPending: !!savedOrder, resumed, ...(savedOrder ? { expectedPaymentMinor: storedPaymentMinor(automatic.expectedPaymentMinor, Number(savedOrder.grandTotal), /Prepaid.*Cash on Delivery/i.test(savedOrder.paymentMethod || "")), savedCodFee: savedCodFee(savedOrder.paymentMethod, savedOrder.codFee), savedTotal: Number(savedOrder.grandTotal), savedShippingFee: Number(savedOrder.shippingFee), paymentMode: /Prepaid.*Cash on Delivery/i.test(savedOrder.paymentMethod || "") ? "partial_cod" as const : "full" as const } : {}) }} /><Footer /></main>;
    }
    const [savedOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, automatic.orderId)).limit(1);
    if (savedOrder) return <main className="mx-auto max-w-xl px-5 py-20"><h1 className="text-2xl font-semibold">This checkout already has an order</h1><p className="mt-4">Check its progress before placing another order.</p><Link className="mt-5 inline-block underline" href={`/order/${deriveOrderToken(token)}`}>View order</Link></main>;
    const restored = buildResumeCart(automatic.cart, await freshResumeCatalogue());
    return <SharedCheckoutSelection items={restored.items} issues={restored.issues} />;
  }
  let id: string | null;
  try { id = await resolveCustomerLink(token, "checkout"); } catch { reportServerError("CHECKOUT_RESUME_FAILED"); id = null; }
  if (!id) notFound();
  const draft = await db.select().from(checkoutDrafts).where(eq(checkoutDrafts.id, id)).limit(1)
    .then(rows => rows[0]).catch(() => { reportServerError("CHECKOUT_RESUME_FAILED"); return null; });
  if (!draft) notFound();
  const existing = await db.select({ id: orders.id }).from(orders).where(eq(orders.sessionId, draft.sessionId)).limit(1)
    .then(rows => rows[0]).catch(() => { reportServerError("CHECKOUT_RESUME_FAILED"); return "unavailable" as const; });
  if (existing === "unavailable") notFound();
  if (existing) return <main className="mx-auto max-w-xl px-5 py-20 text-zinc-950"><h1 className="text-2xl font-semibold">This checkout already has an order</h1><p className="mt-4">Please check your account or contact HUME for your order update. Do not place another order from this link.</p><Link href="/account" className="mt-5 inline-block underline">My account</Link></main>;
  const catalogue = await freshResumeCatalogue().catch(() => { reportServerError("CHECKOUT_RESUME_FAILED"); return null; });
  if (!catalogue) notFound();
  const restored = buildResumeCart(draft.cartSnapshot, catalogue);
  return <CheckoutResumePreview token={token} restoredItems={restored.items} issues={restored.issues} pricesChanged={restored.pricesChanged} />;
}
