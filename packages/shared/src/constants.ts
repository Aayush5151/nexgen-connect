/**
 * NexGen Connect — runtime constants shared between web and mobile.
 *
 * Numbers and strings that govern product behaviour live here, not in
 * component files. Anything quoted in BP v15 / Mobile Plan v6 with a
 * specific value (Layer-2 30 / Layer-1 8 unlock thresholds, 20+ uni
 * subgroup, ₹999 Premium, 48h admit-letter SLA) maps to one entry
 * below. If a constant needs to differ between web and mobile, expose
 * two named exports — never let the value silently drift.
 *
 * Threshold defaults are also overridable at runtime via server config
 * (per BP §12.2 A3 retune trigger). The values here are the v15
 * baselines; the mobile + web clients should read from `/api/config`
 * at boot and fall back to these constants if the server is unreachable.
 */

/* ------------------------------------------------------------------ */
/* CORRIDOR + GROUP MECHANICS                                          */
/* (v15 BP §3.2 layer architecture, §3.3 unlock thresholds, §16.F1)    */
/* ------------------------------------------------------------------ */

/** Layer 2 (destination × intake) verified count required to unlock the
 *  primary group chat. Layer 2 is the user's primary surface — most users
 *  see ~95 verified at unlock, the 30 floor protects against the v14
 *  cold-start "5 of 60 alone" failure mode. v15 BP §3.2 layer inversion.
 *  Server-overridable per A3 retune in BP §12.2. */
export const CORRIDOR_LAYER_2_UNLOCK = 30;

/** Layer 1 (home_city × destination × intake) verified count required to
 *  spawn the hometown-crew thread (CH6) inside an unlocked Layer 2.
 *  Affinity sub-group, not primary surface. v15 BP §3.2. */
export const CORRIDOR_LAYER_1_UNLOCK = 8;

/** Layer 3 (destination-city ambient) minimum verified count required to
 *  surface as a fallback ambient feed (Dublin / Munich city-scope). Higher
 *  bar because it's the broadest layer. v15 BP §3.2. */
export const CORRIDOR_LAYER_3_FALLBACK_MIN = 50;

/** Number of verified classmates at the same HEI required to spawn a
 *  uni-specific subgroup inside an unlocked Layer 2 corridor. */
export const UNI_SUBGROUP_THRESHOLD = 20;

/** Hard cap on cohort size at unlock. Over-unlock holds remainders for
 *  next cycle (BP §16.F8 — stability over expansion). */
export const COHORT_MAX_SIZE = 75;

/** Weeks before a stalled corridor offers a refund + bridge to nearest
 *  viable corridor (BP §3.3 cohort-shift cascade). */
export const CORRIDOR_BRIDGE_DEADLINE_WEEKS = 8;

/* ------------------------------------------------------------------ */
/* PRICING (v15 BP §5.1, §5.2 — repriced from ₹1,499 to ₹999)          */
/* ------------------------------------------------------------------ */

/** Premium one-time unlock price in INR paise (Razorpay convention).
 *  ₹999 = 99,900 paise. Repriced from ₹1,499 in v15 §5.2 — the lower
 *  ladder better matches Indian middle-class parent willingness-to-pay
 *  during the high-anxiety pre-departure window, and the dropped feature
 *  ("priority match") was retired for contradicting the L8 brand promise.
 *  Reprice fallback to ₹799 if conversion drops below 10% (A6 kill
 *  criterion in BP §12.2). */
export const PREMIUM_PRICE_INR_PAISE = 99_900;

/** Display string for marketing surfaces. */
export const PREMIUM_PRICE_DISPLAY = "₹999";

/** Reprice fallback if A6 fires. Don't expose to UI by default. */
export const PREMIUM_REPRICE_INR_PAISE = 79_900;

/* ------------------------------------------------------------------ */
/* TRUST & SAFETY SLA (BP §9.5)                                        */
/* ------------------------------------------------------------------ */

/** Free-tier first-response SLA in minutes during IST business hours
 *  (08:00–22:00 IST). */
export const TS_SLA_BUSINESS_MIN = 4 * 60;

/** Free-tier first-response SLA in minutes overnight (22:00–08:00 IST). */
export const TS_SLA_OVERNIGHT_MIN = 12 * 60;

/** Free-tier SLA during peak intake (Aug–Oct annually). */
export const TS_SLA_PEAK_MIN = 6 * 60;

/** Premium tier SLA — 1 hour, 24/7. */
export const TS_SLA_PREMIUM_MIN = 60;

/** Imminent-harm outreach attempt SLA, regardless of tier. */
export const TS_SLA_IMMINENT_MIN = 30;

/* ------------------------------------------------------------------ */
/* VERIFICATION (BP §9.1, Mobile §4.2)                                 */
/* ------------------------------------------------------------------ */

/** Admit-letter human-review SLA in hours. SLA breach triggers fast-
 *  path + apology email + ₹100 credit (BP §16.S5). */
export const ADMIT_REVIEW_SLA_HOURS = 48;

/** Admit-letter PDF retention after review completes. Plan §3.9 L12. */
export const ADMIT_PDF_TTL_MIN = 60;

/** Aadhaar VID + DigiLocker JWT wipe deadline after handshake. */
export const AADHAAR_WIPE_DEADLINE_MIN = 5;

/** Composite identity hash version. Append-only. Never expire bans;
 *  every new signup checks against union of all hash versions. */
export const IDENTITY_HASH_VERSION = 1;

/* ------------------------------------------------------------------ */
/* LAUNCH WINDOWS                                                      */
/* ------------------------------------------------------------------ */

export const LAUNCH_DATES = {
  ireland: {
    intakeMonth: "September 2026",
    publicLaunchISO: "2026-09-01",
  },
  germany: {
    intakeMonth: "October 2026",
    publicLaunchISO: "2026-10-01",
  },
} as const;

/* ------------------------------------------------------------------ */
/* CONTACT                                                             */
/* ------------------------------------------------------------------ */

export const CONTACT = {
  supportEmail: "hello@nexgenconnect.com",
  pressEmail: "press@nexgenconnect.com",
} as const;

/* ------------------------------------------------------------------ */
/* CRISIS RESOURCES (BP §16.MH3 region defaults)                       */
/* ------------------------------------------------------------------ */

export const CRISIS_RESOURCES = {
  IN: [
    { name: "iCall (TISS)", phone: "+91 9152987821", priority: 1 },
    { name: "Vandrevala Foundation", phone: "1860 266 2345", priority: 2 },
    { name: "AASRA", phone: "+91 98204 66726", priority: 3 },
  ],
  IE: [
    { name: "HSE Live", phone: "1800 700 700", priority: 1 },
    { name: "Pieta House", phone: "1800 247 247", priority: 2 },
    { name: "Samaritans IE", phone: "116 123", priority: 3 },
  ],
  DE: [
    { name: "Caritas Beratung (online)", phone: null, priority: 1 },
    { name: "TelefonSeelsorge (DE)", phone: "0800 111 0 111", priority: 2 },
    {
      name: "TelefonSeelsorge (alternate)",
      phone: "0800 111 0 222",
      priority: 3,
    },
  ],
} as const;

export type Region = keyof typeof CRISIS_RESOURCES;
