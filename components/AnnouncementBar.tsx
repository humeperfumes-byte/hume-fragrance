"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteControls } from "@/hooks/use-site-controls";

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const settings = useSiteControls();

  return (
    <AnimatePresence>
      {isVisible && settings.announcementEnabled && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary text-primary-foreground text-center text-xs tracking-[0.2em] uppercase overflow-hidden"
        >
          <div className="relative flex items-center justify-center py-2.5 px-10">
            <span className="font-light">
              {settings.announcementText}
            </span>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-3 p-1 hover:opacity-70 transition-opacity"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
