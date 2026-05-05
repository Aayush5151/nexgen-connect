/**
 * Drizzle schema — hand-curated from the SQL migrations in
 * `packages/server/migrations/0001..0008.sql` until staging cut-over.
 *
 * Why hand-curated: per D1 of `docs/v16-web-pivot-decisions.md`, the
 * SQL migrations are documentary contracts that apply to a fresh
 * Supabase project at the staging cut-over moment. Until that moment,
 * the live Mumbai project is empty. `drizzle-kit pull` against an
 * empty schema returns nothing useful, so we maintain this file by
 * hand and treat it as canonical.
 *
 * The agreement with the SQL migrations:
 *   - This file MIRRORS migrations 0001–0008 exactly. Every column
 *     name, type, default, and constraint matches the SQL.
 *   - When a migration changes, BOTH the SQL file AND this file
 *     update in the same commit. Drift between the two is a
 *     PR-blocker (verified by the consistency check at the bottom
 *     of this file's tests).
 *   - At staging cut-over, run `drizzle-kit pull` to overwrite this
 *     file. The pull output replaces the hand-curated version. Any
 *     drift between this file and the pull result is documented as
 *     a fix-up commit on the cut-over PR.
 *
 * Naming:
 *   - Postgres uses snake_case → camelCase here for the TS API.
 *   - Plural / singular follows the SQL.
 *   - `auth.uid()` references stay in raw SQL (RLS policies are
 *     defined in the migrations, not regenerated here — Drizzle
 *     doesn't re-emit RLS policies from `drizzle-kit pull`).
 *
 * v16 web pivot §P1.a.
 */
import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// 0001_v5_baseline.sql
// ---------------------------------------------------------------------------

export const identityHash = pgTable("identity_hash", {
  hash: text("hash").primaryKey(),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  banned: boolean("banned").notNull().default(false),
  bannedAt: timestamp("banned_at", { withTimezone: true }),
  bannedReason: text("banned_reason"),
});

export const verifiedUser = pgTable("verified_user", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  identityHash: text("identity_hash")
    .notNull()
    .references(() => identityHash.hash),
  phoneHash: text("phone_hash").notNull(),
  // 0001 column constraints — Drizzle emits these as CHECKs in
  // generated migrations, but here we model them as text + comments
  // because the actual constraint lives in the migration SQL.
  phoneStatus: text("phone_status").notNull(), // check: 'unverified' | 'verified'
  phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
  identityStatus: text("identity_status").notNull(), // check: 'unstarted' | 'in_progress' | 'verified' | 'failed'
  identityVerifiedAt: timestamp("identity_verified_at", { withTimezone: true }),
  admitStatus: text("admit_status").notNull(), // check: 'not_uploaded' | 'pending' | 'approved' | 'rejected'
  admitUploadedAt: timestamp("admit_uploaded_at", { withTimezone: true }),
  admitDecidedAt: timestamp("admit_decided_at", { withTimezone: true }),
  admitLetterHash: text("admit_letter_hash"),
  premiumUnlockId: uuid("premium_unlock_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // 0002 deltas — appended via `alter table` in migration but modelled
  // here as part of the table for Drizzle introspection.
  scariestThingSeptember: text("scariest_thing_september"),
  isRecoveringStudent: boolean("is_recovering_student").default(false),
  womenOnlySubThreadOptIn: boolean("women_only_sub_thread_opt_in").default(true),
  corridorLayer2Id: uuid("corridor_layer_2_id").references((): never => corridor.id as never),
  corridorLayer1Id: uuid("corridor_layer_1_id").references((): never => corridor.id as never),
  emergencyPhoneConsentFirstWeek: boolean("emergency_phone_consent_first_week").default(false),
  arrivalDate: timestamp("arrival_date", { withTimezone: true }),
});

export const corridor = pgTable(
  "corridor",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    homeCity: text("home_city").notNull(),
    destinationUni: text("destination_uni").notNull(),
    destinationCity: text("destination_city").notNull(),
    destinationCountry: text("destination_country").notNull(), // check: 'Ireland' | 'Germany'
    intakeMonth: text("intake_month").notNull(),
    status: text("status").notNull().default("forming"), // check: 'forming' | 'unlocked' | 'frozen'
    unlockThreshold: integer("unlock_threshold").notNull().default(60),
    memberCount: integer("member_count").notNull().default(0),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    // 0002 deltas
    corridorLayer: smallint("corridor_layer").notNull().default(2), // check: between 1 and 3
    parentCorridorId: uuid("parent_corridor_id"),
    memberCountL1: integer("member_count_l1").notNull().default(0),
    memberCountL2: integer("member_count_l2").notNull().default(0),
    womenOnlySubThreadActive: boolean("women_only_sub_thread_active").default(false),
  },
  (t) => ({
    corridorLayerStatusIdx: index("corridor_corridor_layer_status_idx").on(t.corridorLayer, t.status),
    parentCorridorIdIdx: index("corridor_parent_corridor_id_idx").on(t.parentCorridorId).where(sql`parent_corridor_id is not null`),
  }),
);

export const corridorMember = pgTable(
  "corridor_member",
  {
    corridorId: uuid("corridor_id")
      .notNull()
      .references(() => corridor.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => verifiedUser.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.corridorId, t.userId] }),
  }),
);

export const groupMessage = pgTable(
  "group_message",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    channelId: text("channel_id").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => verifiedUser.id),
    body: text("body").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    seqId: bigserial("seq_id", { mode: "bigint" }).notNull(),
    isSystemPrompt: boolean("is_system_prompt").notNull().default(false),
  },
  (t) => ({
    channelSeqIdx: index("group_message_channel_seq_idx").on(t.channelId, t.seqId),
  }),
);

export const premiumUnlock = pgTable("premium_unlock", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => verifiedUser.id),
  amountInr: integer("amount_inr").notNull().default(99900), // ₹999 in paise
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
  receiptId: text("receipt_id").notNull(),
});

export const tsIncident = pgTable("ts_incident", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => verifiedUser.id),
  category: text("category").notNull(), // check: 'harassment' | 'scam' | 'hard_time' | 'other'
  reason: text("reason").notNull(),
  context: jsonb("context"),
  status: text("status").notNull().default("open"), // check: 'open' | 'assigned' | 'resolved' | 'dismissed'
  assignedAdvisorId: uuid("assigned_advisor_id"),
  firstResponseBy: timestamp("first_response_by", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id"),
    procedure: text("procedure").notNull(),
    reqId: uuid("req_id").notNull(),
    type: text("type").notNull(), // check: 'query' | 'mutation' | 'subscription'
    success: boolean("success").notNull(),
    elapsedMs: integer("elapsed_ms").notNull(),
    inputHash: text("input_hash"),
    errorCode: text("error_code"),
    ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
    // 0006 v16 columns
    ipHash: text("ip_hash"),
    inputSummary: jsonb("input_summary"),
    outputStatus: text("output_status"),
    requestId: text("request_id"),
  },
  (t) => ({
    userTsIdx: index("audit_log_user_ts_idx").on(t.userId, t.ts),
    procedureTsIdx: index("audit_log_procedure_ts_idx").on(t.procedure, t.ts),
    ipHashTsIdx: index("audit_log_ip_hash_ts_idx").on(t.ipHash, t.ts).where(sql`ip_hash is not null`),
  }),
);

export const scmIncident = pgTable("scm_incident", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => verifiedUser.id),
  patternId: text("pattern_id").notNull(),
  details: text("details"),
  amountInr: integer("amount_inr"),
  reportedAt: timestamp("reported_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("open"),
});

export const digilockerFallback = pgTable("digilocker_fallback", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => verifiedUser.id),
  reason: text("reason").notNull(), // check: 'aadhaar_not_linked' | 'mobile_changed' | 'deactivated' | 'invisible_character'
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 0003_v6_first_mover_outreach.sql
// ---------------------------------------------------------------------------

export const firstMoverOutreach = pgTable(
  "first_mover_outreach",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => verifiedUser.id),
    corridorId: uuid("corridor_id")
      .notNull()
      .references(() => corridor.id),
    trigger: text("trigger").notNull(), // check: 'first_woman_in_women_only' | 'first_user_tier3_home_city'
    status: text("status").notNull().default("queued"), // check: see migration
    assignedAdvisorId: uuid("assigned_advisor_id"),
    targetSlaAt: timestamp("target_sla_at", { withTimezone: true }).notNull(),
    callStartedAt: timestamp("call_started_at", { withTimezone: true }),
    callEndedAt: timestamp("call_ended_at", { withTimezone: true }),
    callDurationS: integer("call_duration_s"),
    outcomeNotes: text("outcome_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusSlaIdx: index("first_mover_outreach_status_sla_idx")
      .on(t.status, t.targetSlaAt)
      .where(sql`status in ('queued', 'in_progress')`),
  }),
);

// ---------------------------------------------------------------------------
// 0004_v6_arrival_checkin_and_optout.sql
// ---------------------------------------------------------------------------

export const arrivalCheckin = pgTable(
  "arrival_checkin",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => verifiedUser.id),
    dayPostArrival: smallint("day_post_arrival").notNull(), // check: between 0 and 7
    status: text("status").notNull(), // check: see migration
    userNote: text("user_note"),
    advisorResponse: text("advisor_response"),
    advisorId: uuid("advisor_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
  },
  (t) => ({
    userDayIdx: index("arrival_checkin_user_day_idx").on(t.userId, t.dayPostArrival),
  }),
);

export const womenOnlySubThreadOptout = pgTable(
  "women_only_sub_thread_optout",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => verifiedUser.id, { onDelete: "cascade" }),
    corridorId: uuid("corridor_id")
      .notNull()
      .references(() => corridor.id, { onDelete: "cascade" }),
    optedOutAt: timestamp("opted_out_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.corridorId] }),
  }),
);

// ---------------------------------------------------------------------------
// 0005_consent_records.sql
// ---------------------------------------------------------------------------

export const consentTypeEnum = pgEnum("consent_type", [
  "signup_otp",
  "digilocker_handshake",
  "admit_upload",
  "premium_purchase",
  "parent_view_share",
  "data_export_request",
  "account_erasure",
]);

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").references(() => verifiedUser.id, { onDelete: "set null" }),
    consentType: consentTypeEnum("consent_type").notNull(),
    policyVersion: text("policy_version").notNull(),
    ipHash: text("ip_hash").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    userIdRecordedAtIdx: index("consent_records_user_id_recorded_at")
      .on(t.userId, t.recordedAt)
      .where(sql`user_id is not null`),
    consentTypeRecordedAtIdx: index("consent_records_consent_type_recorded_at").on(
      t.consentType,
      t.recordedAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// 0007_erasure_request.sql
// ---------------------------------------------------------------------------

export const requestTypeEnum = pgEnum("request_type", ["erasure", "data_export"]);

export const erasureStatusEnum = pgEnum("erasure_status", [
  "acknowledged",
  "in_progress",
  "completed",
  "failed",
]);

export const erasureRequest = pgTable(
  "erasure_request",
  {
    id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid("user_id").references(() => verifiedUser.id, { onDelete: "set null" }),
    requestType: requestTypeEnum("request_type").notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true }).notNull().defaultNow(),
    completionDeadline: timestamp("completion_deadline", { withTimezone: true })
      .notNull()
      .default(sql`(now() + interval '30 days')`),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    status: erasureStatusEnum("status").notNull().default("acknowledged"),
    reason: text("reason"),
    exportSignedUrl: text("export_signed_url"),
    exportExpiresAt: timestamp("export_expires_at", { withTimezone: true }),
  },
  (t) => ({
    statusDeadlineIdx: index("erasure_request_status_deadline")
      .on(t.status, t.completionDeadline)
      .where(sql`status in ('acknowledged', 'in_progress')`),
    userAckIdx: index("erasure_request_user_id_acknowledged_at")
      .on(t.userId, t.acknowledgedAt)
      .where(sql`user_id is not null`),
  }),
);

// ---------------------------------------------------------------------------
// 0008_banned_identity_hash.sql
// ---------------------------------------------------------------------------

export const bannedIdentityHash = pgTable(
  "banned_identity_hash",
  {
    hash: text("hash").primaryKey(),
    reason: text("reason").notNull(),
    bannedBy: text("banned_by").notNull(),
    bannedAt: timestamp("banned_at", { withTimezone: true }).notNull().defaultNow(),
    unbannedAt: timestamp("unbanned_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    bannedByAtIdx: index("banned_identity_hash_banned_by_at").on(t.bannedBy, t.bannedAt),
    hashFormatCheck: check("banned_identity_hash_hash_format", sql`hash ~ '^[0-9a-f]{64}$'`),
  }),
);

// ---------------------------------------------------------------------------
// Schema agreement check (run in tests)
// ---------------------------------------------------------------------------

/**
 * Tables in this schema, by name, in source-of-truth migration order.
 * Used by `__tests__/schema-agreement.test.ts` to verify drift between
 * this file and the SQL migrations is caught at PR-time.
 */
export const TABLES_IN_ORDER = [
  // 0001
  "identity_hash",
  "verified_user",
  "corridor",
  "corridor_member",
  "group_message",
  "premium_unlock",
  "ts_incident",
  "audit_log",
  "scm_incident",
  "digilocker_fallback",
  // 0003
  "first_mover_outreach",
  // 0004
  "arrival_checkin",
  "women_only_sub_thread_optout",
  // 0005
  "consent_records",
  // 0007
  "erasure_request",
  // 0008
  "banned_identity_hash",
] as const;
