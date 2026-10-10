import { createHmac, timingSafeEqual } from "node:crypto";
import { createWelcomeBackReward, WELCOME_BACK_DURATION_MS, WELCOME_BACK_MIN_VISIT_GAP_MS } from "./cart-discounts";
type VisitState = { visits: number; lastVisit: number; tier: 0 | 5 | 10; unlockedAt: number; expiresAt: number };
export const VISIT_REWARD_COOKIE = "hume_visit_reward";
export function readVisitReward(value: string | undefined, secret: string | undefined, now = Date.now()): VisitState | null {
  if (!value || !secret || value.length > 1000) return null;
  const [encoded, signature] = value.split(".");
  if (!encoded || !signature || !/^[a-f0-9]{64}$/.test(signature)) return null;
  const expected = createHmac("sha256", secret).update(encoded).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) return null;
  try {
    const state = JSON.parse(Buffer.from(encoded, "base64url").toString()) as VisitState;
    if (!Number.isInteger(state.visits) || state.visits < 1 || state.visits > 10 || ![0, 5, 10].includes(state.tier) || !Number.isFinite(state.lastVisit) || state.lastVisit > now || !Number.isFinite(state.expiresAt) || state.expiresAt < now || state.expiresAt > now + WELCOME_BACK_DURATION_MS) return null;
    return state;
  } catch { return null; }
}
export function advanceVisitReward(previous: VisitState | null, now = Date.now()): VisitState {
  if (previous && now - previous.lastVisit < WELCOME_BACK_MIN_VISIT_GAP_MS) return previous;
  const visits = Math.min(10, (previous?.visits || 0) + 1);
  const tier = visits >= 3 ? 10 : visits >= 2 ? 5 : 0;
  return { visits, lastVisit: now, tier, unlockedAt: tier > (previous?.tier || 0) ? now : previous?.unlockedAt || now, expiresAt: tier > (previous?.tier || 0) || !previous ? now + WELCOME_BACK_DURATION_MS : previous.expiresAt };
}
export function signVisitReward(state: VisitState, secret: string) {
  const encoded = Buffer.from(JSON.stringify(state)).toString("base64url");
  return `${encoded}.${createHmac("sha256", secret).update(encoded).digest("hex")}`;
}
export function publicVisitReward(state: VisitState | null) {
  if (!state?.tier) return null;
  return { ...createWelcomeBackReward(state.tier, state.unlockedAt, state.visits), expiresAt: state.expiresAt };
}
