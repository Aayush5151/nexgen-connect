import { z } from "zod";

export const UNIVERSITIES = ["UCD", "Trinity", "UCC"] as const;
export type University = (typeof UNIVERSITIES)[number];

export const INTAKES = ["Sept 2026"] as const;
export type Intake = (typeof INTAKES)[number];

export const VERIFICATION_STATUS = [
  "unverified",
  "pending",
  "verified",
  "rejected",
] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUS)[number];

export const IDENTITY_STATUS = [
  "unverified",
  "pending",
  "verified",
  "failed",
] as const;
export type IdentityStatus = (typeof IDENTITY_STATUS)[number];

export const ADMISSION_STATUS = [
  "pending_review",
  "approved",
  "declined",
] as const;
export type AdmissionStatus = (typeof ADMISSION_STATUS)[number];

const phoneE164 = z
  .string()
  .trim()
  .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile (e.g. +919876543210)");

const firstName = z
  .string()
  .trim()
  .min(1, "Required")
  .max(40, "Too long")
  .regex(/^[A-Za-z][A-Za-z\s.'-]*$/, "Letters only");

const homeCity = z
  .string()
  .trim()
  .min(2, "Enter your city")
  .max(60, "Too long");

export const startWaitlistSchema = z.object({
  phone: phoneE164,
  first_name: firstName,
  home_city: homeCity,
  destination_university: z.enum(UNIVERSITIES),
  intake: z.enum(INTAKES),
  consent_version: z.string().min(1),
  email: z.string().trim().email().optional(),
});
export type StartWaitlistInput = z.infer<typeof startWaitlistSchema>;

export const verifyOtpSchema = z.object({
  phone: phoneE164,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const cohortQuerySchema = z.object({
  home_city: homeCity,
  destination_university: z.enum(UNIVERSITIES),
});
export type CohortQueryInput = z.infer<typeof cohortQuerySchema>;

export type WaitlistRow = {
  id: string;
  phone_hash: string;
  first_name: string;
  home_city: string;
  destination_university: University;
  intake: Intake;
  verification_status: VerificationStatus;
  admit_letter_url: string | null;
  consent_version: string;
  email_hash: string | null;
  created_at: string;
  verified_at: string | null;
  // DigiLocker identity fields (added in migration 0004)
  digilocker_verified_at: string | null;
  digilocker_reference_id: string | null;
  aadhaar_last4: string | null;
  aadhaar_name_match: boolean | null;
  identity_status: IdentityStatus;
  // Admin review fields (added in migration 0005)
  is_admin: boolean;
  admission_status: AdmissionStatus;
  admission_reviewed_at: string | null;
  admission_reviewed_by: string | null;
  admission_note: string | null;
};

export type AdmissionAuditLogRow = {
  id: string;
  target_id: string;
  admin_id: string;
  from_status: AdmissionStatus;
  to_status: AdmissionStatus;
  note: string | null;
  created_at: string;
};

export const updateAdmissionSchema = z.object({
  target_id: z.string().uuid(),
  new_status: z.enum(["approved", "declined", "pending_review"]),
  note: z.string().trim().max(500).optional(),
});
export type UpdateAdmissionInput = z.infer<typeof updateAdmissionSchema>;

export type AdminStats = {
  total: number;
  pending_review: number;
  approved: number;
  declined: number;
  verified_phone: number;
  identity_verified: number;
};

export type RecentActivityRow = {
  first_name: string;
  home_city: string;
  destination_university: University;
  created_at: string;
};

export type MapCohortRow = {
  destination_university: University;
  cohort_size: number;
};
