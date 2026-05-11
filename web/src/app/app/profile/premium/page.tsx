"use client";

import { useState } from "react";
import Link from "next/link";
import { premiumStartCheckout } from "@/lib/app/services";
import { trackPostHog } from "@/lib/posthog";

/**
 * /app/profile/premium — premium upsell.
 *
 * ₹999 one-time. Three concrete features (parent view, group-apply,
 * arrival check-in) plus the 1h T&S SLA upgrade. No subscription, no
 * tier games. Real Razorpay wiring lands in Bucket 8.
 *
 * v16 web pivot §Bucket 5.
 */
export default function PremiumPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<{ orderId: string; amount: number } | null>(null);

  async function startCheckout() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await premiumStartCheckout();
      setOrder({ orderId: res.orderId, amount: res.amount });
      trackPostHog("premium_checkout_started", { orderId: res.orderId });
      // When real Razorpay is wired (NEXT_PUBLIC_USE_REAL_RAZORPAY=true)
      // this is where we'd open Razorpay Checkout.js with res.keyId,
      // res.orderId, and prefilled email/phone. The client-side widget
      // POSTs payment_id back to our webhook (signature-verified) which
      // emits the Inngest premium/order.paid event — that durable job
      // flips user_premium.status to 'active' and emits premium_paid
      // analytics.
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown_error";
      trackPostHog("premium_failed", { orderId: order?.orderId ?? "unknown", reason });
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 pt-2">
      <header>
        <Link
          href="/app/profile"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)] hover:text-[color:var(--color-fg)]"
        >
          ← Profile
        </Link>
        <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
          Premium · ₹999 once
        </p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
          Buy it once. Use it through your degree.
        </h1>
      </header>

      <ul className="space-y-3">
        <Feature
          title="Parent view"
          sub="Magic-link dashboard for your parent. Read-only. No chats. No Instagram."
        />
        <Feature
          title="Group apply"
          sub="3–6 of you apply for housing together via verified PBSA partners (aparto, Yugo, Fresh, Mezzino)."
        />
        <Feature
          title="Arrival check-in (Y6)"
          sub="Log arrival at the airport or uni. Your parent gets one notification, that you landed safe."
        />
        <Feature
          title="1h T&S SLA"
          sub="Faster review on harassment, scams, anything that puts you at risk."
        />
      </ul>

      {error && (
        <p className="text-[12px] text-[color:var(--color-danger)]">{error}</p>
      )}

      {order ? (
        <section className="rounded-[14px] border border-[color:var(--color-primary)]/30 bg-[color:var(--color-surface)] p-5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
            Mock checkout · order {order.orderId.slice(-8)}
          </p>
          <p className="mt-3 text-[14px] text-[color:var(--color-fg)]">
            Real Razorpay flow lands in Bucket 6/8. Mock would now open Razorpay
            checkout for ₹{(order.amount / 100).toFixed(0)}.
          </p>
        </section>
      ) : (
        <button
          type="button"
          onClick={startCheckout}
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Opening checkout…" : "Pay ₹999"}
        </button>
      )}

      <p className="text-center text-[12px] text-[color:var(--color-fg-subtle)]">
        Refunds: 14 days, no-tour-yet, full refund. After tour: pro-rated. Per Terms §6.
      </p>
    </div>
  );
}

function Feature({ title, sub }: { title: string; sub: string }) {
  return (
    <li className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <p className="text-[14px] font-semibold text-[color:var(--color-fg)]">{title}</p>
      <p className="mt-1 text-[13px] leading-[1.5] text-[color:var(--color-fg-muted)]">{sub}</p>
    </li>
  );
}
