/**
 * Premium router — Razorpay ₹999 one-time + status + first-week check-in.
 *
 * Pricing locked at ₹999 per v15 BP §5.2 (Parent-Pay framing). A6 kill
 * criterion (§12.3): if conversion <10% at ₹999 in pilot, reprice to ₹599.
 *
 * v15 BP §5.2 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { ArrivalCheckinSchema } from "@nexgen-connect/shared";
import { router, fullyVerifiedProcedure, fullyVerifiedMutation } from "../trpc";

const PremiumStatus = z.object({
  active: z.boolean(),
  activatedAt: z.string().nullable(),
  receiptId: z.string().nullable(),
});

export const premiumRouter = router({
  status: fullyVerifiedProcedure
    .output(PremiumStatus)
    .query(async ({ ctx }) => ({
      active: ctx.user.premiumActiveAt !== null,
      activatedAt: ctx.user.premiumActiveAt,
      receiptId: ctx.user.premiumActiveAt ? "rcpt-mock-1" : null,
    })),

  startCheckout: fullyVerifiedMutation
    .output(
      z.object({
        razorpayOrderId: z.string(),
        amountDisplay: z.string(),
      }),
    )
    .mutation(async () => ({
      razorpayOrderId: `order_${crypto.randomUUID().slice(0, 14)}`,
      amountDisplay: "₹999",
    })),

  confirmCheckout: fullyVerifiedMutation
    .input(z.object({ razorpayOrderId: z.string() }))
    .output(PremiumStatus)
    .mutation(async ({ ctx }) => ({
      active: true,
      activatedAt: ctx.now.toISOString(),
      receiptId: `rcpt-${crypto.randomUUID().slice(0, 8)}`,
    })),

  firstWeekCheckin: fullyVerifiedMutation
    .input(ArrivalCheckinSchema)
    .output(z.object({ ok: z.boolean(), advisorResponseEta: z.string().optional() }))
    .mutation(async ({ ctx, input }) => ({
      ok: true,
      advisorResponseEta:
        input.status === "i_need_help_triggered"
          ? new Date(ctx.now.getTime() + 30 * 60_000).toISOString()
          : undefined,
    })),
});
