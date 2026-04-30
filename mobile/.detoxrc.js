/**
 * Detox config scaffold — integration tests for the seven critical
 * flows from Build Prompt §Bucket 6.
 *
 * Status: scaffolded, not yet running. Per C5 of build-prompt-decisions
 * the flows execute against a dev simulator with the mock backend
 * until TestFlight credentials clear (see e2e-testflight-runbook.md).
 *
 * The seven flows specs land at .detox/specs/ as a Bucket 6 follow-up
 * — this config is the harness wiring.
 *
 * v6 build §23 / Build Prompt Bucket 6.
 */
/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: ".detox/jest.config.js",
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    "ios.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/NexGenConnect.app",
      build: "xcodebuild -workspace ios/NexGenConnect.xcworkspace -scheme NexGenConnect -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "ios.release": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Release-iphonesimulator/NexGenConnect.app",
      build: "xcodebuild -workspace ios/NexGenConnect.xcworkspace -scheme NexGenConnect -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
    },
    "android.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build: "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      reversePorts: [4000, 8081],
    },
  },
  devices: {
    "ios.simulator.iphone12": {
      type: "ios.simulator",
      device: { type: "iPhone 12" },
    },
    "android.emulator.pixel5": {
      type: "android.emulator",
      device: { avdName: "Pixel_5_API_34" },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "ios.simulator.iphone12",
      app: "ios.debug",
    },
    "ios.sim.release": {
      device: "ios.simulator.iphone12",
      app: "ios.release",
    },
    "android.emu.debug": {
      device: "android.emulator.pixel5",
      app: "android.debug",
    },
  },
};
