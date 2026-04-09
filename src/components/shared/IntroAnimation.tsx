"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function IntroAnimation() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("nexgen-intro-seen");
    if (!hasSeenIntro) {
      setShow(true);
      sessionStorage.setItem("nexgen-intro-seen", "true");
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#020617]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#3B82F6] text-xl font-black text-white shadow-lg shadow-[#3B82F6]/20"
          >
            N
          </motion.div>

          {/* Text */}
          <motion.p
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="mt-5 text-lg font-bold tracking-tight text-[#F8FAFC]"
          >
            NexGen <span className="font-extrabold">Connect</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
