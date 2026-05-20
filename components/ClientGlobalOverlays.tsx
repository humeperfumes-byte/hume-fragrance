"use client";

import dynamic from "next/dynamic";

const EarlyBirdPopup = dynamic(() => import("@/components/EarlyBirdPopup"), {
  ssr: false,
});
const WelcomeBackRewardBanner = dynamic(
  () => import("@/components/WelcomeBackRewardBanner"),
  { ssr: false },
);

export default function ClientGlobalOverlays() {
  return (
    <>
      <EarlyBirdPopup />
      <WelcomeBackRewardBanner />
    </>
  );
}
