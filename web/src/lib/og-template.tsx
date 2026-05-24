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
 * Slack, iMessage, Facebook). Runtime: edge — required by next/og's
 * Satori. Same as the root opengraph-image.tsx.
 *
 * Style discipline matches src/app/globals.css design tokens. If the
 * palette shifts, mirror the change here in the same commit so
 * previews don't drift from the live site.
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
  /** ALL-CAPS mono kicker shown above the headline. e.g. "FOUNDER LETTER · NO. 01". */
  eyebrow: string;
  /** Main headline. Sans-serif, large. e.g. "Why we built". */
  headline: string;
  /** Italic serif accent following the headline. e.g. "the corridor.". */
  accent: string;
  /** Optional bottom-left body line. Defaults to the global brand pitch. */
  footer?: string;
  /** Optional bottom-right status line. Defaults to "Ships 2026". */
  badge?: string;
};

export function renderOgImage({
  eyebrow,
  headline,
  accent,
  footer = "Verified classmates from your home city, going to your destination, in your intake month.",
  badge = "Ships 2026",
}: OgImageProps): ImageResponse {
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
              color: FG_MUTED,
              fontSize: 13,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            Ireland Sept 2026 · Germany Oct 2026
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
              color: PRIMARY,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            · {eyebrow}
          </div>
          <div
            style={{
              color: FG,
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2.4,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {headline}
          </div>
          <div
            style={{
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
