"use client";

import EarlyBirdPopup from "@/components/EarlyBirdPopup";
import WelcomeBackRewardBanner from "@/components/WelcomeBackRewardBanner";

export default function ClientGlobalOverlays() {
  return (
    <>
      <EarlyBirdPopup />
      <WelcomeBackRewardBanner />
    </>
  );
}
