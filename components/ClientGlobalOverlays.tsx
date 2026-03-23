"use client";

import AIChatBot from "@/components/AIChatBot";
import EarlyBirdPopup from "@/components/EarlyBirdPopup";

export default function ClientGlobalOverlays() {
  return (
    <>
      <AIChatBot />
      <EarlyBirdPopup />
    </>
  );
}
