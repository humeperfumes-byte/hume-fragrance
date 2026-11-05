"use client";
import { getStoredAccountLoginToken } from "@/lib/customer-account";
export function growthHeaders() {
  return {
    "Content-Type": "application/json",
    "x-hume-account-token":
      typeof window === "undefined"
        ? ""
        : getStoredAccountLoginToken(window.localStorage),
  };
}
