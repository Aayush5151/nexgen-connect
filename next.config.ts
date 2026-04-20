import path from "node:path";
import type { NextConfig } from "next";

/**
 * Content Security Policy — "no-nonce" variant (see Next.js 16 CSP docs).
 *
 * Trade-off picked for launch: we stay compatible with static rendering and
 * CDN caching by accepting 'unsafe-inline' for scripts and styles. The
 * landing page is a marketing page — no auth'd content, no tokens in the
 * DOM — so the XSS blast radius is small, and moving to a nonce-based CSP
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
const cspDirectives = [
  "default-src 'self'",
  // 'unsafe-eval' is required only in dev (React dev shim).
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://plausible.io`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Supabase + Plausible + MSG91 verify from browser (never hit from browser
  // today — verify happens server-side — but leave supabase in for realtime
  // if we add it).
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io",
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
  // Cross-origin policies — relaxed to 'same-origin' on CORP so next/image
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
    root: path.resolve(__dirname),
  },
  // Ship with X-Powered-By stripped — small, but every disclosed framework
  // bit is a free hint for drive-by scanners.
  poweredByHeader: false,
  // Block client-side source maps in production — they leak comments, private
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
};

export default nextConfig;
