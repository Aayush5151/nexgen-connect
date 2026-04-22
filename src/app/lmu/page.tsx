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
    "Your verified NexGen group for LMU Munich. Eight to twelve Indian classmates, all flying the same month, ready before the first Vorlesung at Geschwister-Scholl-Platz.",
  alternates: { canonical: "/lmu" },
  openGraph: {
    title: "Ludwig Maximilian University of Munich · NexGen Connect",
    description:
      "A pocket-sized group of verified Indian LMU-bound classmates, all flying the same month, before you land in Munich. The app ships October 2026.",
    url: "/lmu",
    type: "website",
  },
};

export default function LMUPage() {
  return <UniversityLanding cfg={LMU_CONFIG} />;
}
