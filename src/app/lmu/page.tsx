import type { Metadata } from "next";
import {
  UniversityLanding,
  LMU_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /lmu - Ludwig Maximilian University of Munich landing page. LMU is
 * Germany's oldest university and the humanities + life-sciences
 * counterweight to TUM's engineering pull. Optimised for searches
 * like "LMU Indian students 2026" or "LMU Medicine Munich India".
 */

export const metadata: Metadata = {
  title: "LMU Munich · Indian students, October 2026",
  description:
    "Your verified NexGen corridor for LMU Munich. Indian classmates from your home city, going to Munich, in your intake month — ready before the first Vorlesung at Geschwister-Scholl-Platz.",
  alternates: { canonical: "/lmu" },
  openGraph: {
    title: "Ludwig Maximilian University of Munich · NexGen Connect",
    description:
      "A verified group of LMU-bound classmates from your home city, going to Munich, in your intake month — before you land. The app ships October 2026.",
    url: "/lmu",
    type: "website",
  },
};

export default function LMUPage() {
  return <UniversityLanding cfg={LMU_CONFIG} />;
}
