"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const smoothProgress = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const p = docHeight > 0 ? scrollTop / docHeight : 0;
      setProgress(p);
      smoothProgress.set(p);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [smoothProgress]);

  if (progress < 0.01) return null;

  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
      style={{
        scaleX: smoothProgress,
        background: "linear-gradient(90deg, #3B82F6, #60A5FA, #3B82F6)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: progress > 0.01 ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
