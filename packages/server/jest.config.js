/**
 * Jest config for @nexgen-connect/server.
 *
 * Tests for identity-hash, audit-log scrubber, storage abstraction,
 * Turnstile verifier. Pure Node — no Next.js runtime.
 *
 * v16 web pivot §3 / Bucket 3.
 */
/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  collectCoverageFrom: [
    "src/server/lib/**/*.ts",
    "src/server/middleware/**/*.ts",
    "!src/server/lib/**/*.test.ts",
  ],
};
