/**
 * PostHog — mock client.
 *
 * v15 BP §21 / v6 build §21 — telemetry. ~40 events instrumented per
 * the §21 catalogue. Real implementation uses `posthog-react-native`
 * with project key from `EXPO_PUBLIC_POSTHOG_KEY` env var.
 *
 * Mock: no-op client with event buffer for inspection. Drop-in API
 * for the methods the app uses: init, capture, identify, reset,
 * group, screen.
 */

export type PostHogEvent = {
  name: string;
  properties?: Record<string, unknown>;
  at: string;
};

const buffer: PostHogEvent[] = [];
let distinctId: string | null = null;
let initialized = false;

declare const __DEV__: boolean;

export const posthogMock = {
  init(opts: { apiKey: string; host?: string }): void {
    initialized = true;
    void opts;
    if (__DEV__) {
       
      console.log("[posthog-mock] init — events will buffer locally");
    }
  },

  capture(eventName: string, properties?: Record<string, unknown>): void {
    const event: PostHogEvent = {
      name: eventName,
      properties,
      at: new Date().toISOString(),
    };
    buffer.push(event);
    if (__DEV__) {
       
      console.log(`[posthog-mock] ${eventName}`, properties ?? {});
    }
  },

  /** Identify the current user — flips anonymous events to user-keyed. */
  identify(
    id: string,
    traits?: Record<string, unknown>,
  ): void {
    distinctId = id;
    void traits;
  },

  /** Clear identification (sign-out). */
  reset(): void {
    distinctId = null;
  },

  /** Track a screen view. Convenience over capture. */
  screen(screenName: string, properties?: Record<string, unknown>): void {
    this.capture("$screen", { screen: screenName, ...properties });
  },

  /** Test helper — inspect captured events. */
  _buffer(): PostHogEvent[] {
    return [...buffer];
  },

  /** Test helper — current distinct id. */
  _distinctId(): string | null {
    return distinctId;
  },

  /** Test helper — clear buffer + identity. */
  _reset(): void {
    buffer.length = 0;
    distinctId = null;
    initialized = false;
  },

  /** Test helper — has init been called. */
  _isInitialized(): boolean {
    return initialized;
  },
};

export type PostHogClient = typeof posthogMock;
