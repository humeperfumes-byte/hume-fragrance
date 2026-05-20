"use client";

import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Check, CheckCircle2, ChevronDown } from "lucide-react";
import { cities as indianCityData } from "indian-cities-json";
import { getAllStatesWithDistricts } from "india-state-district";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  calculateCouponDiscount,
  calculateWelcomeBackDiscount,
  getEffectiveWelcomeBackLabel,
  getEffectiveWelcomeBackPercent,
  readWelcomeBackReward,
  type WelcomeBackReward,
} from "@/lib/cart-discounts";
import { persistCustomerAccountFromCheckout } from "@/lib/customer-account";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";
import { isRazorpayAllowedHost } from "@/lib/razorpay-domain";

const CHECKOUT_STORAGE_KEY = "hume_checkout_details_v1";
const CHECKOUT_SESSION_KEY = "hume_checkout_session_id";
const CART_SESSION_KEY = "hume_cart_session_id";
const FIRST_TOUCH_SOURCE_KEY = "hume_first_touch_source";
const APPLIED_COUPON_STORAGE_KEY = "hume_applied_coupon_code";
const LAST_ORDER_SIGNATURE_KEY = "hume_last_order_signature_v1";
const LAST_ORDER_ID_KEY = "hume_last_order_id_v1";
const LAST_ORDER_NUMBER_KEY = "hume_last_order_number_v1";
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE_BELOW_THRESHOLD = 100;
const RAZORPAY_CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
const RAZORPAY_SCRIPT_TIMEOUT_MS = 15000;

let razorpayScriptPromise: Promise<boolean> | null = null;

type CheckoutDetails = {
  fullName: string;
  phone: string;
  alternatePhone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

type FirstTouchSource = {
  source: string;
  category: string;
  referrerHost: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  capturedAt?: string;
};

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  displayInCart?: boolean;
  welcomeBackMode?: string;
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>;
};

type RazorpayCheckout = {
  open: () => void;
  on: (
    event: "payment.failed",
    handler: (response: RazorpayFailureResponse) => void,
  ) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

const defaultDetails: CheckoutDetails = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

const checkoutFieldClassName =
  "h-11 rounded-2xl border-[#e6e8ef] bg-[#fbfbfd] px-4 text-[0.86rem] font-medium text-[#1d1d1f] shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition-colors placeholder:text-[0.82rem] placeholder:font-normal placeholder:text-black/30 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10";

const checkoutTextareaClassName =
  "min-h-[4.75rem] rounded-2xl border-[#e6e8ef] bg-[#fbfbfd] px-4 py-3 text-[0.86rem] font-medium text-[#1d1d1f] shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition-colors placeholder:text-[0.82rem] placeholder:font-normal placeholder:text-black/30 focus-visible:border-blue-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-500/10";

const checkoutLabelClassName =
  "mb-1.5 block text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#a1a4ae]";

const orderButtonClassName = "hume-order-button";
const whatsappButtonClassName =
  "h-12 w-full rounded-full border border-[#8ee6bb] bg-[#eafff4] px-5 font-semibold text-[#07836f] shadow-[0_14px_30px_rgba(7,131,111,0.08)] hover:border-[#6cdaa9] hover:bg-[#ddffed] hover:text-[#057565] disabled:opacity-60";

const checkoutFieldOrder: Array<keyof CheckoutDetails> = [
  "fullName",
  "phone",
  "alternatePhone",
  "email",
  "addressLine1",
  "addressLine2",
  "state",
  "city",
  "pincode",
  "notes",
];

const indianStateOptions = getAllStatesWithDistricts().sort((a, b) =>
  a.name.localeCompare(b.name),
);

const indianStates = indianStateOptions.map((state) => state.name);

const indianDistrictsByState = new Map(
  indianStateOptions.map((state) => [state.name, state.districts]),
);

function normalizeLocationName(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

const stateAliasByNormalizedName = new Map<string, string>();

for (const state of indianStateOptions) {
  stateAliasByNormalizedName.set(normalizeLocationName(state.name), state.name);
}

stateAliasByNormalizedName.set("delhi", "New Delhi");
stateAliasByNormalizedName.set("newdelhi", "New Delhi");
stateAliasByNormalizedName.set(
  "andamanandnicobarislands",
  "Andaman and Nicobar",
);
stateAliasByNormalizedName.set(
  "dadraandnagarhaveli",
  "Dadra and Nagar Haveli and Daman and Diu",
);
stateAliasByNormalizedName.set("himachalpraddesh", "Himachal Pradesh");

function getCitiesForState(stateName: string) {
  const normalizedStateName = normalizeLocationName(stateName);
  const matchingCityNames = indianCityData
    .filter((city) => {
      const cityState =
        stateAliasByNormalizedName.get(normalizeLocationName(city.state)) ??
        city.state;
      return normalizeLocationName(cityState) === normalizedStateName;
    })
    .map((city) => city.name.trim());
  const districtNames = indianDistrictsByState.get(stateName) ?? [];

  return Array.from(
    new Set([...matchingCityNames, ...districtNames].filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

function formatIndianMobileInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#fff"
        d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98c-0.001,0,0,0,0,0h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"
      />
      <path
        fill="#fff"
        d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"
      />
      <path
        fill="#cfd8dc"
        d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974C24.014,42.974,24.014,42.974,24.014,42.974 M24.014,4C24.014,4,24.014,4,24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4L24.014,4z"
      />
      <path
        fill="#40c351"
        d="M35.176,12.832c-2.98-2.982-6.941-4.625-11.157-4.626c-8.704,0-15.783,7.076-15.787,15.774c-0.001,2.981,0.833,5.883,2.413,8.396l0.376,0.597l-1.595,5.821l5.973-1.566l0.577,0.342c2.422,1.438,5.2,2.198,8.032,2.199h0.006c8.698,0,15.777-7.077,15.78-15.776C39.795,19.778,38.156,15.814,35.176,12.832z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M19.268,16.045c-0.355-0.79-0.729-0.806-1.068-0.82c-0.277-0.012-0.593-0.011-0.909-0.011c-0.316,0-0.83,0.119-1.265,0.594c-0.435,0.475-1.661,1.622-1.661,3.956c0,2.334,1.7,4.59,1.937,4.906c0.237,0.316,3.282,5.259,8.104,7.161c4.007,1.58,4.823,1.266,5.693,1.187c0.87-0.079,2.807-1.147,3.202-2.255c0.395-1.108,0.395-2.057,0.277-2.255c-0.119-0.198-0.435-0.316-0.909-0.554s-2.807-1.385-3.242-1.543c-0.435-0.158-0.751-0.237-1.068,0.238c-0.316,0.474-1.225,1.543-1.502,1.859c-0.277,0.317-0.554,0.357-1.028,0.119c-0.474-0.238-2.002-0.738-3.815-2.354c-1.41-1.257-2.362-2.81-2.639-3.285c-0.277-0.474-0.03-0.731,0.208-0.968c0.213-0.213,0.474-0.554,0.712-0.831c0.237-0.277,0.316-0.475,0.474-0.791c0.158-0.317,0.079-0.594-0.04-0.831C20.612,19.329,19.69,16.983,19.268,16.045z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function OrderButtonContent({ processing }: { processing: boolean }) {
  if (processing) {
    return <span className="hume-order-text">Opening Payment...</span>;
  }

  return (
    <>
      <svg
        className="hume-order-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
      <span className="hume-order-text" aria-label="Place Order">
        {"Place Order".split("").map((letter, index) => (
          <span
            key={`${letter || "space"}-${index}`}
            className="hume-order-letter"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </span>
      <svg
        className="hume-order-icon hume-order-icon-right"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    </>
  );
}

function getOrCreateCheckoutSessionId() {
  const existing = window.localStorage.getItem(CHECKOUT_SESSION_KEY);
  if (existing) return existing;
  const cartSession = window.localStorage.getItem(CART_SESSION_KEY);
  if (cartSession) {
    window.localStorage.setItem(CHECKOUT_SESSION_KEY, cartSession);
    return cartSession;
  }
  const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(CHECKOUT_SESSION_KEY, next);
  window.localStorage.setItem(CART_SESSION_KEY, next);
  return next;
}

function getDraftStatus(details: CheckoutDetails) {
  const hasAnyValue = Object.values(details).some(
    (value) => value.trim().length > 0,
  );
  if (!hasAnyValue) return "started" as const;

  const requiredKeys: Array<keyof CheckoutDetails> = [
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "pincode",
  ];

  const isComplete = requiredKeys.every(
    (key) => details[key].trim().length > 0,
  );
  return isComplete ? ("complete" as const) : ("partial" as const);
}

function getFirstTouchSource(): FirstTouchSource | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FIRST_TOUCH_SOURCE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FirstTouchSource;
  } catch (error) {
    console.error("Failed to read first-touch source:", error);
    return null;
  }
}

function createOrderNumber() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `HF-${year}-${suffix}`;
}

function getCheckoutUrl(pathname: string) {
  if (typeof window === "undefined") return pathname;
  return `${window.location.origin}${pathname}`;
}

function isRazorpayAvailableForCurrentHost() {
  if (typeof window === "undefined") return false;
  return isRazorpayAllowedHost(
    window.location.host,
    process.env.NEXT_PUBLIC_RAZORPAY_ALLOWED_HOSTS,
  );
}

function getRazorpayScriptElement() {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLScriptElement>(
    `script[src="${RAZORPAY_CHECKOUT_SCRIPT_SRC}"]`,
  );
}

function loadRazorpayScript({ forceReload = false } = {}) {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (forceReload) {
    razorpayScriptPromise = null;
    getRazorpayScriptElement()?.remove();
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise<boolean>((resolve) => {
    let settled = false;
    let timeoutId: number | null = null;
    let script = getRazorpayScriptElement();

    if (script?.dataset.humeRazorpayStatus === "failed") {
      script.remove();
      script = null;
    }

    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      if (loaded && window.Razorpay) {
        if (script) script.dataset.humeRazorpayStatus = "loaded";
        resolve(true);
        return;
      }

      if (script) {
        script.dataset.humeRazorpayStatus = "failed";
        if (script.dataset.humeRazorpayOwner === "checkout-loader") {
          script.remove();
        }
      }
      razorpayScriptPromise = null;
      resolve(false);
    };

    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.humeRazorpayOwner = "checkout-loader";
      script.dataset.humeRazorpayStatus = "loading";
    }

    script.addEventListener("load", () => finish(Boolean(window.Razorpay)), {
      once: true,
    });
    script.addEventListener("error", () => finish(false), { once: true });

    timeoutId = window.setTimeout(() => finish(false), RAZORPAY_SCRIPT_TIMEOUT_MS);

    if (!script.parentElement) {
      document.body.appendChild(script);
    }
  });

  return razorpayScriptPromise;
}

async function ensureRazorpayScriptLoaded() {
  const loaded = await loadRazorpayScript();
  if (loaded) return true;
  return loadRazorpayScript({ forceReload: true });
}

function waitForButtonPaint() {
  if (typeof window === "undefined") return Promise.resolve();
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

export default function CheckoutClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { items, totalPrice, clearCart } = useCart();
  const checkoutSessionIdRef = useRef<string | null>(null);
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSignatureRef = useRef<string>("");
  const fieldRefs = useRef<
    Partial<Record<keyof CheckoutDetails, HTMLElement | null>>
  >({});
  const didAutoFocusRef = useRef(false);
  const [allCoupons, setAllCoupons] = useState<Coupon[]>([]);
  const [welcomeBackReward, setWelcomeBackReward] =
    useState<WelcomeBackReward | null>(null);
  const [kitOutOfStock, setKitOutOfStock] = useState(false);
  const [kitHoldNotice, setKitHoldNotice] = useState(false);
  const [isRazorpayAvailable, setIsRazorpayAvailable] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isStateListOpen, setIsStateListOpen] = useState(false);
  const [isCityListOpen, setIsCityListOpen] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [showAlternatePhone, setShowAlternatePhone] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails>(() => {
    if (typeof window === "undefined") return defaultDetails;
    try {
      const raw = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (!raw) return defaultDetails;
      const parsed = JSON.parse(raw) as Partial<CheckoutDetails>;
      return { ...defaultDetails, ...parsed };
    } catch (error) {
      console.error("Failed to hydrate checkout details:", error);
      return defaultDetails;
    }
  });

  useEffect(() => {
    const available = isRazorpayAvailableForCurrentHost();
    setIsRazorpayAvailable(available);
    if (available) {
      void loadRazorpayScript();
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/kit-availability", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { outOfStock?: boolean };
      })
      .then((data) => {
        if (active && data) setKitOutOfStock(Boolean(data.outOfStock));
      })
      .catch((error) => {
        console.error("Failed to load kit availability:", error);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify(details),
      );
      const sessionId =
        checkoutSessionIdRef.current ?? getOrCreateCheckoutSessionId();
      checkoutSessionIdRef.current = sessionId;
      persistCustomerAccountFromCheckout(
        window.localStorage,
        sessionId,
        details,
      );
    } catch (error) {
      console.error("Failed to persist checkout details:", error);
    }
  }, [details]);

  useEffect(() => {
    if (details.alternatePhone.trim()) setShowAlternatePhone(true);
  }, [details.alternatePhone]);

  const appliedCouponCode = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage
        .getItem(APPLIED_COUPON_STORAGE_KEY)
        ?.trim()
        .toUpperCase() ?? null
    );
  }, []);
  const appliedCoupon = useMemo(
    () =>
      allCoupons.find(
        (coupon) =>
          coupon.code.toUpperCase() === (appliedCouponCode ?? "").toUpperCase(),
      ) ?? null,
    [allCoupons, appliedCouponCode],
  );
  const couponResult = useMemo(
    () => calculateCouponDiscount(appliedCoupon, items, totalPrice),
    [appliedCoupon, items, totalPrice],
  );
  const couponDiscount = Math.min(totalPrice, couponResult.discount);
  const welcomeBackDiscount = calculateWelcomeBackDiscount(
    welcomeBackReward,
    totalPrice,
    couponDiscount,
    appliedCoupon,
  );
  const effectiveWelcomeBackPercent = getEffectiveWelcomeBackPercent(
    welcomeBackReward,
    appliedCoupon,
  );
  const welcomeBackLabel = getEffectiveWelcomeBackLabel(
    welcomeBackReward,
    appliedCoupon,
  );
  const hasWelcomeBackBenefit = effectiveWelcomeBackPercent > 0;
  const regularShippingFee =
    totalPrice > 0 && totalPrice < FREE_DELIVERY_THRESHOLD
      ? DELIVERY_FEE_BELOW_THRESHOLD
      : 0;
  const shippingFee = hasWelcomeBackBenefit ? 0 : regularShippingFee;
  const shippingSavings = Math.max(0, regularShippingFee - shippingFee);
  const grandTotal =
    Math.max(0, totalPrice - couponDiscount - welcomeBackDiscount) +
    shippingFee;
  const appliedOfferCodes = [appliedCouponCode, hasWelcomeBackBenefit ? welcomeBackReward?.code : null]
    .filter(Boolean)
    .join(" + ");
  const hasKitInCart = items.some(
    (item) =>
      !item.isGift &&
      (Boolean(item.kitSelections?.length) ||
        item.category === "Kit" ||
        item.id.startsWith("kit-")),
  );

  const giftItems = useMemo(() => items.filter((item) => item.isGift), [items]);
  const selectedStateCities = useMemo(
    () => getCitiesForState(details.state),
    [details.state],
  );
  const visibleCityOptions = useMemo(() => {
    const query = citySearchQuery.trim().toLowerCase();
    if (!query) return selectedStateCities;

    return selectedStateCities.filter((city) =>
      city.toLowerCase().includes(query),
    );
  }, [citySearchQuery, selectedStateCities]);
  const typedCityValue = citySearchQuery.trim();
  const hasExactCityMatch = useMemo(() => {
    const normalizedTypedCity = typedCityValue.toLowerCase();
    if (!normalizedTypedCity) return true;
    return selectedStateCities.some(
      (city) => city.toLowerCase() === normalizedTypedCity,
    );
  }, [selectedStateCities, typedCityValue]);
  const setFieldRef =
    (field: keyof CheckoutDetails) => (node: HTMLElement | null) => {
      fieldRefs.current[field] = node;
    };

  const focusField = (field: keyof CheckoutDetails) => {
    window.setTimeout(() => fieldRefs.current[field]?.focus(), 0);
  };

  const focusNextField = (field: keyof CheckoutDetails) => {
    const currentIndex = checkoutFieldOrder.indexOf(field);
    const nextField = checkoutFieldOrder
      .slice(currentIndex + 1)
      .find((candidate) => fieldRefs.current[candidate]);
    if (nextField) focusField(nextField);
  };

  const handleFieldKeyDown =
    (field: keyof CheckoutDetails) =>
    (
      event:
        | KeyboardEvent<HTMLInputElement>
        | KeyboardEvent<HTMLSelectElement>,
    ) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      focusNextField(field);
    };

  useEffect(() => {
    let active = true;
    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/coupons?includeHidden=1");
        if (!response.ok) throw new Error("Failed to fetch coupons");
        const data = (await response.json()) as Coupon[];
        if (active) setAllCoupons(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load checkout coupons:", error);
      }
    };
    loadCoupons();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (didAutoFocusRef.current || items.length === 0) return;
    didAutoFocusRef.current = true;

    const firstEmptyField =
      checkoutFieldOrder.find((field) => !details[field].trim()) ??
      "fullName";

    focusField(firstEmptyField);
  }, [details, items.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reward = readWelcomeBackReward(window.localStorage);
    setWelcomeBackReward(reward);
    if (!reward) return;
    window.dispatchEvent(
      new CustomEvent("hume:tracking", {
        detail: {
          eventType: "coupon_auto_applied",
          payload: {
            couponCode: reward.code,
            rewardLabel: reward.label,
            rewardPercent: reward.percent,
            trigger: "checkout_reward_detected",
            visitCount: reward.visitCount,
            expiresAt: reward.expiresAt,
          },
        },
      }),
    );
  }, []);

  const buildDraftPayload = useCallback(
    (
      lastEditedField?: keyof CheckoutDetails,
      statusOverride?:
        | "started"
        | "partial"
        | "complete"
        | "whatsapp_initiated",
    ) => {
      const firstTouch = getFirstTouchSource();
      return {
        sessionId:
          checkoutSessionIdRef.current ??
          (typeof window !== "undefined"
            ? getOrCreateCheckoutSessionId()
            : "server"),
        status: statusOverride ?? getDraftStatus(details),
        path: getCheckoutUrl(pathname),
        lastEditedField,
        acquisitionSource: firstTouch?.source,
        acquisitionCategory: firstTouch?.category,
        acquisitionReferrerHost: firstTouch?.referrerHost ?? undefined,
        utmSource: firstTouch?.utmSource,
        utmMedium: firstTouch?.utmMedium,
        utmCampaign: firstTouch?.utmCampaign,
        utmTerm: firstTouch?.utmTerm,
        utmContent: firstTouch?.utmContent,
        subtotal: totalPrice,
        shippingFee,
        grandTotal,
        cartSnapshot: items.map((item) => ({
          id: item.id,
          name: item.name,
          inspiration: item.inspiration,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          isGift: item.isGift,
          kitSelections: item.kitSelections,
        })),
        details,
      };
    },
    [details, grandTotal, items, pathname, shippingFee, totalPrice],
  );

  const persistDraft = useCallback(
    async (
      lastEditedField?: keyof CheckoutDetails,
      statusOverride?:
        | "started"
        | "partial"
        | "complete"
        | "whatsapp_initiated",
      force = false,
    ) => {
      if (typeof window === "undefined") return;

      if (!checkoutSessionIdRef.current) {
        checkoutSessionIdRef.current = getOrCreateCheckoutSessionId();
      }

      const payload = buildDraftPayload(lastEditedField, statusOverride);
      const signature = JSON.stringify(payload);

      if (!force && signature === lastSavedSignatureRef.current) return;

      try {
        const response = await fetch("/api/checkout-drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          lastSavedSignatureRef.current = signature;
        }
      } catch (error) {
        console.error("Checkout draft save failed:", error);
      }
    },
    [buildDraftPayload],
  );

  const updateField = (field: keyof CheckoutDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  };

  const updateState = (state: string) => {
    setDetails((prev) => ({
      ...prev,
      state,
      city:
        state && getCitiesForState(state).includes(prev.city)
          ? prev.city
          : "",
    }));
    setIsCityListOpen(false);
    setCitySearchQuery("");
  };

  const handleFieldBlur = (field: keyof CheckoutDetails) => {
    void persistDraft(field, undefined, true);
  };

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    if (!checkoutSessionIdRef.current) {
      checkoutSessionIdRef.current = getOrCreateCheckoutSessionId();
    }

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(() => {
      void persistDraft();
    }, 700);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, [details, items, persistDraft, totalPrice, shippingFee, grandTotal]);

  useEffect(() => {
    if (typeof window === "undefined" || items.length === 0) return;

    const flushDraft = () => {
      void persistDraft(undefined, undefined, true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushDraft();
      }
    };

    window.addEventListener("pagehide", flushDraft);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushDraft);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [items.length, persistDraft]);

  const validate = () => {
    const requiredFields: Array<{ key: keyof CheckoutDetails; label: string }> =
      [
        { key: "fullName", label: "Full name" },
        { key: "phone", label: "Phone number" },
        { key: "addressLine1", label: "Address line 1" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "pincode", label: "Pincode" },
      ];

    const missing = requiredFields.find(({ key }) => !details[key].trim());
    if (missing) {
      toast({
        title: `${missing.label} is required`,
        description:
          "Please complete all required order details before continuing.",
      });
      return false;
    }

    const phoneDigits = details.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast({
        title: "Enter a valid phone number",
        description:
          "A 10 digit mobile number works best for order confirmation.",
      });
      return false;
    }

    const pincodeDigits = details.pincode.replace(/\D/g, "");
    if (pincodeDigits.length < 6) {
      toast({
        title: "Enter a valid pincode",
        description: "Please add a valid delivery pincode.",
      });
      return false;
    }

    return true;
  };

  const buildOrderMessage = () => {
    const itemLines = items
      .map((item) => {
        const linePrice = item.isGift
          ? "FREE"
          : formatINR(item.price * item.quantity);
        if (item.isGift) {
          return `* ${item.name} [FREE GIFT] x${item.quantity} - ${linePrice}`;
        }
        return `* ${item.name} (${item.size ?? "50ml"}, Inspired by ${item.inspiration}) x${item.quantity} - ${linePrice}`;
      })
      .join("\n");

    const addressBlock = [
      details.addressLine1.trim(),
      details.addressLine2.trim(),
      `${details.city.trim()}, ${details.state.trim()} ${details.pincode.trim()}`.trim(),
    ]
      .filter(Boolean)
      .join(", ");

    return [
      "Hello HUME Fragrance",
      "",
      "I want to place this order:",
      "",
      itemLines,
      "",
      `Subtotal: ${formatINR(totalPrice)}`,
      couponDiscount > 0
        ? `Coupon Discount (${appliedCouponCode}): -${formatINR(couponDiscount)}`
        : null,
      welcomeBackLabel && welcomeBackDiscount > 0
        ? `${welcomeBackLabel}: -${formatINR(welcomeBackDiscount)}`
        : null,
      `Delivery: ${shippingFee === 0 ? "FREE" : formatINR(shippingFee)}`,
      `Grand Total: ${formatINR(grandTotal)}`,
      appliedOfferCodes ? `Offer Codes: ${appliedOfferCodes}` : null,
      giftItems.length > 0
        ? `Free Gifts: ${giftItems.map((item) => item.name).join(", ")}`
        : null,
      "",
      "Customer details:",
      `Name: ${details.fullName.trim()}`,
      `Phone: ${details.phone.trim()}`,
      details.alternatePhone.trim()
        ? `Alternative phone: ${details.alternatePhone.trim()}`
        : null,
      details.email.trim() ? `Email: ${details.email.trim()}` : null,
      `Address: ${addressBlock}`,
      details.notes.trim() ? `Order notes: ${details.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const getOrderIdentity = () => {
    const signature = JSON.stringify({
      details,
      items: items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        isGift: item.isGift,
        kitSelections: item.kitSelections,
      })),
      subtotal: totalPrice,
      couponDiscount,
      welcomeBackDiscount,
      shippingSavings,
      shippingFee,
      grandTotal,
      appliedOfferCodes,
    });

    const previousSignature = window.localStorage.getItem(
      LAST_ORDER_SIGNATURE_KEY,
    );
    const previousOrderId = window.localStorage.getItem(LAST_ORDER_ID_KEY);
    const previousOrderNumber = window.localStorage.getItem(
      LAST_ORDER_NUMBER_KEY,
    );

    if (
      previousSignature === signature &&
      previousOrderId &&
      previousOrderNumber
    ) {
      return {
        id: previousOrderId,
        orderNumber: previousOrderNumber,
        signature,
      };
    }

    const nextId = crypto.randomUUID();
    const nextOrderNumber = createOrderNumber();
    window.localStorage.setItem(LAST_ORDER_SIGNATURE_KEY, signature);
    window.localStorage.setItem(LAST_ORDER_ID_KEY, nextId);
    window.localStorage.setItem(LAST_ORDER_NUMBER_KEY, nextOrderNumber);

    return { id: nextId, orderNumber: nextOrderNumber, signature };
  };

  const persistOrder = async ({
    checkoutChannel,
    paymentMethod,
    status,
    orderMessage,
  }: {
    checkoutChannel: "whatsapp" | "razorpay";
    paymentMethod: string;
    status:
      | "whatsapp_initiated"
      | "payment_pending"
      | "payment_authorized"
      | "payment_failed"
      | "processing";
    orderMessage: string;
  }) => {
    if (typeof window === "undefined") return false;

    const firstTouch = getFirstTouchSource();
    const sessionId =
      checkoutSessionIdRef.current ?? getOrCreateCheckoutSessionId();
    const identity = getOrderIdentity();

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          id: identity.id,
          orderNumber: identity.orderNumber,
          sessionId,
          status,
          checkoutChannel,
          paymentMethod,
          shippingMethod:
            shippingFee === 0 ? "Free Delivery" : "Standard Shipping",
          path: getCheckoutUrl(pathname),
          acquisitionSource: firstTouch?.source,
          acquisitionCategory: firstTouch?.category,
          acquisitionReferrerHost: firstTouch?.referrerHost ?? undefined,
          utmSource: firstTouch?.utmSource,
          utmMedium: firstTouch?.utmMedium,
          utmCampaign: firstTouch?.utmCampaign,
          utmTerm: firstTouch?.utmTerm,
          utmContent: firstTouch?.utmContent,
          appliedCouponCode: appliedOfferCodes || undefined,
          subtotal: totalPrice,
          couponDiscount,
          welcomeBackDiscount,
          shippingSavings,
          shippingFee,
          grandTotal,
          whatsappMessage: orderMessage,
          cartSnapshot: items.map((item) => ({
            id: item.id,
            name: item.name,
            inspiration: item.inspiration,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            isGift: item.isGift,
            kitSelections: item.kitSelections,
          })),
          giftItems: giftItems.map((item) => item.name),
          details,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Order save failed:", error);
      return false;
    }
  };

  const ensureCartAvailability = async () => {
    const stockItems = items
      .filter((item) => !item.isGift)
      .flatMap((item) => {
        if (item.kitSelections?.length) {
          return item.kitSelections.map((selection) => ({
            id: selection.id,
            quantity: 1,
          }));
        }

        if (item.category === "Kit" || item.id.startsWith("kit-")) {
          return [];
        }

        return [{ id: item.id, quantity: item.quantity }];
      });
    if (stockItems.length === 0) return true;

    try {
      const response = await fetch("/api/products/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: stockItems }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        issues?: Array<{ message?: string }>;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        const firstIssue = data.issues?.[0]?.message;
        toast({
          title: firstIssue || data.error || "A cart item is unavailable",
          description: "Please remove it from your bag or ask us on WhatsApp.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Availability check failed:", error);
      toast({
        title: "Stock check failed",
        description: "Please retry before placing the order.",
        variant: "destructive",
      });
      return false;
    }
  };

  const holdKitLeadIfUnavailable = async () => {
    if (!hasKitInCart || !kitOutOfStock) return false;

    setIsPaymentProcessing(true);
    try {
      await persistDraft(undefined, "complete", true);
      setKitHoldNotice(true);
      window.dispatchEvent(
        new CustomEvent("hume:tracking", {
          detail: {
            eventType: "kit_out_of_stock_lead",
            payload: {
              subtotal: totalPrice,
              grandTotal,
              itemCount: items.length,
            },
          },
        }),
      );
      toast({
        title: "Kit request received",
        description: "The kit is currently out of stock. We saved your details and will connect with you soon.",
      });
      return true;
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!isRazorpayAvailable) {
      toast({
        title: "Online payment is not available here",
        description: "Please place this order through WhatsApp checkout.",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add a product before placing an order.",
      });
      showNavigationLoadingToast();
      router.push("/shop");
      return;
    }

    setIsPaymentProcessing(true);
    await waitForButtonPaint();

    if (!validate()) {
      setIsPaymentProcessing(false);
      return;
    }

    if (!(await ensureCartAvailability())) {
      setIsPaymentProcessing(false);
      return;
    }

    if (await holdKitLeadIfUnavailable()) return;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!keyId) {
      toast({
        title: "Payment is not configured",
        description: "Razorpay key is missing. Please try WhatsApp checkout.",
        variant: "destructive",
      });
      setIsPaymentProcessing(false);
      return;
    }

    try {
      const scriptLoadPromise = ensureRazorpayScriptLoaded();
      await persistDraft(undefined, "complete", true);

      const scriptLoaded = await scriptLoadPromise;
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please retry or use WhatsApp checkout.",
        );
      }

      const identity = getOrderIdentity();
      const sessionId =
        checkoutSessionIdRef.current ?? getOrCreateCheckoutSessionId();
      const amount = Math.max(100, Math.round(grandTotal * 100));
      const createOrderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          receipt: identity.orderNumber.slice(0, 40),
          notes: {
            humeOrderId: identity.id,
            humeOrderNumber: identity.orderNumber,
            checkoutSessionId: sessionId,
            checkoutUrl: getCheckoutUrl(pathname),
          },
        }),
      });

      const orderData = (await createOrderResponse.json()) as {
        order_id?: string;
        amount?: number;
        currency?: string;
        error?: string;
      };

      if (!createOrderResponse.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Unable to create payment order.");
      }

      await persistOrder({
        checkoutChannel: "razorpay",
        paymentMethod: "Razorpay Online Payment",
        status: "payment_pending",
        orderMessage: [
          buildOrderMessage(),
          "",
          "Payment details:",
          `Razorpay Order ID: ${orderData.order_id}`,
          "Payment Status: Awaiting Razorpay confirmation",
        ].join("\n"),
      });

      const razorpay = new window.Razorpay({
        key: keyId,
        amount: Number(orderData.amount ?? amount),
        currency: orderData.currency ?? "INR",
        name: "HUME Fragrance",
        description: `Order ${identity.orderNumber}`,
        image: `${window.location.origin}/icon.png`,
        order_id: orderData.order_id,
        prefill: {
          name: details.fullName.trim(),
          email: details.email.trim(),
          contact: details.phone.trim(),
        },
        notes: {
          humeOrderNumber: identity.orderNumber,
          humeOrderId: identity.id,
          checkoutUrl: getCheckoutUrl(pathname),
        },
        theme: {
          color: "#171717",
        },
        modal: {
          ondismiss: () => {
            setIsPaymentProcessing(false);
            toast({
              title: "Payment cancelled",
              description: "You can retry online payment or use WhatsApp checkout.",
            });
          },
        },
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });

            const verifyData = (await verifyResponse.json()) as {
              success?: boolean;
              error?: string;
            };

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            const paymentMessage = [
              buildOrderMessage(),
              "",
              "Payment details:",
              `Razorpay Order ID: ${response.razorpay_order_id}`,
              `Razorpay Payment ID: ${response.razorpay_payment_id}`,
              "Payment Status: Verified",
            ].join("\n");

            const orderSaved = await persistOrder({
              checkoutChannel: "razorpay",
              paymentMethod: "Razorpay Online Payment",
              status: "processing",
              orderMessage: paymentMessage,
            });

            await persistDraft(undefined, "complete", true);

            toast({
              title: "Payment successful",
              description: orderSaved
                ? "Your paid order has been saved for processing."
                : "Payment verified, but the local order record could not be saved.",
            });
            clearCart();
            showNavigationLoadingToast();
            router.push(
              `/order-success?order=${encodeURIComponent(identity.orderNumber)}&channel=razorpay`,
            );
          } catch (error) {
            toast({
              title: "Payment verification failed",
              description:
                error instanceof Error ? error.message : "Please contact HUME support.",
              variant: "destructive",
            });
          } finally {
            setIsPaymentProcessing(false);
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        setIsPaymentProcessing(false);
        toast({
          title: "Payment failed",
          description:
            response.error?.description ||
            response.error?.reason ||
            "The payment could not be completed.",
          variant: "destructive",
        });
      });

      razorpay.open();
    } catch (error) {
      setIsPaymentProcessing(false);
      toast({
        title: "Payment could not start",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) {
      toast({
        title: "Your cart is empty",
        description: "Add a product before placing an order.",
      });
      showNavigationLoadingToast();
      router.push("/shop");
      return;
    }

    if (!validate()) return;
    if (!(await ensureCartAvailability())) return;
    if (await holdKitLeadIfUnavailable()) return;

    const identity = getOrderIdentity();
    const whatsappMessage = buildOrderMessage();
    await persistDraft(undefined, "whatsapp_initiated", true);
    const orderSaved = await persistOrder({
      checkoutChannel: "whatsapp",
      paymentMethod: "WhatsApp Confirmation",
      status: "whatsapp_initiated",
      orderMessage: whatsappMessage,
    });

    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/919559024822?text=${encodedMessage}`, "_blank");

    if (appliedOfferCodes) {
      const sessionId =
        checkoutSessionIdRef.current ?? getOrCreateCheckoutSessionId();
      void fetch("/api/coupon-code-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          sessionId,
          channel: "whatsapp",
          eventType: "sent",
          couponCode: appliedOfferCodes,
          destination: "919559024822",
          path: pathname,
          referrer:
            typeof document !== "undefined" ? document.referrer : undefined,
          payload: {
            subtotal: totalPrice,
            shippingFee,
            grandTotal,
            itemCount: items.length,
          },
        }),
      }).catch((error) => {
        console.error("Failed to capture WhatsApp coupon event:", error);
      });
    }

    toast({
      title: "Opening WhatsApp",
      description: orderSaved
        ? "Your order details have been saved and prefilled for WhatsApp."
        : "WhatsApp opened, but the order record could not be saved this time.",
    });
    showNavigationLoadingToast();
    router.push(
      `/order-success?order=${encodeURIComponent(identity.orderNumber)}&channel=whatsapp`,
    );
  };

  if (items.length === 0) {
    return (
      <section className="pt-28 pb-20">
        <div className="container-luxury">
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-border bg-card/95 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
            <p className="text-caption text-muted-foreground mb-3">Checkout</p>
            <h1 className="font-serif text-4xl mb-4">Your bag is empty</h1>
            <p className="text-body text-muted-foreground mb-6">
              Add a fragrance to continue with checkout.
            </p>
            <Button
              onClick={() => {
                showNavigationLoadingToast();
                router.push("/shop");
              }}
              className="h-11 px-6"
            >
              Explore Fragrances
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f7f8] pb-12 pt-20 text-[#171717] md:pb-16 md:pt-24">
      <div className="container-luxury">
        <div className="mb-4 flex items-center gap-3 md:mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-black/75 transition-colors hover:bg-black/[0.04]"
            aria-label="Go back"
          >
            &larr;
          </button>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Checkout
          </h1>
        </div>

        <div className="mx-auto mb-4 max-w-3xl overflow-hidden rounded-2xl border border-border bg-secondary/20 shadow-[0_14px_38px_rgba(0,0,0,0.05)] md:mb-6">
          <div className="relative aspect-[16/7] w-full sm:aspect-[16/6]">
            <Image
              src="/images/perfume-packaging.png"
              alt="HUME Fragrance perfume packaging"
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(330px,380px)] lg:gap-8">
          <div className="rounded-[1.35rem] border border-[#ececf2] bg-white p-4 shadow-[0_18px_50px_rgba(20,20,30,0.06)] md:p-6">
            <div className="space-y-4 md:space-y-7">
              <div>
                <p className="mb-3 text-[0.92rem] font-semibold text-black md:mb-5">
                  1. Contact Information
                </p>
                <div className="grid gap-x-4 gap-y-2.5 md:grid-cols-2 md:gap-y-4">
                  <div className="md:col-span-2">
                    <label className={checkoutLabelClassName}>Full Name</label>
                    <Input
                      ref={setFieldRef("fullName")}
                      value={details.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      onBlur={() => handleFieldBlur("fullName")}
                      onKeyDown={handleFieldKeyDown("fullName")}
                      placeholder="Priyanshu Choudary"
                      autoComplete="name"
                      className={checkoutFieldClassName}
                    />
                  </div>
                  <div>
                    <label className={checkoutLabelClassName}>Phone</label>
                    <div className="flex h-11 overflow-hidden rounded-2xl border border-[#e6e8ef] bg-[#fbfbfd] shadow-[0_8px_22px_rgba(15,23,42,0.035)] transition-colors focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10">
                      <div className="flex items-center gap-1.5 border-r border-[#ececf2] px-3 text-[0.8rem] font-semibold text-[#1d1d1f]">
                        <span>IN</span>
                        <span className="text-black/35">+91</span>
                      </div>
                      <Input
                        ref={setFieldRef("phone")}
                        value={details.phone}
                        onChange={(e) =>
                          updateField(
                            "phone",
                            formatIndianMobileInput(e.target.value),
                          )
                        }
                        onBlur={() => handleFieldBlur("phone")}
                        onKeyDown={handleFieldKeyDown("phone")}
                        placeholder="79003-47512"
                        inputMode="tel"
                        autoComplete="tel-national"
                        className="h-full flex-1 rounded-none border-0 bg-transparent px-3 text-[0.82rem] font-medium shadow-none focus-visible:ring-0"
                      />
                      {details.phone.replace(/\D/g, "").length >= 10 ? (
                        <div className="flex items-center pr-3 text-[#4bc43f]">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      ) : null}
                    </div>
                    {showAlternatePhone ? (
                      <div className="mt-1.5">
                        <label className={checkoutLabelClassName}>
                          Alternative Mobile No.
                        </label>
                        <Input
                          ref={setFieldRef("alternatePhone")}
                          value={details.alternatePhone}
                          onChange={(e) =>
                            updateField(
                              "alternatePhone",
                              formatIndianMobileInput(e.target.value),
                            )
                          }
                          onBlur={() => handleFieldBlur("alternatePhone")}
                          onKeyDown={handleFieldKeyDown("alternatePhone")}
                          placeholder="98765-43210"
                          inputMode="tel"
                          autoComplete="tel"
                          className={checkoutFieldClassName}
                        />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAlternatePhone(true);
                          focusField("alternatePhone");
                        }}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-[0.68rem] font-medium text-blue-600 transition-colors hover:text-blue-700"
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[0.7rem] leading-none text-white shadow-[0_3px_8px_rgba(37,99,235,0.22)]">
                          +
                        </span>
                        add alternative mob. no.
                      </button>
                    )}
                  </div>
                  <div>
                    <label className={checkoutLabelClassName}>E-mail</label>
                    <Input
                      ref={setFieldRef("email")}
                      value={details.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email")}
                      onKeyDown={handleFieldKeyDown("email")}
                      placeholder="priyanshu212@gmail.com"
                      inputMode="email"
                      autoComplete="email"
                      className={checkoutFieldClassName}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[0.92rem] font-semibold text-black md:mb-5">
                  2. Delivery Details
                </p>
                <div className="grid gap-x-4 gap-y-2.5 md:grid-cols-6 md:gap-y-4">
                  <div className="relative md:col-span-2">
                    <label className={checkoutLabelClassName}>State</label>
                    <button
                      type="button"
                      ref={setFieldRef("state")}
                      onClick={() => setIsStateListOpen((open) => !open)}
                      onBlur={() => handleFieldBlur("state")}
                      className={`${checkoutFieldClassName} group flex w-full items-center justify-between border py-0 pr-1 text-left`}
                      aria-expanded={isStateListOpen}
                      aria-haspopup="listbox"
                    >
                      <span
                        className={
                          details.state ? "truncate" : "truncate text-black/36"
                        }
                      >
                        {details.state || "Select state"}
                      </span>
                      <span className="flex h-[calc(100%-0.5rem)] w-10 shrink-0 items-center justify-center border-l border-black/10 bg-transparent text-black/45 transition-colors group-hover:bg-black/[0.02]">
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isStateListOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>
                    {isStateListOpen ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-[12.5rem] overflow-hidden rounded-xl border border-[#e6e8ef] bg-white p-1 shadow-[0_18px_42px_rgba(15,23,42,0.13)]">
                        <div className="max-h-[11.8rem] overflow-y-auto pr-1">
                          {indianStates.map((state) => (
                            <button
                              key={state}
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                updateState(state);
                                setIsStateListOpen(false);
                                focusField("city");
                              }}
                              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[0.78rem] font-medium transition-colors ${
                                details.state === state
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-[#1d1d1f] hover:bg-[#f5f6f8]"
                              }`}
                              role="option"
                              aria-selected={details.state === state}
                            >
                              <span>{state}</span>
                              {details.state === state ? (
                                <Check className="h-4 w-4" />
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="relative md:col-span-2">
                    <label className={checkoutLabelClassName}>City</label>
                    <Input
                      ref={setFieldRef("city")}
                      value={details.city}
                      onFocus={() => {
                        if (!details.state) return;
                        setCitySearchQuery("");
                        setIsCityListOpen(true);
                      }}
                      onChange={(event) => {
                        updateField("city", event.target.value);
                        setCitySearchQuery(event.target.value);
                        if (details.state) setIsCityListOpen(true);
                      }}
                      onBlur={() => handleFieldBlur("city")}
                      onKeyDown={handleFieldKeyDown("city")}
                      disabled={!details.state}
                      placeholder={details.state ? "Search city" : "Select state first"}
                      autoComplete="off"
                      className={`${checkoutFieldClassName} border pr-14 disabled:cursor-not-allowed disabled:opacity-70`}
                      aria-expanded={isCityListOpen}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!details.state) return;
                        setCitySearchQuery("");
                        setIsCityListOpen((open) => !open);
                      }}
                      className="absolute bottom-1 right-1 top-[1.62rem] flex w-10 items-center justify-center border-l border-black/10 bg-transparent text-black/45 transition-colors hover:bg-black/[0.02]"
                      aria-label="Open city list"
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-black/35 transition-transform ${
                          isCityListOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isCityListOpen ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 max-h-[13rem] overflow-hidden rounded-xl border border-[#e6e8ef] bg-white p-1 shadow-[0_18px_42px_rgba(15,23,42,0.13)]">
                        <div className="border-b border-[#edf0f4] p-1">
                          <Input
                            value={citySearchQuery}
                            onMouseDown={(event) => event.stopPropagation()}
                            onChange={(event) => {
                              const nextCity = event.target.value;
                              setCitySearchQuery(nextCity);
                              updateField("city", nextCity);
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter") return;
                              event.preventDefault();
                              const nextCity = citySearchQuery.trim();
                              if (!nextCity) return;
                              updateField("city", nextCity);
                              setIsCityListOpen(false);
                              setCitySearchQuery("");
                              focusField("pincode");
                            }}
                            placeholder="Type city, village, or locality"
                            autoFocus
                            className="h-8 rounded-lg border-[#dfe4ec] bg-[#f8fafc] px-2.5 text-[0.8rem] shadow-none focus-visible:ring-2 focus-visible:ring-blue-300"
                          />
                          <p className="mt-0.5 px-1 text-[0.46rem] font-medium uppercase leading-tight tracking-[0.04em] text-black/30">
                            Type village/locality manually
                          </p>
                        </div>
                        <div className="max-h-[8.8rem] overflow-y-auto pr-1 pt-1">
                          {typedCityValue && !hasExactCityMatch ? (
                            <button
                              type="button"
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => {
                                updateField("city", typedCityValue);
                                setCitySearchQuery("");
                                setIsCityListOpen(false);
                                focusField("pincode");
                              }}
                              className="mb-1 flex w-full items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-left text-[0.78rem] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                            >
                              <span className="truncate">Use &quot;{typedCityValue}&quot;</span>
                              <Check className="h-4 w-4" />
                            </button>
                          ) : null}
                          {visibleCityOptions.length > 0 ? (
                            visibleCityOptions.map((city) => (
                              <button
                                key={city}
                                type="button"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  updateField("city", city);
                                  setCitySearchQuery("");
                                  setIsCityListOpen(false);
                                  focusField("pincode");
                                }}
                                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[0.78rem] font-medium transition-colors ${
                                  details.city === city
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-[#1d1d1f] hover:bg-[#f5f6f8]"
                                }`}
                                role="option"
                                aria-selected={details.city === city}
                              >
                                <span>{city}</span>
                                {details.city === city ? (
                                  <Check className="h-4 w-4" />
                                ) : null}
                              </button>
                            ))
                          ) : (
                            <p className="px-2.5 py-2 text-[0.76rem] text-black/45">
                              No matching city. You can type it manually.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="md:col-span-2">
                    <label className={checkoutLabelClassName}>Pincode</label>
                    <Input
                      ref={setFieldRef("pincode")}
                      value={details.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      onBlur={() => handleFieldBlur("pincode")}
                      onKeyDown={handleFieldKeyDown("pincode")}
                      placeholder="400121"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      className={checkoutFieldClassName}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={checkoutLabelClassName}>Address</label>
                    <Input
                      ref={setFieldRef("addressLine1")}
                      value={details.addressLine1}
                      onChange={(e) =>
                        updateField("addressLine1", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("addressLine1")}
                      onKeyDown={handleFieldKeyDown("addressLine1")}
                      placeholder="Flat 402, Shree Heights, Andheri East"
                      autoComplete="address-line1"
                      className={checkoutFieldClassName}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={checkoutLabelClassName}>Landmark</label>
                    <Input
                      ref={setFieldRef("addressLine2")}
                      value={details.addressLine2}
                      onChange={(e) =>
                        updateField("addressLine2", e.target.value)
                      }
                      onBlur={() => handleFieldBlur("addressLine2")}
                      onKeyDown={handleFieldKeyDown("addressLine2")}
                      placeholder="Near metro station, opposite mall"
                      autoComplete="address-line2"
                      className={checkoutFieldClassName}
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className={checkoutLabelClassName}>Order Notes</label>
                    <Textarea
                      ref={setFieldRef("notes")}
                      value={details.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      onBlur={() => handleFieldBlur("notes")}
                      placeholder="Gift note, alternate phone number, or delivery instruction."
                      className={checkoutTextareaClassName}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:hidden">
              {kitHoldNotice ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <p className="font-semibold">Kit request saved</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
                    The kit is currently out of stock. We have your details and will connect with you soon.
                  </p>
                </div>
              ) : null}
              {isRazorpayAvailable ? (
                <Button
                  onClick={handleRazorpayPayment}
                  disabled={isPaymentProcessing}
                  className={orderButtonClassName}
                >
                  <OrderButtonContent processing={isPaymentProcessing} />
                </Button>
              ) : null}
              <Button
                onClick={handleWhatsAppOrder}
                disabled={isPaymentProcessing}
                className={whatsappButtonClassName}
              >
                <WhatsAppIcon className="mr-3 h-11 w-11 scale-150" />
                Order via WhatsApp
              </Button>
            </div>
          </div>

          <div className="h-fit rounded-[1.35rem] border border-[#ececf2] bg-white p-4 shadow-[0_24px_70px_rgba(20,20,30,0.08)] md:sticky md:top-24">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">Order</h2>
              </div>
              <span className="rounded-full bg-[#f4f4f6] px-2.5 py-1 text-xs text-black/45">
                {items.length} items
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b border-[#ececf2] pb-4"
                >
                  <div
                    className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ${item.isGift ? "bg-white p-2" : "bg-[#f4f4f6]"}`}
                  >
                    <ImageWithFallback
                      src={withCloudinaryTransforms(
                        item.image || "/images/logo.png",
                        { width: 160 },
                      )}
                      fallbackSrc="/images/logo.png"
                      alt={item.name}
                      fill
                      sizes="80px"
                      className={
                        item.isGift ? "object-contain" : "object-cover"
                      }
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-tight">
                      {item.name}
                    </p>
                    {!item.isGift ? (
                      <p className="mt-1 line-clamp-1 text-xs italic text-black/45">
                        Inspired by {item.inspiration}
                      </p>
                    ) : null}
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-black/45">
                        Qty {item.quantity}
                        {!item.isGift && item.size ? ` - ${item.size}` : ""}
                      </span>
                      <span
                        className={
                          item.isGift
                            ? "font-semibold text-emerald-600"
                            : "font-semibold"
                        }
                      >
                        {item.isGift
                          ? "FREE"
                          : formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[#f7f7f8] p-4">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-black/35">
                Billing Snapshot
              </p>
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-black/45">Subtotal</span>
                  <span>{formatINR(totalPrice)}</span>
                </div>
                {couponDiscount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-black/45">
                      Coupon ({appliedCouponCode})
                    </span>
                    <span className="text-emerald-600">
                      -{formatINR(couponDiscount)}
                    </span>
                  </div>
                ) : null}
                {welcomeBackLabel && welcomeBackDiscount > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-black/45">
                      {welcomeBackLabel}
                    </span>
                    <span className="text-emerald-600">
                      -{formatINR(welcomeBackDiscount)}
                    </span>
                  </div>
                ) : null}
                {shippingSavings > 0 ? (
                  <div className="flex items-center justify-between">
                    <span className="text-black/45">
                      {welcomeBackReward
                        ? "Welcome back free delivery"
                        : "Free delivery unlocked"}
                    </span>
                    <span className="text-emerald-600">
                      -{formatINR(shippingSavings)}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-black/45">Delivery</span>
                  <span className={shippingFee === 0 ? "text-emerald-600" : ""}>
                    {shippingFee === 0 ? "FREE" : formatINR(shippingFee)}
                  </span>
                </div>
                {shippingFee > 0 ? (
                  <p className="text-xs text-black/40">
                    Shop above {formatINR(FREE_DELIVERY_THRESHOLD)} for free
                    delivery.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-[#f7f7f8] px-4 py-3 text-xs">
                <span className="text-black/45">Payment</span>
                <span className="font-medium text-black/75">
                  {isRazorpayAvailable ? "Online or WhatsApp" : "WhatsApp"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-[#ececf2] pt-4 text-base font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatINR(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-5 hidden flex-col gap-4 lg:flex">
              {kitHoldNotice ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <p className="font-semibold">Kit request saved</p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-900/75">
                    The kit is currently out of stock. We have your details and will connect with you soon.
                  </p>
                </div>
              ) : null}
              {isRazorpayAvailable ? (
                <Button
                  onClick={handleRazorpayPayment}
                  disabled={isPaymentProcessing}
                  className={orderButtonClassName}
                >
                  <OrderButtonContent processing={isPaymentProcessing} />
                </Button>
              ) : null}
              <Button
                onClick={handleWhatsAppOrder}
                disabled={isPaymentProcessing}
                className={whatsappButtonClassName}
              >
                <WhatsAppIcon className="mr-3 h-11 w-11 scale-150" />
                Order via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 hidden gap-3 md:grid md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
              Secure Checkout
            </p>
            <p className="mt-2 text-sm text-foreground">
              {isRazorpayAvailable
                ? "Pay securely online with Razorpay or keep WhatsApp confirmation as backup."
                : "Place the order on WhatsApp and we will confirm payment and dispatch details."}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
              Fast Dispatch
            </p>
            <p className="mt-2 text-sm text-foreground">
              Ready stock orders are usually prepared within 24 hours.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-center">
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-muted-foreground">
              Made By HUME
            </p>
            <p className="mt-2 text-sm text-foreground">
              Filled and packed in our own manufacturing facility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
