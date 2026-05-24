import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "Stories — long-form essays from the NexGen verified arrival corridor. Founder letters, corridor stories, and the annual Migration Report.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Stories · the editorial property",
    headline: "The corridor,",
    accent: "in long form.",
    footer:
      "Founder letters, essays from verified members, and the annual Migration Report. Published quarterly.",
    badge: "Publishing",
  });
}
