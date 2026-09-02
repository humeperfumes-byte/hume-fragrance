"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, BadgePercent, MessageCircle, Sparkles } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const STORAGE_KEY = "hume_early_bird_dismissed";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const CART_SESSION_KEY = "hume_cart_session_id";
const INTENT_STORAGE_KEY = "hume_behavior_intent_unlocked";

function getOrCreateSessionId() {
  const existing = typeof window !== "undefined"
    ? window.localStorage.getItem(CHECKOUT_SESSION_KEY)
    : null;
  if (existing) return existing;

  const cartSession = typeof window !== "undefined"
    ? window.localStorage.getItem(CART_SESSION_KEY)
    : null;
  if (cartSession) {
    window.localStorage.setItem(CHECKOUT_SESSION_KEY, cartSession);
    return cartSession;
  }

  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHECKOUT_SESSION_KEY, next);
  window.localStorage.setItem(CART_SESSION_KEY, next);
  return next;
}

type CouponSendResponse = {
  ok?: boolean;
  message?: string;
};

const EarlyBirdPopup = () => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    const isDevelopmentPreview =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).has("previewEarlyBird");
    if (!isDevelopmentPreview && window.localStorage.getItem(STORAGE_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), isDevelopmentPreview ? 200 : 10000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || submitted) return;

    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
    if (!normalizedPhone) return;

    submittingRef.current = true;
    setSubmitting(true);
    setErrorMessage("");

    const sessionId = getOrCreateSessionId();
    window.localStorage.setItem(INTENT_STORAGE_KEY, "true");
    window.dispatchEvent(new CustomEvent("hume:tracking", {
      detail: {
        eventType: "coupon_requested",
        payload: {
          source: "early_bird_popup",
          channel: "whatsapp",
          phoneLast4: normalizedPhone.slice(-4),
        },
      },
    }));

    try {
      const response = await fetch("/api/coupon-code/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          sessionId,
          path: window.location.pathname,
          referrer: document.referrer,
          source: "early_bird_popup",
        }),
      });
      const data = (await response.json()) as CouponSendResponse;

      if (!response.ok) {
        setErrorMessage(data.message || "Enter a valid WhatsApp number.");
        return;
      }

      setSubmitted(true);
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.error("Failed to register Early Bird request:", error);
      setErrorMessage("Unable to register right now. Please try again.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(value) => (value ? setOpen(true) : handleClose())}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full overflow-hidden rounded-t-[30px] border-x-0 border-b-0 border-black/5 bg-[#fbfaf7] px-0 pb-0 pt-0 text-[#171713] shadow-[0_-24px_80px_rgba(18,16,12,0.2)] data-[state=closed]:duration-300 data-[state=open]:duration-500 sm:bottom-5 sm:left-1/2 sm:max-w-[520px] sm:-translate-x-1/2 sm:rounded-[30px] sm:border"
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-black/15 sm:hidden" />

        <div className="relative overflow-hidden border-b border-black/[0.06] px-6 pb-6 pt-7 sm:px-8 sm:pt-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(198,163,94,0.22),transparent_68%)]" />
          <div className="pointer-events-none absolute -left-14 bottom-[-90px] h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(122,91,55,0.1),transparent_70%)]" />

          <div className="relative pr-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#9b712a]/30 bg-[#a87b31] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(155,113,42,0.22)]">
              <Sparkles className="h-3.5 w-3.5" />
              First-order offer
            </div>

            <SheetHeader className="space-y-3 text-left">
              <SheetTitle className="max-w-[360px] font-serif text-[34px] font-light leading-[1.02] tracking-[-0.025em] text-[#171713] sm:text-[40px]">
                A little welcome,
                <span className="block italic text-[#8a692f]">just for you.</span>
              </SheetTitle>
              <SheetDescription className="max-w-[410px] text-[15px] leading-6 text-black/55">
                Share your WhatsApp number to receive your personal 10% code.
              </SheetDescription>
            </SheetHeader>
          </div>
        </div>

        {submitted ? (
          <div className="px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 sm:px-8 sm:pb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b2b] text-white shadow-[0_10px_24px_rgba(23,59,43,0.18)]">
              <MessageCircle className="h-5 w-5" />
            </div>
            <p className="mt-5 text-lg font-semibold tracking-[-0.02em]">You&apos;re on the Early Bird list.</p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-black/50">
              We&apos;ll personally send your code to +91 {phone.replace(/\D/g, "").slice(-10)} on WhatsApp shortly.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#171713] px-5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(23,23,19,0.18)]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 pb-[max(22px,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            <div className="mb-4 flex items-center gap-3 text-xs text-black/45">
              <span className="flex items-center gap-1.5">
                <BadgePercent className="h-3.5 w-3.5 text-[#8a692f]" /> 10% welcome offer
              </span>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <span>No spam</span>
            </div>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">
                WhatsApp number
              </span>
              <div className="flex min-h-14 items-center rounded-2xl border border-black/10 bg-white px-4 shadow-[0_8px_28px_rgba(30,25,18,0.06)] transition focus-within:border-[#9c783c]/55 focus-within:ring-4 focus-within:ring-[#b8914f]/10">
                <span className="border-r border-black/10 pr-3 text-sm font-semibold text-black/55">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  aria-label="WhatsApp number"
                  placeholder="10-digit mobile number"
                  value={phone}
                  maxLength={10}
                  onChange={(event) => {
                    setPhone(event.target.value.replace(/\D/g, "").slice(0, 10));
                    setErrorMessage("");
                  }}
                  className="min-w-0 flex-1 bg-transparent px-3 text-[15px] font-medium tracking-[0.04em] text-[#171713] outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-black/30"
                  disabled={submitting}
                  required
                />
              </div>
            </label>

            {errorMessage ? <p className="mt-2 text-xs font-medium text-red-600">{errorMessage}</p> : null}
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#171713] px-5 text-left text-white shadow-[0_14px_34px_rgba(23,23,19,0.2)] transition hover:bg-black active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-semibold">{submitting ? "Registering..." : "Unlock the code"}</span>
                <span className="mt-0.5 block text-[10px] text-white/55">Sent personally on WhatsApp</span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 min-h-10 w-full text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35 transition hover:text-black/65"
            >
              Maybe later
            </button>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default EarlyBirdPopup;
