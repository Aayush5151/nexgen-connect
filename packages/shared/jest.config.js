/**
 * Jest config for @nexgen-connect/shared.
 *
 * Tests Zod schemas + theme tokens + corridor constants. No RN runtime
 * dependency — runs under plain ts-jest since shared package is
 * isomorphic.
 *
 * v6 build §23 / Build Prompt Bucket 6.
 */
/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
