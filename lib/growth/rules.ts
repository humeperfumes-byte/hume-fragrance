import { z } from "zod";
export const rewardSettingsSchema = z.object({
  earningEnabled: z.boolean().default(false),
  earnPercent: z.number().min(0).max(20).default(5),
  maxRedeemPercent: z.number().int().min(1).max(100).default(20),
  holdDays: z.number().int().min(0).max(90).default(7),
  referralsEnabled: z.boolean().default(false),
  referralCoins: z.number().int().min(0).max(10000).default(50),
  friendDiscount: z.number().int().min(0).max(10000).default(50),
  referralMinSubtotal: z.number().min(0).max(100000).default(499),
  earnFrom: z.string().nullable().default(null),
});
export type RewardSettings = z.infer<typeof rewardSettingsSchema>;
export const defaultRewardSettings = rewardSettingsSchema.parse({});
export const couponRulesSchema = z
  .object({
    startsAt: z.string().datetime().nullable().optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    maxUses: z.number().int().positive().max(1000000).nullable().optional(),
    perCustomer: z.number().int().positive().max(10000).nullable().optional(),
    customerKey: z.string().max(330).nullable().optional(),
    audience: z.enum(["all", "first", "returning"]).default("all"),
    maxDiscount: z.number().nonnegative().max(100000).nullable().optional(),
    productIds: z.array(z.string().max(255)).max(200).default([]),
    categoryIds: z.array(z.string().max(100)).max(100).default([]),
    sampleProductId: z.string().max(255).nullable().optional(),
    stackable: z.boolean().default(false),
  })
  .refine(
    (v) =>
      !v.startsAt ||
      !v.expiresAt ||
      new Date(v.expiresAt) > new Date(v.startsAt),
    "Expiry must follow the start date",
  );
export type CouponRules = z.infer<typeof couponRulesSchema>;
export function customerKey(phone?: string | null, email?: string | null) {
  const digits = (phone || "").replace(/\D/g, "");
  if (/^(91|0091|0)?[6-9]\d{9}$/.test(digits))
    return "phone:" + digits.slice(-10);
  const e = (email || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? "email:" + e : null;
}
export function coinLimit(
  netMerchandise: number,
  available: number,
  percent: number,
) {
  return Math.max(
    0,
    Math.min(
      Math.floor(available),
      Math.floor((Math.max(0, netMerchandise) * percent) / 100),
      Math.max(0, Math.floor(netMerchandise - 1)),
    ),
  );
}
export function rewardCoins(paidMerchandise: number, percent: number) {
  return Math.max(
    0,
    Math.floor((Math.round(paidMerchandise * 100) * percent) / 10000),
  );
}
export const isReversedStatus = (status: string) =>
  /cancel|refund|disput/i.test(status);
export function csvCell(input: unknown) {
  const text = String(input ?? "");
  return (
    '"' +
    (/^[=+@\-\t\r]/.test(text) ? "'" : "") +
    text.replaceAll('"', '""') +
    '"'
  );
}
export type Wallet = {
  available: number;
  pending: number;
  reserved: number;
  balance: number;
  referralCode: string;
  marketingOptIn: boolean;
  history: {
    id: string;
    delta: number;
    voided?: boolean;
    kind: string;
    note: string;
    available_at: string;
    created_at: string;
  }[];
  settings: RewardSettings;
  referrals?: { status: string; coins: number; created_at: string }[];
};
export type GrowthQuote = {
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  couponDiscount: number;
  welcomeDiscount: number;
  coins: number;
  referralDiscount: number;
  freeSample: string | null;
  reservationId: string;
  walletAvailable: number;
  maxCoins: number;
};

export function offerMatchesCustomer(target: string | null | undefined, key: string | null, verifiedEmail?: string | null) { return !target || target === key || (!!verifiedEmail && target === "email:"+verifiedEmail.trim().toLowerCase()); }
