"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup } from "@/lib/signup/state";
import { verificationUploadAdmit, verificationCompleteAdmit } from "@/lib/signup/mock-services";

/**
 * /signup/admit — admit-letter upload. Step 7 of 7.
 *
 * Mock: file picker → mock signed URL → completeAdmit returns
 * queue position. Real Cloudflare Images upload lands in Bucket 6.
 *
 * v16 web pivot §Bucket 4.
 */
export default function SignupAdmitPage() {
  const router = useRouter();
  const identityHashMasked = useSignup((s) => s.identityHashMasked);
  const setAdmit = useSignup((s) => s.setAdmit);

  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identityHashMasked) router.replace("/signup/identity");
  }, [identityHashMasked, router]);

  async function onSubmit() {
    if (!file) return;
    setSubmitting(true);
    setError(null);
    try {
      const upload = await verificationUploadAdmit({
        mimeType: file.type,
        fileSizeBytes: file.size,
      });
      // In mock, skip the actual file upload. Real impl would PUT
      // to upload.uploadUrl with the file body.
      const complete = await verificationCompleteAdmit({ docId: upload.docId });
      setAdmit({ docId: complete.docId, state: "pending" });
      router.push("/signup/admit/pending");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <SignupShell step={7}>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--color-primary)]">
        Last check
      </p>
      <h1 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">
        Drop the letter. A human reads it.
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
        JPEG, PNG, or PDF up to 8 MB. Auto-deleted from our storage 60
        minutes after the reviewer&apos;s decision.
      </p>

      <div className="mt-6 rounded-[12px] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-6 text-center">
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[13px] text-[color:var(--color-fg-muted)] file:mr-4 file:rounded-md file:border-0 file:bg-[color:var(--color-primary)] file:px-4 file:py-2 file:text-[12px] file:font-semibold file:text-[color:var(--color-primary-fg)] hover:file:bg-[color:var(--color-primary-hover)]"
        />
        {file && (
          <p className="mt-3 text-[12px] text-[color:var(--color-fg-muted)]">
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-[color:var(--color-danger)]">{error}</p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!file || submitting}
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[color:var(--color-primary)] text-[14px] font-semibold text-[color:var(--color-primary-fg)] transition-[background-color,opacity] hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Uploading…" : "Submit for review"}
      </button>
    </SignupShell>
  );
}
