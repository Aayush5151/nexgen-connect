/**
 * Screen-protection helpers.
 *
 * Build Prompt §Bucket 3:
 *   - Background blur on app switch (iOS): when the app goes to
 *     background, the screenshot in the app switcher is replaced
 *     with a blurred placeholder. Use react-native-privacy-snapshot
 *     equivalent.
 *   - Screenshot prevention (Android): FLAG_SECURE on screens with
 *     sensitive data: Parent View dashboard, T&S Report thread,
 *     Premium receipt, admit-letter preview. Use expo-screen-capture
 *     with preventScreenCaptureAsync().
 *
 * Implementation:
 *   - useScreenCapturePrevent(): React hook that blocks capture for
 *     the lifetime of the component.
 *   - The iOS app-switcher blur lives in the native side via
 *     expo-blur-on-background (added in Bucket 3 follow-up).
 *
 * v15 BP §16 / v6 build §16 / Build Prompt Bucket 3.
 */
import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

/**
 * Hook that prevents screen capture (Android FLAG_SECURE +
 * iOS screenshot-blur in app switcher) for the lifetime of the
 * mounted component. Re-allows capture on unmount.
 *
 * Use on screens that show:
 *   - Parent dashboard (PV2)
 *   - T&S Report thread (TS3)
 *   - Premium receipt (PR3)
 *   - Admit-letter preview (O8 / O11)
 *
 * Stacking: if the user navigates from PV2 to PV4 (also sensitive),
 * both call prevent — that's idempotent on the platform side.
 */
export function useScreenCapturePrevent(active: boolean = true): void {
  useEffect(() => {
    if (!active) return;
    let mounted = true;
    void ScreenCapture.preventScreenCaptureAsync().catch(() => {
      // No-op — preventScreenCaptureAsync rejects on unsupported
      // platforms (web). Don't crash the screen for it.
    });
    return () => {
      if (!mounted) return;
      mounted = false;
      void ScreenCapture.allowScreenCaptureAsync().catch(() => {
        // Same — best-effort.
      });
    };
  }, [active]);
}
