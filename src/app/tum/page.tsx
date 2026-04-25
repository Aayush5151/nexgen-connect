import type { Metadata } from "next";
import {
  UniversityLanding,
  TUM_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /tum - Technical University of Munich landing page. TUM is Germany's
 * #1 STEM campus and the deepest Indian-student pipeline on the
 * October 2026 corridor. The page is optimised for Garching-bound
 * searches ("TUM Indian students Informatics 2026").
 */

export const metadata: Metadata = {
  title: "TUM · Indian students, October 2026",
  description:
    "Your verified NexGen corridor for the Technical University of Munich. Indian classmates from your home city, going to Munich, in your intake month — ready before Wintersemester orientation at Garching.",
  alternates: { canonical: "/tum" },
  openGraph: {
    title: "Technical University of Munich · NexGen Connect",
    description:
      "A verified group of TUM-bound classmates from your home city, going to Munich, in your intake month — before you land. The app ships October 2026.",
    url: "/tum",
    type: "website",
  },
};

export default function TUMPage() {
  return <UniversityLanding cfg={TUM_CONFIG} />;
}
