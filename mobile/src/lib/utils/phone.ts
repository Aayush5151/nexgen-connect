/**
 * Indian phone number helpers — Phase 1 supports IN-only numbers
 * (the launch corridor is India → Ireland / Germany). Future phases
 * widen to other origin countries.
 *
 * IN format: +91 XXXXX XXXXX (10 digits after the +91 prefix).
 */

const IN_DIAL = "91";

/**
 * Strip non-digit chars and return the 10-digit local part if valid,
 * otherwise null. Accepts inputs like "98765 43210", "+91 9876543210",
 * "9876-543-210". Rejects anything that doesn't have exactly 10 digits
 * or starts with 0 / 1.
 */
export function parseIndianMobile(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  // Strip dial code if present.
  const withoutDial = digits.startsWith(IN_DIAL) ? digits.slice(2) : digits;
  if (withoutDial.length !== 10) return null;
  // Indian mobile numbers start with 6, 7, 8, or 9.
  if (!/^[6-9]/.test(withoutDial)) return null;
  return withoutDial;
}

/**
 * Return the E.164 representation (without leading +) for an IN
 * mobile number. Null if the input is invalid.
 */
export function toE164IndianMobile(raw: string): string | null {
  const local = parseIndianMobile(raw);
  if (!local) return null;
  return IN_DIAL + local;
}

/** Format a 10-digit local number as "98765 43210" for display. */
export function formatIndianLocal(local: string): string {
  if (local.length !== 10) return local;
  return `${local.slice(0, 5)} ${local.slice(5)}`;
}

/** Mask all but the last two digits: "+91 ********10". */
export function maskE164(e164: string): string {
  if (e164.length < 4) return "+" + e164;
  return "+" + e164.slice(0, 2) + " " + "*".repeat(8) + e164.slice(-2);
}
