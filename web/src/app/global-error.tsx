"use client";

/**
 * Root global-error boundary.
 *
 * Only triggers when the root layout itself throws (or anything thrown
 * outside an `error.tsx` segment). Required by Next 16 to render any
 * useful UI for that worst-case path. MUST render <html> and <body> —
 * Next's root layout isn't available here.
 */
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    try {
      const w = window as unknown as {
        Sentry?: { captureException?: (e: unknown) => void };
      };
      w?.Sentry?.captureException?.(error);
    } catch {
      // never re-throw from an error boundary
    }
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#000",
          color: "#FAFAFA",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "center" }}>
          <h1 style={{ fontSize: 32, margin: "0 0 16px" }}>
            Something went wrong.
          </h1>
          <p style={{ color: "#A1A1A1", margin: "0 0 24px" }}>
            The page failed to load. Please refresh.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              background: "#00DC82",
              color: "#000",
              padding: "12px 20px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go home
          </a>
          {error.digest ? (
            <p
              style={{
                color: "#555",
                fontFamily: "monospace",
                fontSize: 11,
                marginTop: 32,
              }}
            >
              ref · {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
