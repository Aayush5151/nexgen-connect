/**
 * NexGen Connect — corridor topology, shared between web (marketing
 * pins on the globe and roadmap chips) and mobile (corridor placement
 * + matching).
 *
 * Mirrors the live web definition at web/src/lib/corridors.ts. When
 * we add or close a corridor the change happens here and both surfaces
 * pick it up. Web kept its own copy historically for build-time
 * imports; once the migration settles, web/src/lib/corridors.ts becomes
 * a thin re-export of this file.
 */

export type CorridorStatus = "live" | "next" | "soon";

export type Corridor = {
  /** Anchor city used for the globe label and the marketing roadmap. */
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: CorridorStatus;
  /** Short note shown under the label on marketing surfaces. */
  note: string;
  /** Every launch city for this corridor. Live corridors list more
   *  than one anchor; upcoming corridors stay at country level. */
  cities: string[];
};

export const CORRIDORS: Corridor[] = [
  {
    city: "Dublin",
    country: "Ireland",
    lat: 53.35,
    lng: -6.26,
    status: "live",
    note: "Sept 2026 · waitlist open",
    cities: ["Dublin", "Cork"],
  },
  {
    city: "Munich",
    country: "Germany",
    lat: 48.14,
    lng: 11.58,
    status: "live",
    note: "Oct 2026 · waitlist open",
    cities: ["Munich", "Aachen", "Berlin"],
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.37,
    lng: 4.9,
    status: "next",
    note: "Y2 evaluation",
    cities: ["Amsterdam"],
  },
  {
    city: "London",
    country: "United Kingdom",
    lat: 51.5,
    lng: -0.13,
    status: "soon",
    note: "Y2 evaluation",
    cities: ["London"],
  },
  {
    city: "Toronto",
    country: "Canada",
    lat: 43.65,
    lng: -79.38,
    status: "soon",
    note: "Y2 evaluation",
    cities: ["Toronto"],
  },
];

/* ------------------------------------------------------------------ */
/* CAMPUS PINS — every campus city we ship on launch day.              */
/* ------------------------------------------------------------------ */

export type CampusPin = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  month: "Sept 2026" | "Oct 2026";
  /** primary=true means this is the country anchor. Renders the
   *  pulsing ring on the globe + the headline pill underneath. */
  primary: boolean;
};

export const CAMPUS_PINS: CampusPin[] = [
  {
    city: "Dublin",
    country: "Ireland",
    lat: 53.35,
    lng: -6.26,
    month: "Sept 2026",
    primary: true,
  },
  {
    city: "Cork",
    country: "Ireland",
    lat: 51.9,
    lng: -8.47,
    month: "Sept 2026",
    primary: false,
  },
  {
    city: "Munich",
    country: "Germany",
    lat: 48.14,
    lng: 11.58,
    month: "Oct 2026",
    primary: true,
  },
  {
    city: "Aachen",
    country: "Germany",
    lat: 50.78,
    lng: 6.08,
    month: "Oct 2026",
    primary: false,
  },
  {
    city: "Berlin",
    country: "Germany",
    lat: 52.52,
    lng: 13.4,
    month: "Oct 2026",
    primary: false,
  },
];
