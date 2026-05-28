"use client";

import { useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  ClipboardList,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  ReceiptText,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";
import type { CheckoutDraft, Order } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/currency";
import { buildAdminEmailHref, buildAdminWhatsAppHref } from "@/lib/admin-message-templates";
import { getSavedPricingOfferSummary, normalizeSavedPricingBreakdown } from "@/lib/saved-pricing-breakdown";

export type CustomerRecord = {
  key: string;
  name: string;
  phone: string | null;
  email: string | null;
  orders: Order[];
  checkoutDrafts: CheckoutDraft[];
  revenue: number;
  potentialValue: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  firstOrderAt: Date | null;
  lastOrderAt: Date | null;
};

function toMoney(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? "0"));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMaybeDate(value: Date | string | null | undefined): string {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return format(date, "dd MMM yyyy, h:mm a");
}

function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return format(date, "d MMM yyyy");
}

function getLastSeenLabel(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return formatDistanceToNow(date, { addSuffix: true });
}

function getCustomerAddress(customer: CustomerRecord) {
  const latestDraft = [...customer.checkoutDrafts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];
  const latestOrder = [...customer.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  const source = latestDraft || latestOrder;

  if (!source) return [];

  return [
    source.addressLine1,
    source.addressLine2,
    [source.city, source.state, source.pincode].filter(Boolean).join(", "),
    source.country,
  ].filter(Boolean) as string[];
}

function getCustomerNotes(customer: CustomerRecord) {
  return (
    [...customer.checkoutDrafts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .find((draft) => draft.notes)?.notes ||
    [...customer.orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find((order) => order.notes)?.notes ||
    null
  );
}

function getLatestCartItems(customer: CustomerRecord) {
  const latestDraft = [...customer.checkoutDrafts]
    .filter((draft) => draft.cartSnapshot?.length)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
  if (latestDraft?.cartSnapshot?.length) return latestDraft.cartSnapshot;

  const latestOrder = [...customer.orders]
    .filter((order) => order.cartSnapshot?.length)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return latestOrder?.cartSnapshot || [];
}

function getCartItemTotal(item: Order["cartSnapshot"][number] | CheckoutDraft["cartSnapshot"][number]) {
  const quantity = Number(item.quantity || 0);
  return toMoney(item.price) * (Number.isFinite(quantity) ? quantity : 0);
}

function getOrderDiscount(order: Order) {
  return Math.max(0, toMoney(order.subtotal) + toMoney(order.shippingFee) - toMoney(order.grandTotal));
}

function getDraftDiscount(draft: CheckoutDraft) {
  const saved = normalizeSavedPricingBreakdown(draft.pricingBreakdown);
  if (saved) {
    return {
      coupon: saved.couponDiscount,
      couponCode: saved.couponCode,
      welcome: saved.welcomeBackDiscount,
      welcomeLabel: saved.welcomeBackLabel,
      shippingSavings: saved.shippingSavings,
      summary: getSavedPricingOfferSummary(saved),
    };
  }

  return {
    coupon: 0,
    couponCode: null,
    welcome: 0,
    welcomeLabel: null,
    shippingSavings: 0,
    summary: null,
  };
}

function buildCustomerCopy(customer: CustomerRecord) {
  const address = getCustomerAddress(customer);
  const latestItems = getLatestCartItems(customer);
  const latestOrder = [...customer.orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];
  const latestDraft = [...customer.checkoutDrafts].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  return [
    `Name: ${customer.name}`,
    `Phone: ${customer.phone || "Not added"}`,
    `Email: ${customer.email || "Not added"}`,
    address.length ? `Address: ${address.join(", ")}` : "Address: Not added",
    `Notes: ${getCustomerNotes(customer) || "None"}`,
    latestOrder ? `Latest order: ${latestOrder.orderNumber} (${formatINR(toMoney(latestOrder.grandTotal))})` : null,
    latestDraft ? `Latest checkout lead: ${latestDraft.status} (${formatINR(toMoney(latestDraft.grandTotal))})` : null,
    latestItems.length
      ? `Items: ${latestItems.map((item) => `${item.name}${item.size ? ` ${item.size}` : ""} x${item.quantity}`).join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">{label}</p>
      <p className="mt-1 break-words text-sm text-white/70">{value || "Not added"}</p>
    </div>
  );
}

function ItemsList({ items }: { items: Order["cartSnapshot"] | CheckoutDraft["cartSnapshot"] }) {
  if (!items?.length) return <p className="text-sm text-white/35">No cart snapshot stored.</p>;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${item.id}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-white">{item.isGift ? item.name || `Gift ${index + 1}` : item.name}</p>
              <p className="mt-0.5 text-xs text-white/45">
                {[item.inspiration, item.size, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
              </p>
            </div>
            <p className={item.isGift ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-white"}>
              {item.isGift ? "FREE" : formatINR(getCartItemTotal(item))}
            </p>
          </div>
          {item.kitSelections?.length ? (
            <div className="mt-2 rounded-md border border-white/10 bg-black/20 p-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Kit selections</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.kitSelections.map((selection) => (
                  <span key={selection.id} className="rounded bg-white/[0.06] px-2 py-1 text-xs text-white/55">
                    {selection.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {item.sampleSelections?.length ? (
            <div className="mt-2 rounded-md border border-emerald-400/10 bg-emerald-400/[0.04] p-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200/45">Discovery samples</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.sampleSelections.map((selection) => (
                  <span key={selection.id} className="rounded bg-emerald-400/[0.08] px-2 py-1 text-xs text-emerald-100/65">
                    {selection.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PricingRows({ draft }: { draft: CheckoutDraft }) {
  const discount = getDraftDiscount(draft);
  const inferredDiscount = Math.max(0, toMoney(draft.subtotal) + toMoney(draft.shippingFee) - toMoney(draft.grandTotal));

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between gap-4 text-white/55">
        <span>Subtotal</span>
        <span>{formatINR(toMoney(draft.subtotal))}</span>
      </div>
      {discount.coupon > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-300">
          <span>{discount.couponCode || "Coupon"}</span>
          <span>-{formatINR(discount.coupon)}</span>
        </div>
      ) : null}
      {discount.welcome > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-300">
          <span>{discount.welcomeLabel || "Welcome offer"}</span>
          <span>-{formatINR(discount.welcome)}</span>
        </div>
      ) : null}
      {!discount.summary && inferredDiscount > 0 ? (
        <div className="flex justify-between gap-4 text-emerald-300">
          <span>Inferred discount</span>
          <span>-{formatINR(inferredDiscount)}</span>
        </div>
      ) : null}
      <div className="flex justify-between gap-4 text-white/55">
        <span>Delivery</span>
        <span>{toMoney(draft.shippingFee) > 0 ? formatINR(toMoney(draft.shippingFee)) : "Free"}</span>
      </div>
      <div className="border-t border-white/10 pt-2 flex justify-between gap-4 font-semibold text-white">
        <span>Total</span>
        <span>{formatINR(toMoney(draft.grandTotal))}</span>
      </div>
      {discount.summary ? <p className="text-xs text-white/35">Applied: {discount.summary}</p> : null}
    </div>
  );
}

function CustomerDetailSheet({
  customer,
  onOpenChange,
}: {
  customer: CustomerRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  const addressLines = customer ? getCustomerAddress(customer) : [];
  const notes = customer ? getCustomerNotes(customer) : null;
  const latestItems = customer ? getLatestCartItems(customer) : [];

  async function copyCustomer() {
    if (!customer) return;
    await navigator.clipboard.writeText(buildCustomerCopy(customer));
    toast({ title: "Customer details copied" });
  }

  return (
    <Sheet open={Boolean(customer)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-white/10 bg-[#080808] text-white sm:max-w-3xl">
        {customer ? (
          <div className="space-y-6 pb-10">
            <SheetHeader className="space-y-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black">
                <User className="h-5 w-5" />
              </div>
              <SheetTitle className="text-2xl text-white">{customer.name}</SheetTitle>
              <SheetDescription className="text-white/45">
                {customer.orders.length ? "Paying customer" : "Checkout lead"} · Last seen {getLastSeenLabel(customer.lastSeenAt)}
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Orders</p>
                <p className="mt-2 text-xl font-semibold text-white">{customer.orders.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Checkout leads</p>
                <p className="mt-2 text-xl font-semibold text-amber-200">{customer.checkoutDrafts.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">Value</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatINR(customer.revenue || customer.potentialValue)}
                </p>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <Button
                type="button"
                onClick={copyCustomer}
                className="h-10 rounded-lg border border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy full details
              </Button>
              <a
                href={buildAdminWhatsAppHref(customer.phone, {
                  template: customer.orders.length ? "repeat_customer" : "checkout_abandoned",
                  name: customer.name,
                  products: latestItems.map((item) => item.name),
                  value: customer.revenue || customer.potentialValue,
                  orderCount: customer.orders.length,
                  lastOrderNumber: customer.orders[0]?.orderNumber || null,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/15 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
              </a>
              {customer.email ? (
                <a
                  href={buildAdminEmailHref(customer.email, {
                    template: customer.orders.length ? "repeat_customer" : "checkout_abandoned",
                    name: customer.name,
                    products: latestItems.map((item) => item.name),
                    value: customer.revenue || customer.potentialValue,
                    orderCount: customer.orders.length,
                    lastOrderNumber: customer.orders[0]?.orderNumber || null,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/15 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </a>
              ) : null}
            </div>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <MapPin className="h-4 w-4 text-emerald-300" />
                Full customer details
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailRow label="Full name" value={customer.name} />
                <DetailRow label="Phone" value={customer.phone} />
                <DetailRow label="Email" value={customer.email} />
                <DetailRow label="First seen" value={formatMaybeDate(customer.firstSeenAt)} />
              </div>
              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Delivery address</p>
                {addressLines.length ? (
                  <div className="mt-2 space-y-1 text-sm text-white/70">
                    {addressLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-white/35">Not added</p>
                )}
              </div>
              {notes ? (
                <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30">Order notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-white/70">{notes}</p>
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShoppingCart className="h-4 w-4 text-white/45" />
                Latest cart / reorder items
              </h3>
              <div className="mt-4">
                <ItemsList items={latestItems} />
              </div>
            </section>

            {customer.checkoutDrafts.length ? (
              <section className="rounded-xl border border-amber-500/15 bg-amber-500/[0.04] p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ClipboardList className="h-4 w-4 text-amber-200" />
                  Checkout leads
                </h3>
                <div className="mt-4 space-y-3">
                  {customer.checkoutDrafts.map((draft) => (
                    <div key={draft.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/10">
                            {draft.status.replace("_", " ")}
                          </Badge>
                          <p className="mt-2 text-xs text-white/35">
                            Updated {formatMaybeDate(draft.updatedAt)} · Last field {draft.lastEditedField || "unknown"}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-white">{formatINR(toMoney(draft.grandTotal))}</p>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                        <ItemsList items={draft.cartSnapshot || []} />
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                          <PricingRows draft={draft} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {customer.orders.length ? (
              <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ReceiptText className="h-4 w-4 text-white/45" />
                  Orders
                </h3>
                <div className="mt-4 space-y-3">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{order.orderNumber}</p>
                          <p className="mt-1 text-xs text-white/35">
                            {formatMaybeDate(order.createdAt)} · {order.checkoutChannel || "checkout"} · {order.status}
                          </p>
                        </div>
                        <p className="text-lg font-semibold text-white">{formatINR(toMoney(order.grandTotal))}</p>
                      </div>
                      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
                        <ItemsList items={order.cartSnapshot || []} />
                        <div className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
                          <div className="flex justify-between gap-4 text-white/55">
                            <span>Subtotal</span>
                            <span>{formatINR(toMoney(order.subtotal))}</span>
                          </div>
                          {order.appliedCouponCode ? (
                            <div className="flex justify-between gap-4 text-emerald-300">
                              <span>{order.appliedCouponCode}</span>
                              <span>-{formatINR(getOrderDiscount(order))}</span>
                            </div>
                          ) : getOrderDiscount(order) > 0 ? (
                            <div className="flex justify-between gap-4 text-emerald-300">
                              <span>Total discount</span>
                              <span>-{formatINR(getOrderDiscount(order))}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between gap-4 text-white/55">
                            <span>Delivery</span>
                            <span>{toMoney(order.shippingFee) > 0 ? formatINR(toMoney(order.shippingFee)) : "Free"}</span>
                          </div>
                          <div className="flex justify-between gap-4 border-t border-white/10 pt-2 font-semibold text-white">
                            <span>Total</span>
                            <span>{formatINR(toMoney(order.grandTotal))}</span>
                          </div>
                          {order.trackingNumber ? (
                            <p className="pt-2 text-xs text-white/40">Tracking: {order.trackingNumber}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Tag className="h-4 w-4 text-white/45" />
                Source and device
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Source", customer.checkoutDrafts[0]?.acquisitionSource || customer.orders[0]?.acquisitionSource],
                  ["Category", customer.checkoutDrafts[0]?.acquisitionCategory || customer.orders[0]?.acquisitionCategory],
                  ["Referrer", customer.checkoutDrafts[0]?.acquisitionReferrerHost || customer.orders[0]?.acquisitionReferrerHost],
                  ["UTM source", customer.checkoutDrafts[0]?.utmSource || customer.orders[0]?.utmSource],
                  ["Path", customer.checkoutDrafts[0]?.path || customer.orders[0]?.path],
                  ["IP address", customer.checkoutDrafts[0]?.ipAddress || customer.orders[0]?.ipAddress],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <DetailRow key={label} label={label || ""} value={value || null} />
                  ))}
              </div>
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

export function CustomersTable({ customers }: { customers: CustomerRecord[] }) {
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  const sortedCustomers = useMemo(
    () =>
      [...customers].sort(
        (a, b) =>
          b.revenue - a.revenue ||
          b.potentialValue - a.potentialValue ||
          new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
      ),
    [customers],
  );

  if (!sortedCustomers.length) {
    return (
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="p-8 text-center text-sm text-white/35">No customer or checkout lead history yet.</div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="hidden grid-cols-[1.1fr_0.8fr_0.55fr_0.65fr_1fr_170px] gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-xs font-medium text-white/45 xl:grid">
          <span>Customer</span>
          <span>Contact</span>
          <span className="text-right">Orders</span>
          <span className="text-right">Value</span>
          <span>History</span>
          <span>Reconnect</span>
        </div>
        {sortedCustomers.map((customer) => {
          const latestOrder = [...customer.orders].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )[0];
          const latestDraft = [...customer.checkoutDrafts].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )[0];
          const latestItems = getLatestCartItems(customer);
          const messageInput = {
            template: customer.orders.length ? ("repeat_customer" as const) : ("checkout_abandoned" as const),
            name: customer.name,
            orderCount: customer.orders.length,
            lastOrderNumber: latestOrder?.orderNumber || null,
            products: latestItems.map((item) => item.name),
            value: customer.revenue || customer.potentialValue,
            checkoutField: latestDraft?.lastEditedField || null,
          };

          return (
            <div
              key={customer.key}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedCustomer(customer)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setSelectedCustomer(customer);
              }}
              className="grid cursor-pointer gap-4 border-b border-white/5 px-4 py-4 text-left text-sm transition last:border-b-0 hover:bg-white/[0.04] xl:grid-cols-[1.1fr_0.8fr_0.55fr_0.65fr_1fr_170px] xl:px-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-white">{customer.name}</p>
                  {!customer.orders.length ? (
                    <Badge className="border-amber-400/20 bg-amber-400/10 text-amber-100 hover:bg-amber-400/10">
                      Lead
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-white/35">
                  First seen {formatShortDate(customer.firstSeenAt)}
                </p>
              </div>
              <div className="min-w-0 text-white/55">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 xl:hidden">Contact</p>
                <p className="truncate">{customer.phone || "No phone"}</p>
                <p className="truncate text-xs">{customer.email || "No email"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 xl:contents">
                <p className="font-semibold text-white xl:text-right">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 xl:hidden">Orders</span>
                  {customer.orders.length}
                  {customer.checkoutDrafts.length ? (
                    <span className="ml-1 text-xs font-normal text-amber-200/70">+{customer.checkoutDrafts.length} lead</span>
                  ) : null}
                </p>
                <p className="font-semibold text-white xl:text-right">
                  <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 xl:hidden">Value</span>
                  {formatINR(customer.revenue || customer.potentialValue)}
                </p>
              </div>
              <div className="text-xs text-white/45">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30 xl:hidden">History</p>
                <p>
                  {latestOrder
                    ? `Last order ${formatShortDate(customer.lastOrderAt)}`
                    : `Checkout lead ${formatShortDate(customer.lastSeenAt)}`}
                </p>
                <p className="mt-1">
                  {customer.orders.length
                    ? customer.orders.slice(0, 3).map((order) => order.orderNumber).join(", ")
                    : latestDraft?.status.replace("_", " ") || "Lead captured"}
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1" onClick={(event) => event.stopPropagation()}>
                <a
                  href={buildAdminWhatsAppHref(customer.phone, messageInput)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                {customer.email ? (
                  <a
                    href={buildAdminEmailHref(customer.email, messageInput)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <CustomerDetailSheet customer={selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)} />
    </>
  );
}
