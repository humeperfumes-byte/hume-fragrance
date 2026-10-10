import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse, after } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { secureCheckoutSessions, orders, customerAccessLinks, siteSettings, checkoutDrafts, coupons } from "@/db/schema";
import { createCustomerToken, hashCustomerToken } from "./customer-access-token";
import { CHECKOUT_OWNER_COOKIE, CHECKOUT_ACTIVE_COOKIE, deriveOrderToken, ownsCheckout } from "./secure-checkout-capability";
import { freshResumeCatalogue } from "./fresh-resume-catalogue";
import { buildResumeCart } from "./checkout-resume-cart";
import { ADMIN_CONTROLS_KEY, normalizeAdminControls } from "./admin-settings";
import { priceSecureCart, expectedPaymentMinor, storedPaymentMinor, matchesCapturedPayment } from "./secure-checkout-pricing";
import { readBoundedJson } from "./bounded-request-body";
import { reportServerError } from "./server-error-monitoring";
import { normalizeIndianMobile } from "./phone";
import type { CartItem } from "@/context/CartContext";
import { VISIT_REWARD_COOKIE, readVisitReward } from "./server-visit-reward";
import { sendOrderConfirmationEmail } from "./email/send-order-confirmation";
import { sendAdminOrderAlert } from "./notifications/admin-order-alert";
import type { Order } from "@/db/schema";
import type { SafeErrorCode } from "./safe-error-monitoring";
import { checkoutCanContinue, checkoutDraftAlert, hasCheckoutContact } from "./checkout-continuation";
import { sendAdminCheckoutDraftAlert } from "./notifications/admin-order-alert";
import { displayPhoneNumber } from "./phone";
import { resolveIndiaAwareCountry } from "./admin-market";

export const secureCheckoutEnabled = () => process.env.ENABLE_SECURE_CHECKOUT === "true";
export class CheckoutRequestError extends Error { constructor(message: string, public status = 400) { super(message); } }
const privateHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
export async function checkoutFailure(error: unknown, code: SafeErrorCode = "CHECKOUT_RESUME_FAILED") {
  if (error instanceof CheckoutRequestError) {
    if (error.status >= 500) await reportServerError(code);
    return NextResponse.json({ error: error.message, success: false, ok: false }, { status: error.status, headers: privateHeaders });
  }
  if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check the checkout details", success: false, ok: false }, { status: 400, headers: privateHeaders });
  await reportServerError(code);
  return NextResponse.json({ error: "Checkout is temporarily unavailable. Your bag is preserved; please retry.", success: false, ok: false }, { status: 503, headers: privateHeaders });
}
export async function secureSessionByToken(token: string) {
  const hash = hashCustomerToken(token); if (!hash || !secureCheckoutEnabled()) return null;
  const [session] = await db.select().from(secureCheckoutSessions).where(and(eq(secureCheckoutSessions.tokenHash, hash), gt(secureCheckoutSessions.expiresAt, new Date()))).limit(1);
  return session || null;
}
export async function requireCheckoutSession(request: NextRequest) {
  if (!secureCheckoutEnabled()) throw new CheckoutRequestError("Secure checkout is unavailable", 503);
  if (request.method !== "GET" && request.headers.get("origin") !== request.nextUrl.origin) throw new CheckoutRequestError("Invalid request origin", 403);
  const token = request.headers.get("x-hume-checkout-token") || request.cookies.get(CHECKOUT_ACTIVE_COOKIE)?.value || "";
  const session = await secureSessionByToken(token);
  if (!session || !ownsCheckout(request.cookies.get(CHECKOUT_OWNER_COOKIE)?.value, session.ownerHash)) throw new CheckoutRequestError("Your checkout session has expired. Return to your bag to start again.", 401);
  return { session, token };
}
export async function ownsPageSession(ownerHash: string) { return ownsCheckout((await cookies()).get(CHECKOUT_OWNER_COOKIE)?.value, ownerHash); }
export async function activeSecureCheckout(request: NextRequest) {
  try {
    const token = request.cookies.get(CHECKOUT_ACTIVE_COOKIE)?.value;
    const session = token ? await secureSessionByToken(token) : null;
    if (!session || !ownsCheckout(request.cookies.get(CHECKOUT_OWNER_COOKIE)?.value, session.ownerHash)) return NextResponse.json({ checkout: null }, { headers: privateHeaders });
    const [order] = await db.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
    if (!checkoutCanContinue(order || null)) return NextResponse.json({ checkout: null, closedOrderId: order?.id }, { headers: privateHeaders });
    const [draft] = await db.select({ total: checkoutDrafts.grandTotal }).from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id)).limit(1);
    const grandTotal = Number(order?.grandTotal ?? draft?.total ?? session.cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    return NextResponse.json({ checkout: {
      path: `/checkout/${token}`, sessionId: session.id, status: order ? "payment_pending" : "draft", grandTotal,
      items: session.cart.filter(item => !item.isGift).map(({ id, name, image, size, price, quantity }) => ({ id, name, image, size, price, quantity })),
    } }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
function notificationsEnabled() {
  return process.env.NODE_ENV !== "test" && (process.env.NODE_ENV !== "development" || process.env.ENABLE_LOCAL_CUSTOMER_NOTIFICATIONS === "true");
}
function scheduleOrderNotification(order: Order, sendEmail = true) {
  if (!notificationsEnabled()) return;
  after(async () => {
    const payload = { orderNumber: order.orderNumber, status: order.status, checkoutChannel: order.checkoutChannel, paymentMethod: order.paymentMethod, shippingMethod: order.shippingMethod, subtotal: order.subtotal, shippingFee: order.shippingFee, grandTotal: order.grandTotal, details: { fullName: order.fullName, phone: order.phone, email: order.email, addressLine1: order.addressLine1, addressLine2: order.addressLine2, city: order.city, state: order.state, pincode: order.pincode }, cartSnapshot: order.cartSnapshot };
    await Promise.allSettled([...(sendEmail ? [sendOrderConfirmationEmail(payload)] : []), sendAdminOrderAlert(payload)]);
  });
}

const selection = z.object({ id: z.string().min(1).max(255) });
const cartSchema = z.array(z.object({ id: z.string().min(1).max(255), quantity: z.number().int().min(1).max(20), price: z.number().nonnegative(), isGift: z.boolean().optional(), kitSelections: z.array(selection).max(5).optional(), sampleSelections: z.array(selection).max(15).optional() })).min(1).max(40);
export const detailsSchema = z.object({ fullName: z.string().max(255).default(""), phone: z.string().max(50).default(""), alternatePhone: z.string().max(50).default(""), email: z.string().max(255).default(""), addressLine1: z.string().max(2000).default(""), addressLine2: z.string().max(2000).default(""), city: z.string().max(255).default(""), state: z.string().max(255).default(""), pincode: z.string().max(20).default(""), notes: z.string().max(5000).default("") });
export async function canonicalCart(raw: unknown) {
  const parsed = cartSchema.parse(raw);
  const catalogue = await freshResumeCatalogue();
  const regular = parsed.filter(item => !item.kitSelections?.length);
  const result = regular.some(item => !item.isGift) ? buildResumeCart(regular, catalogue) : { items: [] as CartItem[], issues: [] };
  if (result.issues.length) throw new CheckoutRequestError(result.issues[0]);
  const kits = parsed.filter(item => item.kitSelections?.length && !item.isGift);
  const [kitSetting] = kits.length
    ? await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, "kit_availability")).limit(1)
    : [];
  for (const item of kits) {
    if ((kitSetting?.value as { outOfStock?: boolean })?.outOfStock || !item.id.startsWith("kit-") || item.kitSelections!.length !== 5 || new Set(item.kitSelections!.map(p => p.id)).size !== 5) throw new CheckoutRequestError("Please rebuild your five-fragrance kit");
    const selected = item.kitSelections!.map(s => catalogue.find(p => p.id === s.id));
    if (selected.some(p => !p || p.badges?.soldOut || p.badges?.comingSoon || p.priceCurrency !== "INR")) throw new CheckoutRequestError("A kit fragrance is unavailable");
    result.items.push({ id: item.id, quantity: item.quantity, price: 999, size: "5 x 15ml", name: "HUME Perfume Kit", inspiration: "Five selected fragrances", image: "/images/kit.png", category: "Kit", kitSelections: selected.map(p => ({ id: p!.id, name: p!.name, inspiration: p!.inspiration })) });
  }
  if (!result.items.length) throw new CheckoutRequestError("Please add a perfume to your bag");
  if (new Set(result.items.map(item => item.id)).size !== result.items.length) throw new CheckoutRequestError("Duplicate products need correcting");
  return result.items;
}
async function controls() {
  const [setting] = await db.select({ value: siteSettings.value }).from(siteSettings).where(eq(siteSettings.key, ADMIN_CONTROLS_KEY)).limit(1);
  return normalizeAdminControls(setting?.value);
}
const journeyMetadataSchema = z.object({
  acquisitionSource: z.string().max(100).optional(), acquisitionCategory: z.string().max(50).optional(),
  acquisitionReferrerHost: z.string().max(255).optional(), utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(), utmCampaign: z.string().max(180).optional(),
  utmTerm: z.string().max(180).optional(), utmContent: z.string().max(180).optional(),
  lastEditedField: z.string().max(100).optional(), appliedCouponCode: z.string().max(100).optional(),
});
async function persistJourneyDraft(request: NextRequest, session: typeof secureCheckoutSessions.$inferSelect, cart: CartItem[], details: z.infer<typeof detailsSchema>, metadata: z.infer<typeof journeyMetadataSchema>, create = false) {
  const sourceMetadata = journeyMetadataSchema.parse(metadata);
  const config = await controls();
  const codes = (metadata.appliedCouponCode || "").split(/\s*\+\s*/).filter(Boolean);
  const normalCode = codes.find(code => !/^WELCOME-BACK-(5|10)$/.test(code));
  const [couponRow] = normalCode ? await db.select().from(coupons).where(eq(coupons.code, normalCode.toUpperCase())).limit(1) : [];
  const coupon = couponRow?.active && !couponRow.archivedAt ? { ...couponRow, value: Number(couponRow.value), minSubtotal: Number(couponRow.minSubtotal) } : !couponRow && normalCode === "SPECIAL-5" ? { code: "SPECIAL-5", description: "Special 5% discount", type: "percent", value: 5, minSubtotal: 0, welcomeBackMode: "cap_5" } : null;
  const reward = readVisitReward(request.cookies.get(VISIT_REWARD_COOKIE)?.value, process.env.CHECKOUT_SESSION_SIGNING_SECRET);
  const requestedWelcome = codes.includes("WELCOME-BACK-10") ? 10 : codes.includes("WELCOME-BACK-5") ? 5 : 0;
  const welcome = Math.min(requestedWelcome, reward?.tier || 0) as 0 | 5 | 10;
  const quote = priceSecureCart(cart, coupon, welcome, config);
  const normalizedDetails = { ...details, phone: displayPhoneNumber(details.phone), alternatePhone: displayPhoneNumber(details.alternatePhone) };
  const alert = await db.transaction(async tx => {
    if (create) await tx.insert(secureCheckoutSessions).values(session);
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
    const [order] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.id, session.orderId)).limit(1);
    if (order) return null; // Saved/paid orders must never be overwritten by a late autosave.
    const [previous] = await tx.select().from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id)).limit(1);
    const override = previous?.pricingBreakdown?.overrideTotal;
    const finalTotal = typeof override === "number" && Number.isFinite(override) && override > 0 ? override : quote.grandTotal;
    const status = Object.values(normalizedDetails).some(value => value.trim()) ? "partial" : "started";
    const fields = {
      ...normalizedDetails, status, path: `${request.nextUrl.origin}/checkout`, cartSnapshot: cart,
      subtotal: quote.subtotal.toFixed(2), shippingFee: quote.shippingFee.toFixed(2), grandTotal: finalTotal.toFixed(2),
      pricingBreakdown: { ...(previous?.pricingBreakdown || {}), subtotal: quote.subtotal, shippingFee: quote.shippingFee, grandTotal: finalTotal, appliedCouponCode: coupon?.code || null, welcomeBackPercent: welcome, contactAlertQueued: Boolean(previous?.pricingBreakdown?.contactAlertQueued || hasCheckoutContact(normalizedDetails)) },
      country: resolveIndiaAwareCountry({ headerCountry: request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"), phone: normalizedDetails.phone, pincode: details.pincode, state: details.state }),
      ipAddress: (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "").slice(0,255) || null,
      userAgent: request.headers.get("user-agent")?.slice(0,2000) || null,
      ...Object.fromEntries(Object.entries(sourceMetadata).filter(([key, value]) => key !== "appliedCouponCode" && value !== undefined)),
      updatedAt: new Date(),
    };
    await tx.update(secureCheckoutSessions).set({ cart, details: normalizedDetails, updatedAt: new Date() }).where(eq(secureCheckoutSessions.id, session.id));
    await tx.insert(checkoutDrafts).values({ id: randomUUID(), sessionId: session.id, ...fields }).onConflictDoUpdate({ target: checkoutDrafts.sessionId, set: fields });
    const type = previous?.pricingBreakdown?.contactAlertQueued ? null : checkoutDraftAlert(previous || null, normalizedDetails);
    return type ? { sessionId: session.id, fullName: details.fullName, phone: normalizedDetails.phone, email: details.email, grandTotal: finalTotal, cartSnapshot: cart, type } : null;
  });
  if (alert && notificationsEnabled()) after(async () => { await sendAdminCheckoutDraftAlert(alert); });
}
export async function startSecureCheckout(request: NextRequest) {
  try {
    if (!secureCheckoutEnabled()) throw new CheckoutRequestError("Secure checkout is unavailable", 503);
    if (request.headers.get("origin") !== request.nextUrl.origin) throw new CheckoutRequestError("Invalid request origin", 403);
    const raw = journeyMetadataSchema.extend({ cart: z.unknown() }).parse(await readBoundedJson(request, 64000));
    const existingToken = request.cookies.get(CHECKOUT_ACTIVE_COOKIE)?.value;
    const previous = existingToken ? await secureSessionByToken(existingToken) : null;
    const owner = request.cookies.get(CHECKOUT_OWNER_COOKIE)?.value;
    if (previous && ownsCheckout(owner, previous.ownerHash)) {
      const [order] = await db.select().from(orders).where(eq(orders.id, previous.orderId)).limit(1);
      if (!checkoutCanContinue(order || null)) { /* A completed order must not capture a new purchase. */ } else {
      // Reusing the same identity protects an unresolved payment from a second order.
      if (!order) await persistJourneyDraft(request, previous, await canonicalCart(raw.cart), detailsSchema.parse(previous.details), raw);
      return NextResponse.json({ path: `/checkout/${existingToken}` }, { headers: privateHeaders });
      }
    }
    const cart = await canonicalCart(raw.cart);
    const capability = createCustomerToken();
    const ownerCapability = owner && hashCustomerToken(owner) ? { token: owner, hash: hashCustomerToken(owner)! } : createCustomerToken();
    const id = randomUUID();
    await persistJourneyDraft(request, { id, tokenHash: capability.hash, ownerHash: ownerCapability.hash, orderId: randomUUID(), orderNumber: `HF-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 12).toUpperCase()}`, expectedPaymentMinor: null, details: {}, cart, expiresAt: new Date(Date.now() + 7 * 86400000), createdAt: new Date(), updatedAt: new Date() }, cart, detailsSchema.parse({}), raw, true);
    const response = NextResponse.json({ path: `/checkout/${capability.token}` }, { headers: privateHeaders });
    const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: request.nextUrl.protocol === "https:", path: "/", maxAge: 30 * 86400 };
    response.cookies.set(CHECKOUT_OWNER_COOKIE, ownerCapability.token, cookieOptions);
    response.cookies.set(CHECKOUT_ACTIVE_COOKIE, capability.token, { ...cookieOptions, maxAge: 7 * 86400 });
    return response;
  } catch (error) { return checkoutFailure(error); }
}
export async function saveSecureDraft(request: NextRequest) {
  try {
    const { session } = await requireCheckoutSession(request);
    const body = journeyMetadataSchema.extend({ cartSnapshot: z.unknown(), details: detailsSchema }).parse(await readBoundedJson(request, 64000));
    const cart = await canonicalCart(body.cartSnapshot);
    await persistJourneyDraft(request, session, cart, body.details, body);
    return NextResponse.json({ ok: true }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error, "DRAFT_SAVE_FAILED"); }
}
export async function saveSecureOrder(request: NextRequest) {
  try {
    const { session, token } = await requireCheckoutSession(request);
    const body = z.object({ cartSnapshot: z.unknown(), details: detailsSchema, checkoutChannel: z.enum(["razorpay", "whatsapp"]), paymentMethod: z.string().max(100), status: z.enum(["payment_pending", "payment_authorized", "payment_failed", "processing", "whatsapp_initiated"]), appliedCouponCode: z.string().max(100).optional(), grandTotal: z.number().positive(), shippingFee: z.number().nonnegative(), whatsappMessage: z.string().max(20000).optional() }).parse(await readBoundedJson(request, 64000));
    const [alreadySaved] = await db.select({ id: orders.id }).from(orders).where(eq(orders.id, session.orderId)).limit(1);
    const prepared = alreadySaved ? null : await (async () => {
    const cart = await canonicalCart(body.cartSnapshot);
    const config = await controls();
    const codes = (body.appliedCouponCode || "").split(/\s*\+\s*/).filter(Boolean);
    const welcomeCodes = codes.filter(code => /^WELCOME-BACK-(5|10)$/.test(code));
    const normalCodes = codes.filter(code => !/^WELCOME-BACK-(5|10)$/.test(code));
    if (normalCodes.length > 1 || welcomeCodes.length > 1) throw new CheckoutRequestError("Please use one coupon and one welcome offer");
    const [couponRow] = normalCodes[0] ? await db.select().from(coupons).where(eq(coupons.code, normalCodes[0].toUpperCase())).limit(1) : [];
    const coupon = couponRow && couponRow.active && !couponRow.archivedAt ? { ...couponRow, value: Number(couponRow.value), minSubtotal: Number(couponRow.minSubtotal) } : !couponRow && normalCodes[0] === "SPECIAL-5" ? { code: "SPECIAL-5", description: "Private cart recovery offer", type: "percent", value: 5, minSubtotal: 0, welcomeBackMode: "cap_5" } : null;
    if (normalCodes[0] && !coupon) throw new CheckoutRequestError("This coupon is no longer available");
    const welcome = welcomeCodes[0]?.endsWith("10") ? 10 : welcomeCodes.length ? 5 : 0;
    const visitReward = readVisitReward(request.cookies.get(VISIT_REWARD_COOKIE)?.value, process.env.CHECKOUT_SESSION_SIGNING_SECRET);
    if (welcome > (visitReward?.tier || 0)) throw new CheckoutRequestError("Your welcome offer has expired. Reopen your bag to refresh available offers.", 409);
    const quote = priceSecureCart(cart, coupon, welcome, config);
    return { cart, config, codes, quote };
    })();
    const orderToken = deriveOrderToken(token);
    let created = false;
    const result = await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
      const [existing] = await tx.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
      if (existing) {
        if (existing.sessionId !== session.id) throw new CheckoutRequestError("Order ownership mismatch", 403);
        if (Math.round(Number(existing.grandTotal) * 100) !== Math.round(body.grandTotal * 100) || Math.round(Number(existing.shippingFee) * 100) !== Math.round(body.shippingFee * 100)) throw new CheckoutRequestError("This saved order has a different total. Reopen its checkout link to review it before paying.", 409);
        if (body.status === "processing" && !existing.paymentCapturedAt) throw new CheckoutRequestError("Payment confirmation is still pending", 409);
        if (body.status === "whatsapp_initiated" && existing.checkoutChannel !== "whatsapp") throw new CheckoutRequestError("An online payment already exists. Please confirm it before switching payment method.", 409);
        return existing;
      }
      if (!prepared) throw new CheckoutRequestError("Your saved order is unavailable. Please contact HUME.", 409);
      const { cart, config, codes, quote } = prepared;
      // An admin override must come from the authenticated admin's saved draft, never a client total.
      const [draft] = await tx.select({ pricingBreakdown: checkoutDrafts.pricingBreakdown }).from(checkoutDrafts).where(eq(checkoutDrafts.sessionId, session.id)).limit(1);
      const override = draft?.pricingBreakdown?.overrideTotal;
      if (typeof override === "number" && Number.isFinite(override) && override > 0) quote.grandTotal = Math.round(override * 100) / 100;
      if (Math.round(quote.grandTotal * 100) !== Math.round(body.grandTotal * 100) || Math.round(quote.shippingFee * 100) !== Math.round(body.shippingFee * 100)) throw new CheckoutRequestError("The price has changed. Refresh checkout to review the current total.", 409);
      const d = body.details;
      const phone = normalizeIndianMobile(d.phone);
      if (!d.fullName.trim() || !/^[6-9]\d{9}$/.test(phone) || !d.addressLine1.trim() || !d.city.trim() || !d.state.trim() || !/^\d{6}$/.test(d.pincode)) throw new CheckoutRequestError("Please complete your name, mobile number and delivery address");
      if (body.checkoutChannel === "razorpay" && !config.razorpayEnabled || body.checkoutChannel === "whatsapp" && !config.whatsappCheckoutEnabled) throw new CheckoutRequestError("This payment method is unavailable", 409);
      const gifts = quote.subtotal >= config.giftTwoThreshold ? 2 : quote.subtotal >= config.giftOneThreshold ? 1 : 0;
      const giftItems = Array.from({ length: gifts }, (_, i) => `Gift ${i + 1}`);
      const partial = /Prepaid.*Cash on Delivery/i.test(body.paymentMethod);
      const snapshot = [...cart, ...giftItems.map((name, index) => ({ id: `gift-tier-${index + 1}`, name, inspiration: "Complimentary gift", size: "Gift", price: 0, quantity: 1, isGift: true }))];
      const [order] = await tx.insert(orders).values({ id: session.orderId, orderNumber: session.orderNumber, sessionId: session.id, checkoutChannel: body.checkoutChannel, status: body.checkoutChannel === "whatsapp" ? "whatsapp_initiated" : "payment_pending", paymentMethod: body.checkoutChannel === "whatsapp" ? "WhatsApp order" : partial ? "20% Prepaid + 80% Cash on Delivery" : "Razorpay Online Payment", ...d, phone, country: "IN", path: "/checkout", subtotal: quote.subtotal.toFixed(2), shippingFee: quote.shippingFee.toFixed(2), grandTotal: quote.grandTotal.toFixed(2), appliedCouponCode: codes.join(" + ") || null, cartSnapshot: snapshot, giftItems, whatsappMessage: body.whatsappMessage || null }).returning();
      created = true;
      await tx.update(secureCheckoutSessions).set({ cart, details: { ...d, phone }, expectedPaymentMinor: body.checkoutChannel === "razorpay" ? expectedPaymentMinor(quote.grandTotal, partial) : null, updatedAt: new Date() }).where(eq(secureCheckoutSessions.id, session.id));
      if (body.checkoutChannel === "whatsapp") await tx.update(checkoutDrafts).set({ status: "whatsapp_initiated", whatsappInitiatedAt: new Date(), updatedAt: new Date() }).where(eq(checkoutDrafts.sessionId, session.id));
      await tx.insert(customerAccessLinks).values({ id: randomUUID(), tokenHash: hashCustomerToken(orderToken)!, scope: "order", resourceId: order.id, expiresAt: new Date(Date.now() + 30 * 86400000) }).onConflictDoNothing({ target: customerAccessLinks.tokenHash });
      return order;
    });
    if (created) scheduleOrderNotification(result, result.checkoutChannel === "whatsapp");
    return NextResponse.json({ ok: true, orderId: result.id, orderNumber: result.orderNumber, orderPath: `/order/${orderToken}` }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error, "ORDER_SAVE_FAILED"); }
}

type ProviderOrder = { id: string; amount: number | string; currency: string; status: string; receipt?: string };
type ProviderPayment = { id: string; order_id: string; amount: number; currency: string; status: string };
async function razorpay<T>(path: string, body?: unknown): Promise<T> {
  const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret) throw new CheckoutRequestError("Online payments are unavailable", 503);
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, { method: body ? "POST" : "GET", headers: { Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new CheckoutRequestError("Payment confirmation is unavailable. Do not pay again; please retry checking your order.", 503);
  return response.json();
}
export async function createSecurePayment(request: NextRequest) {
  try {
    const { session } = await requireCheckoutSession(request);
    await canonicalCart(session.cart); // Recheck availability without changing an already agreed order total.
    // Claim creation before the provider call. Ambiguous timeouts remain locked instead of charging twice.
    const order = await db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
      const [stored] = await tx.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
      if (!stored || stored.checkoutChannel !== "razorpay") throw new CheckoutRequestError("Save your checkout before paying", 409);
      if (stored.paymentCapturedAt || !["payment_pending", "payment_failed"].includes(stored.status)) throw new CheckoutRequestError("This order already has a payment or is under review. Do not pay again.", 409);
      if (stored.razorpayOrderId) return stored;
      if (stored.paymentSyncStatus === "creating") throw new CheckoutRequestError("A payment request is being confirmed. Please contact HUME before retrying.", 409);
      await tx.update(orders).set({ paymentSyncStatus: "creating", updatedAt: new Date() }).where(eq(orders.id, stored.id));
      return stored;
    });
    const amount = storedPaymentMinor(session.expectedPaymentMinor, Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || ""));
    if (order.razorpayOrderId) {
      const attempts = await razorpay<{ items: ProviderPayment[] }>(`orders/${encodeURIComponent(order.razorpayOrderId)}/payments`);
      if (attempts.items.some(payment => ["captured", "authorized"].includes(payment.status))) throw new CheckoutRequestError("An existing payment needs confirmation. Please check your order instead of paying again.", 409);
    }
    const providerOrder = order.razorpayOrderId ? await razorpay<ProviderOrder>(`orders/${encodeURIComponent(order.razorpayOrderId)}`) : await razorpay<ProviderOrder>("orders", { amount, currency: "INR", receipt: order.orderNumber.slice(0, 40), notes: { humeOrderId: order.id, humeOrderNumber: order.orderNumber, checkoutSessionId: session.id } });
    if (Number(providerOrder.amount) !== amount || providerOrder.currency !== "INR" || providerOrder.status === "paid") throw new CheckoutRequestError("This payment needs confirmation. Do not pay again.", 409);
    await db.update(orders).set({ razorpayOrderId: providerOrder.id, paymentSyncStatus: "pending", updatedAt: new Date() }).where(eq(orders.id, order.id));
    return NextResponse.json({ order_id: providerOrder.id, amount, currency: "INR" }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error, "PAYMENT_PROVIDER_FAILED"); }
}
export async function verifySecurePayment(request: NextRequest) {
  try {
    const { session, token } = await requireCheckoutSession(request);
    const input = z.object({ razorpay_order_id: z.string().max(100), razorpay_payment_id: z.string().max(100), razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/) }).parse(await readBoundedJson(request, 2000));
    const { createHmac, timingSafeEqual } = await import("node:crypto");
    const signature = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "").update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest();
    if (!process.env.RAZORPAY_KEY_SECRET || !timingSafeEqual(signature, Buffer.from(input.razorpay_signature, "hex"))) throw new CheckoutRequestError("Payment signature mismatch");
    const [order] = await db.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
    if (!order || order.razorpayOrderId !== input.razorpay_order_id || order.checkoutChannel !== "razorpay") throw new CheckoutRequestError("Payment does not belong to this checkout", 403);
    const payment = await razorpay<ProviderPayment>(`payments/${encodeURIComponent(input.razorpay_payment_id)}`);
    const expected = storedPaymentMinor(session.expectedPaymentMinor, Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || ""));
    if (!matchesCapturedPayment(payment, order.razorpayOrderId, expected)) throw new CheckoutRequestError("Your payment is awaiting capture or needs review. Do not pay again.", 409);
    await finalizeSecurePayment(session.id, order.id, payment);
    return NextResponse.json({ success: true, payment_id: payment.id, order_id: payment.order_id, orderPath: `/order/${deriveOrderToken(token)}` }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error, "PAYMENT_VERIFY_FAILED"); }
}
async function finalizeSecurePayment(sessionId: string, orderId: string, payment: ProviderPayment) {
  const notification = await db.transaction(async tx => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${sessionId}))`);
    const [latest] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!latest || latest.razorpayOrderId !== payment.order_id) throw new CheckoutRequestError("Payment mismatch", 409);
    if (/refund|disput/i.test(latest.status)) throw new CheckoutRequestError("This order's payment is under review. Please contact HUME.", 409);
    if (latest.razorpayPaymentId && latest.razorpayPaymentId !== payment.id) throw new CheckoutRequestError("Another payment is already recorded. Contact HUME.", 409);
    const nextStatus = ["payment_pending", "payment_authorized", "payment_failed"].includes(latest.status) ? "processing" : latest.status;
    await tx.update(orders).set({ status: nextStatus, razorpayPaymentId: payment.id, capturedPaymentAmount: (payment.amount / 100).toFixed(2), paymentCapturedAt: latest.paymentCapturedAt || new Date(), paymentReconciledAt: new Date(), paymentSyncStatus: "captured", updatedAt: new Date() }).where(eq(orders.id, orderId));
    await tx.update(checkoutDrafts).set({ status: "complete", updatedAt: new Date() }).where(eq(checkoutDrafts.sessionId, sessionId));
    return !latest.paymentCapturedAt && ["payment_pending", "payment_authorized", "payment_failed"].includes(latest.status) ? { ...latest, status: nextStatus } : null;
  });
  if (notification) scheduleOrderNotification(notification);
}
export async function recoverSecurePayment(request: NextRequest) {
  try {
    const { session, token } = await requireCheckoutSession(request);
    let [order] = await db.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
    if (!order) return NextResponse.json({ confirmed: false }, { headers: privateHeaders });
    if (order.paymentCapturedAt && Math.round(Number(order.capturedPaymentAmount) * 100) !== storedPaymentMinor(session.expectedPaymentMinor, Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || ""))) throw new CheckoutRequestError("The recorded payment needs review. Contact HUME; do not pay again.", 409);
    if (order.checkoutChannel === "razorpay" && !order.razorpayOrderId && order.paymentSyncStatus === "creating") {
      const expected = storedPaymentMinor(session.expectedPaymentMinor, Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || ""));
      const result = await razorpay<{ items: ProviderOrder[] }>(`orders?receipt=${encodeURIComponent(order.orderNumber)}&count=100`);
      const matching = (result.items || []).filter(item => item.receipt === order.orderNumber && item.currency === "INR" && Number(item.amount) === expected);
      if (matching.length > 1) throw new CheckoutRequestError("This payment request needs review. Contact HUME before paying again.", 409);
      if (matching[0]) {
        order = await db.transaction(async tx => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${session.id}))`);
          const [latest] = await tx.select().from(orders).where(eq(orders.id, session.orderId)).limit(1);
          if (!latest || latest.razorpayOrderId && latest.razorpayOrderId !== matching[0].id) throw new CheckoutRequestError("Payment request needs review", 409);
          const [updated] = await tx.update(orders).set({ razorpayOrderId: matching[0].id, paymentSyncStatus: latest.paymentCapturedAt ? latest.paymentSyncStatus : "pending", updatedAt: new Date() }).where(eq(orders.id, latest.id)).returning();
          return updated;
        });
      }
    }
    if (order.checkoutChannel === "razorpay" && !order.paymentCapturedAt && order.razorpayOrderId) {
      const result = await razorpay<{ items: ProviderPayment[] }>(`orders/${encodeURIComponent(order.razorpayOrderId)}/payments`);
      const expected = storedPaymentMinor(session.expectedPaymentMinor, Number(order.grandTotal), /Prepaid.*Cash on Delivery/i.test(order.paymentMethod || ""));
      const captured = result.items.filter(p => matchesCapturedPayment(p, order.razorpayOrderId!, expected));
      if (captured.length > 1) throw new CheckoutRequestError("Multiple payments need review. Please contact HUME.", 409);
      if (captured[0]) await finalizeSecurePayment(session.id, order.id, captured[0]);
      else return NextResponse.json({ confirmed: false, pending: true }, { headers: privateHeaders });
    } else if (order.checkoutChannel === "razorpay" && !order.paymentCapturedAt) return NextResponse.json({ confirmed: false, pending: true }, { headers: privateHeaders });
    return NextResponse.json({ confirmed: true, orderPath: `/order/${deriveOrderToken(token)}` }, { headers: privateHeaders });
  } catch (error) { return checkoutFailure(error); }
}
