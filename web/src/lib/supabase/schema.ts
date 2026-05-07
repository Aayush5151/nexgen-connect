import { z } from "zod";

// Two beachhead corridors at launch:
//   - Ireland (Sept 2026): UCD, Trinity, UCC
//   - Germany (Oct 2026): TUM (Munich), LMU (Munich), RWTH Aachen, Humboldt
// Kept in a single union so backend tables don't need a second "intake
// country" column - the university picker drives the country inference
// and the intake selector narrows the month.
export const UNIVERSITIES = [
  "UCD",
  "Trinity",
  "UCC",
  "TUM",
  "LMU",
  "RWTH Aachen",
  "Humboldt",
] as const;
export type University = (typeof UNIVERSITIES)[number];

// Both live intakes at launch. Ireland flies first in September; Germany's
// winter semester follows roughly a month later.
export const INTAKES = ["Sept 2026", "Oct 2026"] as const;
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

// Strips all whitespace before the regex runs so users can type the natural
// "+91 98765 43210" form without tripping validation. Keeps input type as
// `string` (not `unknown`) so react-hook-form's Resolver generic is happy,
// while still normalising to the exact (+91 + 10 digits, no spaces) form
// used to compute phone_hash - stored hashes keep matching on both signup
// and later OTP checks.
export const phoneE164 = z
  .string()
  .transform((val) => val.replace(/\s+/g, ""))
  .pipe(
    z
      .string()
      .regex(/^\+91[6-9]\d{9}$/, "Enter a valid Indian mobile (e.g. +919876543210)"),
  );

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

// ---------------------------------------------------------------------------
// v16 source-of-truth shape — auth.users.user_metadata as the canonical
// signup record. The legacy `waitlist` table (above) stays in place for the
// admin auth gate (waitlist.is_admin) but the v16 funnel writes here:
//
//   /signup            → establish-session sets metadata.signup_step = 'phone'
//                                              + metadata.phone_verified_at
//   /signup/you        → updateProfileAction sets first_name, email, home_city,
//                                              dob_month, signup_step = 'profile'
//   /signup/corridor   → updateCorridorAction (P1.e follow-up)
//   /admin             → reads auth.users + parses metadata, writes
//                                              admission_status via metadata
//
// Keeping it as a typed jsonb blob keeps Drizzle out of the path entirely —
// the v16 funnel persistence is just Supabase Auth metadata.
// ---------------------------------------------------------------------------

export type SignupStep =
  | "phone"
  | "profile"
  | "corridor"
  | "identity"
  | "admit"
  | "complete";

export type SignupMetadata = {
  /** ISO timestamp set by establish-session on first phone OTP success. */
  phone_verified_at?: string;
  /** Furthest funnel step reached. Drives /admin "stage" column. */
  signup_step?: SignupStep;
  /** Profile fields collected at /signup/you. */
  first_name?: string;
  email?: string | null;
  home_city?: string;
  /** 1..12; year intentionally not collected per data-minimisation. */
  dob_month?: number;
  /** Corridor (P1.e). Stored as flat fields for SQL ease. */
  destination_country?: "IE" | "DE";
  destination_city?: string;
  destination_uni?: University;
  intake?: Intake;
  /** Identity + admit (P1.f / P1.g). */
  identity_status?: IdentityStatus;
  admit_status?: "not_uploaded" | "pending" | "approved" | "rejected";
  /** Admin review fields written by /admin actions. */
  admission_status?: AdmissionStatus;
  admission_reviewed_at?: string;
  admission_reviewed_by?: string;
  admission_note?: string | null;
};

/**
 * SignupRow — the normalised admin-dashboard view of one auth.users row.
 *
 * Shape is intentionally close to WaitlistRow so the existing AdminReviewTable
 * UI can swap data sources with minimal churn. Fields not yet collected by
 * the v16 funnel (DigiLocker artefacts, etc.) come back as null.
 */
export type SignupRow = {
  id: string; // auth.users.id (uuid)
  phone_e164: string | null; // auth.users.phone with leading +
  phone_tail: string; // last 4 digits, used for masking in the UI
  first_name: string | null;
  email: string | null;
  home_city: string | null;
  dob_month: number | null;
  destination_country: "IE" | "DE" | null;
  destination_city: string | null;
  destination_uni: University | null;
  intake: Intake | null;
  signup_step: SignupStep;
  verification_status: VerificationStatus; // derived: 'verified' if phone_verified_at set
  identity_status: IdentityStatus;
  admit_status: "not_uploaded" | "pending" | "approved" | "rejected";
  admission_status: AdmissionStatus;
  admission_reviewed_at: string | null;
  admission_reviewed_by: string | null;
  admission_note: string | null;
  created_at: string;
  last_sign_in_at: string | null;
};

export const updateSignupAdmissionSchema = z.object({
  user_id: z.string().uuid(),
  new_status: z.enum(["approved", "declined", "pending_review"]),
  note: z.string().trim().max(500).optional(),
});
export type UpdateSignupAdmissionInput = z.infer<typeof updateSignupAdmissionSchema>;

export const updateProfileSchema = z.object({
  first_name: firstName,
  email: z.string().trim().email().nullable().optional(),
  home_city: homeCity,
  dob_month: z.number().int().min(1).max(12),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
