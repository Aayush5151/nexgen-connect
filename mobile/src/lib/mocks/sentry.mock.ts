/**
 * Sentry RN — mock client.
 *
 * v15 BP §22 / v6 build §22 — crash reporting. Real implementation uses
 * `@sentry/react-native` with native iOS/Android crash handlers. DSN
 * comes from `EXPO_PUBLIC_SENTRY_DSN` env var.
 *
 * Mock: no-op client that logs to console in __DEV__ and stores a
 * buffer for inspection. Drop-in API match for the subset of Sentry
 * methods the app uses (init, captureException, captureMessage,
 * setUser, addBreadcrumb).
 */

type SentryEvent =
  | { kind: "exception"; error: Error; tags?: Record<string, string> }
  | {
      kind: "message";
      message: string;
      level: "fatal" | "error" | "warning" | "info" | "debug";
    }
  | { kind: "breadcrumb"; category: string; message: string };

const buffer: SentryEvent[] = [];
let user: { id?: string; email?: string } | null = null;
let initialized = false;

declare const __DEV__: boolean;

export const sentryMock = {
  init(opts: { dsn: string; environment?: string }): void {
    initialized = true;
    void opts;
    if (__DEV__) {
      console.log("[sentry-mock] init — events will buffer locally");
    }
  },

  captureException(error: Error, tags?: Record<string, string>): void {
    buffer.push({ kind: "exception", error, tags });
    if (__DEV__) {
      console.error("[sentry-mock] exception:", error.message, tags ?? {});
    }
  },

  captureMessage(
    message: string,
    level: "fatal" | "error" | "warning" | "info" | "debug" = "info"
  ): void {
    buffer.push({ kind: "message", message, level });
    if (__DEV__) {
      console.log(`[sentry-mock] ${level}:`, message);
    }
  },

  setUser(u: { id?: string; email?: string } | null): void {
    user = u;
  },

  addBreadcrumb(category: string, message: string): void {
    buffer.push({ kind: "breadcrumb", category, message });
  },

  /** Test helper — inspect buffered events. */
  _buffer(): SentryEvent[] {
    return [...buffer];
  },

  /** Test helper — current user. */
  _user(): { id?: string; email?: string } | null {
    return user;
  },

  /** Test helper — clear buffer. */
  _reset(): void {
    buffer.length = 0;
    user = null;
    initialized = false;
  },

  /** Test helper — has init been called. */
  _isInitialized(): boolean {
    return initialized;
  },
};

export type SentryClient = typeof sentryMock;
