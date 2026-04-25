import type { Metadata } from "next";
import {
  UniversityLanding,
  TRINITY_CONFIG,
} from "@/components/landing/UniversityLanding";

/**
 * /trinity - Trinity College Dublin landing page. SEO + personalisation.
 * A student searching "Trinity Indian students 2026" lands on copy that
 * speaks their exact situation, not a generic homepage.
 */

export const metadata: Metadata = {
  title: "Trinity College Dublin · Indian students, September 2026",
  description:
    "Your verified NexGen corridor for Trinity. Indian classmates from your home city, going to Dublin, in your intake month — ready before the first lecture on Front Square.",
  alternates: { canonical: "/trinity" },
  openGraph: {
    title: "Trinity College Dublin · NexGen Connect",
    description:
      "A verified group of classmates from your home city, going to Dublin, in your intake month — before you land. The app ships September 2026.",
    url: "/trinity",
    type: "website",
  },
};

export default function TrinityPage() {
  return <UniversityLanding cfg={TRINITY_CONFIG} />;
}
