"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { CtaButton } from "@/components/ui/CtaButton";
import {
  startAdminLoginAction,
  verifyAdminLoginAction,
} from "@/app/actions/admin";
import { track } from "@/lib/analytics";
import {
  phoneE164,
  verifyOtpSchema,
  type VerifyOtpInput,
} from "@/lib/supabase/schema";

const phoneSchema = z.object({ phone: phoneE164 });
type PhoneInput = z.infer<typeof phoneSchema>;

const inputClass =
  "mt-2 w-full rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3 text-[15px] text-[color:var(--color-fg)] placeholder:text-[color:var(--color-fg-placeholder)] focus:border-[color:var(--color-primary)] focus:outline-none";

export function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [pending, setPending] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "+91" },
  });
  const otpForm = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone: "", code: "" },
  });

  async function onSubmitPhone(data: PhoneInput) {
    setPending(true);
    setFormError(null);
    track("Admin_Login_Attempt");
    const res = await startAdminLoginAction(data);
    setPending(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setPhone(data.phone);
    setMockMode(res.mock);
    otpForm.reset({ phone: data.phone, code: "" });
    setStep("otp");
  }

  async function onSubmitOtp(data: VerifyOtpInput) {
    setPending(true);
    setFormError(null);
    const res = await verifyAdminLoginAction({ phone, code: data.code });
    setPending(false);
    if (!res.ok) {
      // Do not leak whether the phone is an admin or not — show the error
      // verbatim, server uses generic copy for non-admin rejections.
      setFormError(res.error);
      toast.error(res.error);
      return;
    }
    track("Admin_Login_Success");
    toast.success(`Welcome, ${res.first_name}.`);
    router.replace("/admin");
    router.refresh();
  }

  if (step === "phone") {
    return (
      <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} className="space-y-5">
        <label className="block">
          <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
            Mobile
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91"
            {...phoneForm.register("phone")}
            className={inputClass}
          />
          {phoneForm.formState.errors.phone?.message && (
            <span className="mt-1 block text-[12px] text-[color:var(--color-danger)]">
              {phoneForm.formState.errors.phone.message}
            </span>
          )}
          {formError && (
            <span className="mt-1 block text-[12px] text-[color:var(--color-danger)]">
              {formError}
            </span>
          )}
        </label>
        <CtaButton
          type="submit"
          size="lg"
          arrow
          disabled={pending}
          className="w-full"
        >
          {pending ? "Sending…" : "Send me a code"}
        </CtaButton>
      </form>
    );
  }

  return (
    <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-5">
      <div>
        <p className="text-[13px] text-[color:var(--color-fg-muted)]">
          We sent a 6-digit code to {phone}.
        </p>
        {mockMode && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-primary)]">
            Dev mode · use 000000
          </p>
        )}
      </div>
      <label className="block">
        <span className="text-[13px] font-medium text-[color:var(--color-fg-muted)]">
          Code
        </span>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          {...otpForm.register("code")}
          className={inputClass}
        />
        {otpForm.formState.errors.code?.message && (
          <span className="mt-1 block text-[12px] text-[color:var(--color-danger)]">
            {otpForm.formState.errors.code.message}
          </span>
        )}
        {formError && (
          <span className="mt-1 block text-[12px] text-[color:var(--color-danger)]">
            {formError}
          </span>
        )}
      </label>
      <CtaButton
        type="submit"
        size="lg"
        arrow
        disabled={pending}
        className="w-full"
      >
        {pending ? "Verifying…" : "Verify and enter"}
      </CtaButton>
      <button
        type="button"
        onClick={() => {
          setStep("phone");
          setFormError(null);
        }}
        className="mt-1 text-[12px] text-[color:var(--color-fg-muted)] underline underline-offset-2 hover:text-[color:var(--color-fg)]"
      >
        ← Use a different number
      </button>
    </form>
  );
}
