import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph image for the homepage. Rendered at build time
 * (statically optimised) and served as a 1200x630 PNG whenever the
 * root URL is shared on X, WhatsApp, Slack, LinkedIn, iMessage, etc.
 *
 * Brand voice through visuals: deep black background, primary-green
 * accent, Instrument-serif italic for &ldquo;your people&rdquo;,
 * Inter-ish sans for everything else. Because Satori only ships a
 * default sans on the edge, we lean on style rather than typography -
 * the strong color contrast does the work.
 */


export const alt =
  "NexGen Connect · Find your people before you land · A verified group of classmates from your home city, going to your destination, in your intake month.";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand colors. Keep in sync with src/app/globals.css :root tokens -
// this file ships at build time as an OG fallback so it cannot read
// CSS variables at runtime. If the site palette shifts, mirror the
// change here in the same commit so previews on X / Slack / LinkedIn
// do not drift away from the actual page chrome.
const PRIMARY = "#00DC82"; // --color-primary
const BG = "#000000"; // --color-bg
const BORDER = "#1F1F1F"; // --color-border
const FG = "#FAFAFA"; // --color-fg
const FG_MUTED = "#A1A1A1"; // --color-fg-muted

export default function Image() {
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
        {/* Subtle top-right glow - mimics the radial we use on the site */}
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

        {/* Header row */}
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

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Main headline */}
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
            · For Indian students flying abroad
          </div>
          <div
            style={{
              color: FG,
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2.4,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Find your people
          </div>
          <div
            style={{
              color: PRIMARY,
              fontSize: 88,
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: 1.02,
              letterSpacing: -2.4,
              fontFamily: "serif",
            }}
          >
            before you land.
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Footer row */}
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
            Verified classmates from your home city, going to your
            destination, in your intake month. Ireland and Germany first.
            Everywhere after.
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
            Ships 2026
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
