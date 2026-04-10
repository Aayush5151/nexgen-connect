"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone } from "lucide-react";

export function StickyMobileCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#020617]/90 p-3 backdrop-blur-xl md:hidden"
        >
          <button
            onClick={() => {
              const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
              window.location.href = isIOS ? "https://apps.apple.com" : "https://play.google.com";
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B82F6] text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/10 active:scale-[0.97]"
          >
            <Smartphone className="h-4 w-4" />
            Find Your People, Free
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
