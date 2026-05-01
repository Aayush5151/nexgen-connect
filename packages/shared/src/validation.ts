/**
 * Validation schemas — Zod, shared between client and server.
 *
 * Build Prompt §Bucket 3 / Input validation:
 *   "Every form, both client and server. Zod schemas at the boundary.
 *    Reject malformed input with the right error code from the
 *    catalogue."
 *
 * Server (Bucket 4) tRPC procedures use these as input parsers; mobile
 * forms use them via react-hook-form's Zod resolver. One source of
 * truth, no drift between client validation messages and server
 * rejection messages.
 *
 * v15 BP §16 / v6 build §16 + §18 / Build Prompt Bucket 3.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Phone — E.164 with India-first validation                          */
/* ------------------------------------------------------------------ */

/**
 * Indian mobile phone: 10 digits, leading 6/7/8/9, with optional
 * country code (+91 / 91). The submitted form is normalised to E.164
 * (no plus sign — 919876543210).
 *
 * Why we validate first-digit (6/7/8/9): TRAI mobile-numbering rules
 * mean Indian mobile numbers always start with one of those. Rejecting
 * 919876543210 → 91XX… catches 95% of typos before the OTP fires.
 */
export const PhoneSchema = z.object({
  country: z.literal("IN"),
  e164: z
    .string()
    .regex(/^91[6-9]\d{9}$/, "Enter a valid Indian mobile number (10 digits, starts 6/7/8/9)."),
});

export type PhoneInput = z.infer<typeof PhoneSchema>;

/* ------------------------------------------------------------------ */
/* OTP                                                                 */
/* ------------------------------------------------------------------ */

export const OtpSchema = z.object({
  otpSessionId: z.string().min(1),
  code: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits."),
});

export type OtpInput = z.infer<typeof OtpSchema>;

/* ------------------------------------------------------------------ */
/* Profile (the YOU screen)                                           */
/* ------------------------------------------------------------------ */

export const ProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .max(50, "First name is too long.")
    .regex(
      /^[\p{L}][\p{L}\p{M}\s'-]*$/u,
      "First name uses unsupported characters."
    ),
  /** Optional — backup channel if SMS fails. */
  email: z.union([z.string().email("Enter a valid email."), z.literal(""), z.null()]).optional(),
  /** 1-12 — month of birth, anchor for the composite identity hash. */
  dobMonth: z.number().int().min(1).max(12),
  homeCity: z.string().min(1).max(80),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

/* ------------------------------------------------------------------ */
/* Corridor choice                                                     */
/* ------------------------------------------------------------------ */

export const CorridorChoiceSchema = z.object({
  country: z.enum(["IE", "DE"]),
  city: z.string().min(1).max(80),
  uni: z.string().min(1).max(120),
  intake: z.string().regex(/^[A-Z][a-z]+ \d{4}$/, "Intake must be 'September 2026' format."),
});

export type CorridorChoiceInput = z.infer<typeof CorridorChoiceSchema>;

/* ------------------------------------------------------------------ */
/* O3a "scared" free-text                                              */
/* ------------------------------------------------------------------ */

export const ScaredSchema = z.object({
  text: z.string().max(200, "Keep it under 200 characters."),
});

export type ScaredInput = z.infer<typeof ScaredSchema>;

/* ------------------------------------------------------------------ */
/* Admit-letter upload                                                 */
/* ------------------------------------------------------------------ */

const ADMIT_MIME_ALLOWED = ["image/jpeg", "image/png", "application/pdf"] as const;
const ADMIT_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export const UploadAdmitSchema = z.object({
  mimeType: z.enum(ADMIT_MIME_ALLOWED, {
    message: "Admit letter must be a JPEG, PNG, or PDF.",
  }),
  fileSizeBytes: z
    .number()
    .int()
    .max(ADMIT_MAX_BYTES, "Admit letter is too large (max 8 MB)."),
});

export type UploadAdmitInput = z.infer<typeof UploadAdmitSchema>;

/* ------------------------------------------------------------------ */
/* T&S report                                                          */
/* ------------------------------------------------------------------ */

export const ReportSchema = z.object({
  reason: z
    .string()
    .min(10, "Tell us a bit more — at least 10 characters.")
    .max(2000, "Keep it under 2000 characters."),
  context: z
    .object({
      channelId: z.string().optional(),
      messageId: z.string().optional(),
      userId: z.string().optional(),
    })
    .optional(),
  category: z.enum(["harassment", "scam", "hard_time", "other"]).optional(),
});

export type ReportInput = z.infer<typeof ReportSchema>;

/* ------------------------------------------------------------------ */
/* Parent passcode                                                     */
/* ------------------------------------------------------------------ */

export const ParentPasscodeSchema = z.object({
  passcode: z
    .string()
    .regex(/^\d{6}$/, "Passcode must be exactly 6 digits."),
});

export type ParentPasscodeInput = z.infer<typeof ParentPasscodeSchema>;

/* ------------------------------------------------------------------ */
/* Y6 first-week arrival check-in                                      */
/* ------------------------------------------------------------------ */

export const ArrivalCheckinSchema = z.object({
  dayPostArrival: z.number().int().min(0).max(7),
  status: z.enum([
    "received_thumb_up",
    "received_thumb_down",
    "received_with_note",
    "i_need_help_triggered",
  ]),
  userNote: z.string().max(500).optional(),
});

export type ArrivalCheckinInput = z.infer<typeof ArrivalCheckinSchema>;
