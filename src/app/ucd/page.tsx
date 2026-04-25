import type { Metadata } from "next";
import {
  UniversityLanding,
  UCD_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /ucd - University College Dublin landing page. UCD hosts the deepest
 * Indian-student pipeline of any Irish campus; the page is optimised
 * for Belfield-bound searches ("UCD Indian students Belfield 2026").
 */

export const metadata: Metadata = {
  title: "UCD · Indian students, September 2026",
  description:
    "Your verified NexGen corridor for UCD Belfield. Indian classmates from your home city, going to Dublin, in your intake month — ready before orientation week.",
  alternates: { canonical: "/ucd" },
  openGraph: {
    title: "University College Dublin · NexGen Connect",
    description:
      "A verified group of Belfield-bound classmates from your home city, going to Dublin, in your intake month — before you land. The app ships September 2026.",
    url: "/ucd",
    type: "website",
  },
};

export default function UCDPage() {
  return <UniversityLanding cfg={UCD_CONFIG} />;
}
