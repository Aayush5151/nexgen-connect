declare global {
  interface Window {
    plausible?: (
      event: string,
      opts?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export type AnalyticsEvent =
  | "Cohort_Viewed"
  | "Waitlist_Started"
  | "OTP_Sent"
  | "OTP_Verified"
  | "OTP_Rate_Limited"
  | "Signup_Completed"
  | "Admit_Uploaded"
  | "CTA_Clicked"
  | "Scrollytelling_Complete";

export function track(
  event: AnalyticsEvent,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  window.plausible?.(event, props ? { props } : undefined);
}
