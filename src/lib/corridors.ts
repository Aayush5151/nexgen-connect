/**
 * Corridor roadmap data. Two live beachheads at launch, then a staged
 * rollout. Lives in a plain TS module (no react-globe.gl imports) so
 * both the WebGL globe and the HTML roadmap list can read the same
 * source without dragging the WebGL bundle into the server render.
 *
 * v9 business-plan alignment:
 *   - India -> Ireland   · Sept 2026  (live - Dublin + Cork)
 *   - India -> Germany   · Oct 2026   (live - Munich + Aachen + Berlin)
 *   - India -> Netherlands, UK, Australia follow in 2027+.
 *
 * v10: each live corridor now carries an explicit `cities` array so the
 * marketing surfaces can name Dublin/Cork and Munich/Aachen/Berlin
 * instead of over-indexing on the capital city. CAMPUS_PINS is a flat
 * lat/lng list used by the 3D globe so every live campus gets a dot.
 *
 * The Globe had previously exported this constant from within its
 * client module - but the client module also does `import Globe from
 * "react-globe.gl"` at the top level, which touches `window`, which
 * broke the static prerender of the home page. A plain data file
 * keeps the server bundle clean.
 */

export type Corridor = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  status: "live" | "next" | "soon";
  /** Short note shown under the label. */
  note: string;
  /** All launch cities for this corridor. Live corridors always list
   *  more than one; upcoming corridors are named at the country level
   *  for now. */
  cities: string[];
};

export const CORRIDORS: Corridor[] = [
  {
    city: "Dublin",
    country: "Ireland",
    lat: 53.35,
    lng: -6.26,
    status: "live",
    note: "Sept 2026",
    cities: ["Dublin", "Cork"],
  },
  {
    city: "Munich",
    country: "Germany",
    lat: 48.14,
    lng: 11.58,
    status: "live",
    note: "Oct 2026",
    cities: ["Munich", "Aachen", "Berlin"],
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.37,
    lng: 4.9,
    status: "next",
    note: "Jan 2027",
    cities: ["Amsterdam"],
  },
  {
    city: "London",
    country: "United Kingdom",
    lat: 51.5,
    lng: -0.13,
    status: "soon",
    note: "Sept 2027",
    cities: ["London"],
  },
  {
    city: "Melbourne",
    country: "Australia",
    lat: -37.81,
    lng: 144.96,
    status: "soon",
    note: "Feb 2028",
    cities: ["Melbourne"],
  },
];

/**
 * Flat list of every campus city we actually ship on launch day.
 * `primary: true` means this is the anchor for the country (it gets the
 * pulsing ring on the globe and the headline pill under it); `primary:
 * false` means it's a secondary live campus that gets a quiet dot plus
 * its own label. Upcoming corridors are not in this list - they appear
 * on the globe via CORRIDORS and in the roadmap chips below the map.
 */
export type CampusPin = {
  city: string;
  country: string;
  lat: number;
  lng: number;
  month: "Sept 2026" | "Oct 2026";
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
