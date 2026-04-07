"use client";

import { useState, useCallback } from "react";
import { Mail, MapPin, Send, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const subjects = ["General", "Bug Report", "Account Issue", "Partnership", "Other"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.subject) {
    errors.subject = "Please select a subject.";
  }
  if (form.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }
  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field as user types
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      },
    []
  );

  const handleBlur = useCallback(
    (field: keyof FormState) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validate(form);
      if (fieldErrors[field]) {
        setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
      }
    },
    [form]
  );

  const isFormFilled =
    form.name.trim().length >= 2 &&
    EMAIL_RE.test(form.email.trim()) &&
    form.subject !== "" &&
    form.message.trim().length >= 10;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, subject: true, message: true });

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm(INITIAL_FORM);
        setErrors({});
        setTouched({});
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.message ?? "Failed to send message. Please try again.");
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldError = (field: keyof FormState) =>
    touched[field] ? errors[field] : undefined;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-navy via-[#1a2255] to-navy py-20 md:py-28">
          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Get in Touch
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-ice-blue/70">
                Have a question, found a bug, or want to partner? We&apos;d love to hear from you.
              </p>
            </ScrollReveal>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-narrow">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5">
              {/* Contact Info */}
              <ScrollReveal className="lg:col-span-2">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-navy">Contact Us</h2>
                    <p className="mt-2 text-sm text-text-secondary">
                      We typically respond within 24 hours.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
                        <Mail className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Email</p>
                        <a
                          href="mailto:support@nexgenconnect.com"
                          className="text-sm font-medium text-navy hover:text-coral"
                        >
                          support@nexgenconnect.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5">
                        <MapPin className="h-5 w-5 text-navy" />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Location</p>
                        <p className="text-sm font-medium text-navy">India</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Form */}
              <ScrollReveal delay={0.1} className="lg:col-span-3">
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="rounded-2xl border border-border/50 bg-off-white p-6 shadow-sm sm:p-8"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-navy">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange("name")}
                        onBlur={handleBlur("name")}
                        placeholder="Your name"
                        className="rounded-lg border-border bg-white"
                        aria-invalid={!!fieldError("name")}
                        aria-describedby={fieldError("name") ? "name-error" : undefined}
                      />
                      {fieldError("name") && (
                        <p id="name-error" className="mt-1 text-xs text-red-500">
                          {fieldError("name")}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange("email")}
                        onBlur={handleBlur("email")}
                        placeholder="you@example.com"
                        className="rounded-lg border-border bg-white"
                        aria-invalid={!!fieldError("email")}
                        aria-describedby={fieldError("email") ? "email-error" : undefined}
                      />
                      {fieldError("email") && (
                        <p id="email-error" className="mt-1 text-xs text-red-500">
                          {fieldError("email")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-navy">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      onBlur={handleBlur("subject")}
                      aria-invalid={!!fieldError("subject")}
                      aria-describedby={fieldError("subject") ? "subject-error" : undefined}
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/20 ${
                        fieldError("subject")
                          ? "border-red-500 text-text-primary"
                          : "border-border text-text-primary"
                      }`}
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {fieldError("subject") && (
                      <p id="subject-error" className="mt-1 text-xs text-red-500">
                        {fieldError("subject")}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-navy">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange("message")}
                      onBlur={handleBlur("message")}
                      placeholder="Tell us what's on your mind..."
                      aria-invalid={!!fieldError("message")}
                      aria-describedby={fieldError("message") ? "message-error" : undefined}
                      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/20 ${
                        fieldError("message")
                          ? "border-red-500 text-text-primary"
                          : "border-border text-text-primary"
                      }`}
                    />
                    {fieldError("message") && (
                      <p id="message-error" className="mt-1 text-xs text-red-500">
                        {fieldError("message")}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !isFormFilled}
                    className="mt-6 w-full rounded-lg bg-coral py-3 text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
