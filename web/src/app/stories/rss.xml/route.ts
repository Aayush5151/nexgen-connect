/**
 * /stories/rss.xml — RSS feed for the editorial property.
 *
 * Signals that the publishing house is real, not aspirational. RSS
 * is the discreet "this is a real journal" affordance — Stripe Press,
 * Substack, Patagonia's Journal all expose one. Even with one piece
 * in the feed, the feed existing tells aggregators, journalists, and
 * old-school readers that NexGen is publishing.
 *
 * The feed is built from the same LIVE_PIECES source-of-truth that
 * /stories renders, so adding a new piece in one place updates both
 * surfaces.
 *
 * v18 category-presence pass · Mechanism 7 (narrative compounding).
 */

import { NextResponse } from "next/server";

// Single source of truth for live editorial pieces. When a new piece
// ships, add it here AND link it from /stories.
const LIVE_PIECES = [
  {
    slug: "founding",
    title: "Why we built the corridor.",
    description:
      "Letter No. 01 — a personal note from Aayush on the founding day. Why the verification stack matters, what we will never do, who is in the founding class.",
    publishedIso: "2026-05-12T08:00:00+05:30",
    author: "Aayush Shah",
    kind: "Founder letter",
  },
] as const;

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexgenconnect.in";

  const items = LIVE_PIECES.map((p) => {
    const url = `${base}/stories/${p.slug}`;
    return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedIso).toUTCString()}</pubDate>
      <author>hello@nexgenconnect.com (${escapeXml(p.author)})</author>
      <category>${escapeXml(p.kind)}</category>
      <description>${escapeXml(p.description)}</description>
    </item>`;
  }).join("\n");

  const lastBuilt =
    LIVE_PIECES.length > 0
      ? new Date(LIVE_PIECES[0]!.publishedIso).toUTCString()
      : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>NexGen Connect · Stories</title>
    <link>${base}/stories</link>
    <atom:link href="${base}/stories/rss.xml" rel="self" type="application/rss+xml" />
    <description>Long-form essays from the NexGen verified arrival corridor. Founder letters, corridor stories, and the annual Migration Report.</description>
    <language>en</language>
    <copyright>© ${new Date().getFullYear()} NexGen Connect</copyright>
    <lastBuildDate>${lastBuilt}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Cache for an hour — these pieces aren't going to change
      // frequently; aggregators can revalidate hourly.
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
