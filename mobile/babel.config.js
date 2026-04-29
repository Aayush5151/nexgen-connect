module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // react-native-reanimated/plugin must be the LAST plugin in the
      // list. Required for reanimated worklets — without it, animated
      // styles run on the JS thread and the worklet directives are
      // silently no-ops. Per the official RN-Reanimated v4 install
      // guide.
      "react-native-reanimated/plugin",
    ],
  };
};
