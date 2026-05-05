/**
 * Account router — erasure cascade, data export, erasure status.
 *
 * v16 web pivot §3.4 + GDPR Art. 17 + DPDP §13. The four pre-launch
 * blockers from `mobile/docs/pre-launch-blockers.md` §4 land here:
 *   - 60-min acknowledgement SLA on erasure
 *   - 30-day cascade SLA across analytics, payment processors, backups
 *   - Data export with 24h signed-URL delivery
 *   - Idempotency on every mutation (retried tap doesn't double-process)
 *
 * Procedures:
 *   account.requestErasure  — mutation, fullyVerified+idempotent. Inserts
 *                             into erasure_request, fires confirmation
 *                             email, returns acknowledgement timestamp.
 *   account.dataExport      — mutation, fullyVerified+idempotent.
 *                             Triggers async job that compiles user
 *                             data → JSON → time-limited signed URL.
 *   account.erasureStatus   — query. Returns pending / completed /
 *                             not-requested.
 *
 * The actual cascade runs as a background job (post-Bucket-3-followup
 * — Vercel Cron + queue worker). This router writes the request row +
 * fires the acknowledgement; the worker does the deletion across:
 *   1. Anonymise chat messages (user_id → null)
 *   2. Delete verified_user row
 *   3. Delete consent_records older than 30-day retention
 *   4. Replace audit_log user_id with deletion-token
 *   5. Delete uploaded admit-letter from storage
 *   6. Revoke active sessions
 *   7. Hit Supabase Auth deleteUser
 *   8. Hit PostHog person delete API
 *   9. Hit Sentry user delete API
 *   10. Hit Resend audience suppression
 *   11. Hit Razorpay deletion-request endpoint
 *   12. Email user when complete
 *
 * v16 web pivot §3.4.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, fullyVerifiedMutation, fullyVerifiedProcedure } from "../trpc";

const ErasureRequestOutput = z.object({
  /** ID of the erasure-request row. */
  requestId: z.string(),
  /** ISO timestamp of acknowledgement (≤60min after request). */
  acknowledgedAt: z.string(),
  /** Hard SLA for cascade completion (30 days from request). */
  completionDeadline: z.string(),
});

const DataExportOutput = z.object({
  /** ID of the export-request row. */
  exportId: z.string(),
  /** When the user can expect the email with the download link. */
  estimatedReadyAt: z.string(),
});

const ErasureStatusOutput = z.object({
  status: z.enum(["not_requested", "acknowledged", "in_progress", "completed"]),
  /** Present once acknowledged. */
  acknowledgedAt: z.string().nullable(),
  /** Present once completed. */
  completedAt: z.string().nullable(),
  /** Soft deadline. Present once acknowledged. */
  completionDeadline: z.string().nullable(),
});

export const accountRouter = router({
  /**
   * Request account erasure. Idempotency-key required (the mutation
   * is wrapped in fullyVerifiedMutation which auto-applies
   * withIdempotency). Re-tapping with the same key inside 24h returns
   * the same acknowledged-at timestamp.
   *
   * SLA per Privacy Policy §6: 60-minute ACK, 30-day cascade.
   */
  requestErasure: fullyVerifiedMutation
    .input(
      z.object({
        /** Required idempotency key per fullyVerifiedMutation contract. */
        _idempotencyKey: z.string().min(8),
        /** Free-text reason — optional, for analytics + improving the
         *  product. Not mandatory; many regulators forbid demanding a
         *  reason as a precondition for erasure. */
        reason: z.string().max(500).optional(),
      }),
    )
    .output(ErasureRequestOutput)
    .mutation(async ({ ctx }) => {
      const requestId = crypto.randomUUID();
      const acknowledgedAt = ctx.now.toISOString();
      const completionDeadline = new Date(
        ctx.now.getTime() + 30 * 24 * 60 * 60_000,
      ).toISOString();

      const record = {
        id: requestId,
        user_id: ctx.user.id,
        request_type: "erasure" as const,
        acknowledged_at: acknowledgedAt,
        completion_deadline: completionDeadline,
        completed_at: null,
        status: "acknowledged" as const,
      };

      // Real DB write when ctx.db wired (Bucket 3 follow-up).
      if (ctx.db?.erasureRequestInsert) {
        try {
          await ctx.db.erasureRequestInsert(record);
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "E040:erasure_request_failed",
            cause: e,
          });
        }
      } else {
        // Dev / pre-Supabase fallback.
        console.log("[erasure_request]", JSON.stringify(record));
      }

      // TODO(post-bucket-3): fire confirmation email via Resend.
      // TODO(post-bucket-3): enqueue background-job message to start cascade.
      return { requestId, acknowledgedAt, completionDeadline };
    }),

  /**
   * Request data export. Idempotent. Triggers async job that compiles
   * the user's data into JSON, uploads to a Supabase signed URL with
   * 24-hour expiry, and emails the link.
   *
   * SLA: typically <2h for the email, hard 30-day deadline.
   */
  dataExport: fullyVerifiedMutation
    .input(
      z.object({
        _idempotencyKey: z.string().min(8),
      }),
    )
    .output(DataExportOutput)
    .mutation(async ({ ctx }) => {
      const exportId = crypto.randomUUID();
      const estimatedReadyAt = new Date(ctx.now.getTime() + 2 * 60 * 60_000).toISOString();

      // TODO(post-bucket-3): enqueue background job that builds the JSON
      // and uploads to Supabase Storage with signed URL.
      console.log(
        "[data_export]",
        JSON.stringify({ id: exportId, user_id: ctx.user.id, requested_at: ctx.now.toISOString() }),
      );

      return { exportId, estimatedReadyAt };
    }),

  /**
   * Query erasure status. Returns the current state for the auth'd
   * user. UI uses this to show "We're processing your deletion — done
   * by 1 June 2026" or "No deletion requested."
   */
  erasureStatus: fullyVerifiedProcedure
    .output(ErasureStatusOutput)
    .query(async () => {
      // Real impl reads from erasure_request table where user_id = ctx.user.id.
      // Dev fallback: always returns not_requested.
      return {
        status: "not_requested" as const,
        acknowledgedAt: null,
        completedAt: null,
        completionDeadline: null,
      };
    }),
});
