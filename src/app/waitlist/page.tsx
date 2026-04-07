"use client";

import { useState, useCallback } from "react";
import { Bell, Users, CheckCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DESTINATION_COUNTRIES, INTAKE_PERIODS, INDIAN_CITY_NAMES } from "@/lib/constants/indian-cities";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian phone: optional +91, then 10 digits starting with 6-9
const INDIAN_PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/;

interface FormState {
  email: string;
  phone: string;
  city: string;
  destination: string;
  intake: string;
}

interface FormErrors {
  email?: string;
  phone?: string;
}

const INITIAL_FORM: FormState = {
  email: "",
  phone: "",
  city: "",
  destination: "",
  intake: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (form.phone.trim() && !INDIAN_PHONE_RE.test(form.phone.trim().replace(/\s+/g, ""))) {
    errors.phone = "Please enter a valid Indian phone number (e.g. +91 98765 43210).";
  }
  return errors;
}

export default function WaitlistPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<"email" | "phone", boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        if (field === "email" || field === "phone") {
          setErrors((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }
      },
    []
  );

  const handleBlur = useCallback(
    (field: "email" | "phone") => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validate(form);
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [form]
  );

  const isFormValid = EMAIL_RE.test(form.email.trim()) && !errors.phone;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setTouched({ email: true, phone: true });

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          city: form.city || undefined,
          destination: form.destination || undefined,
          intake: form.intake || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("You're on the waitlist!");
      } else if (res.status === 409) {
        // Duplicate email
        toast.info("You're already on the waitlist! We'll notify you when your cohort is ready.");
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (field: "email" | "phone") =>
    touched[field] ? errors[field] : undefined;

  return (
    <>
      <Navbar />
      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#1a2255] to-navy py-20 md:py-28">
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-coral/10 blur-3xl" />
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/20">
                <Bell className="h-8 w-8 text-coral" />
              </div>
              <h1 className="mt-6 text-4xl font-bold text-white sm:text-5xl">
                Join the Waitlist
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-xl text-lg text-ice-blue/70">
                Be the first to know when your cohort is ready. We&apos;ll notify you as soon as
                students from your city start joining.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-narrow">
            <div className="mx-auto max-w-lg">
              {submitted ? (
                <ScrollReveal>
                  <div className="rounded-2xl border border-emerald/30 bg-emerald/5 p-8 text-center">
                    <CheckCircle className="mx-auto h-12 w-12 text-emerald" />
                    <h2 className="mt-4 text-2xl font-bold text-navy">You&apos;re In!</h2>
                    <p className="mt-2 text-text-secondary">
                      We&apos;ll email you as soon as your cohort is live. Keep an eye on your inbox.
                    </p>
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal>
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="rounded-2xl border border-border/50 bg-off-white p-6 shadow-sm sm:p-8"
                  >
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="wl-email" className="mb-1.5 block text-sm font-medium text-navy">
                          Email <span className="text-coral">*</span>
                        </label>
                        <Input
                          id="wl-email"
                          type="email"
                          value={form.email}
                          onChange={handleChange("email")}
                          onBlur={handleBlur("email")}
                          placeholder="you@example.com"
                          className="rounded-lg border-border bg-white"
                          aria-invalid={!!fieldError("email")}
                          aria-describedby={fieldError("email") ? "wl-email-error" : undefined}
                        />
                        {fieldError("email") && (
                          <p id="wl-email-error" className="mt-1 text-xs text-red-500">
                            {fieldError("email")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="wl-phone" className="mb-1.5 block text-sm font-medium text-navy">
                          Phone (optional)
                        </label>
                        <Input
                          id="wl-phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange("phone")}
                          onBlur={handleBlur("phone")}
                          placeholder="+91 98765 43210"
                          className="rounded-lg border-border bg-white"
                          aria-invalid={!!fieldError("phone")}
                          aria-describedby={fieldError("phone") ? "wl-phone-error" : undefined}
                        />
                        {fieldError("phone") && (
                          <p id="wl-phone-error" className="mt-1 text-xs text-red-500">
                            {fieldError("phone")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="wl-city" className="mb-1.5 block text-sm font-medium text-navy">
                          Origin City
                        </label>
                        <select
                          id="wl-city"
                          value={form.city}
                          onChange={handleChange("city")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                        >
                          <option value="">Select your city</option>
                          {INDIAN_CITY_NAMES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="wl-dest" className="mb-1.5 block text-sm font-medium text-navy">
                          Destination Country
                        </label>
                        <select
                          id="wl-dest"
                          value={form.destination}
                          onChange={handleChange("destination")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                        >
                          <option value="">Select destination</option>
                          {DESTINATION_COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="wl-intake" className="mb-1.5 block text-sm font-medium text-navy">
                          Intake Period
                        </label>
                        <select
                          id="wl-intake"
                          value={form.intake}
                          onChange={handleChange("intake")}
                          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-navy focus:ring-2 focus:ring-navy/20"
                        >
                          <option value="">Select intake</option>
                          {INTAKE_PERIODS.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="mt-6 w-full rounded-lg bg-coral py-3 text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        "Join Waitlist"
                      )}
                    </Button>
                  </form>
                </ScrollReveal>
              )}

              <ScrollReveal delay={0.2}>
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-text-muted">
                  <Users className="h-4 w-4" />
                  <span>2,400+ students already on the waitlist</span>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
