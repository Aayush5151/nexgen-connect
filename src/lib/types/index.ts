export type UserRole = "user" | "admin" | "moderator";

export type SwipeDirection = "left" | "right";

export type CohortLevel = 1 | 2 | 3 | 4;

export type VerificationStatus = "pending" | "in_progress" | "completed" | "failed";

export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export type ReportReason =
  | "fake_profile"
  | "spam"
  | "harassment"
  | "inappropriate_photo"
  | "other";

export type ReportStatus = "pending" | "reviewed" | "action_taken" | "dismissed";

export type FaceVerificationStatus =
  | "idle"
  | "camera_open"
  | "captured"
  | "verifying"
  | "verified"
  | "failed";

export interface UserProfile {
  id: string;
  firstName: string;
  photoUrls: string[];
  bio: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  religion: string | null;
  originCity: string;
  originState: string;
  destinationCountry: string;
  destinationCity: string | null;
  university: string | null;
  intakePeriod: string;
  courseField: string | null;
  hobbies: string[];
  languages: string[];
  isNightOwl: boolean | null;
  isCooking: boolean | null;
  isNeatFreak: boolean | null;
  icebreakerText: string | null;
  isLinkedinVerified: boolean;
  isFaceVerified: boolean;
  cohortLevel?: CohortLevel;
}

export interface MatchedUser extends UserProfile {
  instagramHandle: string | null;
  linkedinUrl: string | null;
  matchedAt: string;
}

export interface CohortInfo {
  id: string;
  level: CohortLevel;
  originValue: string;
  destinationValue: string;
  intakePeriod: string;
  memberCount: number;
}

export interface VerificationState {
  phone: VerificationStatus;
  email: VerificationStatus;
  face: VerificationStatus;
  linkedin: VerificationStatus;
  instagram: VerificationStatus;
}
