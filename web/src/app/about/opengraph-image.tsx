import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const runtime = "edge";
export const alt =
  "About NexGen Connect — the verified arrival corridor for Indian students moving abroad.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "About",
    headline: "Two million students.",
    accent: "One verified corridor.",
    footer:
      "We built the trust infrastructure for the largest cross-border student migration in human history.",
  });
}
