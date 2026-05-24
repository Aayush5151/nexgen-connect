import { ImageResponse } from "next/og";

/**
 * Shared Open Graph image template.
 *
 * Every per-route `opengraph-image.tsx` in the app calls
 * `renderOgImage({ eyebrow, headline, accent, footer })` so all social
 * previews share the same brand grammar — black canvas, primary-green
 * accent, serif italic for the accent phrase, mono uppercase for the
 * eyebrow + footer. The only thing that changes between pages is the
 * three short strings.
 *
 * Sized 1200×630 (the OG standard accepted by X, LinkedIn, WhatsApp,
 * Slack, iMessage, Facebook). Default runtime: Node.js / Fluid Compute
 * (the new Vercel default — next/og's ImageResponse has supported
 * Node since Next.js 14.1, and the Edge-only path now risks
 * "Resource provisioning failed" once the per-project Edge function
 * count gets large).
 *
 * Satori-on-Node is stricter than Satori-on-Edge about the rule
 * "any <div> with more than one child needs explicit display: flex"
 * — including a text node + interpolated string counts as two
 * children. To keep this template robust:
 *   • every <div> that holds visible content has display: flex
 *     declared explicitly
 *   • all interpolation is pre-concatenated into a single string
 *     before being placed in a child slot
 */

// Brand tokens — kept in sync with globals.css :root.
const PRIMARY = "#00DC82";
const BG = "#000000";
const BORDER = "#1F1F1F";
const FG = "#FAFAFA";
const FG_MUTED = "#A1A1A1";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

export type OgImageProps = {
  /** ALL-CAPS mono kicker shown above the headline. */
  eyebrow: string;
  /** Main headline. Sans-serif, large. */
  headline: string;
  /** Italic serif accent following the headline. */
  accent: string;
  /** Optional bottom-left body line. */
  footer?: string;
  /** Optional bottom-right status line. */
  badge?: string;
};

export function renderOgImage({
  eyebrow,
  headline,
  accent,
  footer = "Verified classmates from your home city, going to your destination, in your intake month.",
  badge = "Ships 2026",
}: OgImageProps): ImageResponse {
  // Pre-concatenate interpolated strings so Satori sees a SINGLE text
  // child per div (avoids the "multiple children require explicit
  // display: flex" runtime error on Node).
  const eyebrowText = `· ${eyebrow}`;
  const scheduleText = "Ireland Sept 2026 · Germany Oct 2026";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* Subtle top-right glow — mimics the radial on the live site. */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 560,
            height: 560,
            borderRadius: 560,
            background: PRIMARY,
            opacity: 0.12,
            filter: "blur(8px)",
            display: "flex",
          }}
        />

        {/* Header row — wordmark + corridor schedule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: PRIMARY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: BG,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              N
            </div>
            <div
              style={{
                display: "flex",
                color: FG,
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: -0.4,
              }}
            >
              NexGen Connect
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: FG_MUTED,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            {scheduleText}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Headline block — eyebrow + headline + serif italic accent */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: 1060,
          }}
        >
          <div
            style={{
              display: "flex",
              color: PRIMARY,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            {eyebrowText}
          </div>
          <div
            style={{
              display: "flex",
              color: FG,
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2.4,
              flexWrap: "wrap",
            }}
          >
            {headline}
          </div>
          <div
            style={{
              display: "flex",
              color: PRIMARY,
              fontSize: 80,
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.02,
              letterSpacing: -2.4,
              fontFamily: "serif",
            }}
          >
            {accent}
          </div>
        </div>

        <div style={{ flex: 1, display: "flex" }} />

        {/* Footer — body line + status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            paddingTop: 24,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              display: "flex",
              color: FG_MUTED,
              fontSize: 20,
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            {footer}
          </div>
          <div
            style={{
              color: FG,
              fontSize: 15,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "monospace",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                background: PRIMARY,
                display: "flex",
              }}
            />
            {badge}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
