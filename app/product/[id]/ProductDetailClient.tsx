"use client";

import { motion } from "framer-motion";
import { Bell, MessageCircle, ShieldCheck, Truck, WalletCards } from "lucide-react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { toast } from "@/hooks/use-toast";
import type { PerfumeData } from "@/data/perfumes";
import { formatINR } from "@/lib/currency";
import { DISCOVERY_SET_PATH, isDiscoverySetProductId } from "@/lib/discovery-set";

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
    <div className="mb-3 space-y-4 pb-10 md:mb-12 md:space-y-5 md:pb-0">
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
        {isDiscoverySet || isComingSoon ? "Join Waitlist" : isSoldOut ? "Sold Out" : "Add to Bag"}
      </motion.button>

      <a
        href={`https://wa.me/919559024822?text=${whatsappMessage}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-md border border-[#25D366]/35 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/15"
      >
        <MessageCircle className="h-4 w-4" />
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
            {isDiscoverySet || isComingSoon ? "Waitlist" : isSoldOut ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
