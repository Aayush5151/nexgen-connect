"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignupShell } from "@/components/signup/SignupShell";
import { useSignup, type CorridorChoice } from "@/lib/signup/state";

/**
 * /signup/corridor — RC question + country/city/uni/intake. Step 4 of 7.
 *
 * The RC ("recovering student") branch fires BEFORE corridor placement
 * per v15 BP §3.4 so the S31 hybrid-programme warning, accommodation-
 * only mode, and enhanced visa-status check route correctly
 * downstream. v16 web pivot §Bucket 4 carries this forward.
 */

const COUNTRIES = [
  { code: "IE" as const, label: "Ireland", flag: "🇮🇪", cities: ["Dublin", "Cork", "Galway", "Limerick", "Maynooth"] },
  { code: "DE" as const, label: "Germany", flag: "🇩🇪", cities: ["Munich", "Aachen", "Berlin"] },
];

const UNIS: Record<string, string[]> = {
  Dublin: ["University College Dublin", "Trinity College Dublin", "Dublin City University"],
  Cork: ["University College Cork"],
  Galway: ["University of Galway"],
  Limerick: ["University of Limerick"],
  Maynooth: ["Maynooth University"],
  Munich: ["Technical University of Munich", "Ludwig Maximilian University of Munich"],
  Aachen: ["RWTH Aachen University"],
  Berlin: ["Humboldt University of Berlin", "Technical University of Berlin"],
};

const INTAKES = ["September 2026", "October 2026", "January 2027", "April 2027"];

export default function SignupCorridorPage() {
  const router = useRouter();
  const sessionToken = useSignup((s) => s.sessionToken);
  const setIsFirstTimer = useSignup((s) => s.setIsFirstTimer);
  const setCorridorChoice = useSignup((s) => s.setCorridorChoice);

  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isFirstTimer, _setIsFirstTimer] = useState<boolean | null>(null);
  const [country, setCountry] = useState<"IE" | "DE" | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [uni, setUni] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) router.replace("/signup");
  }, [sessionToken, router]);

  function pickFirstTimer(v: boolean) {
    _setIsFirstTimer(v);
    setIsFirstTimer(v);
    setStep(1);
  }
  function pickCountry(c: "IE" | "DE") {
    setCountry(c);
    setCity(null);
    setUni(null);
    setStep(2);
  }
  function pickCity(c: string) {
    setCity(c);
    setUni(null);
    setStep(3);
  }
  function pickUni(u: string) {
    setUni(u);
    setStep(4);
  }
  function pickIntake(i: string) {
    if (country && city && uni) {
      const choice: CorridorChoice = { country, city, uni, intake: i };
      setCorridorChoice(choice);
      router.push("/signup/preview");
    }
  }

  return (
    <SignupShell step={4}>
      {step === 0 && (
        <Question title="First time studying abroad?" sub="Honest answer, both paths are fine.">
          <Tile onClick={() => pickFirstTimer(true)}>Yes, this is the first time</Tile>
          <Tile onClick={() => pickFirstTimer(false)}>No, I&apos;ve been before</Tile>
        </Question>
      )}
      {step === 1 && (
        <Question title="Country?" sub={isFirstTimer ? "Where are you headed?" : "Where to this time?"}>
          {COUNTRIES.map((c) => (
            <Tile key={c.code} onClick={() => pickCountry(c.code)}>
              <span className="mr-2 text-[20px]">{c.flag}</span>
              {c.label}
            </Tile>
          ))}
        </Question>
      )}
      {step === 2 && country && (
        <Question title="Which city?" sub={`In ${COUNTRIES.find((c) => c.code === country)?.label}.`}>
          {COUNTRIES.find((c) => c.code === country)?.cities.map((c) => (
            <Tile key={c} onClick={() => pickCity(c)}>
              {c}
            </Tile>
          ))}
        </Question>
      )}
      {step === 3 && city && (
        <Question title="Which uni?" sub={`In ${city}.`}>
          {(UNIS[city] ?? []).map((u) => (
            <Tile key={u} onClick={() => pickUni(u)}>
              {u}
            </Tile>
          ))}
        </Question>
      )}
      {step === 4 && uni && (
        <Question title="When do you arrive?" sub={`At ${uni}.`}>
          {INTAKES.map((i) => (
            <Tile key={i} onClick={() => pickIntake(i)}>
              {i}
            </Tile>
          ))}
        </Question>
      )}
    </SignupShell>
  );
}

function Question({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] text-[color:var(--color-fg)]">{title}</h1>
      <p className="mt-2 text-[15px] text-[color:var(--color-fg-muted)]">{sub}</p>
      <div className="mt-8 space-y-3">{children}</div>
    </div>
  );
}

function Tile({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full rounded-[12px] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-5 py-4 text-left text-[15px] text-[color:var(--color-fg)] transition-[border-color,transform] hover:border-[color:var(--color-primary)]/60 hover:translate-y-[-1px] active:translate-y-0"
    >
      {children}
    </button>
  );
}
