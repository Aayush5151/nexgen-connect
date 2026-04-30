/**
 * Scams router — five canonical accommodation-scam patterns from v15
 * BP §16.30. Public per the /help-now triage flow (HN1).
 *
 * v15 BP §16.30 / v6 build §18 / Build Prompt Bucket 4.
 */
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

const ScamPattern = z.object({
  id: z.string(),
  title: z.string(),
  ask: z.string(),
  redFlag: z.string(),
  saferPath: z.string(),
});

const PATTERNS: z.infer<typeof ScamPattern>[] = [
  {
    id: "scm_1",
    title: "Fake-PBSA listing",
    ask: "Pay €1,200 deposit by bank transfer to 'reserve' your room.",
    redFlag: "Operator name doesn't match Vacancy.ie / aparto / Yugo / Fresh / Mezzino registry.",
    saferPath: "Use NexGen group-apply to a verified PBSA. Money goes to operator escrow, not the lister.",
  },
  {
    id: "scm_2",
    title: "Mobile-only landlord",
    ask: "Lease over WhatsApp; never an in-person viewing or video call.",
    redFlag: "Refusal to do a video call. No company name. No Eircode.",
    saferPath: "Demand a video viewing + Eircode + landlord PRTB registration before any payment.",
  },
  {
    id: "scm_3",
    title: "Cash-deposit pressure",
    ask: "Pay one month's rent in cash today to 'hold' the room.",
    redFlag: "No formal lease. No receipt. No PRTB registration.",
    saferPath: "Never pay in cash. Pay rent via bank transfer with a written lease + RTB registration.",
  },
  {
    id: "scm_4",
    title: "Fake-agent visa+accommodation combo",
    ask: "EUR 5,000 upfront for visa support + admit-letter assistance + accommodation booking.",
    redFlag: "Listed on MEA's eMigrate uncertified-agents register, or refuses to give a registration number.",
    saferPath: "MEA-certified agents only. Verify the registration number on emigrate.gov.in before paying.",
  },
  {
    id: "scm_5",
    title: "Sex-for-rent",
    ask: "Rent reduction offered for 'companionship' or 'closer relationship' with the landlord.",
    redFlag: "Any conditional offer that ties rent to non-housing terms. Garda treats this as a criminal offence.",
    saferPath: "Walk away immediately. Report via NexGen /help-now or directly to An Garda Síochána.",
  },
];

export const scamsRouter = router({
  patterns: publicProcedure
    .output(z.array(ScamPattern))
    .query(async () => PATTERNS),
});
