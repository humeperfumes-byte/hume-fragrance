"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Gift, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/currency";
import { withCloudinaryTransforms } from "@/lib/cloudinary";
import { formatRewardTimeRemaining } from "@/lib/cart-discounts";
import { showNavigationLoadingToast } from "@/lib/navigation-loading";

type PreviewItem = {
  id: string;
  name: string;
  inspiration: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
  isGift?: boolean;
};

type RewardPreview = {
  label: "Welcome Back 5" | "Welcome Back 10";
  code: "WELCOME-BACK-5" | "WELCOME-BACK-10";
  percent: 5 | 10;
  initialSeconds: number;
  caption: string;
  tease: string;
};

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE_BELOW_THRESHOLD = 100;
const FIRST_GIFT_THRESHOLD = 1699;
const SECOND_GIFT_THRESHOLD = 2499;
const APPLIED_COUPON_CODE = "HUME100";
const APPLIED_COUPON_DISCOUNT = 100;

const sampleItems: PreviewItem[] = [
  {
    id: "preview-sauvage",
    name: "Sauvage",
    inspiration: "Dior Sauvage",
    image: "/images/perfume-1.jpg",
    price: 799,
    size: "50ml",
    quantity: 1,
  },
  {
    id: "preview-ultra-male",
    name: "Ultra Male",
    inspiration: "Ultra Male Jean Paul Gaultier",
    image: "/images/perfume-2.jpg",
    price: 799,
    size: "50ml",
    quantity: 1,
  },
  {
    id: "gift-tier-1-preview",
    name: "Gift 1",
    inspiration: "Free gift",
    image: "/images/logo.png",
    price: 0,
    size: "Gift",
    quantity: 1,
    isGift: true,
  },
];

const rewardPreviews: RewardPreview[] = [
  {
    label: "Welcome Back 5",
    code: "WELCOME-BACK-5",
    percent: 5,
    initialSeconds: 23 * 60 * 60 + 58 * 60 + 42,
    caption: "Second meaningful visit",
    tease: "2nd visit? Secret reward unlocked ;)",
  },
  {
    label: "Welcome Back 10",
    code: "WELCOME-BACK-10",
    percent: 10,
    initialSeconds: 23 * 60 * 60 + 59 * 60 + 18,
    caption: "Fourth meaningful visit",
    tease: "Still deciding? Bigger secret unlocked ;)",
  },
];

function itemTotal(item: PreviewItem) {
  return item.isGift ? 0 : item.price * item.quantity;
}

function RewardPreviewDrawer({ reward }: { reward: RewardPreview }) {
  const router = useRouter();
  const [remainingSeconds, setRemainingSeconds] = useState(
    reward.initialSeconds,
  );
  const paidItems = sampleItems.filter((item) => !item.isGift);
  const subtotal = paidItems.reduce((sum, item) => sum + itemTotal(item), 0);
  const couponDiscount = APPLIED_COUPON_DISCOUNT;
  const welcomeBackDiscount = Math.round(subtotal * (reward.percent / 100));
  const regularShipping =
    subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD
      ? DELIVERY_FEE_BELOW_THRESHOLD
      : 0;
  const grandTotal = Math.max(
    0,
    subtotal - couponDiscount - welcomeBackDiscount,
  );
  const giftProgress = Math.min(100, (subtotal / SECOND_GIFT_THRESHOLD) * 100);
  const amountToGift = Math.max(0, SECOND_GIFT_THRESHOLD - subtotal);
  const totalSavings = couponDiscount + welcomeBackDiscount + regularShipping;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside className="flex min-h-[920px] w-full max-w-[430px] flex-col border border-black/10 bg-[#fbfaf8] text-[#171717] shadow-[0_24px_90px_rgba(0,0,0,0.10)]">
      <header className="border-b border-black/10 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-[1.7rem] leading-none tracking-tight">
              Your Selection
            </h2>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-black/45">
              {APPLIED_COUPON_CODE} + {reward.code}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              showNavigationLoadingToast();
              router.push("/shop");
            }}
            className="flex h-9 w-9 items-center justify-center text-black/45 transition hover:text-black"
            aria-label="Close cart preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <section className="mb-4 overflow-hidden border border-[#d6c7aa] bg-[#15110c] text-white shadow-[0_14px_34px_rgba(21,17,12,0.16)]">
          <div className="px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Extra {reward.percent}% off + free delivery
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-100/50">
                  Ends in
                </p>
                <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-amber-100">
                  {formatRewardTimeRemaining(remainingSeconds * 1000)}
                </p>
              </div>
            </div>
            <p className="mt-1.5 w-full text-xs leading-snug text-white/65">
              <span className="mr-1.5 text-[13px] text-white opacity-100">
                🤫
              </span>
              <span>{reward.tease}</span>
            </p>
          </div>
          <div
            className="h-1 bg-amber-200"
            style={{ width: reward.percent === 5 ? "99%" : "100%" }}
          />
        </section>

        <section className="rounded-[4px] border border-black/10 bg-[#f4f0f5] p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-normal text-black/80">
              {amountToGift > 0 ? (
                <>
                  Add <span className="font-semibold text-[#0f3a2b]">{formatINR(amountToGift)}</span> more for <span className="font-semibold text-[#0f3a2b]">Gift 2</span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-[#0f3a2b]">Gift 1</span> and <span className="font-semibold text-[#0f3a2b]">Gift 2</span> unlocked
                </>
              )}
            </p>
            <Gift className="h-4 w-4 shrink-0 text-emerald-700" />
          </div>
          <div className="mt-3 h-2 overflow-hidden bg-black/10">
            <div
              className="h-full bg-[#0f3a2b]"
              style={{ width: `${giftProgress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-semibold text-black/35">
            <span>{formatINR(0)}</span>
            <span>{formatINR(FIRST_GIFT_THRESHOLD)}</span>
            <span>{formatINR(SECOND_GIFT_THRESHOLD)} goal</span>
          </div>
        </section>

        <section className="mt-5 divide-y divide-black/10 border-y border-black/10">
          {sampleItems.map((item) => {
            const lineTotal = itemTotal(item);
            const stackedPercentDiscount = item.isGift
              ? 0
              : Math.round(lineTotal * (reward.percent / 100));
            const discountedLineTotal = Math.max(
              0,
              lineTotal - stackedPercentDiscount,
            );

            return (
              <article
                key={item.id}
                className="grid grid-cols-[82px_minmax(0,1fr)_auto] gap-3 py-4"
              >
                <div className="relative h-20 w-20 overflow-hidden bg-[#eee9e3]">
                  <Image
                    src={withCloudinaryTransforms(
                      item.image || "/images/logo.png",
                      { width: 180 },
                    )}
                    alt={item.name}
                    fill
                    sizes="82px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {item.name}
                  </p>
                  {!item.isGift ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-snug text-black/50">
                      {item.inspiration} {item.size ? `- ${item.size}` : ""}
                    </p>
                  ) : null}

                  {item.isGift ? (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-[#0f3a2b] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.11em] text-white">
                        Unlocked
                      </span>
                      <span className="text-xs text-black/45">
                        Qty {item.quantity}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 inline-flex h-8 items-center border border-black/10 bg-white">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-black/5"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="flex h-8 w-8 items-center justify-center border-x border-black/10 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-black/5"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex min-w-[58px] flex-col items-end justify-between">
                  <button
                    type="button"
                    className="text-black/35 transition hover:text-red-600"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="text-right">
                    {item.isGift ? (
                      <p className="text-sm font-semibold text-[#0f3a2b]">
                        Free
                      </p>
                    ) : (
                      <div>
                        <p className="text-[11px] font-medium text-black/35 line-through">
                          {formatINR(lineTotal)}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatINR(discountedLineTotal)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-5 overflow-hidden border border-[#d8d0c8] bg-[#fbf7fb] text-black">
          <div className="border-b border-[#e4dde2] p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/45">
                  Applied code
                </p>
                <p className="mt-1.5 font-serif text-[1.4rem] font-semibold leading-none tracking-wide">
                  {APPLIED_COUPON_CODE}
                </p>
              </div>
              <button
                type="button"
                className="h-6 border-b border-black/45 text-xs font-semibold tracking-[0.12em] text-black/65"
              >
                Remove
              </button>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-[0.92rem] font-medium leading-none text-[#0f3a2b]">
                You save {formatINR(couponDiscount)}
              </p>
              <span className="bg-[#d7f1df] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f6b46]">
                Applied
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#e4dde2]">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 opacity-60">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.02em]">
                  B3G1
                </p>
                <p className="mt-0.5 text-xs leading-snug text-black/55">
                  Buy 3 Get 1 Free on all 50ml EDPs
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 min-w-[70px] items-center justify-center border border-black/75 bg-transparent px-3 text-[11px] font-semibold tracking-[0.1em] text-black"
              >
                View
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.02em]">
                  HUME200
                </p>
                <p className="mt-0.5 text-xs leading-snug text-black/55">
                  Flat {formatINR(200)} off on bigger carts
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-8 min-w-[70px] items-center justify-center border border-black/75 bg-transparent px-3 text-[11px] font-semibold tracking-[0.1em] text-black"
              >
                Apply
              </button>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-black/10 bg-[#fbfaf8] px-5 py-4">
        <div className="space-y-2 border-b border-black/10 pb-3 text-sm">
          <div className="flex justify-between">
            <span className="text-black/55">Subtotal</span>
            <span className="font-semibold">{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/55">Offer ({APPLIED_COUPON_CODE})</span>
            <span className="font-semibold text-[#0f6b46]">
              -{formatINR(couponDiscount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/55">{reward.label}</span>
            <span className="font-semibold text-[#0f6b46]">
              -{formatINR(welcomeBackDiscount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/55">Shipping</span>
            <span className="font-semibold text-[#0f6b46]">
              Free
              {regularShipping > 0
                ? ` (${formatINR(regularShipping)} saved)`
                : ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full justify-between pt-3 text-left text-sm"
        >
          <span className="font-semibold">Estimated Total</span>
          <span className="inline-flex items-center gap-2 font-semibold">
            <span className="text-sm font-medium text-black/35 line-through">
              {formatINR(subtotal + regularShipping)}
            </span>
            {formatINR(grandTotal)}
          </span>
        </button>

        <p className="mt-2 text-center text-[11px] font-medium text-[#0f6b46]">
          Total savings in this preview: {formatINR(totalSavings)}
        </p>

        <Button
          onClick={() => {
            showNavigationLoadingToast("Opening checkout");
            router.push("/checkout");
          }}
          className="mt-4 h-12 w-full rounded-none bg-black text-sm font-semibold text-white hover:bg-black/85"
        >
          Checkout
          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </aside>
  );
}

export default function CartPreviewExperience() {
  return (
    <main className="min-h-screen bg-[#f3f0ee] px-4 py-8 text-[#171717]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
            Cart Preview
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight">
            Welcome Back Reward Flow
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/55">
            This preview is separate from the live cart. First is the
            second-visit 5% reward, then the fourth-visit 10% upgrade with the
            same cart structure.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {rewardPreviews.map((reward, index) => (
            <section key={reward.code}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold">{reward.label}</h2>
                </div>
                <span className="border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-black/50">
                  {reward.caption}
                </span>
              </div>
              <RewardPreviewDrawer reward={reward} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
