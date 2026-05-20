export type CouponType = string;
export type CouponWelcomeBackMode = "allow" | "cap_5" | "disable";

export interface CouponData {
  id: string;
  code: string;
  title: string;
  description: string;
  type: CouponType;
  value: number;
  minSubtotal: number;
  active: boolean;
  displayInCart: boolean;
  welcomeBackMode: CouponWelcomeBackMode;
}

export const coupons: CouponData[] = [
  {
    id: "cash5",
    code: "CASH5",
    title: "You save ₹26.20",
    description: "Flat 5% off on qualifying orders",
    type: "percent",
    value: 5,
    minSubtotal: 499,
    active: true,
    displayInCart: true,
    welcomeBackMode: "cap_5",
  },
  {
    id: "hume100",
    code: "HUME100",
    title: "Flat ₹100 Off",
    description: "₹100 off above ₹999",
    type: "fixed",
    value: 100,
    minSubtotal: 999,
    active: true,
    displayInCart: true,
    welcomeBackMode: "cap_5",
  },
];
