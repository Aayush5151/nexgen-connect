import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content Security Policy - "no-nonce" variant (see Next.js 16 CSP docs).
 *
 * Trade-off picked for launch: we stay compatible with static rendering and
 * CDN caching by accepting 'unsafe-inline' for scripts and styles. The
 * landing page is a marketing page - no auth'd content, no tokens in the
 * DOM - so the XSS blast radius is small, and moving to a nonce-based CSP
 * via proxy.ts forces every page to be dynamically rendered.
 *
 * Everything still stays locked down via:
 *   - `frame-ancestors 'none'` blocks clickjacking
 *   - `object-src 'none'` blocks legacy <object>/<embed> injection
 *   - `base-uri 'self'` blocks <base href> hijack
 *   - `form-action 'self'` blocks form hijack
 *   - connect-src / img-src whitelist pins third-party endpoints
 *
 * When we eventually add user-authenticated routes, revisit and switch those
 * routes to a nonce-based CSP via proxy.ts.
 */
// Origins listed below are the minimum surface needed once each launch
// integration goes live (Turnstile, Razorpay Checkout, Cloudflare Images,
// PostHog, Sentry, Vercel Analytics + Speed Insights, Open-Meteo for the
// CorridorClock). Keeping them in CSP from day one prevents the moment
// the integration flips on (NEXT_PUBLIC_USE_REAL_*) from silently breaking
// the browser via a missing-origin block.
const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-eval' is required only in dev (React dev shim).
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://plausible.io https://challenges.cloudflare.com https://checkout.razorpay.com https://app.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com https://imagedelivery.net https://*.imagedelivery.net",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Supabase + Plausible + the integrations above. tRPC is same-origin so
  // covered by 'self'. Sentry DSNs land at *.ingest.{sentry.io,us.sentry.io,
  // de.sentry.io} depending on org region.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io https://challenges.cloudflare.com https://api.razorpay.com https://lumberjack.razorpay.com https://app.posthog.com https://us.i.posthog.com https://eu.i.posthog.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://imagedelivery.net https://*.imagedelivery.net https://upload.imagedelivery.net https://api.cloudflare.com https://api.open-meteo.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
  // Turnstile + Razorpay Checkout both render in iframes.
  "frame-src 'self' https://challenges.cloudflare.com https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
];

const securityHeaders = [
  // Classic hardening pack.
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HSTS: 2-year max-age, preload-ready.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-origin policies - relaxed to 'same-origin' on CORP so next/image
  // and font optimisation still work. Tighten later if the app becomes fully
  // first-party.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: cspDirectives.join("; "),
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    // Monorepo: node_modules is hoisted to the parent (repo root) by
    // npm workspaces. Turbopack auto-detects workspace roots by
    // walking up looking for next/package.json — point it at the
    // monorepo root so the hoisted dependency tree is reachable.
    root: path.resolve(__dirname, ".."),
  },
  // Ship with X-Powered-By stripped - small, but every disclosed framework
  // bit is a free hint for drive-by scanners.
  poweredByHeader: false,
  // Block client-side source maps in production - they leak comments, private
  // variable names, and sometimes inline secrets picked up by bundlers.
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Downsample AVIF/WebP at the image optimizer for bandwidth.
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
      {
        source: "/:path*.(js|css|woff2|png|jpg|svg|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    // v16 web pivot §1.7 + v18 standalone parent surface fix.
    //
    // Routes that look like they should exist but don't, redirected to
    // their on-page anchor equivalents so anyone sharing /pricing /
    // /campuses over text doesn't hit a 404. /parents stays as an
    // older shareable alias for the homepage anchor.
    //
    // /for-parents intentionally NOT redirected — the standalone page
    // exists at /for-parents (v18) and the Navbar links to it. The old
    // redirect was shadowing the page; removed.
    //
    // /legal is handled at the page level via permanentRedirect in
    // app/legal/page.tsx — duplicating it here was defense-in-depth
    // but redundant.
    return [
      { source: "/pricing", destination: "/#pricing", permanent: true },
      { source: "/parents", destination: "/#parents", permanent: true },
      { source: "/campuses", destination: "/#campuses", permanent: true },
    ];
  },
};

export default nextConfig;
