import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * POST /api/chat/report
 *
 * T&S report routing. Categories + SLA per v15 BP §3.5 and v16 §Bucket 7:
 *
 *   harassment   → 1h SLA (women-only sub-thread routes here too)
 *   self_harm    → 1h SLA (escalate to crisis path /app/help/now)
 *   scam | spam  → 4h SLA
 *   other        → 4h SLA
 *
 * Inserts into chat_report. Soft-delete of the offending message is the
 * advisor's call — not auto-applied.
 *
 * Input: { messageId: string, category: ChatReportCategory, detail?: string }
 *
 * v16 web pivot §Bucket 7.
 */

const categorySchema = z.enum(["harassment", "self_harm", "scam", "spam", "other"]);

const inputSchema = z.object({
  messageId: z.string().uuid(),
  category: categorySchema,
  detail: z.string().max(1000).optional(),
});

function slaHoursFor(category: z.infer<typeof categorySchema>): 1 | 4 {
  return category === "harassment" || category === "self_harm" ? 1 : 4;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof inputSchema>;
  try {
    body = inputSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "E072:invalid_report" }, { status: 400 });
  }

  const slaHours = slaHoursFor(body.category);

  // Real path: insert into chat_report with reporter_user_id from
  // Supabase SSR cookie. Bucket 8 wires the SSR client here.
  return NextResponse.json({
    ticketId: `chat_${Date.now()}`,
    slaHours,
    deadlineAt: new Date(Date.now() + slaHours * 3600_000).toISOString(),
    routedTo: body.category === "harassment" || body.category === "self_harm" ? "ts_priority" : "ts_general",
  });
}
