export const UNIVERSITIES = [
  { id: "tum", name: "TU Munich", short: "TUM" },
  { id: "rwth", name: "RWTH Aachen", short: "RWTH" },
  { id: "tub", name: "TU Berlin", short: "TUB" },
  { id: "kit", name: "KIT", short: "KIT" },
  { id: "tud", name: "TU Darmstadt", short: "TUD" },
] as const;

export const CITIES = [
  "Mumbai",
  "Delhi",
  "Pune",
  "Bangalore",
  "Hyderabad",
  "Ahmedabad",
  "Chennai",
  "Kolkata",
] as const;

export const INTAKES = ["Winter 2026"] as const;

export const COHORT_CAP = 10;
export const COHORT_MIN = 10;

export type University = (typeof UNIVERSITIES)[number];
export type UniversityId = University["id"];
export type City = (typeof CITIES)[number];
export type Intake = (typeof INTAKES)[number];

export type WaitlistEntry = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  city: City;
  university: UniversityId;
  intake: Intake;
  email: string | null;
  verified_phone: boolean;
};

export type CohortCount = {
  city: City;
  university: UniversityId;
  count: number;
};
