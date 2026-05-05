/**
 * OTP router — picks the primary channel + handles fallback.
 *
 * Primary defaults to WhatsApp (set via OTP_PRIMARY_CHANNEL env). If
 * the primary fails with a `retryable=true` error (which includes
 * "recipient not on WhatsApp"), the router falls through to the
 * secondary channel.
 *
 * `userOptedOutOfWhatsapp=true` is the explicit-user-preference path:
 * the router skips WhatsApp entirely and goes straight to SMS.
 *
 * Output `channel` is the channel that ACTUALLY delivered (or
 * attempted to deliver in the failure case), so the audit log
 * captures the real path.
 *
 * v16 web pivot §P0.
 */
import type { OtpChannel, OtpProvider, SendOtpInput, SendOtpResult } from "./types";
import { whatsappProvider } from "./whatsapp";
import { msg91SmsProvider } from "./msg91-sms";

/** Resolved at call time, not at module load — env can change in tests. */
function primaryChannel(): OtpChannel {
  const flag = process.env.OTP_PRIMARY_CHANNEL?.toLowerCase();
  return flag === "sms" ? "sms" : "whatsapp"; // default: whatsapp
}

function providerFor(channel: OtpChannel): OtpProvider {
  return channel === "whatsapp" ? whatsappProvider : msg91SmsProvider;
}

function otherChannel(channel: OtpChannel): OtpChannel {
  return channel === "whatsapp" ? "sms" : "whatsapp";
}

export type RouterInput = SendOtpInput & {
  /**
   * If true, the user has explicitly asked NOT to receive OTP via
   * WhatsApp. Router skips WhatsApp regardless of OTP_PRIMARY_CHANNEL.
   */
  userOptedOutOfWhatsapp?: boolean;
};

/** Test-injectable factory for unit tests; default uses real providers. */
export type ProviderRegistry = {
  whatsapp: OtpProvider;
  sms: OtpProvider;
};

const defaultRegistry: ProviderRegistry = {
  whatsapp: whatsappProvider,
  sms: msg91SmsProvider,
};

/**
 * Send an OTP via the configured channel chain.
 *
 * Returns the FIRST successful provider's result, or the LAST
 * provider's failure if all attempts fail. The returned `channel`
 * field is the one that actually got the message (or attempted to).
 */
export async function sendOtp(
  input: RouterInput,
  registry: ProviderRegistry = defaultRegistry,
): Promise<SendOtpResult> {
  const startWith: OtpChannel = input.userOptedOutOfWhatsapp
    ? "sms"
    : primaryChannel();

  const providers: OtpProvider[] = [registry[startWith]];
  // If the user hasn't opted out AND we have a fallback, queue it.
  if (!input.userOptedOutOfWhatsapp) {
    providers.push(registry[otherChannel(startWith)]);
  }

  let last: SendOtpResult = {
    ok: false,
    channel: startWith,
    error: "E019:no_provider_available",
    retryable: false,
  };

  for (const p of providers) {
    const result = await p.send({ phoneE164: input.phoneE164, code: input.code });
    if (result.ok) return result;
    last = result;
    if (!result.retryable) {
      // Non-retryable error from primary — don't burn the fallback.
      // E.g., "whatsapp_not_configured" in prod = environment bug, not
      // user-resolvable, and SMS is also likely misconfigured.
      // EXCEPTION: recipient-not-on-whatsapp is retryable=true on the
      // provider side, which lands us in fallback. Other errors stop here.
      return result;
    }
  }

  return last;
}
