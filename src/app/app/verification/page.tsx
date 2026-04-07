"use client";

import { useState, useCallback } from "react";
import {
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";

type StepStatus = "completed" | "pending" | "verifying";

interface VerificationStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  status: StepStatus;
  optional: boolean;
}

const initialSteps: VerificationStep[] = [
  {
    id: "phone",
    label: "Phone Number",
    description: "Verified via OTP during signup",
    icon: Phone,
    status: "completed",
    optional: false,
  },
  {
    id: "email",
    label: "Email Address",
    description: "Verified via confirmation link",
    icon: Mail,
    status: "completed",
    optional: false,
  },
  {
    id: "face",
    label: "Face Verification",
    description: "Verify your identity with a live selfie",
    icon: Camera,
    status: "pending",
    optional: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    description: "Verify your professional profile",
    icon: LinkedinIcon,
    status: "pending",
    optional: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    description: "Connect your Instagram account",
    icon: InstagramIcon,
    status: "pending",
    optional: true,
  },
];

function getProgressPercentage(steps: VerificationStep[]): number {
  const completed = steps.filter((s) => s.status === "completed").length;
  return Math.round((completed / steps.length) * 100);
}

// Animated circular progress ring
function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(219, 234, 254, 0.4)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#10B981"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          className="text-sm font-bold text-white"
          key={progress}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {progress}%
        </motion.span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: StepStatus }) {
  if (status === "completed") {
    return (
      <motion.span
        className="flex items-center gap-1 text-xs font-medium text-emerald"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <CheckCircle2 className="h-4 w-4" />
        Verified
      </motion.span>
    );
  }
  if (status === "verifying") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-coral">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verifying
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber">
      <Clock className="h-4 w-4" />
      Pending
    </span>
  );
}

function VerificationStepCard({
  step,
  onVerify,
}: {
  step: VerificationStep;
  onVerify: (id: string) => void;
}) {
  const Icon = step.icon;
  const isCompleted = step.status === "completed";
  const isVerifying = step.status === "verifying";

  return (
    <motion.div
      className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
        isCompleted
          ? "border-emerald/20 bg-emerald/5"
          : "border-border/50 bg-white hover:bg-off-white"
      }`}
      layout
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          isCompleted ? "bg-emerald/10" : "bg-muted"
        }`}
      >
        <AnimatePresence mode="wait">
          {isCompleted ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald" />
            </motion.div>
          ) : (
            <motion.div key="icon" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Icon
                className={`h-5 w-5 ${
                  isCompleted ? "text-emerald" : "text-text-secondary"
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy">{step.label}</p>
          {step.optional && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-text-muted">
              Optional
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-text-muted">{step.description}</p>
      </div>

      <div className="shrink-0">
        {isCompleted ? (
          <StatusBadge status="completed" />
        ) : isVerifying ? (
          <StatusBadge status="verifying" />
        ) : (
          <Button
            variant="outline"
            onClick={() => onVerify(step.id)}
            className="h-8 rounded-lg px-3 text-xs font-medium"
          >
            Verify
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function VerificationPage() {
  const [steps, setSteps] = useState<VerificationStep[]>(initialSteps);

  const progress = getProgressPercentage(steps);
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const totalCount = steps.length;

  const handleVerify = useCallback((id: string) => {
    // Set to verifying state
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "verifying" as StepStatus } : s))
    );

    // After 2s, mark as completed
    setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "completed" as StepStatus } : s
        )
      );
    }, 2000);
  }, []);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Verification</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Build trust with other students
        </p>
      </div>

      <div className="mx-auto max-w-lg space-y-6">
        {/* Progress Card */}
        <motion.div
          className="rounded-2xl bg-gradient-to-r from-navy to-navy/90 p-5 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ice-blue/80">Verification progress</p>
              <motion.p
                className="mt-1 text-3xl font-bold"
                key={progress}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {progress}%
              </motion.p>
            </div>
            <ProgressRing progress={progress} />
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-emerald"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>

          <p className="mt-3 text-xs text-ice-blue/60">
            {completedCount}/{totalCount} steps complete.{" "}
            {progress < 100
              ? "Complete all verifications to get a trust badge on your profile."
              : "All verifications complete! Your profile shows a trust badge."}
          </p>
        </motion.div>

        {/* Checklist */}
        <div className="space-y-3">
          {steps.map((step) => (
            <VerificationStepCard
              key={step.id}
              step={step}
              onVerify={handleVerify}
            />
          ))}
        </div>

        {/* Info */}
        <div className="rounded-2xl bg-off-white p-4">
          <p className="text-xs leading-relaxed text-text-muted">
            <strong className="text-navy">Why verify?</strong> Verified profiles
            get 3x more matches. Your selfie is compared against your profile
            photos. The selfie is deleted after verification.
          </p>
        </div>
      </div>
    </div>
  );
}
