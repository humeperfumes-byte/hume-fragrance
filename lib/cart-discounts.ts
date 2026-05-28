export type CouponLike = {
  code: string;
  description: string;
  type: string;
  value: number;
  minSubtotal: number;
  welcomeBackMode?: string | null;
};

export type CartDiscountItem = {
  id: string;
  price: number;
  quantity: number;
  isGift?: boolean;
};

export type BuyGetConfig = {
  buy: number;
  get: number;
};

export type WelcomeBackReward = {
  code: "WELCOME-BACK-5" | "WELCOME-BACK-10";
  label: "Welcome Back 5" | "Welcome Back 10";
  percent: 5 | 10;
  tier: 5 | 10;
  visitCount: number;
  unlockedAt: number;
  expiresAt: number;
};

export type CouponWelcomeBackMode = "allow" | "cap_5" | "disable";

export const WELCOME_BACK_VISIT_COUNT_KEY = "hume_welcome_back_visit_count_v1";
export const WELCOME_BACK_LAST_VISIT_AT_KEY =
  "hume_welcome_back_last_visit_at_v1";
export const WELCOME_BACK_REWARD_KEY = "hume_welcome_back_reward_v1";
export const WELCOME_BACK_CELEBRATED_REWARD_KEY =
  "hume_welcome_back_celebrated_reward_v1";
export const WELCOME_BACK_MIN_VISIT_GAP_MS = 10 * 60 * 1000;
export const WELCOME_BACK_DURATION_MS = 24 * 60 * 60 * 1000;
export const WELCOME_BACK_10_MIN_SUBTOTAL = 1200;

function numeric(value: string | null): number {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseBuyGetConfig(
  coupon: Pick<CouponLike, "code" | "description" | "type"> | null,
) {
  if (!coupon) return null;

  const parseFromText = (text: string) => {
    const normalized = text.replace(/\s+/g, "");
    const match = normalized.match(/B(\d+)G(\d+)/i);
    if (!match) return null;
    const buy = Number(match[1]);
    const get = Number(match[2]);
    if (!Number.isFinite(buy) || !Number.isFinite(get) || buy <= 0 || get <= 0)
      return null;
    return { buy, get };
  };

  return (
    parseFromText(coupon.type) ||
    parseFromText(coupon.code) ||
    parseFromText(coupon.description)
  );
}

export function getPaidItemCount(items: CartDiscountItem[]) {
  return items.reduce(
    (sum, item) => sum + (item.isGift ? 0 : item.quantity),
    0,
  );
}

export function isCouponEligible(
  coupon: CouponLike,
  items: CartDiscountItem[],
  subtotal: number,
) {
  if (subtotal < coupon.minSubtotal) return false;
  const buyGet = parseBuyGetConfig(coupon);
  if (buyGet && getPaidItemCount(items) < buyGet.buy + buyGet.get) return false;
  return true;
}

export function calculateCouponDiscount(
  coupon: CouponLike | null,
  items: CartDiscountItem[],
  subtotal: number,
) {
  const emptyFreeUnitMap = new Map<string, number>();
  if (!coupon || !isCouponEligible(coupon, items, subtotal)) {
    return {
      discount: 0,
      freeUnitByItemId: emptyFreeUnitMap,
      buyGetConfig: null as BuyGetConfig | null,
      buyGetEligible: false,
      freeUnitTargetCount: 0,
    };
  }

  const buyGetConfig = parseBuyGetConfig(coupon);

  if (coupon.type === "percent") {
    return {
      discount: (subtotal * coupon.value) / 100,
      freeUnitByItemId: emptyFreeUnitMap,
      buyGetConfig,
      buyGetEligible: false,
      freeUnitTargetCount: 0,
    };
  }

  if (coupon.type === "fixed") {
    return {
      discount: coupon.value,
      freeUnitByItemId: emptyFreeUnitMap,
      buyGetConfig,
      buyGetEligible: false,
      freeUnitTargetCount: 0,
    };
  }

  if (!buyGetConfig) {
    return {
      discount: 0,
      freeUnitByItemId: emptyFreeUnitMap,
      buyGetConfig,
      buyGetEligible: false,
      freeUnitTargetCount: 0,
    };
  }

  const paidItemCount = getPaidItemCount(items);
  const eligiblePaidUnits = buyGetConfig.buy + buyGetConfig.get;
  const buyGetEligible = paidItemCount >= eligiblePaidUnits;
  const freeUnitTargetCount = buyGetEligible
    ? Math.floor(paidItemCount / eligiblePaidUnits) * buyGetConfig.get
    : 0;

  if (!buyGetEligible || freeUnitTargetCount <= 0) {
    return {
      discount: 0,
      freeUnitByItemId: emptyFreeUnitMap,
      buyGetConfig,
      buyGetEligible,
      freeUnitTargetCount,
    };
  }

  const sortedUnits = items
    .filter((item) => !item.isGift)
    .flatMap((item) =>
      Array.from({ length: item.quantity }, () => ({
        itemId: item.id,
        price: item.price,
      })),
    )
    .sort((a, b) => a.price - b.price);

  const freeUnits = sortedUnits.slice(0, freeUnitTargetCount);
  const freeUnitByItemId = freeUnits.reduce((acc, unit) => {
    acc.set(unit.itemId, (acc.get(unit.itemId) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const discount = items
    .filter((item) => !item.isGift)
    .reduce(
      (sum, item) => sum + (freeUnitByItemId.get(item.id) ?? 0) * item.price,
      0,
    );

  return {
    discount,
    freeUnitByItemId,
    buyGetConfig,
    buyGetEligible,
    freeUnitTargetCount,
  };
}

export function createWelcomeBackReward(
  tier: 5 | 10,
  now: number,
  visitCount: number,
): WelcomeBackReward {
  return {
    code: tier === 10 ? "WELCOME-BACK-10" : "WELCOME-BACK-5",
    label: tier === 10 ? "Welcome Back 10" : "Welcome Back 5",
    percent: tier,
    tier,
    visitCount,
    unlockedAt: now,
    expiresAt: now + WELCOME_BACK_DURATION_MS,
  };
}

export function readWelcomeBackReward(
  storage: Storage,
  now = Date.now(),
): WelcomeBackReward | null {
  try {
    const raw = storage.getItem(WELCOME_BACK_REWARD_KEY);
    if (!raw) return null;
    const reward = JSON.parse(raw) as WelcomeBackReward;
    if (!reward || !reward.expiresAt || reward.expiresAt <= now) return null;
    if (reward.tier !== 5 && reward.tier !== 10) return null;
    return reward;
  } catch {
    return null;
  }
}

export function trackWelcomeBackVisit(storage: Storage, now = Date.now()) {
  const lastVisitAt = numeric(storage.getItem(WELCOME_BACK_LAST_VISIT_AT_KEY));
  const currentVisitCount = numeric(
    storage.getItem(WELCOME_BACK_VISIT_COUNT_KEY),
  );
  const activeReward = readWelcomeBackReward(storage, now);

  if (lastVisitAt && now - lastVisitAt < WELCOME_BACK_MIN_VISIT_GAP_MS) {
    return {
      reward: activeReward,
      justUnlocked: false,
      visitCount: currentVisitCount,
    };
  }

  const visitCount = currentVisitCount + 1;
  storage.setItem(WELCOME_BACK_VISIT_COUNT_KEY, String(visitCount));
  storage.setItem(WELCOME_BACK_LAST_VISIT_AT_KEY, String(now));

  const targetTier = visitCount >= 3 ? 10 : visitCount >= 2 ? 5 : null;
  if (!targetTier)
    return { reward: activeReward, justUnlocked: false, visitCount };

  if (activeReward && activeReward.tier >= targetTier) {
    return { reward: activeReward, justUnlocked: false, visitCount };
  }

  const reward = createWelcomeBackReward(targetTier, now, visitCount);
  storage.setItem(WELCOME_BACK_REWARD_KEY, JSON.stringify(reward));
  return { reward, justUnlocked: true, visitCount };
}

export function getWelcomeBackRewardId(reward: WelcomeBackReward) {
  return `${reward.code}:${reward.unlockedAt}`;
}

export function getCouponWelcomeBackMode(
  coupon: Pick<CouponLike, "welcomeBackMode"> | null | undefined,
): CouponWelcomeBackMode {
  const mode = String(coupon?.welcomeBackMode ?? "cap_5").trim().toLowerCase();
  if (mode === "allow" || mode === "disable") return mode;
  return "cap_5";
}

export function getEffectiveWelcomeBackPercent(
  reward: WelcomeBackReward | null,
  coupon: Pick<CouponLike, "welcomeBackMode"> | null | undefined,
  subtotal?: number,
) {
  if (!reward) return 0;
  const applySubtotalGate = (percent: number) => {
    if (
      percent >= 10 &&
      typeof subtotal === "number" &&
      Number.isFinite(subtotal) &&
      subtotal < WELCOME_BACK_10_MIN_SUBTOTAL
    ) {
      return 5;
    }

    return percent;
  };

  if (!coupon) return applySubtotalGate(reward.percent);

  const mode = getCouponWelcomeBackMode(coupon);
  if (mode === "disable") return 0;
  if (mode === "allow") return applySubtotalGate(reward.percent);
  return Math.min(applySubtotalGate(reward.percent), 5);
}

export function getEffectiveWelcomeBackLabel(
  reward: WelcomeBackReward | null,
  coupon: Pick<CouponLike, "welcomeBackMode"> | null | undefined,
  subtotal?: number,
) {
  const percent = getEffectiveWelcomeBackPercent(reward, coupon, subtotal);
  if (percent <= 0) return null;
  return percent === 10 ? "Welcome Back 10" : "Welcome Back 5";
}

export function getEffectiveWelcomeBackCode(
  reward: WelcomeBackReward | null,
  coupon: Pick<CouponLike, "welcomeBackMode"> | null | undefined,
  subtotal?: number,
) {
  const percent = getEffectiveWelcomeBackPercent(reward, coupon, subtotal);
  if (percent <= 0) return null;
  return percent === 10 ? "WELCOME-BACK-10" : "WELCOME-BACK-5";
}

export function calculateWelcomeBackDiscount(
  reward: WelcomeBackReward | null,
  subtotal: number,
  alreadyDiscountedAmount: number,
  coupon?: Pick<CouponLike, "welcomeBackMode"> | null,
) {
  if (!reward) return 0;
  const effectivePercent = getEffectiveWelcomeBackPercent(
    reward,
    coupon ?? null,
    subtotal,
  );
  if (effectivePercent <= 0) return 0;
  const remainingSubtotal = Math.max(0, subtotal - alreadyDiscountedAmount);
  return Math.min(remainingSubtotal, (subtotal * effectivePercent) / 100);
}

export function formatRewardTimeRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}
