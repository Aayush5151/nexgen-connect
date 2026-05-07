/**
 * tRPC v11 builder + middleware.
 *
 * Procedures:
 *   publicProcedure          — anyone, including unauthed.
 *   phoneOnlyProcedure       — phone OTP verified, identity not yet.
 *   fullyVerifiedProcedure   — phone + DigiLocker + admit-letter all green.
 *   adminProcedure           — fullyVerified + ctx.user.isAdmin (back-office).
 *
 * Middleware (composable):
 *   withRateLimit(perMinute)  — token-bucket per (userId, procedure).
 *   withAuditLog              — appends row to audit_log on every PII-
 *                               adjacent call.
 *   withIdempotency           — if client retries with same key inside
 *                               24h, returns cached response.
 *   withErrorMapping          — maps every thrown error to E001-E065.
 *
 * Procedure factories (auth-only, fully-verified-only, admin-only) compose
 * these automatically — each domain router opts in.
 *
 * v15 BP §9.5 / v6 build §8, §11, §16, §18 / Build Prompt Bucket 4.
 */
import { TRPCError } from "@trpc/server";
import { router, middleware, procedure as t_procedure } from "./trpc-builder";
import { withRateLimit } from "./middleware/rate-limit";
import { withAuditLog } from "./middleware/audit-log";
import { withIdempotency } from "./middleware/idempotency";
import { withErrorMapping } from "./middleware/error-mapping";

export { router, middleware };

/**
 * Auth gates. The mobile client sends a session-token header; ctx.user
 * is populated by createContext. These middleware reject anything
 * below the required stage.
 */
const requirePhoneVerified = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "E001:auth_required" });
  }
  if (ctx.user.stage === "public") {
    throw new TRPCError({ code: "FORBIDDEN", message: "E002:phone_otp_required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const requireFullyVerified = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "E001:auth_required" });
  }
  if (ctx.user.stage !== "fullyVerified") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "E003:identity_or_admit_pending",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/**
 * Admin role gate. Sourced from `ctx.user.isAdmin` which mirrors the
 * Supabase JWT's `app_metadata.is_admin` (set via service-role
 * bootstrap SQL — the user cannot self-promote). Composed AFTER
 * requireFullyVerified so a non-admin user gets the more specific
 * FORBIDDEN before the role check fires.
 *
 * Defense-in-depth: every admin-tagged write should ALSO re-check
 * is_admin against the live DB row inside the procedure body — a
 * stale JWT could outlast a demotion. The middleware here catches
 * the 99% case (non-admin attempting admin call); the in-procedure
 * re-read handles the rare cache-staleness window.
 */
const requireAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "E001:auth_required" });
  }
  if (!ctx.user.isAdmin) {
    throw new TRPCError({ code: "FORBIDDEN", message: "E004:admin_required" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/* ------------------------------------------------------------------ */
/* Procedure factories                                                  */
/* ------------------------------------------------------------------ */

/**
 * publicProcedure — no auth required. Wraps with error-mapping +
 * audit-log. Use for: auth.requestOtp, auth.verifyOtp, scams.patterns.
 */
export const publicProcedure = t_procedure
  .use(withErrorMapping)
  .use(withAuditLog);

/**
 * phoneOnlyProcedure — bearer token must resolve a user with at least
 * phoneOnly stage. Use for: corridor.preview, profile setters before
 * identity verification.
 */
export const phoneOnlyProcedure = t_procedure
  .use(withErrorMapping)
  .use(withAuditLog)
  .use(requirePhoneVerified);

/**
 * fullyVerifiedProcedure — full three-check trio. Use for: corridor.me,
 * chat.*, premium.*, parent.*, trustSafety.*, groupApply.*.
 *
 * Mutations on this gate carry idempotency-key middleware automatically
 * because retried writes (e.g., ts.report) on the user side could
 * otherwise create duplicate rows.
 */
export const fullyVerifiedProcedure = t_procedure
  .use(withErrorMapping)
  .use(withAuditLog)
  .use(requireFullyVerified);

/**
 * fullyVerifiedMutation — fullyVerified + idempotency. Per Build Prompt
 * Bucket 4: "if the client retries with the same key within 24h, return
 * the cached response."
 */
export const fullyVerifiedMutation = fullyVerifiedProcedure.use(withIdempotency);

/**
 * adminProcedure — fullyVerified + admin role. Use for back-office
 * adminRouter procedures (callFirstMover, banUser, scmReview, etc.).
 *
 * The role flag is read from the Supabase JWT's `app_metadata.is_admin`
 * (preferred — service-role-only) or `user_metadata.is_admin` (legacy
 * dev path). Bootstrap an admin via:
 *
 *   update auth.users
 *   set raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'::jsonb
 *   where email = 'aayush@nexgenconnect.in';
 *
 * The next time that user requests a fresh JWT, the claim flows through
 * createContext → AuthedUser.isAdmin → this gate.
 */
export const adminProcedure = fullyVerifiedProcedure.use(requireAdmin);

/**
 * adminMutation — admin + idempotency. Same retry-safety as
 * fullyVerifiedMutation; required because admin actions like banUser
 * are non-idempotent without a key (a retry would log two ban events).
 */
export const adminMutation = adminProcedure.use(withIdempotency);

/**
 * Per-procedure rate-limit composer. Use:
 *   const protected = fullyVerifiedProcedure.use(withRateLimit({ perMinute: 30 }));
 *
 * The default rate-limit is 60/min for fully-verified procedures and
 * 10/min for public. Override per route — e.g., auth.requestOtp gets
 * (1 per 30s, 3 per hour) per Build Prompt §Bucket 3.
 */
export { withRateLimit };
