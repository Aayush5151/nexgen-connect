"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function LoginVerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  }, []);

  const handleVerify = useCallback(
    async (code: string) => {
      if (code.length < 6) return;
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp: code }),
        });

        if (res.ok) {
          toast.success("Verified! Redirecting...");
          window.location.href = "/app";
        } else if (res.status === 401 || res.status === 400) {
          const data = await res.json().catch(() => null);
          const msg = data?.message ?? "Invalid OTP. Please try again.";
          setError(msg);
          triggerShake();
          // Clear OTP inputs so user can retry
          setOtp(["", "", "", "", "", ""]);
          inputs.current[0]?.focus();
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [triggerShake]
  );

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    setError("");

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    const code = newOtp.join("");
    if (code.length === 6) {
      handleVerify(code);
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    // Extract up to 6 digits from pasted content
    const digits = pasted.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 0) return;

    setError("");
    const newOtp = ["", "", "", "", "", ""];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);

    // Focus the next empty input, or the last one
    const nextEmpty = digits.length < 6 ? digits.length : 5;
    inputs.current[nextEmpty]?.focus();

    // Auto-submit if all 6 digits pasted
    if (digits.length === 6) {
      handleVerify(digits);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      triggerShake();
      return;
    }
    handleVerify(code);
  }

  async function handleResend() {
    setResendTimer(30);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("New OTP sent! Check your phone.");
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  }

  const isFilled = otp.every((d) => d !== "");

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-[#0F172A] px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3B82F6]/10">
              <ShieldCheck className="h-6 w-6 text-[#3B82F6]" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#F8FAFC] sm:text-3xl">Verify OTP</h1>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Enter the 6-digit code sent to your phone.
            </p>
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="mt-8 rounded-2xl border border-white/[0.06] bg-[#020617] p-6 shadow-none sm:p-8"
          >
            {/* OTP Input */}
            <div
              className={`flex justify-center gap-2 sm:gap-3 ${shaking ? "animate-shake" : ""}`}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={loading}
                  className={`h-12 w-10 rounded-lg border text-center text-lg font-bold outline-none transition-all sm:h-14 sm:w-12 sm:text-xl ${
                    error
                      ? "border-red-400 bg-red-50/50 text-red-600"
                      : digit
                        ? "border-[#3B82F6] bg-[#3B82F6]/5 text-[#F8FAFC]"
                        : "border-white/[0.06] bg-[#0F172A] text-[#F8FAFC]"
                  } focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-50`}
                  aria-label={`Digit ${i + 1}`}
                  aria-invalid={!!error}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="mt-3 text-center text-xs text-red-500" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !isFilled}
              className="mt-6 w-full rounded-lg bg-[#3B82F6] py-3 text-white hover:bg-[#2563EB] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Login"
              )}
            </Button>

            <div className="mt-4 text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-[#94A3B8]">
                  Resend OTP in {resendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs font-medium text-[#3B82F6] hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[#94A3B8]">
            <Link href="/login" className="font-medium text-[#3B82F6] hover:underline">
              Change phone number
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
