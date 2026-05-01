/**
 * Jest config — unit-test runner for mobile/src/lib/* + packages/copy.
 *
 * v15 BP §23 / v6 build §23. Strategy:
 *   - Unit tests: Jest, lib + utils + mocks (this file).
 *   - Integration tests: Detox, top-line user flows. Configured
 *     separately under mobile/.detoxrc.js when EAS Build lands.
 *   - E2E tests: Maestro, critical journeys. Flow files under
 *     mobile/.maestro/ when staging deploys.
 *
 * Per-package coverage targets (v6 §23):
 *   lib/* + utils/*: 80%
 *   mocks/*: 60% (mocks-of-mocks add little value)
 *   app/* (screens): not unit-tested directly — Detox covers them.
 */

/** @type {import("jest").Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  testMatch: [
    "<rootDir>/__tests__/**/*.test.ts",
    "<rootDir>/__tests__/**/*.test.tsx",
    "<rootDir>/src/**/*.test.ts",
    "<rootDir>/src/**/*.test.tsx",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|@expo|expo|expo-router|nativewind|react-clone-referenced-element)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@nexgen-connect/shared$": "<rootDir>/../packages/shared/src/index.ts",
    "^@nexgen-connect/shared/(.*)$": "<rootDir>/../packages/shared/src/$1",
    "^@nexgen-connect/copy$": "<rootDir>/../packages/copy/src/index.ts",
    "^@nexgen-connect/copy/(.*)$": "<rootDir>/../packages/copy/src/$1",
  },
  collectCoverageFrom: [
    "src/lib/**/*.{ts,tsx}",
    "!src/lib/**/*.test.{ts,tsx}",
    "!src/lib/services/index.ts",
  ],
  coverageThreshold: {
    // Build Prompt §Bucket 6 target: 60% statement coverage on
    // mobile/src/lib/* (business logic).
    "./src/lib/": {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
    // Stricter threshold on security primitives — smallest, highest-stakes.
    "./src/lib/security/": {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
    // Tightest on utils.
    "./src/lib/utils/": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
