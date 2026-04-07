"use client";

import { useState } from "react";
import {
  Check,
  Lock,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ConfettiEffect from "@/components/shared/ConfettiEffect";

const unlockFeatures = [
  "Full profiles with names, photos, and bios",
  "Swipe and match with students in your cohort",
  "Instagram & LinkedIn revealed on mutual match",
  "Access to all cohort levels (city, state, country, global)",
  "Lifetime access to your intake cohort",
];

const paymentMethods = [
  {
    label: "UPI",
    icon: Smartphone,
    description: "Pay instantly with Google Pay, PhonePe, Paytm, or any UPI app.",
  },
  {
    label: "Cards",
    icon: CreditCard,
    description: "Visa, Mastercard, Rupay. Debit and credit cards accepted.",
  },
  {
    label: "Net Banking",
    icon: Building2,
    description: "Pay directly from your bank account via internet banking.",
  },
  {
    label: "Wallets",
    icon: Wallet,
    description: "Paytm Wallet, Mobikwik, Freecharge, and more.",
  },
];

const featureVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

export default function PaymentPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("UPI");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(5);

  function handlePay() {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);

      // Redirect countdown
      let count = 5;
      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(interval);
          router.push("/app/discover");
        }
      }, 1000);
    }, 2000);
  }

  const selectedMethodInfo = paymentMethods.find(
    (m) => m.label === selectedMethod
  );

  if (paymentSuccess) {
    return (
      <div className="px-4 py-6 md:px-8">
        <ConfettiEffect active={showConfetti} />
        <motion.div
          className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald/10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 400,
              damping: 12,
            }}
          >
            <Check className="h-10 w-10 text-emerald" />
          </motion.div>

          <motion.h2
            className="mt-6 text-2xl font-bold text-navy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Payment Successful!
          </motion.h2>
          <motion.p
            className="mt-2 text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Welcome to NexGen Connect
          </motion.p>
          <motion.p
            className="mt-4 text-xs text-text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Redirecting to Discover in {countdown}s...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/app/cohort"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Unlock Your Cohort</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            One payment, lifetime access
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-md space-y-6">
        {/* What you get */}
        <div className="rounded-2xl border border-border/50 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-navy">
            What you&apos;re unlocking
          </h2>
          <ul className="mt-4 space-y-3">
            {unlockFeatures.map((feature, i) => (
              <motion.li
                key={feature}
                className="flex items-start gap-3"
                custom={i}
                variants={featureVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald/10">
                  <Check className="h-3 w-3 text-emerald" />
                </div>
                <span className="text-sm text-text-secondary">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Price Card */}
        <motion.div
          className="rounded-2xl border-2 border-coral bg-gradient-to-br from-white to-coral/5 p-6 text-center shadow-lg shadow-coral/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-navy">&#8377;599</span>
          </div>
          <p className="mt-2 text-sm font-medium text-text-secondary">
            One-time payment. No subscription.
          </p>

          {/* Payment method tabs */}
          <div className="mt-5 flex justify-center gap-1 rounded-xl bg-muted/50 p-1">
            {paymentMethods.map((method) => {
              const isSelected = selectedMethod === method.label;
              return (
                <button
                  key={method.label}
                  onClick={() => setSelectedMethod(method.label)}
                  className={`relative flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-[10px] font-medium transition-all duration-200 ${
                    isSelected
                      ? "bg-white text-navy shadow-sm"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <method.icon
                    className={`h-5 w-5 ${
                      isSelected ? "text-coral" : "text-text-secondary"
                    }`}
                  />
                  <span
                    className={isSelected ? "font-bold" : "font-medium"}
                  >
                    {method.label}
                  </span>
                  {isSelected && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-coral"
                      layoutId="payment-tab-indicator"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Method description */}
          <AnimatePresence mode="wait">
            {selectedMethodInfo && (
              <motion.p
                key={selectedMethod}
                className="mt-3 text-xs text-text-muted"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {selectedMethodInfo.description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Pay button */}
          <Button
            onClick={handlePay}
            disabled={isProcessing}
            className="mt-6 h-12 w-full rounded-xl bg-coral text-base font-bold text-white shadow-lg shadow-coral/30 transition-transform hover:bg-coral-hover hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay &#8377;599
              </>
            )}
          </Button>
        </motion.div>

        {/* Trust / Security */}
        <div className="rounded-2xl bg-off-white p-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <ShieldCheck className="h-5 w-5 text-emerald" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                256-bit encryption
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Lock className="h-5 w-5 text-navy" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                Razorpay Secure
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                <Check className="h-5 w-5 text-coral" />
              </div>
              <span className="text-[10px] font-medium text-text-muted">
                Instant activation
              </span>
            </div>
          </div>
        </div>

        {/* Refund note */}
        <p className="text-center text-[10px] leading-relaxed text-text-muted">
          Full refund within 7 days if you haven&apos;t used the swipe feature.
          By proceeding, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-navy">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
