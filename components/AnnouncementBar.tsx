"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteControls } from "@/hooks/use-site-controls";

interface AnnouncementBarProps {
  isVisible: boolean;
  onClose: () => void;
}

const AnnouncementBar = ({ isVisible, onClose }: AnnouncementBarProps) => {
  const settings = useSiteControls();

  const barContent = (
    <div className="relative w-full overflow-hidden py-1.5 select-none pr-8">
      <div className="flex items-center whitespace-nowrap animate-marquee-custom">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="inline-flex items-center gap-3 px-8 shrink-0">
            {/* Pill Badge */}
            <span className="inline-flex items-center gap-1.5 bg-[#FF3F56] text-white text-[9px] font-black uppercase tracking-[0.16em] px-2.5 py-0.5 rounded-full shadow-sm shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              PRE ORDER
            </span>
            {/* Text */}
            <span className="text-[11px] font-medium tracking-[0.16em] text-stone-200 uppercase">
              {settings.announcementText}
            </span>
          </div>
        ))}
      </div>
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
          className="relative bg-stone-950 text-white text-center overflow-hidden border-b border-white/[0.04] announcement-bar-font"
        >
          <style>{`
            .announcement-bar-font, .announcement-bar-font * {
              font-family: var(--font-mono), monospace !important;
            }
            @keyframes marquee {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .animate-marquee-custom {
              display: inline-flex;
              animation: marquee 25s linear infinite;
            }
            .animate-marquee-custom:hover {
              animation-play-state: paused;
            }
          `}</style>

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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-white transition-colors z-20 bg-stone-950/80 backdrop-blur-xs rounded-full border border-white/[0.05]"
            aria-label="Dismiss announcement"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
