"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const EarlyBirdPopup = dynamic(() => import("@/components/EarlyBirdPopup"), {
  ssr: false,
});
const WelcomeBackRewardBanner = dynamic(
  () => import("@/components/WelcomeBackRewardBanner"),
  { ssr: false },
);
const PaymentRecoveryPrompt = dynamic(
  () => import("@/components/PaymentRecoveryPrompt"),
  { ssr: false },
);
const LiveChatWidget = dynamic(() => import("@/components/LiveChatWidget"), { ssr: false });

export default function ClientGlobalOverlays() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <EarlyBirdPopup />
      <WelcomeBackRewardBanner />
      <PaymentRecoveryPrompt />
      {!isAdmin && <LiveChatWidget />}
    </>
  );
}
