"use client";

import { Mail, ArrowRight, Quote, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { GlowCard } from "@/components/shared/GlowCard";
import { MagneticButton } from "@/components/shared/MagneticButton";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialLinks = [
  { href: "https://linkedin.com/in/aayushshah", label: "LinkedIn", icon: LinkedinIcon },
  { href: "https://instagram.com/aayushshah", label: "Instagram", icon: InstagramIcon },
  { href: "https://twitter.com/aayushshah", label: "Twitter", icon: TwitterIcon },
  { href: "mailto:aayush@shivalikgroup.com", label: "Email", icon: Mail },
];

export default function TeamPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ============================== */}
        {/* Hero — not "Meet the Team"     */}
        {/* This is a founder story.       */}
        {/* ============================== */}
        <section className="relative overflow-hidden bg-navy-deep">
          <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-coral/[0.06] blur-[120px]" />
          <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-ice-blue/[0.04] blur-[100px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <div className="container-narrow relative py-24 text-center md:py-32">
            <ScrollReveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ice-blue/60 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-coral" />
                The Story Behind NexGen Connect
              </span>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <h1 className="mt-8 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                Built by Someone Who
                <br />
                <span className="text-gradient-coral">Lived the Problem</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-ice-blue/50">
                This isn&apos;t a product built in a boardroom. It was born from a real frustration,
                a real gap, and a real desire to fix how Indian students connect before they leave home.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================== */}
        {/* The Origin Story               */}
        {/* ============================== */}
        <section className="section-padding bg-white">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl">
              <ScrollReveal>
                <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">
                  It Started With a WhatsApp Group
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.08}>
                <p className="mt-6 text-base leading-[1.85] text-text-secondary sm:text-lg">
                  When I first decided to study abroad, I did what every Indian student does — I joined
                  WhatsApp groups. &ldquo;Indians going to Germany 2027.&rdquo; 500 members. Immigration agents
                  spamming services. Random strangers from cities I&apos;d never visited. No way to know
                  who was real and who was trying to sell me something.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.12}>
                <p className="mt-5 text-base leading-[1.85] text-text-secondary sm:text-lg">
                  I didn&apos;t want 500 strangers. I wanted to find someone from <em>my city</em> —
                  someone from Mumbai who understood the same chai stalls, the same local trains,
                  the same inside jokes — who also happened to be going to Germany.
                  Someone I could trust. Someone <em>verified</em>.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.16}>
                <p className="mt-5 text-base font-semibold leading-[1.85] text-navy sm:text-lg">
                  That platform didn&apos;t exist. So I built it.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ============================== */}
        {/* The Founder                    */}
        {/* ============================== */}
        <section className="relative overflow-hidden bg-off-white py-20 md:py-28">
          <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-coral/[0.04] blur-[100px]" />

          <div className="container-narrow relative">
            <ScrollReveal>
              <GlowCard className="mx-auto max-w-2xl" glowColor="rgba(249, 97, 103, 0.12)">
                <div className="p-8 text-center sm:p-12">
                  {/* Avatar */}
                  <div className="mx-auto rounded-full bg-gradient-to-br from-coral to-[#FF7B7F] p-[3px] shadow-xl shadow-coral/15">
                    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white text-4xl font-extrabold text-navy sm:h-44 sm:w-44 sm:text-5xl">
                      AS
                    </div>
                  </div>

                  <h2 className="mt-7 text-2xl font-extrabold text-navy sm:text-3xl">
                    Aayush Shah
                  </h2>
                  <p className="mt-1.5 text-base font-semibold text-coral">Founder &amp; CEO</p>

                  <p className="mx-auto mt-6 max-w-md text-sm font-medium leading-relaxed text-text-secondary sm:text-base">
                    An entrepreneur who saw the gap between deciding to study abroad and actually
                    knowing anyone at your destination. He built NexGen Connect to make the pre-departure
                    experience less lonely for every Indian student.
                  </p>

                  {/* Social links */}
                  <div className="mt-7 flex items-center justify-center gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-11 w-11 items-center justify-center rounded-xl bg-navy/5 text-navy transition-all duration-300 hover:bg-gradient-to-br hover:from-navy hover:to-navy-light hover:text-white hover:shadow-lg hover:shadow-navy/15"
                        aria-label={social.label}
                      >
                        <social.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      </a>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-medium text-text-muted">
                    aayush@shivalikgroup.com
                  </p>
                </div>
              </GlowCard>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================== */}
        {/* The Quote — cinematic          */}
        {/* ============================== */}
        <section className="relative overflow-hidden bg-navy-deep py-20 md:py-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/[0.05] blur-[100px]" />

          <div className="container-narrow relative">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <Quote className="mx-auto h-12 w-12 rotate-180 text-coral/20" strokeWidth={1.5} />
                <blockquote className="mt-6 text-2xl font-extrabold leading-relaxed text-white sm:text-3xl md:text-4xl">
                  I saw friends struggle with the loneliness of moving abroad. The WhatsApp groups
                  were chaos. The Reddit threads were anonymous. I wanted to build something where
                  you could find someone from your own{" "}
                  <span className="text-gradient-coral">galli</span> who&apos;s going to the same
                  country.
                </blockquote>
                <div className="mx-auto mt-8 h-px w-16 bg-gradient-to-r from-transparent via-coral/40 to-transparent" />
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-ice-blue/40">
                  Aayush Shah
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ============================== */}
        {/* The Vision Forward              */}
        {/* ============================== */}
        <section className="section-padding bg-white">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl">
              <ScrollReveal>
                <span className="inline-block rounded-full bg-navy/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-navy">
                  Looking Ahead
                </span>
                <h2 className="mt-5 text-2xl font-extrabold text-navy sm:text-3xl">
                  Where This Is Going
                </h2>
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <p className="mt-6 text-base leading-[1.85] text-text-secondary sm:text-lg">
                  Today, NexGen Connect serves Indian students heading to 18+ countries. But the
                  vision is bigger. We want to become the default first thing every student does
                  when they decide to study abroad — not for visa advice, not for admission
                  guidance, but for the most human need of all: <em>finding their people</em>.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <p className="mt-5 text-base leading-[1.85] text-text-secondary sm:text-lg">
                  We&apos;re building for every origin city, every destination country, and every
                  intake. If you&apos;re a student who&apos;s felt the anxiety of going abroad
                  alone — we built this for you. If you&apos;re a builder who wants to make this
                  vision real — we want you on the team.
                </p>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ============================== */}
        {/* Join the Team CTA              */}
        {/* ============================== */}
        <section className="relative overflow-hidden bg-off-white py-20 md:py-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-coral/[0.04] blur-[100px]" />

          <div className="container-narrow relative text-center">
            <ScrollReveal>
              <span className="inline-block rounded-full bg-coral/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-coral">
                Careers
              </span>
              <h2 className="mt-5 text-3xl font-extrabold text-navy sm:text-4xl">
                Join Our Mission
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base font-medium text-text-secondary">
                We&apos;re an early-stage team building something that matters. If you care about
                helping students and love building products — let&apos;s talk.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.15}>
              <div className="mt-8">
                <MagneticButton
                  href="mailto:careers@nexgenconnect.com"
                  className="group gap-2 bg-gradient-to-r from-coral to-[#FF7B7F] px-8 py-4 text-[15px] text-white shadow-xl shadow-coral/20 hover:shadow-2xl hover:shadow-coral/30"
                >
                  Get in Touch
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </MagneticButton>
              </div>
              <p className="mt-4 text-xs font-medium text-text-muted">
                careers@nexgenconnect.com
              </p>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
