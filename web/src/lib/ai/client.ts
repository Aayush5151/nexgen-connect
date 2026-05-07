import "server-only";

import { gateway } from "@ai-sdk/gateway";

/**
 * Shared AI client.
 *
 * All NexGen Connect AI features route through Vercel AI Gateway:
 *   - automatic provider fallback if the primary returns 5xx
 *   - zero data retention contractually upheld by the gateway
 *   - usage shows up in Vercel dashboard, not 4 different vendor consoles
 *
 * Auth: the gateway client auto-discovers credentials from the runtime
 * env. On Vercel deployments the OIDC token is auto-injected and
 * rotates frequently — no manual ops, preferred path. Local dev
 * picks up a short-lived OIDC token via `vercel env pull` so you
 * never hand-rotate a long-lived key. A static API key remains as a
 * fallback for non-Vercel runtimes (CI, alternate hosts) and is
 * documented in `web/.env.example`; the SDK reads whichever is
 * present.
 *
 * Model-id format: gateway slugs use dots for version numbers
 * (`anthropic/claude-haiku-4.5`), distinct from Anthropic's direct
 * API ids (`claude-haiku-4-5-20251001`). The gateway routes the slug
 * to whichever provider snapshot is current.
 *
 * Default model is Claude Haiku 4.5 — fast + cheap + vision-capable, which
 * covers all four current callers (admit-letter parse, scam classify,
 * name match, founder triage). Swap to Sonnet 4.6 only when a specific
 * call site needs deeper reasoning (we don't, today).
 *
 * v16 web pivot Bucket 4 follow-up.
 */

const DEFAULT_MODEL = "anthropic/claude-haiku-4.5";

export type ModelId =
  | "anthropic/claude-haiku-4.5"
  | "anthropic/claude-sonnet-4.6"
  | "anthropic/claude-opus-4.7";

/**
 * Resolve a model handle for the AI SDK. Pass a specific id to opt up;
 * otherwise the cheap-fast default is used.
 *
 * Returns the gateway-bound model. The AI SDK's generateObject /
 * generateText / streamText all accept this directly.
 */
export function aiModel(id: ModelId = DEFAULT_MODEL) {
  return gateway(id);
}

/**
 * Per-feature flags so each AI lane can be flipped independently. The
 * default is OFF in every environment until the operator has reviewed
 * real output and is happy turning it on.
 */
export const aiFlags = {
  admitParse: process.env.AI_ADMIT_PARSE_ENABLED === "true",
  scamDetect: process.env.AI_SCAM_DETECT_ENABLED === "true",
  nameMatch: process.env.AI_NAME_MATCH_ENABLED === "true",
  triage: process.env.AI_TRIAGE_ENABLED === "true",
} as const;

/**
 * Master kill switch. Returns true when an OIDC token is present —
 * the canonical credential path on Vercel deployments and on local dev
 * after `vercel env pull`. Each call site short-circuits with a no-op
 * when this is false, so dev / preview without env wired never hits
 * the network.
 *
 * Non-Vercel runtimes (CI, alternate hosts) can rely on the gateway
 * SDK's own credential discovery and skip this probe — wrap the call
 * in try/catch to absorb the auth error in that case.
 */
export function aiAvailable(): boolean {
  return !!process.env.VERCEL_OIDC_TOKEN;
}
