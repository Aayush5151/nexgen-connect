"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Loader2, ArrowLeft, Smartphone } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

/* ── SVG brand icons ───────────────────────────────────────────── */
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

/* ── Types ──────────────────────────────────────────────────────── */
type Step = "options" | "phone" | "otp" | "success";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

/* ── Component ─────────────────────────────────────────────────── */
export function AuthModal({ open, onClose }: AuthModalProps) {
  const [step, setStep] = useState<Step>("options");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep("options");
        setPhone("");
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
        setResendTimer(0);
      }, 300);
    }
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((p) => (p <= 1 ? 0 : p - 1)), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  /* ── Phone submit ──────────────────────────────────────────── */
  const handleSendOtp = useCallback(() => {
    if (phone.replace(/\s/g, "").length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }, 1200);
  }, [phone]);

  /* ── OTP handling ──────────────────────────────────────────── */
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    // Auto-submit on complete
    const code = newOtp.join("");
    if (code.length === 6) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setStep("success");
      }, 1500);
    }
  }, [otp]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i];
    setOtp(newOtp);
    if (digits.length === 6) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep("success"); }, 1500);
    } else {
      otpRefs.current[digits.length]?.focus();
    }
  }, []);

  /* ── Success redirect ──────────────────────────────────────── */
  useEffect(() => {
    if (step !== "success") return;
    const timer = setTimeout(() => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        window.location.href = isIOS ? "https://apps.apple.com" : "https://play.google.com";
      }
      // Desktop: stay on success screen with QR
    }, 2500);
    return () => clearTimeout(timer);
  }, [step]);

  const isMobile = typeof window !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full max-w-[420px] overflow-hidden rounded-t-[24px] border border-white/[0.08] bg-[#0F172A]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl md:rounded-[24px] md:mb-0"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-[#94A3B8] transition hover:text-[#F8FAFC]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 pb-8 pt-8 sm:px-8">
              <AnimatePresence mode="wait">
                {/* ═══════════════════ OPTIONS SCREEN ═══════════════════ */}
                {step === "options" && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    {/* Header */}
                    <div className="text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#3B82F6] text-lg font-black text-white shadow-lg shadow-[#3B82F6]/20">
                        N
                      </div>
                      <h2 className="mt-5 text-[20px] font-bold text-[#F8FAFC]">Welcome to NexGen</h2>
                      <p className="mt-1 text-[13px] text-[#94A3B8]">Sign in or create your account</p>
                    </div>

                    {/* Auth buttons */}
                    <div className="mt-7 space-y-2.5">
                      <button
                        onClick={() => setStep("phone")}
                        className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[14px] bg-[#3B82F6] text-[14px] font-semibold text-white shadow-lg shadow-[#3B82F6]/15 transition-all hover:bg-[#2563EB] hover:shadow-xl hover:shadow-[#3B82F6]/25 active:scale-[0.98]"
                      >
                        <Phone className="h-[18px] w-[18px]" />
                        Continue with Phone
                      </button>

                      <button className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.08] bg-white/[0.04] text-[14px] font-medium text-[#F8FAFC] transition-all hover:bg-white/[0.08] active:scale-[0.98]">
                        <GoogleIcon className="h-[18px] w-[18px]" />
                        Continue with Google
                      </button>

                      <button className="flex h-[48px] w-full items-center justify-center gap-2.5 rounded-[14px] border border-white/[0.08] bg-white/[0.04] text-[14px] font-medium text-[#F8FAFC] transition-all hover:bg-white/[0.08] active:scale-[0.98]">
                        <AppleIcon className="h-[18px] w-[18px]" />
                        Continue with Apple
                      </button>
                    </div>

                    <p className="mt-6 text-center text-[11px] leading-relaxed text-[#64748B]">
                      By continuing, you agree to our{" "}
                      <a href="/terms" className="text-[#94A3B8] hover:text-[#F8FAFC]">Terms</a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-[#94A3B8] hover:text-[#F8FAFC]">Privacy Policy</a>
                    </p>
                  </motion.div>
                )}

                {/* ═══════════════════ PHONE SCREEN ═══════════════════ */}
                {step === "phone" && (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <button
                      onClick={() => setStep("options")}
                      className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-[#94A3B8] transition hover:text-[#F8FAFC]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>

                    <h2 className="text-[20px] font-bold text-[#F8FAFC]">Enter your phone</h2>
                    <p className="mt-1 text-[13px] text-[#94A3B8]">We&apos;ll send a verification code</p>

                    <div className="mt-6 flex gap-2">
                      <div className="flex h-[48px] items-center rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-3.5 text-[14px] font-medium text-[#94A3B8]">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, "").slice(0, 12))}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSendOtp(); }}
                        placeholder="98765 43210"
                        autoFocus
                        className="h-[48px] flex-1 rounded-[12px] border border-white/[0.08] bg-white/[0.04] px-4 text-[15px] font-medium text-[#F8FAFC] placeholder:text-[#64748B] outline-none transition focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/20"
                      />
                    </div>

                    <button
                      onClick={handleSendOtp}
                      disabled={loading || phone.replace(/\s/g, "").length < 10}
                      className="mt-4 flex h-[48px] w-full items-center justify-center rounded-[14px] bg-[#3B82F6] text-[14px] font-semibold text-white shadow-lg shadow-[#3B82F6]/15 transition-all hover:bg-[#2563EB] active:scale-[0.98] disabled:opacity-40"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send OTP"}
                    </button>
                  </motion.div>
                )}

                {/* ═══════════════════ OTP SCREEN ═══════════════════ */}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease }}
                  >
                    <button
                      onClick={() => { setStep("phone"); setOtp(["","","","","",""]); }}
                      className="mb-5 flex items-center gap-1.5 text-[13px] font-medium text-[#94A3B8] transition hover:text-[#F8FAFC]"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>

                    <h2 className="text-[20px] font-bold text-[#F8FAFC]">Verify your number</h2>
                    <p className="mt-1 text-[13px] text-[#94A3B8]">
                      Code sent to +91 {phone}
                    </p>

                    {/* OTP inputs */}
                    <div className="mt-6 flex justify-center gap-2.5">
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          onPaste={i === 0 ? handleOtpPaste : undefined}
                          disabled={loading}
                          className={`h-[52px] w-[44px] rounded-[12px] border text-center text-[20px] font-bold outline-none transition-all ${
                            digit
                              ? "border-[#3B82F6]/40 bg-[#3B82F6]/[0.06] text-[#F8FAFC]"
                              : "border-white/[0.08] bg-white/[0.04] text-[#F8FAFC]"
                          } focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-50`}
                        />
                      ))}
                    </div>

                    {loading && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-[13px] text-[#94A3B8]">
                        <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                      </div>
                    )}

                    <div className="mt-5 text-center">
                      {resendTimer > 0 ? (
                        <p className="text-[12px] text-[#64748B]">Resend in {resendTimer}s</p>
                      ) : (
                        <button
                          onClick={() => { setResendTimer(30); setOtp(["","","","","",""]); }}
                          className="text-[12px] font-medium text-[#3B82F6] hover:text-[#60A5FA]"
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ═══════════════════ SUCCESS SCREEN ═══════════════════ */}
                {step === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease }}
                    className="py-6 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#3B82F6]/10"
                    >
                      <svg className="h-8 w-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>

                    <h2 className="mt-5 text-[20px] font-bold text-[#F8FAFC]">You&apos;re in!</h2>
                    <p className="mt-1.5 text-[13px] text-[#94A3B8]">
                      {isMobile ? "Opening the app..." : "Continue on your phone"}
                    </p>

                    {/* Desktop: show QR */}
                    {!isMobile && (
                      <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-2xl border border-white/[0.06] bg-white p-3">
                        <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#F8FAFC] text-xs font-bold text-[#0F172A]">
                          QR Code
                        </div>
                      </div>
                    )}

                    {isMobile && (
                      <div className="mt-6">
                        <Smartphone className="mx-auto h-6 w-6 animate-pulse text-[#3B82F6]" />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
