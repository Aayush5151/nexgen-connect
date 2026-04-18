import { NextRequest } from "next/server";
import { z } from "zod";
import { CITIES, INTAKES, UNIVERSITIES } from "@/lib/waitlist";
import {
  addEntry,
  getCohortCounts,
  getLastJoined,
  getTotalCount,
} from "@/lib/waitlist-store";

const UNIVERSITY_IDS = UNIVERSITIES.map((u) => u.id) as [string, ...string[]];

const PostSchema = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{8,18}$/, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  city: z.enum(CITIES),
  university: z.enum(UNIVERSITY_IDS),
  intake: z.enum(INTAKES),
});

export const dynamic = "force-dynamic";

export async function GET() {
  const [counts, last, total] = await Promise.all([
    getCohortCounts(),
    getLastJoined(),
    getTotalCount(),
  ]);
  return Response.json({
    counts,
    last_joined: last
      ? {
          name: last.name.split(" ")[0],
          city: last.city,
          university: last.university,
          created_at: last.created_at,
        }
      : null,
    total,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const entry = await addEntry({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email ?? null,
    city: parsed.data.city,
    university: parsed.data.university as (typeof UNIVERSITIES)[number]["id"],
    intake: parsed.data.intake,
  });

  return Response.json({ ok: true, id: entry.id });
}
