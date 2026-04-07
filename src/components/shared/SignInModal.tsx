"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ease = [0.22, 1, 0.36, 1] as const;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

export function SignInModal({ open, onClose }: SignInModalProps) {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate — in production this calls the auth API
    setTimeout(() => { setLoading(false); }, 1500);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal — centered on desktop, bottom sheet on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-md overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0F172A]/95 shadow-2xl shadow-black/40 backdrop-blur-xl max-md:fixed max-md:inset-x-4 max-md:bottom-4 max-md:top-auto max-md:max-w-none max-md:rounded-t-[24px] max-md:rounded-b-[20px]"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[#94A3B8] transition-colors hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-8 pb-8 pt-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease }}
                className="text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#3B82F6] text-lg font-black text-white shadow-lg shadow-[#3B82F6]/20">
                  N
                </div>
                <h2 className="mt-5 text-xl font-bold text-[#F8FAFC]">Welcome back</h2>
                <p className="mt-1.5 text-sm text-[#94A3B8]">Sign in to continue to NexGen Connect</p>
              </motion.div>

              {/* Social buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease }}
                className="mt-7 space-y-2.5"
              >
                <button className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-[#F8FAFC] transition-all hover:bg-white/[0.08] active:scale-[0.98]">
                  <GoogleIcon className="h-4.5 w-4.5" />
                  Continue with Google
                </button>
                <button className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-[#F8FAFC] transition-all hover:bg-white/[0.08] active:scale-[0.98]">
                  <AppleIcon className="h-5 w-5" />
                  Continue with Apple
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="my-6 flex items-center gap-3"
              >
                <div className="h-px flex-1 bg-white/[0.06]" />
                <span className="text-xs font-medium text-[#64748B]">or</span>
                <div className="h-px flex-1 bg-white/[0.06]" />
              </motion.div>

              {/* Email/Phone toggle */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.4, ease }}
              >
                <div className="mb-4 flex rounded-lg bg-white/[0.04] p-0.5">
                  {(["email", "phone"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold transition-all ${
                        method === m
                          ? "bg-white/[0.08] text-[#F8FAFC] shadow-sm"
                          : "text-[#64748B] hover:text-[#94A3B8]"
                      }`}
                    >
                      {m === "email" ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
                      {m === "email" ? "Email" : "Phone"}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit}>
                  {method === "email" ? (
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex h-11 items-center rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-[#94A3B8]">+91</div>
                      <Input
                        type="tel"
                        placeholder="98765 43210"
                        required
                        maxLength={12}
                        className="h-11 flex-1 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/20"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] font-semibold text-white shadow-lg shadow-[#3B82F6]/15 transition-all hover:shadow-xl hover:shadow-[#3B82F6]/25 active:scale-[0.97] disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                  </Button>
                </form>

                <p className="mt-5 text-center text-xs text-[#64748B]">
                  Don&apos;t have an account?{" "}
                  <a href="#download" onClick={onClose} className="font-medium text-[#3B82F6] hover:text-[#60A5FA]">Download the app</a>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
