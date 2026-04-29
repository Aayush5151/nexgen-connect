module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        "babel-preset-expo",
        {
          // Enable `import.meta` polyfill at compile time (rewrites
          // `import.meta` → `globalThis.__ExpoImportMetaRegistry`).
          // Default is OFF on web; with it OFF, raw `import.meta`
          // survives through Metro's non-module bundle and Chrome
          // throws "Cannot use 'import.meta' outside a module" on
          // first paint. react-native-reanimated v4 + several Expo
          // internals emit `import.meta`, so the polyfill needs to
          // be on for any web build of an Expo SDK 54 + RN 0.81 app.
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      // Monorepo workaround for `process.env.EXPO_ROUTER_APP_ROOT`
      // not being inlined.
      //
      // babel-preset-expo conditionally applies its expo-router
      // plugin via `hasModule('expo-router')` — i.e.
      // require.resolve('expo-router') from inside the preset's own
      // directory. In a monorepo, the preset is hoisted to the
      // workspace root (nexgen-connect/node_modules/babel-preset-expo)
      // while expo-router stays at the leaf (nexgen-connect/mobile/
      // node_modules/expo-router). Node's resolver walks UP from the
      // preset, never finds the leaf install, returns false, and the
      // plugin never registers. The bundle then ships with literal
      // `process.env.EXPO_ROUTER_APP_ROOT` calls — which evaluate to
      // undefined at runtime and crash require.context() in
      // expo-router/_ctx.ios.js with "First argument should be a
      // string".
      //
      // Fix: register the plugin manually here, bypassing
      // hasModule(). The plugin itself reads its config from the
      // Metro babel caller (routerRoot defaults to ./app), so no
      // additional options needed.
      require("babel-preset-expo/build/expo-router-plugin")
        .expoRouterBabelPlugin,

      // react-native-reanimated/plugin must be the LAST plugin in the
      // list. Required for reanimated worklets — without it, animated
      // styles run on the JS thread and the worklet directives are
      // silently no-ops.
      "react-native-reanimated/plugin",
    ],
  };
};
