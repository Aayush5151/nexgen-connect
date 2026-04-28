/**
 * Mock Premium service. Razorpay native sheet stays out of the mock —
 * instead, startCheckout returns a fake order id; the UI calls
 * confirmCheckout({razorpayOrderId}) to flip the status to active.
 *
 * In prod we'll open the Razorpay React Native SDK with the order id
 * and confirm via webhook. The shape of `Services.premium` doesn't
 * change between mock and real.
 */

import { PREMIUM_PRICE_DISPLAY } from "@nexgen-connect/shared";
import type { PremiumStatus, StartCheckoutResult } from "../services/types";

let status: PremiumStatus = {
  active: false,
  activatedAt: null,
  receiptId: null,
};

function delay<T>(ms: number, v: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}
function randomId(): string {
  return Math.random().toString(36).slice(2, 12);
}

export const premiumMock = {
  async status(): Promise<PremiumStatus> {
    return delay(150, { ...status });
  },

  async startCheckout(): Promise<StartCheckoutResult> {
    return delay(400, {
      razorpayOrderId: "ord_mock_" + randomId(),
      amountDisplay: PREMIUM_PRICE_DISPLAY,
    });
  },

  async confirmCheckout(_input: { razorpayOrderId: string }): Promise<PremiumStatus> {
    await delay(900, null);
    status = {
      active: true,
      activatedAt: new Date().toISOString(),
      receiptId: "rcpt_" + randomId(),
    };
    return { ...status };
  },
};
