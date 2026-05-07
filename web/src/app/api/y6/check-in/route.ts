import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAuthedUser } from "@/lib/api-auth";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/y6/check-in
 *
 * Y6 arrival check-in. Two states:
 *   schedule  — student sets a future time (parent NOT notified)
 *   arrive    — student taps "I'm here" at the airport (parent gets ONE email)
 *
 * Auth: required. The arrival row is keyed on the authenticated user;
 * without the gate, anyone could POST a fake arrival and trigger a
 * Resend send to the user's parent.
 *
 * Per v16 §Bucket 8: ONE ping, ONE parent, no GPS, no ongoing tracking.
 * Real impl writes to `y6_arrival` and triggers the Resend "landed safe"
 * email on `arrive`. Bucket 8 wires the SSR helper here.
 *
 * Input (schedule): { atIso: string, airport?: string }
 * Input (arrive):   { kind: "arrive", arrivalId: string }
 *
 * v16 web pivot §Bucket 8 (auth wired).
 */

const inputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("schedule"),
    atIso: z.string(),
    airport: z.string().max(8).optional(),
  }),
  z.object({
    kind: z.literal("arrive"),
    arrivalId: z.string().uuid(),
  }),
]);

export async function POST(req: NextRequest) {
  const auth = await requireAuthedUser();
  if (!auth.user) return auth.response;

  // Schedule edits + the one-time arrival ping. 5/min is generous for
  // legitimate UI interactions and tight against scripted abuse that
  // would re-fire the parent notification.
  const rl = await enforceRateLimit({
    route: "y6-check-in",
    userId: auth.user.id,
    ip: clientIp(req),
    limit: 5,
    windowSec: 60,
  });
  if (!rl.ok) return rl.response;

  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E083:invalid_arrival" }, { status: 400 });
  }

  if (body.kind === "schedule") {
    if (Number.isNaN(new Date(body.atIso).getTime())) {
      return NextResponse.json({ error: "E083:invalid_arrival_time" }, { status: 400 });
    }
    return NextResponse.json({
      arrivalId: crypto.randomUUID(),
      scheduledAt: body.atIso,
      airport: body.airport ?? null,
      status: "scheduled",
      parentNotifiedAt: null,
      userId: auth.user.id,
      mock: true,
    });
  }

  // arrive
  return NextResponse.json({
    arrivalId: body.arrivalId,
    arrivedAt: new Date().toISOString(),
    parentNotifiedAt: new Date().toISOString(),
    status: "arrived",
    userId: auth.user.id,
    mock: true,
  });
}
