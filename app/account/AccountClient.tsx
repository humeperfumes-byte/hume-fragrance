"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  MapPin,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import {
  clearStoredCustomerAccount,
  getStoredCheckoutSessionId,
  persistCustomerAccountFromCheckout,
  readStoredCheckoutDetails,
  readStoredCustomerAccount,
  type StoredCustomerAccount,
} from "@/lib/customer-account";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import { buildPublicTrackingPath } from "@/lib/tracking-url";
import { cn } from "@/lib/utils";

type AccountOrderItem = {
  id: string;
  name: string;
  inspiration?: string;
  size?: string;
  quantity: number;
  price: number;
  isGift?: boolean;
};

type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  checkoutChannel: string;
  paymentMethod: string | null;
  shippingMethod: string | null;
  fulfillmentCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  trackingStatus: string | null;
  trackingLastCheckedAt: string | null;
  subtotal: number | null;
  shippingFee: number | null;
  grandTotal: number | null;
  appliedCouponCode: string | null;
  cartSnapshot: AccountOrderItem[];
  giftItems: string[];
  createdAt: string;
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
};

type AccountResponse = {
  ok?: boolean;
  profile?: Partial<StoredCustomerAccount> | null;
  orders?: AccountOrder[];
  error?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function titleStatus(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  if (status.includes("delivered")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status.includes("failed")) return "bg-rose-50 text-rose-700 border-rose-200";
  if (status.includes("pending")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (status.includes("whatsapp")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-zinc-100 text-zinc-700 border-zinc-200";
}

function compactAddress(account: Partial<StoredCustomerAccount> | null) {
  if (!account) return "Address will appear after checkout.";
  return [
    account.addressLine1,
    account.addressLine2,
    [account.city, account.state, account.pincode].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(", ");
}

export default function AccountClient() {
  const [account, setAccount] = useState<StoredCustomerAccount | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileAddress = useMemo(() => compactAddress(account), [account]);

  const loadAccount = async () => {
    if (typeof window === "undefined") return;
    setError(null);
    setIsLoading(true);

    const storage = window.localStorage;
    const savedAccount = readStoredCustomerAccount(storage);
    const checkoutDetails = readStoredCheckoutDetails(storage);
    const sessionId =
      savedAccount?.sessionId || getStoredCheckoutSessionId(storage);
    const hydratedAccount =
      savedAccount ||
      (checkoutDetails && sessionId
        ? persistCustomerAccountFromCheckout(storage, sessionId, checkoutDetails)
        : null);

    setAccount(hydratedAccount);

    if (!sessionId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = (await response.json()) as AccountResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to load account.");
      }

      const serverProfile = data.profile;
      if (hydratedAccount && serverProfile) {
        const mergedAccount: StoredCustomerAccount = {
          ...hydratedAccount,
          fullName: serverProfile.fullName || hydratedAccount.fullName,
          phone: serverProfile.phone || hydratedAccount.phone,
          email: serverProfile.email || hydratedAccount.email,
          addressLine1: serverProfile.addressLine1 || hydratedAccount.addressLine1,
          addressLine2: serverProfile.addressLine2 || hydratedAccount.addressLine2,
          city: serverProfile.city || hydratedAccount.city,
          state: serverProfile.state || hydratedAccount.state,
          pincode: serverProfile.pincode || hydratedAccount.pincode,
          notes: serverProfile.notes || hydratedAccount.notes,
        };
        setAccount(mergedAccount);
      }
      setOrders(data.orders ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load account.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAccount();
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      clearStoredCustomerAccount(window.localStorage);
    }
    setAccount(null);
    setOrders([]);
  };

  if (!account && !isLoading) {
    return (
      <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-7 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white">
            <UserRound className="h-6 w-6" />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Account not started
          </p>
          <h1 className="mt-3 font-serif text-4xl font-light tracking-wide">
            Checkout once to create your HUME account
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-600">
            Add your name and mobile number at checkout and this device will stay logged in for faster checkout, order history, and tracking updates.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="h-12 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800">
              <Link href="/shop" onClick={() => showNavigationLoadingToast()}>
                <ShoppingBag className="h-4 w-4" />
                Shop perfumes
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6">
              <Link href="/track-order" onClick={() => showNavigationLoadingToast()}>
                <PackageSearch className="h-4 w-4" />
                Track with ID
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-16 pt-28 sm:px-6 md:pt-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              My Account
            </p>
            <h1 className="mt-3 font-serif text-4xl font-light tracking-wide sm:text-5xl">
              {account?.fullName || "HUME Account"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
              Saved on this device for faster checkout, order history, and shipment tracking.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadAccount}
              disabled={isLoading}
              className="h-10 rounded-full"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSignOut}
              className="h-10 rounded-full text-zinc-500 hover:text-zinc-950"
            >
              <LogOut className="h-4 w-4" />
              Clear device
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="space-y-5">
            <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{account?.fullName}</p>
                  <p className="text-xs text-zinc-500">{account?.phone}</p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-zinc-100 pt-5 text-sm">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Email
                  </p>
                  <p className="mt-1 text-zinc-800">{account?.email || "Not added yet"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                    Delivery address
                  </p>
                  <p className="mt-1 leading-6 text-zinc-800">{profileAddress}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Logged in on this device</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800/75">
                    This account uses your checkout session. For another phone or browser, checkout details will create a fresh account.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Orders</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Tracking links appear here after dispatch.
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500">
                {orders.length} orders
              </span>
            </div>

            {isLoading ? (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-500">
                Loading your account...
              </div>
            ) : orders.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-6 text-center">
                <ShoppingBag className="h-9 w-9 text-zinc-300" />
                <p className="mt-4 text-sm font-semibold text-zinc-900">No orders on this device yet</p>
                <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
                  Once you place an order, it will be visible here with status, total, items, and tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-2xl border border-zinc-200 bg-[#fbfbfc] p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-400">
                          {formatDate(order.createdAt)}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{order.orderNumber}</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {order.checkoutChannel === "razorpay" ? "Online payment" : "WhatsApp order"} 
                          {order.paymentMethod ? ` / ${order.paymentMethod}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", statusClass(order.status))}>
                          {titleStatus(order.status)}
                        </span>
                        <span className="text-lg font-semibold">
                          {order.grandTotal !== null ? formatINR(order.grandTotal) : "Saved"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
                      {order.cartSnapshot.slice(0, 4).map((item) => (
                        <div key={`${order.id}-${item.id}`} className="flex items-center justify-between gap-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{item.name}</p>
                            <p className="text-xs text-zinc-500">
                              Qty {item.quantity}
                              {!item.isGift && item.size ? ` - ${item.size}` : ""}
                            </p>
                          </div>
                          <span className={item.isGift ? "text-emerald-600" : "text-zinc-700"}>
                            {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-3">
                      {order.trackingNumber ? (
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-3">
                            <Truck className="mt-1 h-4 w-4 text-emerald-600" />
                            <div>
                              <p className="text-sm font-semibold">
                                {order.fulfillmentCarrier || "Shipment"} / {order.trackingNumber}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                {order.trackingStatus
                                  ? titleStatus(order.trackingStatus)
                                  : "Tracking link is ready"}
                              </p>
                            </div>
                          </div>
                          <Button asChild className="h-10 rounded-full bg-zinc-950 text-white hover:bg-zinc-800">
                            <Link
                              href={buildPublicTrackingPath(order.trackingNumber) || order.trackingUrl || "/track-order"}
                              onClick={() => showNavigationLoadingToast()}
                            >
                              <PackageSearch className="h-4 w-4" />
                              Track
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 text-sm text-zinc-600">
                          <MapPin className="mt-0.5 h-4 w-4 text-zinc-400" />
                          <div>
                            <p className="font-medium text-zinc-800">Tracking not added yet</p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              Once your parcel is dispatched, the tracking ID and link will appear here automatically.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
