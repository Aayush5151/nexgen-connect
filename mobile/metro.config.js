// Metro configuration for monorepo. Required so Metro can resolve
// `@nexgen-connect/shared` from the workspace root and watch for
// changes in packages/* without expensive rebuilds.
//
// Pattern follows the official Expo monorepo guide
// (https://docs.expo.dev/guides/monorepos/) — extending the default
// config rather than replacing fields, so future Expo SDK upgrades
// pick up new defaults automatically.

const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the monorepo root in addition to whatever Expo set up.
//    Triggers fast-refresh when packages/shared changes.
config.watchFolders = [...(config.watchFolders ?? []), monorepoRoot];

// 2. Resolve modules from BOTH the app's own node_modules and the
//    hoisted root node_modules. Order matters: project-local first so
//    a workspace can pin a divergent version (e.g., the SDK-pinned
//    React) and not get accidentally hijacked by the hoisted one.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
