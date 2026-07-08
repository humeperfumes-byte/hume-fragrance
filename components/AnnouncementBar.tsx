"use client";

import { useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteControls } from "@/hooks/use-site-controls";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const settings = useSiteControls();

  const barContent = (
    <div className="flex items-center justify-center gap-3 py-2 px-10">
      {/* Pill Badge */}
      <span className="inline-flex items-center gap-1.5 bg-[#FF3F56] text-white text-[9px] font-black uppercase tracking-[0.16em] px-3 py-1 rounded-full shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        PRE ORDER
      </span>
      {/* Text */}
      <span className="font-sans text-[11px] font-medium tracking-[0.16em] text-stone-200 uppercase">
        {settings.announcementText}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative bg-stone-950 text-white text-center overflow-hidden border-b border-white/[0.04]"
        >
          {settings.announcementLink ? (
            <Link 
              href={settings.announcementLink}
              className="block hover:bg-stone-900 transition-colors"
            >
              {barContent}
            </Link>
          ) : (
            barContent
          )}

          {/* Dismiss button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors z-10"
            aria-label="Dismiss announcement"
          >
            <X size={13} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
