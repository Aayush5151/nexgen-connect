import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "Cohorts — the public yearbook of every NexGen verified arrival corridor.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Cohorts · the public yearbook",
    headline: "Every corridor,",
    accent: "on the record.",
    footer:
      "Each row is a verified arrival corridor — a home country, a destination city, an intake month. Group chat opens at sixty.",
    badge: "Yearbook",
  });
}
