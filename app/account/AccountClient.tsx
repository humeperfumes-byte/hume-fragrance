"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatINR } from "@/lib/currency";
import {
  clearStoredCustomerAccount,
  getStoredAccountLoginToken,
  getStoredCheckoutSessionId,
  persistCustomerAccountFromCheckout,
  persistCustomerAccountFromOtp,
  readStoredCheckoutDetails,
  readStoredCustomerAccount,
  type StoredCustomerAccount,
} from "@/lib/customer-account";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import { buildPublicTrackingPath } from "@/lib/tracking-url";
import { cn } from "@/lib/utils";
import type { FragranceSelection } from "@/lib/discovery-set";

type AccountOrderItem = {
  id: string;
  name: string;
  inspiration?: string;
  size?: string;
  quantity: number;
  price: number;
  isGift?: boolean;
  sampleSelections?: FragranceSelection[];
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

type OtpRequestResponse = {
  ok?: boolean;
  requestId?: string;
  expiresInMinutes?: number;
  deliveryHint?: string;
  dryRun?: boolean;
  error?: string;
};

type OtpVerifyResponse = {
  ok?: boolean;
  accountToken?: string;
  profile?: Partial<StoredCustomerAccount> & {
    sessionId: string;
    fullName: string;
    phone: string;
  };
  error?: string;
};

const OTP_RESEND_SECONDS = 30;

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
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [otpRequest, setOtpRequest] = useState<OtpRequestResponse | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [otpShakeKey, setOtpShakeKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<AccountOrder | null>(null);

  const profileAddress = useMemo(() => compactAddress(account), [account]);

  const loadAccount = useCallback(async () => {
    if (typeof window === "undefined") return;
    setError(null);
    setIsLoading(true);

    const storage = window.localStorage;
    const savedAccount = readStoredCustomerAccount(storage);
    const checkoutDetails = readStoredCheckoutDetails(storage);
    const accountToken =
      savedAccount?.accountLoginToken || getStoredAccountLoginToken(storage);
    const sessionId =
      savedAccount?.sessionId || getStoredCheckoutSessionId(storage);
    const hydratedAccount =
      savedAccount ||
      (checkoutDetails && sessionId
        ? persistCustomerAccountFromCheckout(storage, sessionId, checkoutDetails)
        : null);

    setAccount(hydratedAccount);

    if (!sessionId && !accountToken) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId || undefined,
          accountToken: accountToken || undefined,
        }),
      });
      const data = (await response.json()) as AccountResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to load account.");
      }

      const serverProfile = data.profile;
      if (hydratedAccount && serverProfile) {
        const mergedAccount: StoredCustomerAccount = {
          ...hydratedAccount,
          sessionId: serverProfile.sessionId || hydratedAccount.sessionId,
          accountLoginToken: accountToken || hydratedAccount.accountLoginToken,
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
      } else if (
        !hydratedAccount &&
        accountToken &&
        serverProfile?.sessionId &&
        serverProfile.fullName &&
        serverProfile.phone
      ) {
        const restoredAccount = persistCustomerAccountFromOtp(
          storage,
          accountToken,
          {
            sessionId: serverProfile.sessionId,
            fullName: serverProfile.fullName,
            phone: serverProfile.phone,
            email: serverProfile.email,
            addressLine1: serverProfile.addressLine1,
            addressLine2: serverProfile.addressLine2,
            city: serverProfile.city,
            state: serverProfile.state,
            pincode: serverProfile.pincode,
            notes: serverProfile.notes,
          },
        );
        setAccount(restoredAccount);
      }
      setOrders(data.orders ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load account.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      clearStoredCustomerAccount(window.localStorage);
    }
    setAccount(null);
    setOrders([]);
  };

  const handleRequestOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginStatus(null);
    setIsRequestingOtp(true);

    try {
      const response = await fetch("/api/account/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier }),
      });
      const data = (await response.json()) as OtpRequestResponse;

      if (!response.ok || !data.ok || !data.requestId) {
        throw new Error(data.error || "Unable to send login code.");
      }

      setOtpRequest(data);
      setOtpCode("");
      setResendSeconds(OTP_RESEND_SECONDS);
      setLoginStatus(`Code sent to ${data.deliveryHint || "your saved email"}.`);
    } catch (requestError) {
      setLoginError(requestError instanceof Error ? requestError.message : "Unable to send login code.");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const verifyOtp = useCallback(async (code: string) => {
    if (!otpRequest?.requestId || isVerifyingOtp) return;

    setLoginError(null);
    setIsVerifyingOtp(true);

    try {
      const response = await fetch("/api/account/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: otpRequest.requestId,
          code,
        }),
      });
      const data = (await response.json()) as OtpVerifyResponse;

      if (!response.ok || !data.ok || !data.accountToken || !data.profile) {
        throw new Error(data.error || "Unable to verify login code.");
      }

      const nextAccount = persistCustomerAccountFromOtp(
        window.localStorage,
        data.accountToken,
        data.profile,
      );
      setAccount(nextAccount);
      setLoginStatus("Account opened.");
      setOtpRequest(null);
      setOtpCode("");
      await loadAccount();
    } catch (verifyError) {
      setLoginError(verifyError instanceof Error ? verifyError.message : "Unable to verify login code.");
      setOtpCode("");
      setOtpShakeKey((key) => key + 1);
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [isVerifyingOtp, loadAccount, otpRequest?.requestId]);

  useEffect(() => {
    if (!otpRequest?.requestId || otpCode.length !== 4 || isVerifyingOtp) return;

    const timer = window.setTimeout(() => {
      void verifyOtp(otpCode);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [isVerifyingOtp, otpCode, otpRequest?.requestId, verifyOtp]);

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await verifyOtp(otpCode);
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

          <div className="mx-auto mt-7 max-w-xl rounded-[1.5rem] border border-zinc-200 bg-zinc-50/80 p-4 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-sm">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-950">Already checked out?</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Enter the email or mobile number used at checkout. We will send a 4 digit code to the saved email.
                </p>
              </div>
            </div>

            <form onSubmit={handleRequestOtp} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={loginIdentifier}
                onChange={(event) => setLoginIdentifier(event.target.value)}
                placeholder="Email or mobile number"
                inputMode="email"
                autoComplete="email tel"
                className="min-h-12 flex-1 rounded-full border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-zinc-950"
              />
              <Button
                type="submit"
                disabled={isRequestingOtp || resendSeconds > 0 || !loginIdentifier.trim()}
                className="h-12 rounded-full bg-zinc-950 px-6 text-white hover:bg-zinc-800"
              >
                <Mail className="h-4 w-4" />
                {isRequestingOtp
                  ? "Sending..."
                  : resendSeconds > 0
                    ? `Resend in ${resendSeconds}s`
                    : otpRequest?.requestId
                      ? "Resend code"
                      : "Send code"}
              </Button>
            </form>

            {otpRequest?.requestId ? (
              <form onSubmit={handleVerifyOtp} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <InputOTP
                  maxLength={4}
                  value={otpCode}
                  onChange={(value) => setOtpCode(value.replace(/\D/g, "").slice(0, 4))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  containerClassName="flex-1 justify-center gap-3 sm:justify-start"
                  className="w-full"
                >
                  <InputOTPGroup key={otpShakeKey} className={cn("gap-3", loginError ? "hume-otp-shake" : "")}>
                    {[0, 1, 2, 3].map((index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="h-14 w-14 rounded-xl border border-zinc-200 bg-white text-2xl font-medium text-zinc-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-0 ring-offset-0 first:rounded-xl first:border last:rounded-xl data-[active=true]:border-zinc-950 data-[active=true]:ring-0"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <Button
                  type="submit"
                  disabled={isVerifyingOtp || otpCode.length !== 4}
                  className="h-12 rounded-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                >
                  {isVerifyingOtp ? "Opening..." : "Open account"}
                </Button>
              </form>
            ) : null}

            {loginStatus ? (
              <p className="mt-3 text-xs font-medium text-emerald-700">{loginStatus}</p>
            ) : null}
            {loginError ? (
              <p className="mt-3 text-xs font-medium text-rose-600">{loginError}</p>
            ) : null}
          </div>

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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="h-9 rounded-full bg-white px-4 text-xs"
                        >
                          <ReceiptText className="h-3.5 w-3.5" />
                          Details
                        </Button>
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
                            {item.sampleSelections?.length ? (
                              <p className="mt-1 line-clamp-1 text-xs text-emerald-700">
                                Samples: {item.sampleSelections.map((selection) => selection.name).join(", ")}
                              </p>
                            ) : null}
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

        <Sheet
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
        >
          <SheetContent className="w-full overflow-y-auto border-zinc-200 bg-white p-0 sm:max-w-2xl">
            {selectedOrder ? (
              <div className="space-y-5 p-5 sm:p-7">
                <SheetHeader className="text-left">
                  <SheetTitle className="font-serif text-3xl font-light">
                    {selectedOrder.orderNumber}
                  </SheetTitle>
                  <SheetDescription>
                    Placed {formatDate(selectedOrder.createdAt)} / {titleStatus(selectedOrder.status)}
                  </SheetDescription>
                </SheetHeader>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      <WalletCards className="h-3.5 w-3.5" />
                      Payment
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                      {selectedOrder.paymentMethod || (selectedOrder.checkoutChannel === "razorpay" ? "Razorpay" : "WhatsApp")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950">
                      {selectedOrder.grandTotal !== null ? formatINR(selectedOrder.grandTotal) : "Saved"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Coupon
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                      {selectedOrder.appliedCouponCode || "None"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Items</h3>
                  <div className="mt-4 divide-y divide-zinc-100">
                    {selectedOrder.cartSnapshot.map((item) => (
                      <div key={`${selectedOrder.id}-${item.id}`} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="font-medium text-zinc-950">{item.name}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            Qty {item.quantity}
                            {!item.isGift && item.size ? ` / ${item.size}` : ""}
                            {item.inspiration ? ` / Inspired by ${item.inspiration}` : ""}
                          </p>
                          {item.sampleSelections?.length ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {item.sampleSelections.map((selection) => (
                                <span key={selection.id} className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">
                                  {selection.name}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                        <p className={cn("shrink-0 text-sm font-semibold", item.isGift ? "text-emerald-600" : "text-zinc-950")}>
                          {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                  <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">
                    <MapPin className="h-4 w-4" />
                    Delivery details
                  </p>
                  <p className="mt-3 font-semibold">{account?.fullName || "Customer"}</p>
                  <p className="mt-1 text-sm">{account?.phone || "Phone not available"}</p>
                  {account?.email ? <p className="mt-1 text-sm">{account.email}</p> : null}
                  <p className="mt-3 text-sm leading-6">{profileAddress}</p>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-zinc-950">Shipment</h3>
                  {selectedOrder.trackingNumber ? (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">{selectedOrder.fulfillmentCarrier || "Shipment"}</p>
                        <p className="mt-1 text-sm text-zinc-500">{selectedOrder.trackingNumber}</p>
                        <p className="mt-1 text-xs text-zinc-400">
                          {selectedOrder.trackingLastCheckedAt
                            ? `Last checked ${formatDate(selectedOrder.trackingLastCheckedAt)}`
                            : "Tracking is ready"}
                        </p>
                      </div>
                      <Button asChild className="rounded-full bg-zinc-950 text-white hover:bg-zinc-800">
                        <Link href={buildPublicTrackingPath(selectedOrder.trackingNumber) || selectedOrder.trackingUrl || "/track-order"}>
                          <PackageSearch className="h-4 w-4" />
                          Track order
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      Tracking will appear here after dispatch.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="h-11 flex-1 rounded-full bg-[#25D366] text-white hover:bg-[#20bd5a]">
                    <a href="https://wa.me/919559024822" target="_blank" rel="noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Ask HUME support
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </section>
  );
}
