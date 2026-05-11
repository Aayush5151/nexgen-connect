/**
 * PaymentGateway factory — single entry point for routes that need
 * to charge users. Returns the configured gateway based on the
 * `PAYMENT_GATEWAY` env var (defaults to razorpay).
 *
 * Adding a new gateway:
 *   1. Implement the PaymentGateway interface in a sibling file
 *      (e.g., `stripe-gateway.ts`).
 *   2. Add a case to `getPaymentGateway()` below.
 *   3. Set `PAYMENT_GATEWAY=stripe` in production env.
 *
 * v16 web pivot Bucket 4 follow-up.
 */
import "server-only";

import { razorpayGateway } from "./razorpay-gateway";
import type { PaymentGateway } from "./types";

export type GatewayId = PaymentGateway["id"];

export function getPaymentGateway(): PaymentGateway {
  const id = (process.env.PAYMENT_GATEWAY as GatewayId | undefined) ?? "razorpay";
  switch (id) {
    case "razorpay":
      return razorpayGateway;
    case "stripe":
    case "cashfree":
      throw new Error(
        `[payments] gateway "${id}" not yet implemented, see web/src/lib/payments/types.ts and add a sibling impl.`,
      );
    default:
      // Unreachable under the enum, but keep the runtime check so a
      // typo'd env var fails-loud instead of silently routing to
      // razorpay.
      throw new Error(`[payments] unknown gateway: ${id}`);
  }
}

export type {
  PaymentGateway,
  CreateOrderInput,
  CreateOrderResult,
  VerifyWebhookResult,
} from "./types";
