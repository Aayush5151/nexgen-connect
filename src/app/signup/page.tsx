"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Calendar,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Camera,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiPhotoGrid } from "@/components/shared/MultiPhotoGrid";
import { CameraSelfie } from "@/components/shared/CameraSelfie";
import { PillSelector } from "@/components/shared/PillSelector";
import ConfettiEffect from "@/components/shared/ConfettiEffect";
import {
  INDIAN_CITY_NAMES,
  DESTINATION_COUNTRIES,
  INTAKE_PERIODS,
  HOBBY_CATEGORIES,
  LANGUAGE_OPTIONS,
  COURSE_FIELDS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  ICEBREAKER_PROMPTS,
  THIS_OR_THAT_OPTIONS,
} from "@/lib/constants/indian-cities";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
  firstName: string;
  photos: File[];
  photoPreviews: string[];
  bio: string;
  dateOfBirth: string;
  gender: string;
  religion: string;
  languages: string[];
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
  university: string;
  intakePeriod: string;
  courseField: string;
  hobbies: string[];
  isNightOwl: boolean | null;
  isCooking: boolean | null;
  isNeatFreak: boolean | null;
  isIntrovert: boolean | null;
  isMountains: boolean | null;
  isChai: boolean | null;
  thisOrThat: Record<string, "left" | "right">;
  icebreakerPrompt: string;
  icebreakerAnswer: string;
  phone: string;
  email: string;
  instagramHandle: string;
}

interface StepErrors {
  [key: string]: string;
}

type VerifyPhoneState =
  | "idle"
  | "sending"
  | "otp_sent"
  | "verifying"
  | "verified";

type VerifyEmailState =
  | "idle"
  | "sending"
  | "link_sent"
  | "verifying"
  | "verified";

interface VerificationState {
  phone: VerifyPhoneState;
  email: VerifyEmailState;
  face: "idle" | "verified";
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS_META = [
  { label: "Profile", icon: User },
  { label: "Personal", icon: Calendar },
  { label: "Destination", icon: MapPin },
  { label: "Personality", icon: Sparkles },
  { label: "Verify", icon: ShieldCheck },
];

const INITIAL_FORM: FormState = {
  firstName: "",
  photos: [],
  photoPreviews: [],
  bio: "",
  dateOfBirth: "",
  gender: "",
  religion: "Prefer not to say",
  languages: [],
  originCity: "",
  destinationCountry: "",
  destinationCity: "",
  university: "",
  intakePeriod: "",
  courseField: "",
  hobbies: [],
  isNightOwl: null,
  isCooking: null,
  isNeatFreak: null,
  isIntrovert: null,
  isMountains: null,
  isChai: null,
  thisOrThat: {},
  icebreakerPrompt: "",
  icebreakerAnswer: "",
  phone: "",
  email: "",
  instagramHandle: "",
};

const LIFESTYLE_TOGGLES: {
  key: keyof Pick<
    FormState,
    | "isNightOwl"
    | "isCooking"
    | "isNeatFreak"
    | "isIntrovert"
    | "isMountains"
    | "isChai"
  >;
  leftEmoji: string;
  leftLabel: string;
  rightEmoji: string;
  rightLabel: string;
}[] = [
  {
    key: "isNightOwl",
    leftEmoji: "\uD83C\uDF19",
    leftLabel: "Night Owl",
    rightEmoji: "\u2600\uFE0F",
    rightLabel: "Early Bird",
  },
  {
    key: "isCooking",
    leftEmoji: "\uD83C\uDF73",
    leftLabel: "Cooking",
    rightEmoji: "\uD83D\uDEF5",
    rightLabel: "Ordering In",
  },
  {
    key: "isNeatFreak",
    leftEmoji: "\uD83E\uDDF9",
    leftLabel: "Neat Freak",
    rightEmoji: "\uD83C\uDFA8",
    rightLabel: "Organized Chaos",
  },
  {
    key: "isIntrovert",
    leftEmoji: "\uD83C\uDFA7",
    leftLabel: "Introvert",
    rightEmoji: "\uD83C\uDF89",
    rightLabel: "Extrovert",
  },
  {
    key: "isMountains",
    leftEmoji: "\uD83C\uDFD4\uFE0F",
    leftLabel: "Mountains",
    rightEmoji: "\uD83C\uDFD6\uFE0F",
    rightLabel: "Beaches",
  },
  {
    key: "isChai",
    leftEmoji: "\u2615",
    leftLabel: "Chai",
    rightEmoji: "\u2615",
    rightLabel: "Coffee",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const selectClasses =
  "w-full rounded-lg border border-border bg-off-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/20";

const selectErrorClasses =
  "w-full rounded-lg border border-red-400 bg-off-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/20";

function getMaxDobDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().split("T")[0];
}

function computeAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getDate())
  ) {
    age--;
  }
  return age;
}

// ---------------------------------------------------------------------------
// StepIndicator
// ---------------------------------------------------------------------------

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2.5">
      {STEPS_META.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-1 sm:gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-all sm:h-10 sm:w-10 ${
                i < currentStep
                  ? "bg-emerald text-white"
                  : i === currentStep
                    ? "bg-coral text-white shadow-md shadow-coral/30"
                    : "bg-muted text-text-muted"
              }`}
            >
              {i < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            <span
              className={`hidden text-xs font-medium sm:inline ${
                i === currentStep
                  ? "text-navy"
                  : i < currentStep
                    ? "text-emerald"
                    : "text-text-muted"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS_META.length - 1 && (
              <div
                className={`h-0.5 w-4 rounded-full sm:w-8 ${
                  i < currentStep ? "bg-emerald" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OTP Input Component
// ---------------------------------------------------------------------------

function OTPInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (error) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  function handleChange(index: number, val: string) {
    if (!/^\d*$/.test(val)) return;
    const next = [...value];
    next[index] = val.slice(-1);
    onChange(next);
    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...value];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    onChange(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputs.current[focusIdx]?.focus();
  }

  return (
    <div
      className={`flex justify-center gap-2.5 transition-transform ${shaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={`h-12 w-10 rounded-lg border-2 bg-off-white text-center text-lg font-bold outline-none transition-all focus:border-coral focus:ring-2 focus:ring-coral/20 sm:h-14 sm:w-12 ${
            error
              ? "border-red-400 text-red-600"
              : value[i]
                ? "border-navy text-navy"
                : "border-border text-text-secondary"
          } disabled:opacity-50`}
        />
      ))}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-8px);
          }
          40% {
            transform: translateX(8px);
          }
          60% {
            transform: translateX(-6px);
          }
          80% {
            transform: translateX(6px);
          }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep0(form: FormState): StepErrors {
  const errors: StepErrors = {};
  if (form.firstName.trim().length < 2)
    errors.firstName = "First name must be at least 2 characters";
  if (form.photos.length < 2) errors.photos = "Upload at least 2 photos";
  if (form.bio.trim().length < 10)
    errors.bio = "Bio must be at least 10 characters";
  return errors;
}

function validateStep1(form: FormState): StepErrors {
  const errors: StepErrors = {};
  const age = computeAge(form.dateOfBirth);
  if (!form.dateOfBirth) errors.dateOfBirth = "Please enter your date of birth";
  else if (age === null || age < 16)
    errors.dateOfBirth = "You must be at least 16 years old";
  if (!form.gender) errors.gender = "Please select your gender";
  if (form.languages.length < 1)
    errors.languages = "Please select at least 1 language";
  return errors;
}

function validateStep2(form: FormState): StepErrors {
  const errors: StepErrors = {};
  if (!form.originCity) errors.originCity = "Please select your city";
  if (!form.destinationCountry)
    errors.destinationCountry = "Please select a destination country";
  if (!form.intakePeriod)
    errors.intakePeriod = "Please select an intake period";
  return errors;
}

function validateStep3(form: FormState): StepErrors {
  const errors: StepErrors = {};
  if (form.hobbies.length < 3 || form.hobbies.length > 5)
    errors.hobbies = "Please select 3-5 hobbies";
  return errors;
}

function isStep0Valid(form: FormState): boolean {
  return (
    form.firstName.trim().length >= 2 &&
    form.photos.length >= 2 &&
    form.bio.trim().length >= 10
  );
}

function isStep1Valid(form: FormState): boolean {
  const age = computeAge(form.dateOfBirth);
  return (
    !!form.dateOfBirth &&
    age !== null &&
    age >= 16 &&
    !!form.gender &&
    form.languages.length >= 1
  );
}

function isStep2Valid(form: FormState): boolean {
  return !!form.originCity && !!form.destinationCountry && !!form.intakePeriod;
}

function isStep3Valid(form: FormState): boolean {
  return form.hobbies.length >= 3 && form.hobbies.length <= 5;
}

// ===========================================================================
// Main Component
// ===========================================================================

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<StepErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Verification
  const [verification, setVerification] = useState<VerificationState>({
    phone: "idle",
    email: "idle",
    face: "idle",
  });

  // OTP
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState(false);
  const [otpResendTimer, setOtpResendTimer] = useState(0);

  // Email
  const [emailResendTimer, setEmailResendTimer] = useState(0);

  // Join
  const [joining, setJoining] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Hobby active category
  const [activeHobbyCategory, setActiveHobbyCategory] = useState(0);

  // ---- Timers ----

  useEffect(() => {
    if (otpResendTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpResendTimer]);

  useEffect(() => {
    if (emailResendTimer <= 0) return;
    const interval = setInterval(() => {
      setEmailResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [emailResendTimer]);

  // ---- Form updaters ----

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        if (prev[key]) {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return prev;
      });
    },
    [],
  );

  const markTouched = useCallback((key: string) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  }, []);

  // ---- Photo handling ----

  function handlePhotosAdd(files: File[]) {
    setForm((prev) => {
      const newPhotos = [...prev.photos, ...files];
      const newPreviews = [
        ...prev.photoPreviews,
        ...files.map((f) => URL.createObjectURL(f)),
      ];
      return { ...prev, photos: newPhotos, photoPreviews: newPreviews };
    });
    setErrors((prev) => {
      if (prev.photos) {
        const next = { ...prev };
        delete next.photos;
        return next;
      }
      return prev;
    });
  }

  function handlePhotoRemove(index: number) {
    setForm((prev) => {
      URL.revokeObjectURL(prev.photoPreviews[index]);
      const newPhotos = [...prev.photos];
      const newPreviews = [...prev.photoPreviews];
      newPhotos.splice(index, 1);
      newPreviews.splice(index, 1);
      return { ...prev, photos: newPhotos, photoPreviews: newPreviews };
    });
  }

  // ---- Hobby toggling ----

  function toggleHobby(hobby: string) {
    setForm((prev) => {
      const has = prev.hobbies.includes(hobby);
      if (has) {
        return { ...prev, hobbies: prev.hobbies.filter((h) => h !== hobby) };
      }
      if (prev.hobbies.length < 5) {
        return { ...prev, hobbies: [...prev.hobbies, hobby] };
      }
      return prev;
    });
    setErrors((prev) => {
      if (prev.hobbies) {
        const next = { ...prev };
        delete next.hobbies;
        return next;
      }
      return prev;
    });
  }

  // ---- Language toggling ----

  function toggleLanguage(lang: string) {
    setForm((prev) => {
      const has = prev.languages.includes(lang);
      if (has) {
        return {
          ...prev,
          languages: prev.languages.filter((l) => l !== lang),
        };
      }
      return { ...prev, languages: [...prev.languages, lang] };
    });
    setErrors((prev) => {
      if (prev.languages) {
        const next = { ...prev };
        delete next.languages;
        return next;
      }
      return prev;
    });
  }

  // ---- This or That ----

  function selectThisOrThat(id: string, side: "left" | "right") {
    setForm((prev) => ({
      ...prev,
      thisOrThat: { ...prev.thisOrThat, [id]: side },
    }));
  }

  // ---- Navigation ----

  function handleNext() {
    let stepErrors: StepErrors = {};
    if (step === 0) stepErrors = validateStep0(form);
    else if (step === 1) stepErrors = validateStep1(form);
    else if (step === 2) stepErrors = validateStep2(form);
    else if (step === 3) stepErrors = validateStep3(form);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setTouched({});
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setErrors({});
    setTouched({});
    setStep((s) => Math.max(s - 1, 0));
  }

  // ---- Phone OTP ----

  function handleSendOTP() {
    const clean = form.phone.replace(/\s/g, "");
    if (clean.length !== 10 || !/^\d{10}$/.test(clean)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid 10-digit phone number",
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.phone;
      return next;
    });
    setVerification((prev) => ({ ...prev, phone: "sending" }));
    setTimeout(() => {
      setVerification((prev) => ({ ...prev, phone: "otp_sent" }));
      setOtpResendTimer(30);
      toast.success("OTP sent!");
    }, 1500);
  }

  function handleResendOTP() {
    if (otpResendTimer > 0) return;
    setVerification((prev) => ({ ...prev, phone: "sending" }));
    setOtpDigits(["", "", "", "", "", ""]);
    setOtpError(false);
    setTimeout(() => {
      setVerification((prev) => ({ ...prev, phone: "otp_sent" }));
      setOtpResendTimer(30);
      toast.success("OTP resent!");
    }, 1500);
  }

  function handleVerifyOTP() {
    const code = otpDigits.join("");
    if (code.length < 6) return;

    setVerification((prev) => ({ ...prev, phone: "verifying" }));
    setOtpError(false);

    setTimeout(() => {
      if (code === "000000") {
        // Simulate rejection
        setOtpError(true);
        setVerification((prev) => ({ ...prev, phone: "otp_sent" }));
        setOtpDigits(["", "", "", "", "", ""]);
        toast.error("Invalid OTP. Please try again.");
      } else {
        setVerification((prev) => ({ ...prev, phone: "verified" }));
        toast.success("Phone verified!");
      }
    }, 1000);
  }

  // ---- Email Verification ----

  function handleSendLink() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email address",
      }));
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.email;
      return next;
    });
    setVerification((prev) => ({ ...prev, email: "sending" }));
    setTimeout(() => {
      setVerification((prev) => ({ ...prev, email: "link_sent" }));
      setEmailResendTimer(60);
      toast.success("Verification link sent!");
    }, 1500);
  }

  function handleResendLink() {
    if (emailResendTimer > 0) return;
    setVerification((prev) => ({ ...prev, email: "sending" }));
    setTimeout(() => {
      setVerification((prev) => ({ ...prev, email: "link_sent" }));
      setEmailResendTimer(60);
      toast.success("Link resent!");
    }, 1500);
  }

  function handleConfirmEmailClicked() {
    setVerification((prev) => ({ ...prev, email: "verifying" }));
    setTimeout(() => {
      setVerification((prev) => ({ ...prev, email: "verified" }));
      toast.success("Email verified!");
    }, 2000);
  }

  // ---- Join ----

  const canJoinCohort =
    verification.phone === "verified" &&
    verification.email === "verified" &&
    verification.face === "verified";

  function handleJoinCohort() {
    if (!canJoinCohort || joining) return;
    setJoining(true);
    // Simulate POST /api/users
    setTimeout(() => {
      setShowConfetti(true);
      toast.success("Welcome to NexGen Connect!");
      setTimeout(() => {
        router.push("/app/cohort");
      }, 2000);
    }, 2000);
  }

  const age = computeAge(form.dateOfBirth);

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <>
      <ConfettiEffect active={showConfetti} />

      <main className="flex min-h-screen flex-col bg-off-white">
        {/* Progress bar */}
        <div className="sticky top-0 z-20 border-b border-border/50 bg-white/95 px-4 py-4 backdrop-blur-sm">
          <StepIndicator currentStep={step} />
        </div>

        <div className="flex flex-1 items-start justify-center px-4 py-8 sm:py-12">
          <div className="w-full max-w-lg">
            {/* ============================================================ */}
            {/* STEP 0: Who are you? (Profile)                               */}
            {/* ============================================================ */}
            {step === 0 && (
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-navy">Who are you?</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Let&apos;s start with the basics.
                </p>

                <div className="mt-6 space-y-5">
                  {/* First Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      First Name <span className="text-coral">*</span>
                    </label>
                    <Input
                      placeholder="Your first name"
                      value={form.firstName}
                      onChange={(e) =>
                        updateField("firstName", e.target.value)
                      }
                      onBlur={() => markTouched("firstName")}
                      className={`rounded-lg border-border bg-off-white ${
                        errors.firstName ||
                        (touched.firstName &&
                          form.firstName.trim().length > 0 &&
                          form.firstName.trim().length < 2)
                          ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-200"
                          : ""
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.firstName}
                      </p>
                    )}
                    {!errors.firstName &&
                      touched.firstName &&
                      form.firstName.trim().length > 0 &&
                      form.firstName.trim().length < 2 && (
                        <p className="mt-1 text-xs text-red-500">
                          At least 2 characters required
                        </p>
                      )}
                  </div>

                  {/* Photos */}
                  <MultiPhotoGrid
                    photos={form.photos}
                    previews={form.photoPreviews}
                    onAdd={handlePhotosAdd}
                    onRemove={handlePhotoRemove}
                    maxPhotos={6}
                    minPhotos={2}
                    error={errors.photos}
                  />

                  {/* Bio */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Bio <span className="text-coral">*</span>
                    </label>
                    <textarea
                      placeholder="CS student from Mumbai who overthinks playlist order"
                      maxLength={200}
                      value={form.bio}
                      onChange={(e) => updateField("bio", e.target.value)}
                      onBlur={() => markTouched("bio")}
                      rows={3}
                      className={`w-full resize-none rounded-lg border bg-off-white px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-navy focus:ring-2 focus:ring-navy/20 ${
                        errors.bio
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-border"
                      }`}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      {errors.bio ? (
                        <p className="text-xs text-red-500">{errors.bio}</p>
                      ) : touched.bio &&
                        form.bio.trim().length > 0 &&
                        form.bio.trim().length < 10 ? (
                        <p className="text-xs text-red-500">
                          At least 10 characters required
                        </p>
                      ) : (
                        <span />
                      )}
                      <p
                        className={`text-xs ${
                          form.bio.length >= 180
                            ? "font-semibold text-red-500"
                            : "text-text-muted"
                        }`}
                      >
                        {form.bio.length}/200
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={!isStep0Valid(form)}
                  className="mt-6 w-full rounded-lg bg-coral text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 1: Personal Details                                      */}
            {/* ============================================================ */}
            {step === 1 && (
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-navy">
                  Personal Details
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  A few more things about you.
                </p>

                <div className="mt-6 space-y-5">
                  {/* Date of Birth */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Date of Birth <span className="text-coral">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      max={getMaxDobDate()}
                      onChange={(e) =>
                        updateField("dateOfBirth", e.target.value)
                      }
                      className={`w-full rounded-lg border bg-off-white px-3 py-2 text-sm outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/20 ${
                        errors.dateOfBirth
                          ? "border-red-400 focus:border-red-400 focus:ring-red-200"
                          : "border-border"
                      }`}
                    />
                    {age !== null && age >= 16 && (
                      <p className="mt-1 text-xs font-medium text-emerald">
                        You are {age} years old
                      </p>
                    )}
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <PillSelector
                    label="Gender"
                    required
                    options={GENDER_OPTIONS}
                    value={form.gender}
                    onChange={(v) => updateField("gender", v)}
                    colorScheme="coral"
                    error={errors.gender}
                  />

                  {/* Religion */}
                  <PillSelector
                    label="Religion"
                    options={RELIGION_OPTIONS}
                    value={form.religion}
                    onChange={(v) => updateField("religion", v)}
                    colorScheme="navy"
                  />

                  {/* Languages */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-navy">
                      Languages <span className="text-coral">*</span>
                      {form.languages.length > 0 && (
                        <span className="ml-2 text-xs font-semibold text-emerald">
                          ({form.languages.length} selected)
                        </span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((l) => {
                        const isSelected = form.languages.includes(l);
                        return (
                          <button
                            key={l}
                            type="button"
                            onClick={() => toggleLanguage(l)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                              isSelected
                                ? "border-navy bg-navy/10 text-navy"
                                : "border-border bg-off-white text-text-secondary hover:border-navy/30"
                            }`}
                          >
                            {isSelected && (
                              <Check className="mr-1 inline h-3 w-3" />
                            )}
                            {l}
                          </button>
                        );
                      })}
                    </div>
                    {errors.languages && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.languages}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 rounded-lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep1Valid(form)}
                    className="flex-1 rounded-lg bg-coral text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 2: Where are you headed? (Destination)                  */}
            {/* ============================================================ */}
            {step === 2 && (
              <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-bold text-navy">
                  Where are you headed?
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  We&apos;ll use this to place you in the right cohort.
                </p>

                <div className="mt-6 space-y-4">
                  {/* Origin City */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Origin City <span className="text-coral">*</span>
                    </label>
                    <select
                      value={form.originCity}
                      onChange={(e) =>
                        updateField("originCity", e.target.value)
                      }
                      className={
                        errors.originCity ? selectErrorClasses : selectClasses
                      }
                    >
                      <option value="">Select your city</option>
                      {INDIAN_CITY_NAMES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.originCity && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.originCity}
                      </p>
                    )}
                  </div>

                  {/* Destination Country */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Destination Country{" "}
                      <span className="text-coral">*</span>
                    </label>
                    <select
                      value={form.destinationCountry}
                      onChange={(e) =>
                        updateField("destinationCountry", e.target.value)
                      }
                      className={
                        errors.destinationCountry
                          ? selectErrorClasses
                          : selectClasses
                      }
                    >
                      <option value="">Select destination</option>
                      {DESTINATION_COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.destinationCountry && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.destinationCountry}
                      </p>
                    )}
                  </div>

                  {/* Destination City (optional) */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Destination City
                    </label>
                    <Input
                      placeholder="Munich, London, etc."
                      value={form.destinationCity}
                      onChange={(e) =>
                        updateField("destinationCity", e.target.value)
                      }
                      className="rounded-lg border-border bg-off-white"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      Leave blank if not sure yet
                    </p>
                  </div>

                  {/* University (optional) */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      University
                    </label>
                    <Input
                      placeholder="TU Munich, UCL, etc."
                      value={form.university}
                      onChange={(e) =>
                        updateField("university", e.target.value)
                      }
                      className="rounded-lg border-border bg-off-white"
                    />
                    <p className="mt-1 text-xs text-text-muted">
                      Leave blank if still deciding
                    </p>
                  </div>

                  {/* Intake Period */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Intake Period <span className="text-coral">*</span>
                    </label>
                    <select
                      value={form.intakePeriod}
                      onChange={(e) =>
                        updateField("intakePeriod", e.target.value)
                      }
                      className={
                        errors.intakePeriod
                          ? selectErrorClasses
                          : selectClasses
                      }
                    >
                      <option value="">Select intake</option>
                      {INTAKE_PERIODS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {errors.intakePeriod && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.intakePeriod}
                      </p>
                    )}
                  </div>

                  {/* Course / Field (optional) */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-navy">
                      Course / Field
                    </label>
                    <select
                      value={form.courseField}
                      onChange={(e) =>
                        updateField("courseField", e.target.value)
                      }
                      className={selectClasses}
                    >
                      <option value="">Select field</option>
                      {COURSE_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 rounded-lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep2Valid(form)}
                    className="flex-1 rounded-lg bg-coral text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 3: The fun stuff (Personality)                          */}
            {/* ============================================================ */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Card: Hobbies */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-navy">
                    The fun stuff
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Help others get to know you.
                  </p>

                  {/* --- A. Hobbies (categorized) --- */}
                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-navy">
                      Pick 3-5 Hobbies <span className="text-coral">*</span>
                      <span
                        className={`ml-2 text-xs ${
                          form.hobbies.length >= 3 && form.hobbies.length <= 5
                            ? "font-semibold text-emerald"
                            : "text-text-muted"
                        }`}
                      >
                        ({form.hobbies.length}/5)
                      </span>
                    </label>

                    {/* Category tabs */}
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {HOBBY_CATEGORIES.map((cat, idx) => (
                        <button
                          key={cat.category}
                          type="button"
                          onClick={() => setActiveHobbyCategory(idx)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                            activeHobbyCategory === idx
                              ? "bg-navy text-white"
                              : "bg-off-white text-text-secondary hover:bg-navy/10"
                          }`}
                        >
                          {cat.category}
                        </button>
                      ))}
                    </div>

                    {/* Hobby pills for active category */}
                    <div className="flex flex-wrap gap-2">
                      {HOBBY_CATEGORIES[activeHobbyCategory].hobbies.map(
                        (h) => {
                          const isSelected = form.hobbies.includes(h.name);
                          const isFull = form.hobbies.length >= 5;
                          return (
                            <button
                              key={h.name}
                              type="button"
                              onClick={() => toggleHobby(h.name)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                isSelected
                                  ? "animate-[bounce-once_0.3s_ease] border-coral bg-coral/10 text-coral"
                                  : isFull
                                    ? "border-border bg-off-white text-text-secondary opacity-40"
                                    : "border-border bg-off-white text-text-secondary hover:border-navy/30"
                              }`}
                            >
                              <span className="mr-1">{h.emoji}</span>
                              {isSelected && (
                                <Check className="mr-0.5 inline h-3 w-3" />
                              )}
                              {h.name}
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* Selected hobbies summary */}
                    {form.hobbies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {form.hobbies.map((h) => {
                          const hobbyData = HOBBY_CATEGORIES.flatMap(
                            (c) => c.hobbies,
                          ).find((hb) => hb.name === h);
                          return (
                            <span
                              key={h}
                              className="inline-flex items-center rounded-full border border-coral bg-coral/10 px-2.5 py-1 text-xs font-semibold text-coral"
                            >
                              {hobbyData?.emoji} {h}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {errors.hobbies && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.hobbies}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card: Lifestyle Toggles */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <label className="mb-3 block text-sm font-medium text-navy">
                    Lifestyle
                  </label>
                  <div className="space-y-2.5">
                    {LIFESTYLE_TOGGLES.map((toggle) => {
                      const val = form[toggle.key] as boolean | null;
                      return (
                        <div
                          key={toggle.key}
                          className="flex items-center overflow-hidden rounded-xl border border-border"
                        >
                          {/* Left side */}
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                toggle.key,
                                val === true ? null : (true as never),
                              )
                            }
                            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
                              val === true
                                ? "bg-coral/10 text-coral"
                                : "bg-off-white text-text-muted hover:bg-off-white/80"
                            }`}
                          >
                            <span>{toggle.leftEmoji}</span>
                            {toggle.leftLabel}
                          </button>

                          {/* Divider */}
                          <div className="w-px self-stretch bg-border" />

                          {/* Right side */}
                          <button
                            type="button"
                            onClick={() =>
                              updateField(
                                toggle.key,
                                val === false ? null : (false as never),
                              )
                            }
                            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-sm font-medium transition-all ${
                              val === false
                                ? "bg-coral/10 text-coral"
                                : "bg-off-white text-text-muted hover:bg-off-white/80"
                            }`}
                          >
                            <span>{toggle.rightEmoji}</span>
                            {toggle.rightLabel}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card: This or That */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <label className="mb-3 block text-sm font-medium text-navy">
                    This or That
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {THIS_OR_THAT_OPTIONS.map((opt) => {
                      const selected = form.thisOrThat[opt.id];
                      return (
                        <div
                          key={opt.id}
                          className="flex overflow-hidden rounded-xl border border-border"
                        >
                          <button
                            type="button"
                            onClick={() => selectThisOrThat(opt.id, "left")}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all ${
                              selected === "left"
                                ? "bg-coral/10 text-coral"
                                : "bg-off-white text-text-muted hover:bg-off-white/80"
                            }`}
                          >
                            <span className="text-lg">{opt.leftEmoji}</span>
                            {opt.left}
                          </button>
                          <div className="w-px self-stretch bg-border" />
                          <button
                            type="button"
                            onClick={() => selectThisOrThat(opt.id, "right")}
                            className={`flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all ${
                              selected === "right"
                                ? "bg-coral/10 text-coral"
                                : "bg-off-white text-text-muted hover:bg-off-white/80"
                            }`}
                          >
                            <span className="text-lg">{opt.rightEmoji}</span>
                            {opt.right}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card: Icebreaker */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <label className="mb-3 block text-sm font-medium text-navy">
                    Icebreaker{" "}
                    <span className="text-xs font-normal text-text-muted">
                      (optional)
                    </span>
                  </label>

                  <select
                    value={form.icebreakerPrompt}
                    onChange={(e) =>
                      updateField("icebreakerPrompt", e.target.value)
                    }
                    className={selectClasses}
                  >
                    <option value="">Pick a prompt...</option>
                    {ICEBREAKER_PROMPTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  {form.icebreakerPrompt && (
                    <Input
                      placeholder="Your answer..."
                      value={form.icebreakerAnswer}
                      onChange={(e) =>
                        updateField("icebreakerAnswer", e.target.value)
                      }
                      className="mt-3 rounded-lg border-border bg-off-white"
                    />
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 rounded-lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!isStep3Valid(form)}
                    className="flex-1 rounded-lg bg-coral text-white hover:bg-coral-hover active:scale-[0.98] disabled:opacity-50"
                  >
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* STEP 4: Verify & Join                                        */}
            {/* ============================================================ */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-navy">
                    Verify & Join
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Last step before you join your cohort.
                  </p>
                </div>

                {/* ---- Phone OTP ---- */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        verification.phone === "verified"
                          ? "bg-emerald/10"
                          : "bg-coral/10"
                      }`}
                    >
                      {verification.phone === "verified" ? (
                        <Check className="h-5 w-5 text-emerald" />
                      ) : (
                        <Phone className="h-5 w-5 text-coral" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy">
                        Phone Verification
                      </p>
                      <p className="text-xs text-text-muted">
                        {verification.phone === "verified"
                          ? "Verified"
                          : "We'll send a 6-digit OTP to your number"}
                      </p>
                    </div>
                    {verification.phone === "verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Phone idle state */}
                  {verification.phone === "idle" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <span className="flex h-9 items-center rounded-lg border border-border bg-off-white px-3 text-sm text-text-muted">
                          +91
                        </span>
                        <Input
                          type="tel"
                          placeholder="10 digit number"
                          value={form.phone}
                          onChange={(e) =>
                            updateField(
                              "phone",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          className="flex-1 rounded-lg border-border bg-off-white"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500">{errors.phone}</p>
                      )}
                      <Button
                        onClick={handleSendOTP}
                        className="w-full rounded-lg bg-coral text-white hover:bg-coral-hover"
                      >
                        Send OTP
                      </Button>
                    </div>
                  )}

                  {/* Phone sending state */}
                  {verification.phone === "sending" && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-coral" />
                      <p className="text-sm text-text-secondary">
                        Sending OTP...
                      </p>
                    </div>
                  )}

                  {/* OTP entry */}
                  {verification.phone === "otp_sent" && (
                    <div className="space-y-4">
                      <p className="text-center text-xs text-text-muted">
                        Enter the 6-digit code sent to +91 {form.phone}
                      </p>

                      <OTPInput
                        value={otpDigits}
                        onChange={setOtpDigits}
                        error={otpError}
                      />

                      {otpError && (
                        <p className="text-center text-xs font-medium text-red-500">
                          Invalid OTP. Please try again.
                        </p>
                      )}

                      <Button
                        onClick={handleVerifyOTP}
                        disabled={otpDigits.join("").length < 6}
                        className="w-full rounded-lg bg-coral text-white hover:bg-coral-hover disabled:opacity-50"
                      >
                        Verify OTP
                      </Button>

                      <div className="text-center">
                        {otpResendTimer > 0 ? (
                          <p className="text-xs text-text-muted">
                            Resend in {otpResendTimer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOTP}
                            className="text-xs font-medium text-coral hover:underline"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Phone verifying */}
                  {verification.phone === "verifying" && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-coral" />
                      <p className="text-sm text-text-secondary">
                        Verifying OTP...
                      </p>
                    </div>
                  )}
                </div>

                {/* ---- Email Verification ---- */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        verification.email === "verified"
                          ? "bg-emerald/10"
                          : "bg-coral/10"
                      }`}
                    >
                      {verification.email === "verified" ? (
                        <Check className="h-5 w-5 text-emerald" />
                      ) : (
                        <Mail className="h-5 w-5 text-coral" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-navy">
                        Email Verification
                      </p>
                      <p className="text-xs text-text-muted">
                        {verification.email === "verified"
                          ? "Verified"
                          : "We'll send a verification link"}
                      </p>
                    </div>
                    {verification.email === "verified" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-1 text-xs font-semibold text-emerald">
                        <Check className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Email idle */}
                  {verification.email === "idle" && (
                    <div className="space-y-3">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="rounded-lg border-border bg-off-white"
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500">{errors.email}</p>
                      )}
                      <Button
                        onClick={handleSendLink}
                        className="w-full rounded-lg bg-coral text-white hover:bg-coral-hover"
                      >
                        Send Link
                      </Button>
                    </div>
                  )}

                  {/* Email sending */}
                  {verification.email === "sending" && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-coral" />
                      <p className="text-sm text-text-secondary">
                        Sending verification link...
                      </p>
                    </div>
                  )}

                  {/* Email link sent */}
                  {verification.email === "link_sent" && (
                    <div className="space-y-4">
                      <div className="rounded-lg bg-amber/5 border border-amber/20 px-4 py-3 text-center">
                        <p className="text-sm text-navy">
                          We sent a verification link to{" "}
                          <span className="font-semibold">{form.email}</span>
                        </p>
                        <p className="mt-1 text-xs text-text-muted">
                          Click it, then come back here.
                        </p>
                      </div>

                      <Button
                        onClick={handleConfirmEmailClicked}
                        className="w-full rounded-lg bg-coral text-white hover:bg-coral-hover"
                      >
                        I&apos;ve clicked the link
                      </Button>

                      <div className="text-center">
                        {emailResendTimer > 0 ? (
                          <p className="text-xs text-text-muted">
                            Resend in {emailResendTimer}s
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendLink}
                            className="text-xs font-medium text-coral hover:underline"
                          >
                            Resend link
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Email verifying */}
                  {verification.email === "verifying" && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-coral" />
                      <p className="text-sm text-text-secondary">
                        Checking verification...
                      </p>
                    </div>
                  )}
                </div>

                {/* ---- Face Verification ---- */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <CameraSelfie
                    profilePhotos={form.photoPreviews}
                    onVerified={() =>
                      setVerification((prev) => ({
                        ...prev,
                        face: "verified",
                      }))
                    }
                  />
                </div>

                {/* ---- Social (Optional) ---- */}
                <div className="rounded-2xl border border-border/50 bg-white p-6 shadow-sm sm:p-8">
                  <label className="mb-3 block text-sm font-medium text-navy">
                    Social{" "}
                    <span className="text-xs font-normal text-text-muted">
                      (optional)
                    </span>
                  </label>
                  <div>
                    <label className="mb-1.5 block text-xs text-text-muted">
                      Instagram Handle
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-muted">@</span>
                      <Input
                        placeholder="your_handle"
                        value={form.instagramHandle}
                        onChange={(e) =>
                          updateField("instagramHandle", e.target.value)
                        }
                        className="flex-1 rounded-lg border-border bg-off-white"
                      />
                    </div>
                  </div>
                </div>

                {/* ---- Navigation & Join ---- */}
                <div className="space-y-3">
                  <Button
                    onClick={handleJoinCohort}
                    disabled={!canJoinCohort || joining}
                    className="w-full rounded-xl bg-gradient-to-r from-coral to-[#FF7B7F] py-6 text-base font-bold text-white shadow-lg shadow-coral/20 hover:shadow-xl hover:shadow-coral/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                  >
                    {joining ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Join Your Cohort
                      </>
                    )}
                  </Button>

                  {!canJoinCohort && !joining && (
                    <p className="text-center text-xs text-text-muted">
                      Complete all verifications above to join.
                    </p>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={joining}
                    className="w-full rounded-lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
