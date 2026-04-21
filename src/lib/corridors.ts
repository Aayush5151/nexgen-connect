/**
 * Corridor roadmap data - Ireland-first, then a staged rollout. Lives
 * in a plain TS module (no react-globe.gl imports) so both the WebGL
 * globe and the HTML roadmap list can read the same source without
 * dragging the WebGL bundle into the server render.
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
};

export const CORRIDORS: Corridor[] = [
  {
    city: "Dublin",
    country: "Ireland",
    lat: 53.35,
    lng: -6.26,
    status: "live",
    note: "Sept 2026",
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    lat: 52.37,
    lng: 4.9,
    status: "next",
    note: "Jan 2027",
  },
  {
    city: "Berlin",
    country: "Germany",
    lat: 52.52,
    lng: 13.4,
    status: "next",
    note: "Apr 2027",
  },
  {
    city: "London",
    country: "United Kingdom",
    lat: 51.5,
    lng: -0.13,
    status: "soon",
    note: "Sept 2027",
  },
  {
    city: "Melbourne",
    country: "Australia",
    lat: -37.81,
    lng: 144.96,
    status: "soon",
    note: "Feb 2028",
  },
];
