import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/y6/check-in
 *
 * Y6 arrival check-in. Two states:
 *   schedule  — student sets a future time (parent NOT notified)
 *   arrive    — student taps "I'm here" at the airport (parent gets ONE email)
 *
 * Per v16 §Bucket 8: ONE ping, ONE parent, no GPS, no ongoing tracking.
 * Real impl writes to `y6_arrival` and triggers the Resend "landed safe"
 * email on `arrive`. Bucket 8 wires the SSR helper here.
 *
 * Input (schedule): { atIso: string, airport?: string }
 * Input (arrive):   { kind: "arrive", arrivalId: string }
 *
 * v16 web pivot §Bucket 8.
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
      mock: true,
    });
  }

  // arrive
  return NextResponse.json({
    arrivalId: body.arrivalId,
    arrivedAt: new Date().toISOString(),
    parentNotifiedAt: new Date().toISOString(),
    status: "arrived",
    mock: true,
  });
}
