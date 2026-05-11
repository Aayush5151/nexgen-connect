"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { corridorPreview } from "@/lib/signup/services";

/**
 * /signup/preview — corridor cold-start preview. Step 5 of 7.
 *
 * v16 web pivot §Bucket 4 cold-start awareness:
 *   verifiedCount < 5 → "Be one of the first 5 — Aayush will personally
 *                        call you within 48h" empty state.
 *   verifiedCount ≥ 5 → layered preview (Layer 1 / Layer 2 / Layer 3).
 *
 * No more hardcoded 47/60. Real data drives the surface.
 */

export default function SignupPreviewPage() {
  const router = useRouter();
  const corridorChoice = useSignup((s) => s.corridorChoice);
  const homeCity = useSignup((s) => s.homeCity);

  const [data, setData] = useState<Awaited<ReturnType<typeof corridorPreview>> | null>(null);

  useEffect(() => {
    if (!corridorChoice || !homeCity) {
      router.replace("/signup");
      return;
    }
    void corridorPreview({
      homeCity,
      destination: corridorChoice.uni,
      intake: corridorChoice.intake,
    }).then(setData);
  }, [corridorChoice, homeCity, router]);

  if (!corridorChoice || !data) {
    return (
      <SignupShell step={5}>
        <p className="text-[15px] text-[color:var(--color-fg-muted)]">Loading preview…</p>
      </SignupShell>
    );
  }

  return (
    <SignupShell step={5}>
      {data.isColdStart ? <ColdStart count={data.layer2Count} /> : <Populated data={data} />}
      <button
        type="button"
        onClick={() => router.push("/signup/identity")}
        className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color] hover:bg-[color:var(--color-primary-hover)]"
      >
        Continue to verification
      </button>
    </SignupShell>
  );
}

function ColdStart({ count }: { count: number }) {
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        First five · Founders call
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        You&apos;d be one of the first {count === 0 ? "five" : `${count + 1}`}.
      </h1>
      <p className="mt-3 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        Honest preview: this corridor is brand new. Aayush (the founder) will
        personally call you within 48 hours of admit-letter approval to
        introduce you to the first verified students as they sign up. No bot
        gating, no waiting for the group to fill before you hear back.
      </p>
      <div className="mt-6 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
          What happens next
        </p>
        <ul className="mt-3 space-y-2 text-[13px] text-[color:var(--color-fg-muted)]">
          <li>1. Verify identity via DigiLocker (next step)</li>
          <li>2. Upload admit letter, human review in 48h</li>
          <li>3. We email you when verification clears</li>
          <li>4. Aayush calls within 48h to introduce you to the first cohort</li>
        </ul>
      </div>
    </div>
  );
}

function Populated({
  data,
}: {
  data: { layer1Count: number; layer2Count: number; layer3Count: number; threshold: number };
}) {
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        Real numbers
      </p>
      <h1 className="mt-4 font-heading text-[80px] font-bold leading-none tracking-[-0.04em] text-[color:var(--color-primary)]">
        {data.layer2Count}
      </h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">
        verified students · {data.threshold - data.layer2Count > 0 ? `${data.threshold - data.layer2Count} more to unlock` : "group chat live"}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        <Stat label="Hometown crew" value={data.layer1Count} hint="From your city" />
        <Stat label="City ambient" value={data.layer3Count} hint="Same city, all intakes" />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
        {label}
      </p>
      <p className="mt-2 font-heading text-[32px] font-semibold tabular-nums text-[color:var(--color-fg)]">
        {value}
      </p>
      <p className="mt-1 text-[12px] text-[color:var(--color-fg-subtle)]">{hint}</p>
    </div>
  );
}
