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
    "Your verified NexGen group for the Technical University of Munich. Eight to twelve Indian classmates, all flying the same month, ready before Wintersemester orientation at Garching.",
  alternates: { canonical: "/tum" },
  openGraph: {
    title: "Technical University of Munich · NexGen Connect",
    description:
      "A pocket-sized group of verified Indian TUM-bound classmates, all flying the same month, before you land in Munich. The app ships October 2026.",
    url: "/tum",
    type: "website",
  },
};

export default function TUMPage() {
  return <UniversityLanding cfg={TUM_CONFIG} />;
}
