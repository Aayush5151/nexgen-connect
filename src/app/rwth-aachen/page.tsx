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
    "Your verified NexGen group for RWTH Aachen University. Eight to twelve Indian classmates, all flying the same month, ready before the Melaten campus Wintersemester.",
  alternates: { canonical: "/rwth-aachen" },
  openGraph: {
    title: "RWTH Aachen University · NexGen Connect",
    description:
      "A pocket-sized group of verified Indian RWTH-bound classmates, all flying the same month, before you land in Aachen. The app ships October 2026.",
    url: "/rwth-aachen",
    type: "website",
  },
};

export default function RWTHAachenPage() {
  return <UniversityLanding cfg={RWTH_AACHEN_CONFIG} />;
}
