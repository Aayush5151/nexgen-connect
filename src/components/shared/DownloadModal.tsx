"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

interface DownloadModalProps {
  open: boolean;
  onClose: () => void;
}

export function DownloadModal({ open, onClose }: DownloadModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-sm overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F172A]/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[#94A3B8] transition-colors hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-8 pb-8 pt-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease }}
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6] shadow-lg shadow-[#3B82F6]/20">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#F8FAFC]">Get the App</h2>
                <p className="mt-1.5 text-sm text-[#94A3B8]">Scan the QR code or download from your store</p>
              </motion.div>

              {/* QR Code placeholder */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease }}
                className="mx-auto mt-7 flex h-44 w-44 items-center justify-center rounded-2xl border border-white/[0.06] bg-white p-4"
              >
                <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#F8FAFC] text-sm font-bold text-[#0F172A]">
                  QR Code
                </div>
              </motion.div>

              <p className="mt-4 text-xs text-[#64748B]">Point your camera at the code to download</p>

              {/* Store buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease }}
                className="mt-6 space-y-2.5"
              >
                <a
                  href="#"
                  className="flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white text-sm font-semibold text-[#0F172A] transition-all hover:bg-[#F1F5F9] active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                  Download on the App Store
                </a>
                <a
                  href="#"
                  className="flex h-12 items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-[#F8FAFC] transition-all hover:bg-white/[0.08] active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.12 12l2.578-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.635-8.635z"/></svg>
                  Get it on Google Play
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
