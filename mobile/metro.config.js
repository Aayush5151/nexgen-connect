// Metro configuration for monorepo. Required so Metro can resolve
// `@nexgen-connect/shared` from the workspace root and watch for
// changes in packages/* without expensive rebuilds.
//
// Pattern follows the official Expo monorepo guide
// (https://docs.expo.dev/guides/monorepos/) — extending the default
// config rather than replacing fields, so future Expo SDK upgrades
// pick up new defaults automatically.
//
// expo-router note: see babel.config.js for the workaround that
// keeps `process.env.EXPO_ROUTER_APP_ROOT` correctly inlined when
// babel-preset-expo can't auto-detect expo-router across the hoisted
// monorepo node_modules.
//
// React deduping: handled at install time via root package.json
// `overrides`. Both web (Next.js 16) and mobile (Expo SDK 54) now
// pin react@19.1.0, npm hoists a single copy. No Metro alias needed.

const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the monorepo root in addition to whatever Expo set up.
//    Triggers fast-refresh when packages/shared changes.
config.watchFolders = [...(config.watchFolders ?? []), monorepoRoot];

// 2. Resolve modules from BOTH the app's own node_modules and the
//    hoisted root node_modules. With single-React deduping in place,
//    project-local first is mostly a future-proofing — if a workspace
//    ever needs to pin a divergent version of something, it lands at
//    its own node_modules and wins resolution.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
