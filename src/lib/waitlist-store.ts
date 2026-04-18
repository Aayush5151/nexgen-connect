import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { WaitlistEntry, CohortCount } from "./waitlist";

// Stub storage. Swap to Supabase before public launch.
// Vercel's serverless filesystem is read-only for repo paths, so we
// prefer /tmp in production (ephemeral — resets when the container recycles).
const LOCAL_FILE = path.join(process.cwd(), "data", "waitlist.json");
const TMP_FILE = "/tmp/nexgen-waitlist.json";
const DATA_FILE = process.env.VERCEL ? TMP_FILE : LOCAL_FILE;

async function readAll(): Promise<WaitlistEntry[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { entries: WaitlistEntry[] };
    return parsed.entries ?? [];
  } catch {
    return [];
  }
}

async function writeAll(entries: WaitlistEntry[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ entries }, null, 2));
  } catch {
    // Swallow — local JSON stub. Real backend ships with Supabase.
  }
}

export async function addEntry(
  input: Omit<WaitlistEntry, "id" | "created_at" | "verified_phone">,
): Promise<WaitlistEntry> {
  const entries = await readAll();
  const entry: WaitlistEntry = {
    ...input,
    id: `w_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    verified_phone: false,
  };
  entries.push(entry);
  await writeAll(entries);
  return entry;
}

export async function getCohortCounts(): Promise<CohortCount[]> {
  const entries = await readAll();
  const grouped = new Map<string, CohortCount>();
  for (const e of entries) {
    const key = `${e.city}|${e.university}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      grouped.set(key, { city: e.city, university: e.university, count: 1 });
    }
  }
  return Array.from(grouped.values());
}

export async function getLastJoined(): Promise<WaitlistEntry | null> {
  const entries = await readAll();
  if (entries.length === 0) return null;
  return entries[entries.length - 1];
}

export async function getTotalCount(): Promise<number> {
  const entries = await readAll();
  return entries.length;
}
