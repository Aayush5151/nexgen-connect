/**
 * Cohort data — the public registry of NexGen corridors.
 *
 * This file is the canonical source of truth for the cohort yearbook
 * surfaces (/cohorts, /cohorts/[slug]). For each corridor we track:
 *   slug          stable URL fragment
 *   destination   "Dublin" / "Munich" — the city
 *   uni           "UCD" / "TUM" — the institution
 *   country       "Ireland" / "Germany"
 *   intakeLabel   long-form intake ("September 2026")
 *   intakeIso     "2026-09" — for sorting
 *   verifiedCount integer (pre-launch: small / mock)
 *   threshold     unlock threshold (always 60 for now)
 *   status        "filling" before threshold; "unlocked" once 60+
 *   foundingClassConsented  list of First-Sixty members who consented
 *                           to public attribution. Empty for now —
 *                           fills post-unlock as real consents land.
 *
 * Pre-launch: data is hand-maintained here. Post-launch this becomes
 * an API call to the corridor service.
 *
 * v18 category-presence pass · Mechanism 3 (cohort-naming).
 */

export type Cohort = {
  slug: string;
  destination: string;
  uni: string;
  uniFull: string;
  country: string;
  intakeLabel: string;
  intakeIso: string;
  verifiedCount: number;
  threshold: number;
  status: "filling" | "unlocked";
  foundingClassConsented: { firstName: string; homeCity: string; verifiedOn: string }[];
};

export const COHORTS: Cohort[] = [
  {
    slug: "ucd-sept-2026",
    destination: "Dublin",
    uni: "UCD",
    uniFull: "University College Dublin",
    country: "Ireland",
    intakeLabel: "September 2026",
    intakeIso: "2026-09",
    verifiedCount: 47,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [], // fills post-unlock with real consents
  },
  {
    slug: "trinity-sept-2026",
    destination: "Dublin",
    uni: "Trinity",
    uniFull: "Trinity College Dublin",
    country: "Ireland",
    intakeLabel: "September 2026",
    intakeIso: "2026-09",
    verifiedCount: 31,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
  {
    slug: "ucc-sept-2026",
    destination: "Cork",
    uni: "UCC",
    uniFull: "University College Cork",
    country: "Ireland",
    intakeLabel: "September 2026",
    intakeIso: "2026-09",
    verifiedCount: 18,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
  {
    slug: "tum-oct-2026",
    destination: "Munich",
    uni: "TUM",
    uniFull: "Technical University of Munich",
    country: "Germany",
    intakeLabel: "October 2026",
    intakeIso: "2026-10",
    verifiedCount: 28,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
  {
    slug: "lmu-oct-2026",
    destination: "Munich",
    uni: "LMU",
    uniFull: "Ludwig Maximilian University of Munich",
    country: "Germany",
    intakeLabel: "October 2026",
    intakeIso: "2026-10",
    verifiedCount: 14,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
  {
    slug: "rwth-oct-2026",
    destination: "Aachen",
    uni: "RWTH",
    uniFull: "RWTH Aachen University",
    country: "Germany",
    intakeLabel: "October 2026",
    intakeIso: "2026-10",
    verifiedCount: 22,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
  {
    slug: "humboldt-oct-2026",
    destination: "Berlin",
    uni: "HU Berlin",
    uniFull: "Humboldt University of Berlin",
    country: "Germany",
    intakeLabel: "October 2026",
    intakeIso: "2026-10",
    verifiedCount: 11,
    threshold: 60,
    status: "filling",
    foundingClassConsented: [],
  },
];

export function getCohortBySlug(slug: string): Cohort | undefined {
  return COHORTS.find((c) => c.slug === slug);
}
