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
    "Your verified NexGen group for UCD Belfield. Eight to twelve Indian classmates, all flying the same month, ready before orientation week.",
  alternates: { canonical: "/ucd" },
  openGraph: {
    title: "University College Dublin · NexGen Connect",
    description:
      "A pocket-sized group of verified Indian Belfield-bound classmates, all flying the same month, before you land. The app ships September 2026.",
    url: "/ucd",
    type: "website",
  },
};

export default function UCDPage() {
  return <UniversityLanding cfg={UCD_CONFIG} />;
}
