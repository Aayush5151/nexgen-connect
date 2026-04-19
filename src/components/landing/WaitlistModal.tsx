"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";
import { CtaButton } from "@/components/ui/CtaButton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import {
  startWaitlistAction,
  verifyOtpAction,
} from "@/app/actions/waitlist";
import { track } from "@/lib/analytics";
import { CONSENT_VERSION } from "@/lib/consent";
import {
  startWaitlistSchema,
  verifyOtpSchema,
  type StartWaitlistInput,
  type University,
  type VerifyOtpInput,
} from "@/lib/supabase/schema";

const inputClass =
  "mt-2 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none";

type Step = "details" | "otp" | "success";

type Cohort = { home_city: string; destination_university: University };

export function WaitlistModal({
  open,
  onClose,
  cohort,
}: {
  open: boolean;
  onClose: () => void;
  cohort: Cohort;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<Step>("details");
  const [pending, setPending] = useState(false);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("details");
        setPending(false);
        setPhone("");
        setFirstName("");
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const detailsForm = useForm<StartWaitlistInput>({
    resolver: zodResolver(startWaitlistSchema),
    defaultValues: {
      phone: "+91",
      first_name: "",
      home_city: cohort.home_city,
      destination_university: cohort.destination_university,
      intake: "Sept 2026",
      consent_version: CONSENT_VERSION,
    },
  });

  useEffect(() => {
    detailsForm.setValue("home_city", cohort.home_city);
    detailsForm.setValue("destination_university", cohort.destination_university);
  }, [cohort.home_city, cohort.destination_university, detailsForm]);

  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: "", code: "" },
  });

  async function onSubmitDetails(data: StartWaitlistInput) {
    setPending(true);
    const res = await startWaitlistAction(data);
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setPhone(data.phone);
    setFirstName(data.first_name);
    setMockMode(res.mock);
    otpForm.reset({ phone: data.phone, code: "" });
    setStep("otp");
    track("OTP_Sent", { uni: cohort.destination_university });
  }

  async function onSubmitOtp(data: VerifyOtpInput) {
    setPending(true);
    const res = await verifyOtpAction({ phone, code: data.code });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    track("Signup_Completed", {
      uni: cohort.destination_university,
      city: cohort.home_city,
    });
    setStep("success");
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-0 text-[color:var(--color-fg)] backdrop:bg-black/60"
    >
      <div className="relative p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[color:var(--color-fg-muted)] transition-colors hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-fg)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>

        {step === "details" && (
          <form
            onSubmit={detailsForm.handleSubmit(onSubmitDetails)}
            className="space-y-5"
          >
            <div>
              <SectionLabel>Reserve your spot</SectionLabel>
              <h2 className="mt-3 font-heading text-[24px] font-semibold leading-tight">
                {cohort.destination_university} · Sept 2026
              </h2>
              <p className="mt-2 text-[14px] text-[color:var(--color-fg-muted)]">
                From {cohort.home_city}. One verified match at a time — no
                groups, no agents.
              </p>
            </div>

            <Field
              label="Your first name"
              error={detailsForm.formState.errors.first_name?.message}
            >
              <input
                type="text"
                autoComplete="given-name"
                {...detailsForm.register("first_name")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Your mobile (we'll text a 6-digit code)"
              error={detailsForm.formState.errors.phone?.message}
            >
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91"
                {...detailsForm.register("phone")}
                className={inputClass}
              />
            </Field>

            <p className="text-[11px] leading-relaxed text-[color:var(--color-fg-subtle)]">
              By continuing you agree to our{" "}
              <a
                href="/terms"
                className="underline underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
              >
                terms
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-[color:var(--color-fg-muted)]"
              >
                privacy policy
              </a>
              . We only store a hash of your number.
            </p>

            <CtaButton
              type="submit"
              disabled={pending}
              size="lg"
              arrow
              className="w-full"
            >
              {pending ? "Sending code…" : "Send me a code"}
            </CtaButton>
          </form>
        )}

        {step === "otp" && (
          <form
            onSubmit={otpForm.handleSubmit(onSubmitOtp)}
            className="space-y-5"
          >
            <div>
              <SectionLabel>Verify your number</SectionLabel>
              <h2 className="mt-3 font-heading text-[24px] font-semibold leading-tight">
                Check your SMS
              </h2>
              <p className="mt-2 text-[14px] text-[color:var(--color-fg-muted)]">
                Enter the 6-digit code we sent to {phone}.
              </p>
              {mockMode && (
                <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
                  Dev mode · use 000000
                </p>
              )}
            </div>

            <Field
              label="Code"
              error={otpForm.formState.errors.code?.message}
            >
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                {...otpForm.register("code")}
                className={inputClass}
              />
            </Field>

            <CtaButton
              type="submit"
              disabled={pending}
              size="lg"
              arrow
              className="w-full"
            >
              {pending ? "Verifying…" : "Verify and join"}
            </CtaButton>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="mt-1 text-[12px] text-[color:var(--color-fg-muted)] underline underline-offset-2 hover:text-[color:var(--color-fg)]"
            >
              ← Back
            </button>
          </form>
        )}

        {step === "success" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--color-primary)]/40 bg-[color:var(--color-primary)]/10">
              <CheckCircle2
                className="h-6 w-6 text-[color:var(--color-primary)]"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="font-heading text-[24px] font-semibold leading-tight">
                You&apos;re in, {firstName}.
              </h2>
              <p className="mt-2 text-[14px] text-[color:var(--color-fg-muted)]">
                We&apos;ll SMS you the moment someone from {cohort.home_city}{" "}
                reserves a spot for {cohort.destination_university}.
              </p>
            </div>
            <CtaButton onClick={onClose} size="lg" className="w-full">
              Got it
            </CtaButton>
          </div>
        )}
      </div>
    </dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[12px] text-[color:var(--color-danger)]">
          {error}
        </span>
      )}
    </label>
  );
}
