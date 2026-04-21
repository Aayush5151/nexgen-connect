import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

/**
 * UniversityLanding. A shared shell for /trinity, /ucd, /ucc.
 *
 * Each page passes the university&rsquo;s own copy - stats, intake dates,
 * top home cities, quoted student - but the structure, layout, and
 * brand voice stay identical. This means when we expand to a fourth
 * corridor (Munich? Toronto?) we just drop in another config.
 *
 * Positioning: SEO + personalisation. A student searching &ldquo;Trinity
 * Indian students 2026&rdquo; lands on a page that speaks their exact
 * situation - not a generic homepage.
 */

export type UniversityConfig = {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  kicker: string;
  heroHeadline: string;
  heroAccent: string;
  subheadline: string;
  stats: Array<{ label: string; value: string }>;
  homeCities: string[];
  intake: string;
  coursesHighlight: string[];
  studentQuote: { body: string; name: string; course: string };
  whyThisCampus: string[];
};

export function UniversityLanding({ cfg }: { cfg: UniversityConfig }) {
  return (
    <>
      <Navbar />
      <main id="main" className="flex-1">
        {/* Hero */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="container-narrow">
            <div className="mx-auto max-w-[820px]">
              <SectionLabel>{cfg.kicker}</SectionLabel>
              <h1
                className="mt-6 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(36px, 7vw, 88px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.035em",
                }}
              >
                {cfg.heroHeadline}{" "}
                <span className="font-serif font-normal italic tracking-[-0.02em] text-[color:var(--color-primary)]">
                  {cfg.heroAccent}
                </span>
              </h1>
              <p className="mt-6 max-w-[600px] text-[17px] leading-[1.55] text-[color:var(--color-fg-muted)] sm:text-[18px]">
                {cfg.subheadline}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <AppStoreBadge size="md" />
                <PlayStoreBadge size="md" />
              </div>

              <p className="mt-6 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                <MapPin className="h-3.5 w-3.5 text-[color:var(--color-primary)]" strokeWidth={2} />
                {cfg.city} · {cfg.country} · {cfg.intake}
              </p>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-8 md:py-10">
          <div className="container-narrow">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {cfg.stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-fg-subtle)]">
                    {s.label}
                  </dt>
                  <dd className="mt-1 font-heading text-[24px] font-semibold tabular-nums text-[color:var(--color-primary)] sm:text-[28px]">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Who you might meet */}
        <section className="py-16 md:py-24">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <SectionLabel>Who you might meet</SectionLabel>
                <h2
                  className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(28px, 5vw, 52px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Top home cities{" "}
                  <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                    for {cfg.shortName}.
                  </span>
                </h2>
                <p className="mt-5 max-w-[420px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)]">
                  Ranked by the volume of Indian students who arrived at{" "}
                  {cfg.shortName} in the last three intakes. Your group
                  reflects this mix.
                </p>
              </div>

              <div className="md:col-span-7">
                <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-[color:var(--color-border)] bg-[color:var(--color-border)] sm:grid-cols-3">
                  {cfg.homeCities.map((city, i) => (
                    <li
                      key={city}
                      className="flex items-center justify-between gap-3 bg-[color:var(--color-surface)] px-4 py-3"
                    >
                      <span className="font-heading text-[15px] font-semibold text-[color:var(--color-fg)]">
                        {city}
                      </span>
                      <span className="font-mono text-[10px] text-[color:var(--color-fg-subtle)]">
                        #{i + 1}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-fg-subtle)]">
                  Source · NexGen verification data, rolling 18 months.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses highlight */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-24">
          <div className="container-narrow">
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <SectionLabel>Most matched</SectionLabel>
                <h2
                  className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                  style={{
                    fontSize: "clamp(28px, 5vw, 52px)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Courses Indian students{" "}
                  <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                    pick here.
                  </span>
                </h2>
              </div>
              <div className="md:col-span-7">
                <ul className="flex flex-wrap gap-2">
                  {cfg.coursesHighlight.map((c) => (
                    <li
                      key={c}
                      className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 font-mono text-[12px] text-[color:var(--color-fg)]"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-20 md:py-28">
          <div className="container-narrow">
            <div className="mx-auto max-w-[720px] text-center">
              <SectionLabel className="mx-auto">From {cfg.shortName}</SectionLabel>
              <blockquote
                className="mt-6 font-serif italic text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(22px, 4vw, 38px)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                &ldquo;{cfg.studentQuote.body}&rdquo;
              </blockquote>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.12em] text-[color:var(--color-fg-subtle)]">
                {cfg.studentQuote.name} · {cfg.studentQuote.course}
              </p>
            </div>
          </div>
        </section>

        {/* Why this campus */}
        <section className="border-t border-[color:var(--color-border)] py-16 md:py-24">
          <div className="container-narrow">
            <div className="mx-auto max-w-[760px]">
              <SectionLabel>Why {cfg.shortName}</SectionLabel>
              <h2
                className="mt-4 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                Three things your group already{" "}
                <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-fg-muted)]">
                  knows about {cfg.city}.
                </span>
              </h2>
              <ul className="mt-10 flex flex-col gap-3">
                {cfg.whyThisCampus.map((line, i) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)] font-mono text-[11px] font-semibold text-[color:var(--color-primary)]">
                      0{i + 1}
                    </span>
                    <p className="text-[15px] leading-[1.55] text-[color:var(--color-fg)]">
                      {line}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-[color:var(--color-border)] py-20 md:py-28">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(45% 40% at 50% 30%, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 70%)",
            }}
          />
          <div className="container-narrow relative">
            <div className="mx-auto max-w-[640px] text-center">
              <SectionLabel className="mx-auto">
                Save your seat · {cfg.intake}
              </SectionLabel>
              <h2
                className="mt-5 font-heading font-semibold text-balance text-[color:var(--color-fg)]"
                style={{
                  fontSize: "clamp(32px, 6vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.03em",
                }}
              >
                Your {cfg.shortName} group{" "}
                <span className="font-serif font-normal italic tracking-[-0.015em] text-[color:var(--color-primary)]">
                  is forming now.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-[520px] text-[15px] leading-[1.6] text-[color:var(--color-fg-muted)] sm:text-[16px]">
                Drop your email - we ping you the moment the app opens for{" "}
                {cfg.shortName}, with priority access for the first 100 from
                each campus.
              </p>
              <div className="mx-auto mt-8 max-w-[420px]">
                <EmailWaitlistForm referrer={`uni-${cfg.slug}`} />
              </div>
              <Link
                href="/"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-fg-muted)] transition-colors hover:text-[color:var(--color-primary)]"
              >
                <Users className="h-3.5 w-3.5" strokeWidth={2} />
                Not {cfg.shortName}? See all campuses
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Campus configs. Keep the voice consistent - each uses the same     */
/* shape, so a future copywriter can edit without touching JSX.       */
/* ------------------------------------------------------------------ */

export const TRINITY_CONFIG: UniversityConfig = {
  slug: "trinity",
  name: "Trinity College Dublin",
  shortName: "Trinity",
  city: "Dublin",
  country: "Ireland",
  kicker: "Trinity College Dublin · September 2026",
  heroHeadline: "Your Trinity group,",
  heroAccent: "forming in Dublin.",
  subheadline:
    "Every year, hundreds of Indian students walk onto Front Square not knowing a single person in their class. A NexGen group is ten verified classmates - all from India, all flying the same month - ready before the first lecture.",
  stats: [
    { label: "Indian students / year", value: "~1,000" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Avg group size", value: "10" },
    { label: "Spots per intake", value: "100" },
  ],
  homeCities: [
    "Delhi",
    "Bangalore",
    "Mumbai",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Kolkata",
    "Chandigarh",
    "Ahmedabad",
  ],
  intake: "September 2026",
  coursesHighlight: [
    "Computer Science",
    "MSc Data Science",
    "MSc FinTech",
    "MSc International Management",
    "BA Business & Economics",
    "MSc Computer Engineering",
    "MSc Cyber Security",
  ],
  studentQuote: {
    body:
      "The Arts Block feels huge until you walk in with four people you already know. NexGen was the difference between standing alone at orientation and having lunch plans by 11 am.",
    name: "Aanya R.",
    course: "MSc FinTech · Class of 2025",
  },
  whyThisCampus: [
    "The LUAS is your life - the Green Line gets you from Sandyford to Trinity in 25 minutes, the Red Line takes you to Smithfield for cheaper rent.",
    "Avoid the on-campus canteen at 1 pm; the Pav or the Brogue on Dawson Street are better calls. Trinity Ball tickets sell in 40 minutes - set a calendar alarm.",
    "Dublin rent is brutal. A NexGen group doubles as a housing syndicate - five verified friends signing one lease beats scrolling Daft alone.",
  ],
};

export const UCD_CONFIG: UniversityConfig = {
  slug: "ucd",
  name: "University College Dublin",
  shortName: "UCD",
  city: "Dublin",
  country: "Ireland",
  kicker: "University College Dublin · September 2026",
  heroHeadline: "Your UCD group,",
  heroAccent: "ready for Belfield.",
  subheadline:
    "UCD is Ireland&rsquo;s largest campus and its deepest Indian-student pipeline. A NexGen group is ten verified Belfield freshers - from your home city, your intake, your year - waiting on day one of orientation.",
  stats: [
    { label: "Indian students / year", value: "~1,800" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Avg group size", value: "10" },
    { label: "Spots per intake", value: "100" },
  ],
  homeCities: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Pune",
    "Hyderabad",
    "Kolkata",
    "Chennai",
    "Jaipur",
    "Kochi",
  ],
  intake: "September 2026",
  coursesHighlight: [
    "MSc Data Analytics",
    "MSc Business Analytics",
    "MBA",
    "MSc Computer Science",
    "MSc Finance",
    "MEng Electronic Engineering",
    "BSc Economics",
  ],
  studentQuote: {
    body:
      "Belfield is its own town. Walking into Daonnacht week with three people who already had my number made the first month feel like the fourth. That is genuinely all I asked for.",
    name: "Harsh V.",
    course: "MSc Data Analytics · Class of 2025",
  },
  whyThisCampus: [
    "Belfield is 45 minutes from the city centre by 39a - time it. The internal Belfield loop bus gets you from res halls to lectures without the weather winning.",
    "UCD Global hosts a First Week Ireland programme - RSVP the moment it opens. Your NexGen group should go together so you are not the only one sitting alone.",
    "Ranelagh and Rathmines are student-dense; Dundrum and Clonskeagh are quieter. Decide as a group before you sign a lease - the tube of 3 argument for housing wins every time.",
  ],
};

export const UCC_CONFIG: UniversityConfig = {
  slug: "ucc",
  name: "University College Cork",
  shortName: "UCC",
  city: "Cork",
  country: "Ireland",
  kicker: "University College Cork · September 2026",
  heroHeadline: "Your UCC group,",
  heroAccent: "finding Cork together.",
  subheadline:
    "Cork is quieter than Dublin, the community is tighter, and the Indian student pipeline is the fastest-growing in Ireland. A NexGen group here is ten verified classmates who will genuinely know your name by week two.",
  stats: [
    { label: "Indian students / year", value: "~500" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Avg group size", value: "10" },
    { label: "Spots per intake", value: "100" },
  ],
  homeCities: [
    "Bangalore",
    "Chennai",
    "Mumbai",
    "Hyderabad",
    "Pune",
    "Kochi",
    "Delhi",
    "Ahmedabad",
    "Kolkata",
  ],
  intake: "September 2026",
  coursesHighlight: [
    "MSc Data Science & Analytics",
    "MSc Biotechnology",
    "MSc Finance",
    "MSc Cloud Computing",
    "BComm International",
    "MSc Pharmacy",
    "MSc Interactive Media",
  ],
  studentQuote: {
    body:
      "Cork is warmer than Dublin - the people, not the weather. My NexGen group walked into The Bailey on a Tuesday in September and we did not leave the table for four hours. That is how it starts.",
    name: "Neha M.",
    course: "MSc Data Science · Class of 2025",
  },
  whyThisCampus: [
    "Cork is small. You will run into your group at The Hub, Aras na Mac Leinn, the 208 bus stop - repeatedly. That proximity is an edge, not a liability.",
    "The Indian grocery stores on MacCurtain Street run out of fresh paneer by Friday evening. Coordinate your Friday run with your group and rotate the cooking.",
    "UCC Indian Society is active - join the Telegram the week you arrive. Your NexGen group is ten; the society adds the next hundred.",
  ],
};
