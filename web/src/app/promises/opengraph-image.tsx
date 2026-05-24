import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og-template";

export const alt =
  "Our promises — five signed commitments by NexGen Connect, written with the discipline of vulnerability.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({
    eyebrow: "Our promises · five signed commitments",
    headline: "Five things",
    accent: "we will never do.",
    footer:
      "No Aadhaar sale. No auto-renew. No agents. Personal accountability if we ever break one. Signed by Aayush Shah.",
    badge: "Signed",
  });
}
