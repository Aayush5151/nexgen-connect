"use server";

import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Email waitlist.
 *
 * Lightweight pre-launch signup: a visitor drops their email, we store
 * it in `email_waitlist`, and when the mobile app launches we email
 * everyone who signed up. Separate from the phone-verified `waitlist`
 * table, which captures the full onboarding flow.
 *
 * Table shape (see supabase/migrations/0006_email_waitlist.sql):
 *   id            uuid primary key default gen_random_uuid()
 *   email         text not null unique (citext - case-insensitive)
 *   referrer      text null (optional: hero/final/mobile/etc)
 *   user_agent    text null (debug only - truncated at 200 chars)
 *   created_at    timestamptz not null default now()
 *
 * The server action swallows all Supabase-specific errors to avoid
 * leaking schema; it returns one of:
 *   { ok: true, already: boolean }  - inserted, or duplicate swallowed
 *   { ok: false, error: string }    - validation or infra failure
 */

const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email")
    .max(254),
  referrer: z.string().trim().max(40).optional(),
});

export type EmailWaitlistResult =
  | { ok: true; already: boolean }
  | { ok: false; error: string };

export async function joinEmailWaitlistAction(input: {
  email: string;
  referrer?: string;
}): Promise<EmailWaitlistResult> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  try {
    const db = getSupabaseAdmin();

    // Upsert on email to idempotently absorb duplicates. We check
    // rowCount on the insert path to distinguish first-time from repeat.
    const { error, count } = await db
      .from("email_waitlist")
      .upsert(
        {
          email: parsed.data.email,
          referrer: parsed.data.referrer ?? null,
        },
        { onConflict: "email", ignoreDuplicates: true, count: "exact" },
      );

    if (error) {
      console.error("[email-waitlist]", error.message);
      return { ok: false, error: "Something went wrong. Try again." };
    }

    return { ok: true, already: (count ?? 0) === 0 };
  } catch (err) {
    console.error(
      "[email-waitlist.catch]",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "Something went wrong. Try again." };
  }
}

export type EmailWaitlistCountResult =
  | { ok: true; total: number }
  | { ok: false; error: string };

/**
 * Best-effort total for the landing page. Returns 0 if the table is
 * empty or the RPC errors - we never show a broken number.
 */
export async function getEmailWaitlistTotalAction(): Promise<EmailWaitlistCountResult> {
  try {
    const db = getSupabaseAdmin();
    const { count, error } = await db
      .from("email_waitlist")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("[email-waitlist.count]", error.message);
      return { ok: true, total: 0 };
    }

    return { ok: true, total: count ?? 0 };
  } catch (err) {
    console.error(
      "[email-waitlist.count.catch]",
      err instanceof Error ? err.message : err,
    );
    return { ok: true, total: 0 };
  }
}
