"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Clock3,
  CreditCard,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  PackageSearch,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Smartphone,
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
import { displayPhoneNumber } from "@/lib/phone";
import { useCart } from "@/context/CartContext";
import {
  PAYMENT_RECOVERY_MODE_KEY,
  savePaymentRecovery,
  type RecoveryPaymentMode,
} from "@/lib/payment-recovery";

type AccountOrderItem = {
  id: string;
  name: string;
  image?: string;
  inspiration?: string;
  size?: string;
  quantity: number;
  price: number;
  isGift?: boolean;
  kitSelections?: Array<{ id: string; name: string; inspiration?: string }>;
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
  deliveryChannel?: "sms" | "email";
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
  if (status === "processing") return "Order Confirmed";
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  if (status.includes("delivered")) return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_5px_18px_rgba(16,185,129,.08)]";
  if (status.includes("failed")) return "bg-rose-50 text-rose-700 border-rose-200 shadow-[0_5px_18px_rgba(244,63,94,.08)]";
  if (status.includes("pending")) return "bg-amber-50 text-amber-800 border-amber-200 shadow-[0_5px_18px_rgba(245,158,11,.08)]";
  if (status.includes("whatsapp")) return "bg-sky-50 text-sky-700 border-sky-200";
  if (status.includes("processing") || status.includes("confirmed")) return "bg-violet-50 text-violet-700 border-violet-200";
  if (status.includes("shipped")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-stone-100 text-stone-700 border-stone-200";
}

function orderProgress(order: AccountOrder): number {
  if (order.status.includes("delivered") || order.deliveredAt) return 100;
  if (order.status.includes("shipped") || order.trackingNumber || order.shippedAt) return 72;
  if (order.status.includes("processing") || order.status.includes("confirmed")) return 38;
  if (order.status.includes("payment_pending") || order.status.includes("payment_failed")) return 3;
  return 22;
}

function orderStage(order: AccountOrder): number {
  if (order.status.includes("delivered") || order.deliveredAt) return 4;
  if (order.status.includes("shipped") || order.trackingNumber || order.shippedAt) return 2;
  if (order.status.includes("processing") || order.status.includes("confirmed")) return 1;
  return 0;
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
  const router = useRouter();
  const { addItem, clearCart } = useCart();
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
  const activeOrders = useMemo(
    () => orders.filter((order) => !["delivered", "complete", "cancelled", "refunded"].includes(order.status)).length,
    [orders],
  );
  const totalOrderValue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.grandTotal || 0), 0),
    [orders],
  );

  const resumeOrderPayment = (order: AccountOrder, mode: RecoveryPaymentMode) => {
    if (order.grandTotal === null) return;
    clearCart();
    order.cartSnapshot.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        inspiration: item.inspiration || "HUME Fragrance",
        category: "Perfume",
        image: item.image || "/images/logo.png",
        price: item.price,
        size: item.size,
        isGift: item.isGift,
        sampleSelections: item.sampleSelections,
        kitSelections: item.kitSelections,
      });
    });
    window.localStorage.setItem(PAYMENT_RECOVERY_MODE_KEY, mode);
    savePaymentRecovery(window.localStorage, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
      createdAt: order.createdAt,
      status: order.status === "payment_failed" ? "payment_failed" : "payment_pending",
      items: order.cartSnapshot.map((item) => ({
        id: item.id,
        name: item.name,
        inspiration: item.inspiration,
        size: item.size,
        image: item.image || "/images/logo.png",
        price: item.price,
        quantity: item.quantity,
        isGift: item.isGift,
      })),
    });
    router.push("/checkout");
  };

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
      const destinationType = data.deliveryChannel === "sms" ? "mobile" : "email";
      setLoginStatus(`Code sent to ${data.deliveryHint || `your saved ${destinationType}`}.`);
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
                  Enter the email or mobile number used at checkout. We will send a 4 digit code to that saved contact.
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
                {loginIdentifier.replace(/\D/g, "").length >= 10 && !loginIdentifier.includes("@") ? (
                  <Smartphone className="h-4 w-4" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
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
    <section className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 md:pt-32">
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#d6b77a]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[28rem] h-80 w-80 rounded-full bg-[#8d5a45]/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_10%,rgba(207,171,103,.2),transparent_34%),linear-gradient(135deg,#241813,#130f0d)] p-6 text-white shadow-[0_30px_90px_rgba(46,30,22,.2)] sm:p-8">
          <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full border border-white/[0.06]" />
          <div className="absolute -right-2 -top-6 h-24 w-24 rounded-full border border-[#d7b979]/15" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-serif text-4xl font-light tracking-wide sm:text-5xl">
              Welcome, {account?.fullName?.split(" ")[0] || "Customer"}
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/70"><strong className="text-white">{orders.length}</strong> orders</span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/70"><strong className="text-white">{activeOrders}</strong> active</span>
              <span className="rounded-full border border-[#d8bd87]/20 bg-[#d8bd87]/10 px-3 py-1.5 text-xs text-[#ead8b5]">{formatINR(totalOrderValue)} order value</span>
            </div>
            <div className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#ddc594]"><Smartphone className="h-3.5 w-3.5" /></span>
                <div className="min-w-0"><p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Contact</p><p className="mt-1 truncate text-xs text-white/72">{displayPhoneNumber(account?.phone) || "Not added"}</p></div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#ddc594]"><Mail className="h-3.5 w-3.5" /></span>
                <div className="min-w-0"><p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Email</p><p className="mt-1 truncate text-xs text-white/72">{account?.email || "Not added yet"}</p></div>
              </div>
              <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] p-3 sm:col-span-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[#ddc594]"><MapPin className="h-3.5 w-3.5" /></span>
                <div className="min-w-0"><p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/30">Delivery address</p><p className="mt-1 text-xs leading-5 text-white/68">{profileAddress}</p></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={loadAccount}
              disabled={isLoading}
              className="h-10 rounded-full border-white/15 bg-white/[0.07] px-4 text-white hover:bg-white hover:text-[#1d1512]"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
              Refresh
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSignOut}
              className="h-10 rounded-full text-white/45 hover:bg-white/[0.07] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Clear device
            </Button>
          </div>
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

          <div className="rounded-[1.75rem] border border-[#ded4c8] bg-[#fffdf9] p-4 shadow-[0_18px_55px_rgba(74,51,38,.07)] sm:p-5">
            <div className="mb-5 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#a08772]">Your collection</p>
                <h2 className="mt-1 font-serif text-2xl text-[#271a15]">Orders</h2>
              </div>
              <span className="rounded-full border border-[#e7ddd2] bg-[#f7f1ea] px-3 py-1.5 text-xs font-medium text-[#756154]">
                {orders.length} total
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
                    className="relative overflow-hidden rounded-[1.5rem] border border-[#e3d9ce] bg-white p-4 shadow-[0_14px_42px_rgba(71,47,35,.055)] sm:p-5"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#eee5da]"><div className="h-full rounded-r-full bg-[linear-gradient(90deg,#9b6b4c,#d6b878)] transition-all duration-700" style={{ width: `${orderProgress(order)}%` }} /></div>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a29184]"><Clock3 className="h-3 w-3" />
                          {formatDate(order.createdAt)}
                        </p>
                        <h3 className="mt-2 font-serif text-xl tracking-wide text-[#2a1d17]">{order.orderNumber}</h3>
                        {!["payment_pending", "payment_failed"].includes(order.status) ? (
                          <p className="mt-1 text-xs text-[#806f64]">
                            {order.paymentMethod || (order.checkoutChannel === "razorpay" ? "Razorpay online payment" : "WhatsApp order")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className={cn("rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]", statusClass(order.status))}>
                          {titleStatus(order.status)}
                        </span>
                        <span className="font-serif text-xl text-[#241813]">
                          {order.grandTotal !== null ? formatINR(order.grandTotal) : "Saved"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="h-9 rounded-full border-[#ded3c7] bg-[#faf6f0] px-4 text-xs text-[#3a2921] hover:bg-[#2a1d17] hover:text-white"
                        >
                          <ReceiptText className="h-3.5 w-3.5" />
                          Details
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="relative mt-5 px-1 py-1">
                      <div className="absolute left-[12.5%] right-[12.5%] top-[17px] h-[2px] overflow-hidden rounded-full bg-[#e8dfd5]">
                        <div className="hume-order-progress-flow h-full rounded-full bg-[linear-gradient(90deg,#8a6045,#d6b878,#9d6b49)]" style={{ width: `${Math.min(100, (orderStage(order) / 3) * 100)}%` }} />
                      </div>
                      <div className="relative grid grid-cols-4 gap-1">
                        {["Payment", "Confirmed", "Shipped", "Delivered"].map((step, index) => {
                          const stage = orderStage(order);
                          const complete = stage === 4 || index < stage;
                          const current = stage < 4 && index === stage;
                          return (
                            <div key={step} className="text-center">
                              <span className={cn(
                                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-[9px] font-semibold transition-all duration-500",
                                complete && "border-[#8e6245] bg-[#2b1e18] text-[#ead3a8] shadow-[0_5px_14px_rgba(61,39,29,.18)]",
                                current && "hume-order-current-step border-[#c49a5c] bg-[#f2dfba] text-[#3a271d] shadow-[0_0_0_4px_rgba(214,184,120,.16),0_8px_20px_rgba(125,86,52,.16)]",
                                !complete && !current && "border-[#ded3c7] bg-[#f8f4ee] text-[#aa9b8f]",
                              )}>
                                {complete ? <Check className="h-3.5 w-3.5" /> : index + 1}
                              </span>
                              <p className={cn(
                                "mt-2 text-[8px] font-semibold uppercase tracking-[0.09em] transition-colors",
                                complete ? "text-[#604638]" : current ? "text-[#8a6045]" : "text-[#b2a59a]",
                              )}>{step}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 border-t border-[#eee6dd] pt-4">
                      {order.cartSnapshot.slice(0, 4).map((item) => (
                        <div key={`${order.id}-${item.id}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf7f2] p-3 text-sm">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e7ddd2] bg-white p-1.5 shadow-sm"><Image src={item.image || "/images/logo.png"} alt={item.name} fill sizes="48px" className="object-contain p-1.5" unoptimized /></span>
                            <div className="min-w-0"><p className="truncate font-medium text-[#2d201a]">{item.name}</p>
                            <p className="text-xs text-[#8c796c]">
                              Qty {item.quantity}
                              {!item.isGift && item.size ? ` - ${item.size}` : ""}
                            </p>
                            {item.sampleSelections?.length ? (
                              <p className="mt-1 line-clamp-1 text-xs text-emerald-700">
                                Samples: {item.sampleSelections.map((selection) => selection.name).join(", ")}
                              </p>
                            ) : null}</div>
                          </div>
                          <span className={cn("shrink-0 font-medium", item.isGift ? "text-emerald-600" : "text-[#3c2a22]")}>
                            {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      {order.cartSnapshot.length > 4 ? <p className="px-2 pt-1 text-xs text-[#8c796c]">+{order.cartSnapshot.length - 4} more item{order.cartSnapshot.length - 4 === 1 ? "" : "s"}</p> : null}
                    </div>

                    {["payment_pending", "payment_failed"].includes(order.status) ? (
                      <div className="relative mt-4 min-w-0 overflow-hidden rounded-[1.4rem] border border-[#b99762]/30 bg-[radial-gradient(circle_at_100%_0%,rgba(203,167,105,.16),transparent_36%),linear-gradient(145deg,#251914,#15100e)] p-3.5 shadow-[0_18px_45px_rgba(42,27,20,.2)] sm:p-5">
                        <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full border border-[#d3b47d]/10" />
                        <div className="absolute right-3 top-3 h-16 w-16 rounded-full border border-[#d3b47d]/[0.06]" />
                        <div className="relative mb-4 flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d7b979]/20 bg-[#d7b979]/10 text-[#e3c98f]"><CreditCard className="h-4 w-4" /></span>
                            <div className="min-w-0"><p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#d8bd87]/65">Payment required</p><p className="mt-1 truncate font-serif text-lg text-white sm:text-xl">Complete this order</p></div>
                          </div>
                          <p className="hidden shrink-0 font-serif text-lg text-[#ead7b0] sm:block">{order.grandTotal !== null ? formatINR(order.grandTotal) : null}</p>
                        </div>
                        <div className="relative grid min-w-0 gap-2.5 sm:grid-cols-2">
                          <Button type="button" onClick={() => resumeOrderPayment(order, "partial_cod")} variant="outline" className="group h-14 w-full min-w-0 justify-center overflow-hidden rounded-[14px] border-[#ead7ad]/70 bg-[linear-gradient(135deg,#f4e5c7,#e7cca0)] px-3 text-[11px] font-semibold text-[#2b1d17] shadow-[0_10px_24px_rgba(203,167,105,.16)] transition hover:-translate-y-0.5 hover:border-[#f3dfb6] hover:bg-[#f4e5c7] hover:text-[#211510] active:translate-y-0 sm:justify-between sm:text-xs">
                            <span className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-[#5c412f]/10 bg-[#2b1d17]/[0.07]"><WalletCards className="h-4 w-4" /></span><span className="truncate">Pay 20% now + COD</span></span>
                            <ChevronRight className="hidden h-4 w-4 shrink-0 text-[#6d4f39] transition-transform group-hover:translate-x-0.5 sm:block" />
                          </Button>
                          <Button type="button" onClick={() => resumeOrderPayment(order, "full")} className="group h-14 w-full min-w-0 justify-center overflow-hidden rounded-[14px] border border-emerald-200/15 bg-[linear-gradient(135deg,#1b654d,#2b8063)] px-3 text-[11px] font-semibold text-white shadow-[0_12px_30px_rgba(10,65,46,.3)] transition hover:-translate-y-0.5 hover:bg-[#1b5d47] active:translate-y-0 sm:justify-between sm:text-xs">
                            <span className="flex min-w-0 items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/10"><CreditCard className="h-4 w-4" /></span><span className="truncate">Pay securely with Razorpay</span></span>
                            <ChevronRight className="hidden h-4 w-4 shrink-0 text-emerald-100 transition-transform group-hover:translate-x-0.5 sm:block" />
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    {!["payment_pending", "payment_failed", "whatsapp_initiated"].includes(order.status) ? (
                    <div className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[linear-gradient(135deg,#fffdf9,#f7f2eb)] p-4">
                      {order.trackingNumber ? (
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Truck className="h-4 w-4" /></span>
                            <div>
                              <p className="text-sm font-semibold">
                                {order.fulfillmentCarrier || "Shipment"} / {order.trackingNumber}
                              </p>
                              <p className="mt-1 text-xs text-[#806f64]">
                                {order.trackingStatus
                                  ? titleStatus(order.trackingStatus)
                                  : "Tracking link is ready"}
                              </p>
                            </div>
                          </div>
                          <Button asChild className="h-10 rounded-full bg-[#241813] px-5 text-white hover:bg-[#3a2921]">
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
                        <div className="flex items-start gap-3 text-sm text-[#806f64]">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e5dbcf] bg-white text-[#a78469]"><MapPin className="h-4 w-4" /></span>
                          <div>
                            <p className="font-medium text-[#32231c]">Preparing your delivery</p>
                            <p className="mt-1 text-xs leading-5 text-[#8b796d]">
                              Once your parcel is dispatched, the tracking ID and link will appear here automatically.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
        </div>

        <Sheet
          open={Boolean(selectedOrder)}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
        >
          <SheetContent className="w-full overflow-y-auto border-[#ded4c8] bg-[#f8f3ec] p-0 text-[#251a15] sm:max-w-2xl">
            {selectedOrder ? (
              <div className="space-y-5 p-5 sm:p-7">
                <SheetHeader className="text-left">
                  <SheetTitle className="font-serif text-3xl font-light text-[#251a15]">
                    {selectedOrder.orderNumber}
                  </SheetTitle>
                  <SheetDescription>
                    Placed {formatDate(selectedOrder.createdAt)} / {titleStatus(selectedOrder.status)}
                  </SheetDescription>
                </SheetHeader>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#e3d9ce] bg-[#fffdf9] p-4 shadow-sm">
                    <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      <WalletCards className="h-3.5 w-3.5" />
                      Payment
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                      {["payment_pending", "payment_failed"].includes(selectedOrder.status)
                        ? "Awaiting payment confirmation"
                        : selectedOrder.paymentMethod || (selectedOrder.checkoutChannel === "razorpay" ? "Razorpay" : "WhatsApp")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e3d9ce] bg-[#fffdf9] p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Total
                    </p>
                    <p className="mt-2 text-lg font-semibold text-zinc-950">
                      {selectedOrder.grandTotal !== null ? formatINR(selectedOrder.grandTotal) : "Saved"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e3d9ce] bg-[#fffdf9] p-4 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                      Coupon
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                      {selectedOrder.appliedCouponCode || "None"}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#e3d9ce] bg-[#fffdf9] p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-zinc-950">Items</h3>
                  <div className="mt-4 divide-y divide-zinc-100">
                    {selectedOrder.cartSnapshot.map((item) => (
                      <div key={`${selectedOrder.id}-${item.id}`} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 gap-3">
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#e7ddd2] bg-white"><Image src={item.image || "/images/logo.png"} alt={item.name} fill sizes="48px" className="object-contain p-1.5" unoptimized /></span>
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
                        </div>
                        <p className={cn("shrink-0 text-sm font-semibold", item.isGift ? "text-emerald-600" : "text-zinc-950")}>
                          {item.isGift ? "FREE" : formatINR(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-[#cddfce] bg-[#eff7ef] p-4 text-emerald-950 shadow-sm">
                  <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700/70">
                    <MapPin className="h-4 w-4" />
                    Delivery details
                  </p>
                  <p className="mt-3 font-semibold">{account?.fullName || "Customer"}</p>
                  <p className="mt-1 text-sm">{displayPhoneNumber(account?.phone) || "Phone not available"}</p>
                  {account?.email ? <p className="mt-1 text-sm">{account.email}</p> : null}
                  <p className="mt-3 text-sm leading-6">{profileAddress}</p>
                </div>

                <div className="rounded-3xl border border-[#e3d9ce] bg-[#fffdf9] p-4 shadow-sm">
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
