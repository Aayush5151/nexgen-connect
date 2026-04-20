"use server";

import { z } from "zod";
import { validateEmail } from "@/lib/validation/email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Feedback server action.
 *
 * Submits questions, feedback, and bug reports from the footer FAQ
 * form into the `feedback` table (see 0007_feedback.sql). Name and
 * email are optional so anonymous questions still land; message is
 * required. If the user supplies an email it must validate.
 *
 * Result shape mirrors the email waitlist action:
 *   { ok: true }                    - stored
 *   { ok: false, error: string }    - validation or infra failure
 */

const TOPICS = ["general", "verification", "pricing", "bug", "other"] as const;
export type FeedbackTopic = (typeof TOPICS)[number];

const feedbackSchema = z.object({
  name: z.string().trim().max(80).optional().or(z.literal("")),
  email: z.string().trim().max(254).optional().or(z.literal("")),
  topic: z.enum(TOPICS).optional(),
  message: z
    .string()
    .trim()
    .min(8, "Tell us a bit more - at least 8 characters.")
    .max(2000, "Please keep messages under 2000 characters."),
  referrer: z.string().trim().max(40).optional(),
});

export type FeedbackField = "name" | "email" | "topic" | "message";

export type FeedbackResult =
  | { ok: true }
  | { ok: false; error: string; field?: FeedbackField };

const VALID_FIELDS: readonly FeedbackField[] = [
  "name",
  "email",
  "topic",
  "message",
];

export async function submitFeedbackAction(input: {
  name?: string;
  email?: string;
  topic?: FeedbackTopic;
  message: string;
  referrer?: string;
}): Promise<FeedbackResult> {
  const parsed = feedbackSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const rawField = issue?.path?.[0];
    const field =
      typeof rawField === "string" &&
      (VALID_FIELDS as readonly string[]).includes(rawField)
        ? (rawField as FeedbackField)
        : undefined;
    return {
      ok: false,
      error: issue?.message ?? "Please check the form and try again.",
      ...(field ? { field } : {}),
    };
  }

  const { name, email, topic, message, referrer } = parsed.data;

  // If the user typed an email, run it through the shared validator so
  // the message + code match what the waitlist uses.
  let cleanEmail: string | null = null;
  if (email && email.length > 0) {
    const result = validateEmail(email);
    if (!result.ok) {
      return { ok: false, error: result.error, field: "email" };
    }
    cleanEmail = result.email;
  }

  try {
    const db = getSupabaseAdmin();
    const { error } = await db.from("feedback").insert({
      name: name && name.length > 0 ? name : null,
      email: cleanEmail,
      topic: topic ?? null,
      message,
      referrer: referrer ?? null,
    });
    if (error) {
      console.error("[feedback]", error.message);
      return { ok: false, error: "Couldn't save your message. Try again." };
    }
    return { ok: true };
  } catch (err) {
    console.error(
      "[feedback.catch]",
      err instanceof Error ? err.message : err,
    );
    return { ok: false, error: "Something went wrong. Try again." };
  }
}
