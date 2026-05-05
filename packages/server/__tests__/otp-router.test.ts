/**
 * OTP router tests — provider chain + fallback semantics.
 *
 * v16 web pivot §P0.
 */
import type { OtpProvider, SendOtpResult } from "../src/server/lib/otp/types";
import { sendOtp } from "../src/server/lib/otp/router";

function makeProvider(channel: "whatsapp" | "sms", responses: SendOtpResult[]): OtpProvider & {
  callCount: number;
  lastInput: { phoneE164: string; code: string } | null;
} {
  return {
    channel,
    callCount: 0,
    lastInput: null,
    async send(input) {
      this.callCount++;
      this.lastInput = input;
      return responses[Math.min(this.callCount - 1, responses.length - 1)];
    },
  };
}

const dummyInput = { phoneE164: "+919999999999", code: "123456" };

describe("OTP router", () => {
  const originalEnv = process.env.OTP_PRIMARY_CHANNEL;
  afterEach(() => {
    process.env.OTP_PRIMARY_CHANNEL = originalEnv;
  });

  describe("primary channel selection", () => {
    test("defaults to whatsapp when OTP_PRIMARY_CHANNEL unset", async () => {
      delete process.env.OTP_PRIMARY_CHANNEL;
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(true);
      expect(result.channel).toBe("whatsapp");
      expect(wa.callCount).toBe(1);
      expect(sms.callCount).toBe(0);
    });

    test("respects OTP_PRIMARY_CHANNEL=sms", async () => {
      process.env.OTP_PRIMARY_CHANNEL = "sms";
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(true);
      expect(result.channel).toBe("sms");
      expect(sms.callCount).toBe(1);
      expect(wa.callCount).toBe(0);
    });

    test("OTP_PRIMARY_CHANNEL=whatsapp explicitly", async () => {
      process.env.OTP_PRIMARY_CHANNEL = "whatsapp";
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.channel).toBe("whatsapp");
    });

    test("invalid OTP_PRIMARY_CHANNEL value falls back to whatsapp default", async () => {
      process.env.OTP_PRIMARY_CHANNEL = "telegram";
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.channel).toBe("whatsapp");
    });
  });

  describe("user opt-out", () => {
    test("userOptedOutOfWhatsapp=true skips whatsapp entirely", async () => {
      process.env.OTP_PRIMARY_CHANNEL = "whatsapp";
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp({ ...dummyInput, userOptedOutOfWhatsapp: true }, { whatsapp: wa, sms });
      expect(result.ok).toBe(true);
      expect(result.channel).toBe("sms");
      expect(wa.callCount).toBe(0);
      expect(sms.callCount).toBe(1);
    });

    test("userOptedOutOfWhatsapp=true does NOT fall back to whatsapp on SMS failure", async () => {
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [
        { ok: false, channel: "sms", error: "E018:sms_timeout", retryable: true },
      ]);
      const result = await sendOtp(
        { ...dummyInput, userOptedOutOfWhatsapp: true },
        { whatsapp: wa, sms },
      );
      expect(result.ok).toBe(false);
      expect(wa.callCount).toBe(0);
      expect(sms.callCount).toBe(1);
    });
  });

  describe("fallback semantics", () => {
    test("whatsapp retryable failure → falls back to SMS", async () => {
      const wa = makeProvider("whatsapp", [
        { ok: false, channel: "whatsapp", error: "E013:whatsapp_recipient_unreachable", retryable: true },
      ]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: false, requestId: "req-123" }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(true);
      expect(result.channel).toBe("sms");
      expect(wa.callCount).toBe(1);
      expect(sms.callCount).toBe(1);
    });

    test("whatsapp non-retryable failure → does NOT fall back", async () => {
      const wa = makeProvider("whatsapp", [
        // A genuinely non-retryable failure (auth token rejected by Meta —
        // SMS won't help recover from this and we want the alarm to ring).
        { ok: false, channel: "whatsapp", error: "E014:whatsapp_token_rejected", retryable: false },
      ]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(false);
      expect(result.channel).toBe("whatsapp");
      expect(wa.callCount).toBe(1);
      expect(sms.callCount).toBe(0);
    });

    test("whatsapp_not_configured is retryable → falls back to SMS", async () => {
      // Common launch state: META_WA_* env unset in production. Router
      // must route 100% to SMS rather than fail-close every request.
      const wa = makeProvider("whatsapp", [
        { ok: false, channel: "whatsapp", error: "E012:whatsapp_not_configured", retryable: true },
      ]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(true);
      expect(result.channel).toBe("sms");
      expect(wa.callCount).toBe(1);
      expect(sms.callCount).toBe(1);
    });

    test("both providers fail → returns last failure", async () => {
      const wa = makeProvider("whatsapp", [
        { ok: false, channel: "whatsapp", error: "E015:whatsapp_timeout", retryable: true },
      ]);
      const sms = makeProvider("sms", [
        { ok: false, channel: "sms", error: "E018:sms_timeout", retryable: true },
      ]);
      const result = await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.channel).toBe("sms");
        expect(result.error).toBe("E018:sms_timeout");
      }
    });
  });

  describe("input forwarding", () => {
    test("phoneE164 + code reach the chosen provider unchanged", async () => {
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      await sendOtp(dummyInput, { whatsapp: wa, sms });
      expect(wa.lastInput).toEqual({ phoneE164: dummyInput.phoneE164, code: dummyInput.code });
    });

    test("userOptedOutOfWhatsapp is NOT forwarded to the provider", async () => {
      const wa = makeProvider("whatsapp", [{ ok: true, channel: "whatsapp", mock: true }]);
      const sms = makeProvider("sms", [{ ok: true, channel: "sms", mock: true }]);
      await sendOtp(
        { ...dummyInput, userOptedOutOfWhatsapp: true },
        { whatsapp: wa, sms },
      );
      expect(sms.lastInput).toEqual({ phoneE164: dummyInput.phoneE164, code: dummyInput.code });
    });
  });
});
