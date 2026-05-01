/**
 * Jest global setup. Wires native-module mocks needed for unit tests
 * to import code that, in production, depends on RN/Expo native bridges.
 *
 * v6 build §23 testing scaffold. Bucket 6 will extend this with mocks
 * for SecureStore, Haptics, Reanimated, and any other native module
 * a unit test ends up reaching through.
 */

// AsyncStorage — mock from the package's official jest export.
// Without this, `import AsyncStorage from "@react-native-async-storage/
// async-storage"` throws "NativeModule is null" because the iOS/Android
// bridge isn't present under jsdom.
jest.mock(
  "@react-native-async-storage/async-storage",
  () => require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);
