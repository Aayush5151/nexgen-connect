import type { Metadata } from "next";
import {
  UniversityLanding,
  HUMBOLDT_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /humboldt - Humboldt University of Berlin landing page. HU is Berlin's
 * research anchor, the English-friendly counterweight to Munich's
 * bureaucratic heat. Optimised for searches like "Humboldt Indian
 * students 2026", "HU Berlin MSc Economics India", or "Berlin Masters
 * October intake".
 */

export const metadata: Metadata = {
  title: "Humboldt University Berlin · Indian students, October 2026",
  description:
    "Your verified NexGen corridor for Humboldt University of Berlin. Indian classmates from your home city, going to Berlin, in your intake month — ready before the first Unter den Linden lecture.",
  alternates: { canonical: "/humboldt" },
  openGraph: {
    title: "Humboldt University of Berlin · NexGen Connect",
    description:
      "A verified group of HU Berlin-bound classmates from your home city, going to Berlin, in your intake month — before you land. The app ships October 2026.",
    url: "/humboldt",
    type: "website",
  },
};

export default function HumboldtPage() {
  return <UniversityLanding cfg={HUMBOLDT_CONFIG} />;
}
