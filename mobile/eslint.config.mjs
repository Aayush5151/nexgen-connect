/**
 * Mobile ESLint config — ESLint 9 flat config.
 *
 * Composes Expo's official preset (`eslint-config-expo/flat`), which itself
 * pulls in:
 *   - core ESLint recommended rules
 *   - TypeScript rules (typescript-eslint recommended)
 *   - React + React Hooks rules
 *   - Expo + RN-specific globals (__DEV__, ErrorUtils, etc.)
 *
 * Mirrors the web workspace's flat-config style (`web/eslint.config.mjs`).
 *
 * Why max-warnings 0 in `npm run lint`: zero-warning policy keeps the
 * "Bucket 1 closes when clean clone exits 0" rule honest. Surface drift
 * the moment it lands, not at v6 release.
 */
import { defineConfig, globalIgnores } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import globals from "globals";

export default defineConfig([
  ...expoConfig,
  globalIgnores([
    // Build/derived artifacts
    ".expo/**",
    "android/**",
    "ios/**",
    "node_modules/**",
    "dist/**",
    "web-build/**",
    "coverage/**",
    // Generated types
    "expo-env.d.ts",
    // Detox specs ship as scaffolds — they reference `detox` global
    // types that are only installed when EAS Build wires (Bucket 5 + 6
    // follow-up). Excluded from lint until the harness runs.
    ".detox/**",
  ]),
  {
    rules: {
      // RN's <Text> component renders as native text — apostrophes and
      // quotation marks inside <Text> children are normal characters,
      // not HTML attribute delimiters. The web-oriented HTML-escape
      // rule produces only false positives in RN. Off project-wide.
      // (Configure, don't suppress — per E5 of build-prompt-decisions.md.)
      "react/no-unescaped-entities": "off",
    },
  },
  {
    // Jest globals for test files + setup. Limited to the test surface
    // so component code can't accidentally reach for jest.* at runtime.
    files: ["**/__tests__/**/*.{ts,tsx,js}", "jest.setup.js", "**/*.test.{ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },
]);
