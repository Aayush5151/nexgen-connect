/**
 * OTP provider abstraction.
 *
 * The OTP send path is pluggable: WhatsApp via Meta Cloud API is the
 * primary channel for India users (~₹0.115/msg, 99%+ deliverability,
 * 500M+ Indian DAU on WhatsApp); MSG91 SMS is the fallback for users
 * who are unreachable on WhatsApp or have opted out.
 *
 * Routing logic lives in router.ts. This file is types-only so the
 * concrete provider modules and the consuming tRPC procedure can
 * agree on the contract without circular imports.
 *
 * v16 web pivot §P0.
 */

export type OtpChannel = "whatsapp" | "sms";

export type SendOtpInput = {
  /** E.164 phone number including country code, no leading "+". */
  phoneE164: string;
  /** The 6-digit OTP code to deliver. Caller generates + persists it. */
  code: string;
};

export type SendOtpResult =
  | {
      ok: true;
      /** Channel actually used. May differ from primary if fallback fired. */
      channel: OtpChannel;
      /** True when the upstream was bypassed (no creds, mock mode). */
      mock: boolean;
      /** Provider-specific request id for trace + dedupe. */
      requestId?: string;
    }
  | {
      ok: false;
      /** Channel that was attempted (last in the chain). */
      channel: OtpChannel;
      /** Error code from the E0XX catalog — do NOT forward upstream messages. */
      error: string;
      /** Whether the failure mode is "retry might help" (e.g., upstream 5xx) */
      retryable: boolean;
    };

/**
 * Every concrete provider implements this single method. The provider
 * is stateless beyond its own client config — sessions, rate limits,
 * and audit writes live one layer up (router + tRPC procedure).
 */
export interface OtpProvider {
  readonly channel: OtpChannel;
  send(input: SendOtpInput): Promise<SendOtpResult>;
}
