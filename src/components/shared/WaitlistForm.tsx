"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CtaButton } from "@/components/ui/CtaButton";
import { CITIES, UNIVERSITIES, INTAKES } from "@/lib/waitlist";

const Schema = z.object({
  name: z.string().trim().min(1, "Your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  city: z.enum(CITIES),
  university: z.enum(UNIVERSITIES.map((u) => u.id) as [string, ...string[]]),
  intake: z.enum(INTAKES),
});

type FormValues = z.infer<typeof Schema>;

interface Props {
  onSuccess?: () => void;
  compact?: boolean;
}

export function WaitlistForm({ onSuccess, compact = false }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: {
      city: "Mumbai",
      university: "tum",
      intake: "Winter 2026",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setSubmitted(true);
      reset();
      onSuccess?.();
      toast.success("You're on the WS26 waitlist.");
    } catch {
      toast.error("Something went wrong. Try again or email aayush@nexgenconnect.com.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-[#121217] p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#66D9A3]">
          Received
        </p>
        <h3 className="mt-3 font-heading text-2xl font-semibold text-foreground">
          You&apos;re in the WS26 waitlist.
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          I&apos;ll personally email you the next time your cohort gets closer to filling.
          If you got questions, reply to that email. A person reads it.
        </p>
        <p className="mt-4 font-mono text-xs text-subtle">Aayush · Ahmedabad</p>
      </div>
    );
  }

  const label =
    "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground";
  const input =
    "w-full rounded-lg border border-border bg-[#0B0B0F] px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-subtle transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10";
  const err = "mt-1 text-xs text-[#F07A6D]";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className={compact ? "space-y-4" : "grid gap-4 md:grid-cols-2"}>
        <div>
          <label className={label} htmlFor="wl-name">Your name</label>
          <input id="wl-name" {...register("name")} placeholder="Aayush Shah" className={input} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={label} htmlFor="wl-phone">Phone (we verify later)</label>
          <input id="wl-phone" {...register("phone")} placeholder="+91 98765 43210" className={input} />
          {errors.phone && <p className={err}>{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="wl-email">Email (optional)</label>
        <input id="wl-email" {...register("email")} placeholder="you@example.com" className={input} />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className={label} htmlFor="wl-city">Your city in India</label>
          <select id="wl-city" {...register("city")} className={input}>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="wl-uni">University in Germany</label>
          <select id="wl-uni" {...register("university")} className={input}>
            {UNIVERSITIES.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="wl-intake">Intake</label>
          <select id="wl-intake" {...register("intake")} className={input}>
            {INTAKES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] text-subtle">
          No spam. No agents. Unsubscribe instantly.
        </p>
        <CtaButton type="submit" arrow disabled={submitting}>
          {submitting ? "Joining..." : "Join the WS26 waitlist"}
        </CtaButton>
      </div>
    </form>
  );
}
