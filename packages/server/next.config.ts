import type { NextConfig } from "next";

const config: NextConfig = {
  // packages/server is API-only — no static pages, no client bundles.
  // The /api/trpc/[trpc] route handler is the entire surface.
  reactStrictMode: true,
  // Server-only runtime; no static export.
};

export default config;
