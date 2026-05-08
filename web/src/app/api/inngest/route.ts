/**
 * Inngest serve handler — registers the durable background jobs.
 *
 * The Inngest CLI / cloud calls this route to:
 *   1. Discover all registered functions (introspection on PUT).
 *   2. Invoke a function by id (POST with event + step state).
 *
 * In dev: `npx inngest-cli dev` opens a UI on :8288 and points at
 * http://localhost:3000/api/inngest. In prod: the Inngest cloud
 * registers the production URL and dispatches events.
 *
 * v16 web pivot Bucket 4 follow-up (P4 work).
 */
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { razorpayPaid } from "@/lib/inngest/jobs/razorpay-paid";
import { tsSla } from "@/lib/inngest/jobs/ts-sla";
import { pushFanout } from "@/lib/inngest/jobs/push-fanout";
import { welcomeEmail } from "@/lib/inngest/jobs/welcome-email";
import { staleSignup } from "@/lib/inngest/jobs/stale-signup";
import { chatScamDetect } from "@/lib/inngest/jobs/chat-scam-detect";
import { pushCleanup } from "@/lib/inngest/jobs/push-cleanup";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    razorpayPaid,
    tsSla,
    pushFanout,
    welcomeEmail,
    staleSignup,
    chatScamDetect,
    pushCleanup,
  ],
});

export const runtime = "nodejs";
