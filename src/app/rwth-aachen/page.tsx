import type { Metadata } from "next";
import {
  UniversityLanding,
  RWTH_AACHEN_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /rwth-aachen - RWTH Aachen University landing page. RWTH is Germany's
 * largest technical university and the second-deepest Indian-student
 * pipeline on the October 2026 corridor after TUM. The page is optimised
 * for Aachen-bound STEM searches ("RWTH Indian students Computer Science
 * 2026", "RWTH Data Science India", etc).
 */

export const metadata: Metadata = {
  title: "RWTH Aachen · Indian students, October 2026",
  description:
    "Your verified NexGen corridor for RWTH Aachen University. Indian classmates from your home city, going to Aachen, in your intake month — ready before the Melaten campus Wintersemester.",
  alternates: { canonical: "/rwth-aachen" },
  openGraph: {
    title: "RWTH Aachen University · NexGen Connect",
    description:
      "A verified group of RWTH-bound classmates from your home city, going to Aachen, in your intake month — before you land. The app ships October 2026.",
    url: "/rwth-aachen",
    type: "website",
  },
};

export default function RWTHAachenPage() {
  return <UniversityLanding cfg={RWTH_AACHEN_CONFIG} />;
}
