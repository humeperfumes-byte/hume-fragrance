"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEY = "hume_early_bird_dismissed";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const CART_SESSION_KEY = "hume_cart_session_id";
const INTENT_STORAGE_KEY = "hume_behavior_intent_unlocked";
const EARLY_BIRD_COUPON_CODE = "HUME_EARLY_BIRD";

function getOrCreateSessionId() {
  const existing =
    typeof window !== "undefined" ? window.localStorage.getItem(CHECKOUT_SESSION_KEY) : null;
  if (existing) return existing;
  const cartSession =
    typeof window !== "undefined" ? window.localStorage.getItem(CART_SESSION_KEY) : null;
  if (cartSession) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CHECKOUT_SESSION_KEY, cartSession);
    }
    return cartSession;
  }
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CHECKOUT_SESSION_KEY, next);
    window.localStorage.setItem(CART_SESSION_KEY, next);
  }
  return next;
}

type CouponSendResponse = {
  ok?: boolean;
  couponCode?: string;
  emailSent?: boolean;
  whatsappLink?: string;
};

const EarlyBirdPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [startingCode, setStartingCode] = useState<string>(EARLY_BIRD_COUPON_CODE);
  const [emailSent, setEmailSent] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");

  useEffect(() => {
    const dismissed =
      typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    const sessionId = getOrCreateSessionId();
    window.localStorage.setItem(INTENT_STORAGE_KEY, "true");
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "coupon_requested",
          payload: { source: "early_bird_popup", email: normalizedEmail },
        },
      })
    );

    try {
      const response = await fetch("/api/coupon-code/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          sessionId,
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          source: "early_bird_popup",
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as CouponSendResponse;
        setStartingCode(data.couponCode || EARLY_BIRD_COUPON_CODE);
        setEmailSent(Boolean(data.emailSent));
        setWhatsappLink(data.whatsappLink || "");
      }
    } catch (error) {
      console.error("Failed to send starting code:", error);
    }

    setSubmitted(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setTimeout(() => setOpen(false), 1800);
  };

  const handleWhatsAppCode = () => {
    if (!whatsappLink) return;

    const sessionId = getOrCreateSessionId();
    window.localStorage.setItem(INTENT_STORAGE_KEY, "true");
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "coupon_sent",
          payload: { source: "early_bird_popup", channel: "whatsapp" },
        },
      })
    );
    void fetch("/api/coupon-code-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        channel: "whatsapp",
        eventType: "sent",
        couponCode: startingCode,
        destination: "919559024822",
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
        referrer: typeof document !== "undefined" ? document.referrer : undefined,
        payload: {
          source: "early_bird_popup",
          purpose: "starting_coupon",
        },
      }),
    }).catch((error) => {
      console.error("Failed to capture WhatsApp starting code event:", error);
    });

    window.open(whatsappLink, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? setOpen(true) : handleClose())}>
      <DialogContent className="max-w-md border border-border/60 bg-background/95 p-6 shadow-[0_30px_80px_rgba(15,15,20,0.25)]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-light">
            Early Bird Offer
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Get 10% off your first order - enter your email.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="mt-4 space-y-2 text-sm text-foreground">
            <p>{emailSent ? "Code sent to your email." : "Email not delivered yet. Use WhatsApp to get code now."}</p>
            <p>
              Starting code: <span className="font-semibold tracking-[0.08em]">{startingCode}</span>
            </p>
            {!emailSent ? (
              <button
                type="button"
                onClick={handleWhatsAppCode}
                className="mt-2 w-full bg-emerald-500 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-emerald-600"
              >
                Get Code on WhatsApp
              </button>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border border-border/70 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/60"
              required
            />
            <button
              type="submit"
              className="w-full bg-foreground py-2 text-xs uppercase tracking-[0.28em] text-background"
            >
              Claim 10% Off
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground"
            >
              No thanks
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EarlyBirdPopup;
