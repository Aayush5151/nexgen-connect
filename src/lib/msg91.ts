import "server-only";

const MSG91_URL = "https://control.msg91.com/api/v5/otp";
const MSG91_VERIFY_URL = "https://control.msg91.com/api/v5/otp/verify";

export const MOCK_OTP_CODE = "000000";

export function isMockOtp(): boolean {
  return process.env.MOCK_OTP === "true";
}

type SendOtpResult =
  | { ok: true; mock: boolean }
  | { ok: false; error: string };

export async function sendOtp(phoneE164: string): Promise<SendOtpResult> {
  if (isMockOtp()) {
    console.log(`[mock-otp] ${phoneE164} → ${MOCK_OTP_CODE}`);
    return { ok: true, mock: true };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  const senderId = process.env.MSG91_SENDER_ID ?? "NXGNCN";

  if (!authKey || !templateId) {
    return { ok: false, error: "MSG91 not configured" };
  }

  const mobile = phoneE164.replace(/^\+/, "");

  try {
    const res = await fetch(
      `${MSG91_URL}?template_id=${templateId}&mobile=${mobile}&sender=${senderId}&otp_length=6`,
      {
        method: "POST",
        headers: { authkey: authKey, "Content-Type": "application/json" },
      },
    );
    const data = (await res.json()) as { type?: string; message?: string };
    if (data.type === "success") return { ok: true, mock: false };
    return { ok: false, error: data.message ?? "MSG91 send failed" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "MSG91 send failed",
    };
  }
}

type VerifyOtpResult =
  | { ok: true; mock: boolean }
  | { ok: false; error: string };

export async function verifyOtpUpstream(
  phoneE164: string,
  code: string,
): Promise<VerifyOtpResult> {
  if (isMockOtp()) {
    if (code === MOCK_OTP_CODE) return { ok: true, mock: true };
    return { ok: false, error: "Invalid code" };
  }

  const authKey = process.env.MSG91_AUTH_KEY;
  if (!authKey) return { ok: false, error: "MSG91 not configured" };

  const mobile = phoneE164.replace(/^\+/, "");

  try {
    const res = await fetch(
      `${MSG91_VERIFY_URL}?otp=${code}&mobile=${mobile}`,
      { method: "GET", headers: { authkey: authKey } },
    );
    const data = (await res.json()) as { type?: string; message?: string };
    if (data.type === "success") return { ok: true, mock: false };
    return { ok: false, error: data.message ?? "Invalid code" };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "MSG91 verify failed",
    };
  }
}
