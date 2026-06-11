"use client";

import { motion } from "framer-motion";
import { Bell, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import type { PerfumeData } from "@/data/perfumes";
import { formatINR } from "@/lib/currency";
import { DISCOVERY_SET_PATH, isDiscoverySetProductId } from "@/lib/discovery-set";

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#fff"
        d="M4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303z"
      />
      <path
        fill="#fff"
        d="M4.868,43.803c-0.132,0-0.26-0.052-0.355-0.148c-0.125-0.127-0.174-0.312-0.127-0.483l2.639-9.636c-1.636-2.906-2.499-6.206-2.497-9.556C4.532,13.238,13.273,4.5,24.014,4.5c5.21,0.002,10.105,2.031,13.784,5.713c3.679,3.683,5.704,8.577,5.702,13.781c-0.004,10.741-8.746,19.48-19.486,19.48c-3.189-0.001-6.344-0.788-9.144-2.277l-9.875,2.589C4.953,43.798,4.911,43.803,4.868,43.803z"
      />
      <path
        fill="#cfd8dc"
        d="M24.014,5c5.079,0.002,9.845,1.979,13.43,5.566c3.584,3.588,5.558,8.356,5.556,13.428c-0.004,10.465-8.522,18.98-18.986,18.98h-0.008c-3.177-0.001-6.3-0.798-9.073-2.311L4.868,43.303l2.694-9.835C5.9,30.59,5.026,27.324,5.027,23.979C5.032,13.514,13.548,5,24.014,5 M24.014,4C12.998,4,4.032,12.962,4.027,23.979c-0.001,3.367,0.849,6.685,2.461,9.622l-2.585,9.439c-0.094,0.345,0.002,0.713,0.254,0.967c0.19,0.192,0.447,0.297,0.711,0.297c0.085,0,0.17-0.011,0.254-0.033l9.687-2.54c2.828,1.468,5.998,2.243,9.197,2.244c11.024,0,19.99-8.963,19.995-19.98c0.002-5.339-2.075-10.359-5.848-14.135C34.378,6.083,29.357,4.002,24.014,4z"
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

export default function ProductDetailClient({
  perfume,
  priceLabel,
}: {
  perfume: PerfumeData;
  priceLabel?: string;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const isComingSoon = Boolean(perfume.badges?.comingSoon);
  const isSoldOut = Boolean(perfume.badges?.soldOut);
  const isUnavailable = isComingSoon || isSoldOut;
  const isDiscoverySet = isDiscoverySetProductId(perfume.id);
  const isRoseWater = perfume.categoryId === "rose-water";
  const isKapoorCarFragrance = perfume.categoryId === "car-fragrance";
  const [notifyContact, setNotifyContact] = useState("");
  const [isNotifySaving, setIsNotifySaving] = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);
  const productDescriptor = perfume.inspirationBrand?.trim()
    ? `${perfume.name} (${perfume.size}) inspired by ${perfume.inspirationBrand} ${perfume.inspiration}`
    : `${perfume.name} (${perfume.size})`;
  const whatsappMessage = encodeURIComponent(
    isComingSoon
      ? `Hello HUME Fragrance, I am interested in ${perfume.name} (${perfume.size}). Please notify me when it launches.`
      : `Hello HUME Fragrance, I am interested in ${productDescriptor}. Please help me order it.`,
  );

  const handleAddToCart = () => {
    if (isDiscoverySet) {
      router.push(DISCOVERY_SET_PATH);
      return;
    }

    if (isComingSoon) {
      notifyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast({ title: "Join the launch waitlist" });
      return;
    }

    if (isSoldOut) {
      toast({ title: "Currently sold out" });
      return;
    }

    addItem({
      id: perfume.id,
      name: perfume.name,
      inspiration: perfume.inspiration,
      category: perfume.category,
      image: perfume.images[0],
      price: perfume.price,
      size: perfume.size || "50ml",
    });
    toast({
      title: "Product added to cart",
    });
  };

  const handleNotifySubmit = async () => {
    const contact = notifyContact.trim();
    if (!contact) {
      toast({ title: "Add email or mobile number" });
      return;
    }

    setIsNotifySaving(true);
    try {
      const isEmail = contact.includes("@");
      const response = await fetch("/api/stock-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: perfume.id,
          productName: perfume.name,
          email: isEmail ? contact : undefined,
          phone: isEmail ? undefined : contact,
          sourcePath: typeof window === "undefined" ? undefined : window.location.href,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) throw new Error(data.error || "Unable to save request.");

      setNotifyContact("");
      toast({ title: "We will notify you" });
    } catch (error) {
      toast({
        title: "Could not save notify request",
        description: error instanceof Error ? error.message : "Please ask us on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsNotifySaving(false);
    }
  };

  return (
    <div className="mb-1 space-y-4 pb-3 md:mb-12 md:space-y-5 md:pb-0">
      <motion.button
        onClick={handleAddToCart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-4 text-[11px] uppercase tracking-[0.28em] transition-opacity ${
          isSoldOut && !isComingSoon
            ? "cursor-not-allowed bg-muted text-muted-foreground"
            : isComingSoon
            ? "bg-foreground text-background hover:opacity-90"
            : "bg-foreground text-background hover:opacity-90"
        }`}
      >
        {isDiscoverySet ? "Join Waitlist" : isComingSoon ? "Coming Soon" : isSoldOut ? "Sold Out" : "Add to Bag"}
      </motion.button>

      <a
        href={`https://wa.me/919559024822?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366]/35 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/15"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {isComingSoon ? "Launch updates on WhatsApp" : "Order or ask on WhatsApp"}
      </a>

      {isUnavailable ? (
        <div ref={notifyRef} className="rounded-xl border border-border bg-secondary/30 p-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
              <Bell className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {isComingSoon ? "Join launch waitlist" : "Notify when back"}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {isComingSoon
                  ? "Leave email or mobile and we will message you before this product opens for checkout."
                  : "Leave email or mobile and we will message you when this perfume is ready."}
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  value={notifyContact}
                  onChange={(event) => setNotifyContact(event.target.value)}
                  placeholder="Email or mobile"
                  className="min-h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={handleNotifySubmit}
                  disabled={isNotifySaving}
                  className="min-h-10 rounded-md bg-foreground px-4 text-xs font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
                >
                  {isNotifySaving ? "Saving" : "Notify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-secondary/20 p-3">
        <div className="flex flex-col items-center gap-1 text-center">
          <Truck className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {isComingSoon
              ? "Waitlist open"
              : isRoseWater
                ? "Daily mist"
                : isKapoorCarFragrance
                  ? "Car ritual"
                  : "24h dispatch"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <ShieldCheck className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {isComingSoon
              ? "Launch notice"
              : isRoseWater
                ? "Gulab jal"
                : isKapoorCarFragrance
                  ? "Kapoor aroma"
                  : "IFRA safe"}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <WalletCards className="h-4 w-4 text-foreground/70" />
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {isComingSoon ? "Checkout off" : "UPI / cards"}
          </p>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Price</p>
            <p className="font-serif text-xl">{priceLabel ?? formatINR(perfume.price)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className={`inline-flex min-w-[9rem] items-center justify-center px-6 py-3 text-[10px] uppercase tracking-[0.28em] ${
              isSoldOut && !isComingSoon
                ? "cursor-not-allowed bg-muted text-muted-foreground"
                : isComingSoon
                ? "bg-foreground text-background"
                : "bg-foreground text-background"
            }`}
          >
            {isDiscoverySet ? "Waitlist" : isComingSoon ? "Coming Soon" : isSoldOut ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
