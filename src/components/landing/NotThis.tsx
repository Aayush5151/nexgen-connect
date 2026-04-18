import { SectionLabel } from "@/components/ui/SectionLabel";

const items = [
  {
    title: "Not a WhatsApp group",
    body: "No agents. No spam. No 500-person chats with randoms. Cohorts cap at 10.",
  },
  {
    title: "Not Yocket or Leap",
    body: "We don't sell consulting, loans, counselling, or forex. We match students to students. That's it.",
  },
  {
    title: "Not a social network",
    body: "No feed. No likes. No followers. You meet your 9 and that's it. Delete the app after you land if you want.",
  },
];

export function NotThis() {
  return (
    <section className="border-t border-border section-y">
      <div className="container-narrow">
        <div className="max-w-[720px]">
          <SectionLabel>What we are not</SectionLabel>
          <h2 className="mt-5 font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-foreground md:text-5xl">
            Defining us by negation.
          </h2>
        </div>

        <div className="mt-12 grid gap-[1px] overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col bg-[#121217] p-7"
            >
              <div className="relative">
                <div className="h-px w-6 bg-[#F07A6D]/60" />
                <div className="absolute -top-1 left-2 h-3 w-3 rotate-45 border-b border-r border-[#F07A6D]/60" />
              </div>
              <h3 className="mt-6 font-heading text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
