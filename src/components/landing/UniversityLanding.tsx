import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Users } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { AppStoreBadge } from "@/components/ui/AppStoreBadge";
import { PlayStoreBadge } from "@/components/ui/PlayStoreBadge";
import { EmailWaitlistForm } from "@/components/landing/EmailWaitlistForm";

/**
 * UniversityLanding. A shared shell used across both launch corridors:
 *   - Ireland (Sept 2026): /trinity, /ucd, /ucc
 *   - Germany (Oct 2026):  /tum, /lmu, /rwth-aachen, /humboldt
 *
 * Each page passes the university&rsquo;s own copy - stats, intake dates,
 * top home cities, quoted student - but the structure, layout, and
 * brand voice stay identical. Drop in another config to expand to an
 * eighth campus (Toronto, UCL, Melbourne, etc.).
 *
 * Positioning: SEO + personalisation. A student searching &ldquo;TUM
 * Indian students 2026&rdquo; or &ldquo;Trinity Indian students 2026&rdquo;
 * lands on a page that speaks their exact situation - not a generic
 * homepage.
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
        <section className="py-10 md:py-16">
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
        <section className="border-t border-[color:var(--color-border)] py-10 md:py-16">
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
        <section className="relative border-t border-[color:var(--color-border)] bg-[color:var(--color-bg)] py-12 md:py-16">
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
        <section className="border-t border-[color:var(--color-border)] py-10 md:py-16">
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
        <section className="relative overflow-hidden border-t border-[color:var(--color-border)] py-12 md:py-16">
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
                {cfg.shortName}, with TestFlight priority for the first
                sixty verified students from each campus.
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
    "Every year, hundreds of Indian students walk onto Front Square not knowing a single person in their class. Your NexGen corridor is verified Trinity classmates from your home city, going to Dublin, in the same intake month — ready before the first lecture.",
  stats: [
    { label: "Indian students / year", value: "~1,000" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
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
      "The Arts Block feels huge if you walk in alone. What I actually want is four people I already know before day one - that is the part no university email ever solves.",
    name: "Aanya R.",
    course: "Future Trinity MSc FinTech · Sept 2026 intake",
  },
  whyThisCampus: [
    "The LUAS is your life - the Green Line gets you from Sandyford to Trinity in 25 minutes, the Red Line takes you to Smithfield for cheaper rent.",
    "Avoid the on-campus canteen at 1 pm; the Pav or the Brogue on Dawson Street are better calls. Trinity Ball tickets sell in 40 minutes - set a calendar alarm.",
    "Dublin rent is brutal. A NexGen group doubles as a housing conversation - a handful of verified friends deciding on a lease together beats scrolling Daft alone.",
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
    "UCD is Ireland\u2019s largest campus and its deepest Indian-student pipeline. Your NexGen corridor is verified Belfield freshers \u2014 from your home city, your intake, your year \u2014 waiting on day one of orientation.",
  stats: [
    { label: "Indian students / year", value: "~1,800" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
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
      "Belfield is its own town. If I could walk into Daonnacht week with three people who already had my number, the first month would feel like the fourth. That is genuinely all I am asking for.",
    name: "Harsh V.",
    course: "Future UCD MSc Data Analytics · Sept 2026 intake",
  },
  whyThisCampus: [
    "Belfield is 45 minutes from the city centre by 39a - time it. The internal Belfield loop bus gets you from res halls to lectures without the weather winning.",
    "UCD Global hosts a First Week Ireland programme - RSVP the moment it opens. Your NexGen group should go together so you are not the only one sitting alone.",
    "Ranelagh and Rathmines are student-dense; Dundrum and Clonskeagh are quieter. Decide as a group before you sign a lease - a handful of verified friends on one conversation beats scrolling Daft alone.",
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
    "Cork is quieter than Dublin, the community is tighter, and the Indian student pipeline is the fastest-growing in Ireland. Your NexGen corridor here brings verified Indian classmates who will genuinely know your name by week two.",
  stats: [
    { label: "Indian students / year", value: "~500" },
    { label: "Next intake", value: "Sept 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
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
      "Cork is small enough that the people make the difference, not the weather. If I could walk into The Bailey on a Tuesday in September with a group that already knew my name, that is the start I want.",
    name: "Neha M.",
    course: "Future UCC MSc Data Science · Sept 2026 intake",
  },
  whyThisCampus: [
    "Cork is small. You will run into your group at The Hub, Aras na Mac Leinn, the 208 bus stop - repeatedly. That proximity is an edge, not a liability.",
    "The Indian grocery stores on MacCurtain Street run out of fresh paneer by Friday evening. Coordinate your Friday run with your group and rotate the cooking.",
    "UCC Indian Society is active - join the Telegram the week you arrive. Your NexGen corridor is the tight inner core; the society adds the next hundred.",
  ],
};

/* ------------------------------------------------------------------ */
/* GERMANY - October 2026 intake.                                      */
/* Each config is deliberately Munich-authentic (U-Bahn, Anmeldung,    */
/* blocked account, WG vs Studentenwohnheim). No text-swapped Ireland  */
/* copy. These two campuses anchor the German beachhead alongside      */
/* RWTH Aachen and Humboldt Berlin, which get configs later.           */
/* ------------------------------------------------------------------ */

export const TUM_CONFIG: UniversityConfig = {
  slug: "tum",
  name: "Technical University of Munich",
  shortName: "TUM",
  city: "Munich",
  country: "Germany",
  kicker: "Technical University of Munich · October 2026",
  heroHeadline: "Your TUM group,",
  heroAccent: "landing in Munich.",
  subheadline:
    "TUM is Germany's #1 STEM campus and its deepest Indian-student pipeline. Your NexGen corridor brings verified TUM freshers — from your home city, your intake, your year — ready before Wintersemester orientation, blocked-account deadlines, and the first U-Bahn ride to Garching.",
  stats: [
    { label: "Indian students / year", value: "~900" },
    { label: "Next intake", value: "Oct 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
  ],
  homeCities: [
    "Bangalore",
    "Mumbai",
    "Delhi",
    "Pune",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Chandigarh",
    "Ahmedabad",
  ],
  intake: "October 2026",
  coursesHighlight: [
    "MSc Informatics",
    "MSc Management & Technology",
    "MSc Robotics, Cognition, Intelligence",
    "MSc Aerospace Engineering",
    "MSc Data Engineering & Analytics",
    "MSc Electrical Engineering",
    "MSc Mechanical Engineering",
  ],
  studentQuote: {
    body:
      "My blocked account notarisation, the Anmeldung slot, and the Studentenwohnheim waitlist all happen in week one - not in any order I can read in English. I want eight classmates who are doing it the same week, not a Facebook group of 2,000.",
    name: "Arjun K.",
    course: "Future TUM MSc Informatics · Oct 2026 intake",
  },
  whyThisCampus: [
    "Garching is 30 minutes north of the city on the U6 - cheaper rent, quieter, most of the STEM departments. If your course is Informatics or Mechanical, your lectures live here, not in Innenstadt.",
    "The blocked account (€11,904 for 2026) has to be funded and notarised before your visa interview. Your NexGen group compares Fintiba vs Expatrio vs Coracle the week before - nobody should figure this out alone.",
    "Studentenwohnheim waitlists are legendary - apply the day you accept your offer. A handful of verified friends comparing WG options on Studenten-WG and wg-gesucht beats scrolling alone in Hindi-free German listings.",
  ],
};

export const LMU_CONFIG: UniversityConfig = {
  slug: "lmu",
  name: "Ludwig Maximilian University of Munich",
  shortName: "LMU",
  city: "Munich",
  country: "Germany",
  kicker: "LMU Munich · October 2026",
  heroHeadline: "Your LMU group,",
  heroAccent: "reading Munich together.",
  subheadline:
    "LMU is one of Germany's oldest universities, the quieter counterweight to TUM's engineering pull. Your NexGen corridor for LMU brings verified Indian classmates — across Medicine, Neuroscience, Economics, and Humanities — ready before the first Vorlesung at Geschwister-Scholl-Platz.",
  stats: [
    { label: "Indian students / year", value: "~400" },
    { label: "Next intake", value: "Oct 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
  ],
  homeCities: [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Kolkata",
    "Pune",
    "Chennai",
    "Hyderabad",
    "Lucknow",
    "Ahmedabad",
  ],
  intake: "October 2026",
  coursesHighlight: [
    "MSc Neuro-Cognitive Psychology",
    "MSc Economics",
    "MSc Epidemiology",
    "MSc Computer Science",
    "MSc Biology",
    "MA International Health",
    "MSc Physics",
  ],
  studentQuote: {
    body:
      "LMU is spread across half of Munich - Hauptgebäude in Maxvorstadt, Medicine in Großhadern, Biology in Martinsried. Without a group, you spend semester one figuring out which tram goes where. I want my eight before I land.",
    name: "Sneha P.",
    course: "Future LMU MSc Neuro-Cognitive Psychology · Oct 2026 intake",
  },
  whyThisCampus: [
    "The Maxvorstadt-Schwabing student belt is where most LMU housing lives. Rent is high but the U3/U6 connects Hauptgebäude, the Pinakothek museums, and the Englischer Garten for runs. Pick a WG here if you can.",
    "Anmeldung at the KVR (Munich's citizen office) has to happen within two weeks of arrival - slots disappear fast. Your NexGen group should book adjacent slots on the same morning so paperwork is a shared trip, not a solo panic.",
    "LMU's Indian Students Association is smaller than TUM's - you will be a named face by week three, not a number. Your NexGen corridor is the tight inner core; the ISA adds the next sixty across the university.",
  ],
};

export const RWTH_AACHEN_CONFIG: UniversityConfig = {
  slug: "rwth-aachen",
  name: "RWTH Aachen University",
  shortName: "RWTH",
  city: "Aachen",
  country: "Germany",
  kicker: "RWTH Aachen · October 2026",
  heroHeadline: "Your RWTH group,",
  heroAccent: "Aachen before Semesterstart.",
  subheadline:
    "RWTH is Germany's largest technical university and the second-deepest Indian-student pipeline after TUM. Your NexGen corridor for RWTH brings verified freshers — Informatics, Mechanical, Data Science, Automotive — ready before the visa interview, the Anmeldung slot, and the first tram to the Melaten campus.",
  stats: [
    { label: "Indian students / year", value: "~700" },
    { label: "Next intake", value: "Oct 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
  ],
  homeCities: [
    "Bangalore",
    "Pune",
    "Mumbai",
    "Hyderabad",
    "Delhi",
    "Chennai",
    "Kolkata",
    "Coimbatore",
    "Ahmedabad",
  ],
  intake: "October 2026",
  coursesHighlight: [
    "MSc Computer Science",
    "MSc Data Science",
    "MSc Automotive Engineering",
    "MSc Mechanical Engineering",
    "MSc Electrical Engineering",
    "MSc Production Systems Engineering",
    "MSc Software Systems Engineering",
  ],
  studentQuote: {
    body:
      "Aachen is not a big city - it is a student town. The paperwork is German, the lecture slides are English, and the WG hunt is you, a Facebook group, and Google Translate. I want seven classmates doing it the same week, not four hundred strangers.",
    name: "Rahul M.",
    course: "Future RWTH MSc Data Science · Oct 2026 intake",
  },
  whyThisCampus: [
    "Aachen sits at the Germany-Belgium-Netherlands corner - cheaper than Munich, quieter than Berlin, and almost every Masters student is international. The Melaten + Mittelbau campuses are a 10-minute bus ride from the Altstadt core.",
    "The blocked account deadline (€11,904 for 2026) and the Ausländerbehörde appointment are the two paperwork walls most Indian students trip on. Compare Fintiba vs Expatrio vs Coracle with your seven before you book any of them.",
    "Studierendenwerk Aachen housing is the cheapest in Germany but the waitlist is brutal - apply the day you accept your offer. A pocket group comparing WG-gesucht listings in the same month you land beats solo scrolling in a foreign language.",
  ],
};

export const HUMBOLDT_CONFIG: UniversityConfig = {
  slug: "humboldt",
  name: "Humboldt University of Berlin",
  shortName: "HU Berlin",
  city: "Berlin",
  country: "Germany",
  kicker: "Humboldt University · October 2026",
  heroHeadline: "Your HU Berlin group,",
  heroAccent: "landing in Mitte together.",
  subheadline:
    "Humboldt is the research anchor of Berlin - Nobel laureates, Unter den Linden, and one of the most English-friendly campuses in Germany. Your NexGen corridor for HU brings verified Indian classmates across Economics, Biology, Physics, and Global Studies, ready before the first Einführungswoche lecture.",
  stats: [
    { label: "Indian students / year", value: "~350" },
    { label: "Next intake", value: "Oct 2026" },
    { label: "Corridor unlocks at", value: "60 verified" },
    { label: "TestFlight priority", value: "First 60" },
  ],
  homeCities: [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Chennai",
    "Chandigarh",
    "Jaipur",
  ],
  intake: "October 2026",
  coursesHighlight: [
    "MSc Economics",
    "MSc Statistics",
    "MSc Biophysics",
    "MSc Global Change Geography",
    "MA Global Studies",
    "MSc Computer Science",
    "MA English Literatures",
  ],
  studentQuote: {
    body:
      "Berlin is the friendliest German city for English-speakers, but the Bürgeramt queue does not care about that. I want seven HU classmates flying in the same week so Anmeldung day is a group chat, not a two-hour panic.",
    name: "Ishita B.",
    course: "Future HU Berlin MSc Economics · Oct 2026 intake",
  },
  whyThisCampus: [
    "Mitte, Prenzlauer Berg, and Friedrichshain are where most HU students live - well-connected on the U2/S-Bahn ring and a short bike ride to Unter den Linden. Rent is lower than Munich but climbing - lock a WG before you land.",
    "Anmeldung at a Berlin Bürgeramt has to happen within two weeks of arrival but slots vanish within minutes of being posted. Your NexGen group refreshes the portal together; whoever catches an opening books adjacent slots for everyone.",
    "HU does not have an official Indian Students Association the size of TUM's - the community is warmer but more scattered across faculties. Your NexGen eight become your named group before orientation; the rest of the city comes later.",
  ],
};
