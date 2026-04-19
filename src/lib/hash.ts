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
