import "server-only";

import { createHash } from "node:crypto";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export function hashPhone(phoneE164: string): string {
  const pepper = required("PHONE_PEPPER");
  return createHash("sha256")
    .update(`${pepper}:${phoneE164.trim()}`)
    .digest("hex");
}

export function hashOtp(code: string): string {
  const pepper = required("OTP_PEPPER");
  return createHash("sha256").update(`${pepper}:${code.trim()}`).digest("hex");
}

export function hashEmail(email: string): string {
  const pepper = required("PHONE_PEPPER");
  return createHash("sha256")
    .update(`${pepper}:email:${email.trim().toLowerCase()}`)
    .digest("hex");
}

/**
 * Hash a DigiLocker "reference key" (opaque UIDAI token returned alongside
 * eAadhaar). Using a dedicated pepper means we can rotate PHONE_PEPPER
 * without invalidating in-flight identity records.
 *
 * Never store the raw UIDAI reference. UIDAI rules prohibit it and a leak
 * would link waitlist rows to specific Aadhaar-holders.
 */
export function hashAadhaarRef(ref: string): string {
  const pepper = required("AADHAAR_REF_PEPPER");
  return createHash("sha256").update(`${pepper}:${ref.trim()}`).digest("hex");
}

/**
 * Hash an IP for audit logs. We store the hash so log dumps don't expose
 * raw IPs (GDPR PII), while still allowing us to detect repeat offenders
 * by comparing hashes.
 */
export function hashIp(ip: string): string {
  const pepper = required("PHONE_PEPPER");
  return createHash("sha256")
    .update(`${pepper}:ip:${ip.trim()}`)
    .digest("hex");
}

/**
 * Hash a User-Agent for audit logs. Truncated to 32 chars - plenty of
 * entropy to fingerprint + group related events without turning logs
 * into an analytics goldmine.
 */
export function hashUserAgent(ua: string): string {
  const pepper = required("PHONE_PEPPER");
  return createHash("sha256")
    .update(`${pepper}:ua:${ua.trim()}`)
    .digest("hex")
    .slice(0, 32);
}
