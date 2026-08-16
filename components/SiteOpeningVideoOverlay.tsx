"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function SiteOpeningVideoOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  const closeOverlay = useCallback(() => {
    setClosing((alreadyClosing) => {
      if (alreadyClosing) return alreadyClosing;
      window.setTimeout(() => setVisible(false), 500);
      return true;
    });
  }, []);

  useEffect(() => {
    if (!visible || isAdmin) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const safetyTimer = window.setTimeout(closeOverlay, 30000);
    return () => {
      window.clearTimeout(safetyTimer);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [visible, isAdmin, closeOverlay]);

  if (!visible || isAdmin) return null;

  return (
    <div className={`fixed inset-0 z-[200] bg-black transition-opacity duration-500 ${closing ? "pointer-events-none opacity-0" : "opacity-100"}`} role="dialog" aria-label="HUME Raksha Bandhan opening film">
      <video autoPlay muted playsInline preload="auto" poster="/images/occasions/rakhi.png" onEnded={closeOverlay} onError={closeOverlay} className="h-full w-full object-cover object-center">
        <source src="/videos/raksha-bandhan-hero.mp4?v=final-18" type="video/mp4" />
      </video>
      <button type="button" onClick={closeOverlay} className="absolute right-4 top-4 border border-white/35 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-md transition-colors hover:bg-black/50 sm:right-6 sm:top-6">Skip</button>
    </div>
  );
}
