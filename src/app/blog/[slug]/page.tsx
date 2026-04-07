import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { notFound } from "next/navigation";

const posts: Record<string, { title: string; date: string; readTime: string; category: string; content: string }> = {
  "moving-to-germany-from-india-guide": {
    title: "The Complete Guide to Moving to Germany from India (2027)",
    date: "2026-03-15",
    readTime: "12 min read",
    category: "Guide",
    content: `Moving to Germany from India is one of the most exciting — and overwhelming — decisions you'll make. This guide covers everything from opening a blocked account to registering at your local Rathaus.

## Before You Leave India

Start your preparations at least 3 months before your departure date. Here are the essentials:

**Blocked Account (Sperrkonto):** Required for your student visa. You need to deposit approximately €11,208 for one year. Popular providers include Expatrio and Coracle.

**Health Insurance:** Mandatory in Germany. Compare providers like TK, AOK, and DAK for public insurance, or consider private options if your program is short.

**Documents to Carry:** Original degree certificates, 10-12 passport photos (biometric), rental agreement (if you have one), admission letter, and visa documentation.

## Finding Accommodation

This is often the hardest part. Start looking 2-3 months before arrival. Consider student housing (Studentenwerk), WG-Gesucht for shared apartments, and Facebook groups for your university city.

## Making Friends Before You Land

This is where NexGen Connect comes in. Instead of joining chaotic WhatsApp groups with hundreds of strangers, find verified students from your city who are going to the same destination. Mumbai to Munich? We've got your cohort ready.

## First Week in Germany

Register at the Rathaus (city registration office), activate your health insurance, open a German bank account, get a local SIM card, and explore your campus.

The transition is challenging, but it's also the beginning of an incredible chapter. And it's much easier when you already know someone from home who's going through the same experience.`,
  },
  "how-to-find-roommates-abroad": {
    title: "How to Find Roommates Before You Move Abroad",
    date: "2026-03-08",
    readTime: "6 min read",
    category: "Tips",
    content: `Finding the right roommate can make or break your study abroad experience. Here's how to find someone compatible — ideally someone from your own city.

## Why WhatsApp Groups Don't Work

We've all been there. You join a "Indians going to Germany 2027" group with 500 people. It's noisy, unverified, and full of agents promoting their services. Finding a genuine roommate in that chaos is nearly impossible.

## What to Look For in a Roommate

**Lifestyle compatibility matters more than shared interests.** Are they a night owl or early bird? Do they cook or order in? Are they neat or comfortable with organized chaos? These daily habits will affect your living experience far more than whether you both like cricket.

## The NexGen Connect Approach

On NexGen Connect, you can see these exact preferences on every profile. Our lifestyle toggles (Night Owl vs Early Bird, Cooking vs Ordering, Neat Freak vs Organized Chaos) help you find someone you'll actually enjoy living with.

Plus, every user is government-verified, so you know you're talking to a real person. When you match, their Instagram and LinkedIn are revealed — so you can do your due diligence before committing to sharing a flat.

## Tips for the Roommate Conversation

Once you find a potential roommate, discuss: budget range, preferred neighborhood, cooking habits, sleep schedule, guest policy, and cleanliness expectations. It's better to have these conversations early than to discover incompatibilities after you've signed a lease.`,
  },
  "pre-departure-checklist-indian-students": {
    title: "Pre-Departure Checklist for Indian Students (2027 Edition)",
    date: "2026-02-28",
    readTime: "8 min read",
    category: "Checklist",
    content: `Don't panic — we've organized everything you need into a simple checklist. Print this out or bookmark it.

## Documents

- Passport (valid for at least 6 months beyond your stay)
- Visa / residence permit approval
- University admission letter (original + 3 copies)
- Degree certificates and transcripts (original + attested copies)
- 12 passport-size photos (biometric format for your destination country)
- Health insurance documents
- Blocked account / financial proof
- Travel insurance for the first month

## Finances

- International debit card (Niyo, Fi, or your bank's forex card)
- Carry some local currency in cash (€200-500 equivalent)
- Inform your Indian bank about international travel
- Download your destination country's payment apps

## Packing Essentials

- Indian spices and ready-to-eat meals (trust us)
- Power adapters for your destination
- Important medicines (with prescriptions)
- Warm clothing if going to Europe (buy more there — Indian sizes may differ)
- Laptop and charger

## Digital Setup

- Download offline maps for your destination city
- Get a local SIM card plan ready (or an international eSIM)
- Set up VPN if needed
- Join NexGen Connect to find students from your city

## Before You Leave Home

- Get a complete health check-up
- Visit your dentist
- Make copies of all documents (physical + cloud backup)
- Set up a power of attorney if needed
- Say goodbye to your local chai wala (you'll miss them)

The most important thing you can do? Make sure you're not going alone. Find your people on NexGen Connect before you board that flight.`,
  },
  "best-cities-in-germany-for-indian-students": {
    title: "7 Best Cities in Germany for Indian Students (2027 Guide)",
    date: "2026-04-01",
    readTime: "10 min read",
    category: "Guide",
    content: `Choosing which city to study in is one of the biggest decisions you'll make — and Germany has no shortage of great options. Each city has its own personality, cost of living, and opportunities. Here's a practical breakdown of the seven best German cities for Indian students in 2027.

## 1. Munich (Muenchen)

Munich is the economic powerhouse of southern Germany and a magnet for Indian students in engineering, computer science, and business. The Technical University of Munich (TUM) and Ludwig Maximilian University (LMU) are consistently ranked among Europe's top institutions.

**Cost of living:** High by German standards. Expect to spend between €900 and €1,200 per month on rent, food, and transport. Finding affordable student housing requires starting your search months in advance.

**Indian community:** Munich has one of the largest Indian communities in Germany, with well-established groups like the Indian Association Munich. You'll find multiple Indian grocery stores, restaurants serving authentic South Indian and North Indian food, and regular cultural events around Diwali, Holi, and Ganesh Chaturthi.

**Job prospects:** Exceptional. BMW, Siemens, Allianz, and hundreds of tech startups are headquartered here. Werkstudent (working student) positions are plentiful, especially in software development, data science, and engineering.

## 2. Berlin

Berlin is Germany's capital and its most international city. It's a hub for startups, arts, and culture. The Technische Universitat Berlin, Humboldt University, and Freie Universitat are all excellent choices.

**Cost of living:** Berlin used to be cheap, but rents have risen sharply. Budget around €750 to €1,000 per month. Shared flats (WGs) in neighborhoods like Neukoelln, Wedding, and Marzahn still offer affordable options.

**Indian community:** Berlin's Indian community is vibrant and growing, with a strong presence of young professionals and students. Indian grocery stores are spread across the city, and the restaurant scene includes everything from street-food-style dhabas to upscale dining.

**Job prospects:** Berlin is Germany's startup capital. If you're in tech, product management, marketing, or design, you'll find English-friendly job opportunities more easily than in other cities. Companies like Zalando, N26, Delivery Hero, and hundreds of early-stage startups actively hire international talent.

## 3. Stuttgart

Stuttgart is often overlooked, but it's a goldmine for engineering students. It's home to Porsche, Mercedes-Benz, and Bosch. The University of Stuttgart is particularly strong in mechanical engineering, automotive technology, and manufacturing.

**Cost of living:** Moderate to high, around €800 to €1,050 per month. Student housing through Studierendenwerk Stuttgart is more accessible than in Munich.

**Indian community:** Smaller but close-knit. The Indian community here revolves around the automotive and IT industries. You'll find Indian stores in the city center, and the community organizes regular cultural gatherings.

**Job prospects:** Outstanding for engineering and manufacturing. Werkstudent roles at automotive companies are highly coveted and pay well. Many Indian students land full-time roles at Bosch, Daimler, or their tier-one suppliers after graduation.

## 4. Frankfurt am Main

Frankfurt is Germany's financial capital, home to the European Central Bank and the Frankfurt Stock Exchange. Goethe University Frankfurt and Frankfurt School of Finance are top choices for business and finance students.

**Cost of living:** High, comparable to Munich. Expect to spend around €900 to €1,150 per month. The city is compact, so transport costs are manageable.

**Indian community:** Frankfurt has a well-established Indian population, largely driven by the finance and IT sectors. Grocery stores, temples, and restaurants catering to Indian tastes are easy to find.

**Job prospects:** Excellent for finance, consulting, and IT. The Big Four accounting firms, major banks, and fintech companies have significant operations here. The airport also makes Frankfurt a logistics and supply chain hub.

## 5. Hamburg

Hamburg is Germany's second-largest city, a major port, and a media hub. The University of Hamburg and Hamburg University of Technology (TUHH) attract students in engineering, logistics, and media studies.

**Cost of living:** Moderate, around €750 to €1,000 per month. The city offers better value for housing compared to Munich and Frankfurt.

**Indian community:** Growing steadily. The port and logistics industry has brought many Indian professionals to the city. You'll find Indian grocers in Altona and St. Georg, and the community is welcoming to newcomers.

**Job prospects:** Strong in logistics, maritime engineering, renewable energy, media, and e-commerce. Airbus has a major facility here, and companies like Otto Group and About You are based in Hamburg.

## 6. Aachen

Aachen is a small university city near the Dutch and Belgian borders, famous for RWTH Aachen University — one of Europe's top technical universities. It punches far above its weight for engineering and technology.

**Cost of living:** Very affordable by German standards. You can live comfortably on €650 to €850 per month, including rent. Student housing is easier to find here than in larger cities.

**Indian community:** Surprisingly strong for a small city, thanks to the large number of Indian engineering students at RWTH. The Indian Student Association is active, organizing cricket matches, potluck dinners, and festival celebrations. Multiple Indian grocery shops serve the community.

**Job prospects:** Good, particularly through industry partnerships. RWTH has strong ties with automotive and engineering firms. Many students find Werkstudent positions and thesis opportunities with companies like Ford (which has its European research center in Aachen), Ericsson, and local tech startups.

## 7. Darmstadt

Darmstadt calls itself the "City of Science" and it lives up to the name. Technische Universitat Darmstadt is a premier university for computer science, electrical engineering, and cybersecurity.

**Cost of living:** Very reasonable at €650 to €900 per month. Its proximity to Frankfurt means you get access to big-city amenities without big-city rent.

**Indian community:** Solid and student-driven. TU Darmstadt has a long history of enrolling Indian students, so the support network is well-established. There are Indian grocery stores, and the community organizes regular get-togethers and study groups.

**Job prospects:** Darmstadt's strength is in tech and research. The European Space Agency (ESA/ESOC) is headquartered here. Deutsche Telekom, Merck, and Software AG are major employers. The city also benefits from its proximity to Frankfurt's massive job market — just a 20-minute train ride away.

## How to Choose the Right City

Consider what matters most to you: Are you chasing top-tier job opportunities (Munich, Stuttgart)? Do you want an affordable cost of living and a strong Indian community (Aachen, Darmstadt)? Is startup culture your thing (Berlin)?

Whatever you choose, the transition is easier when you know people from home who are heading to the same city. NexGen Connect helps you find verified students from your own city who are going to the same destination — so you can plan housing, travel, and settling-in together, long before you board the flight.`,
  },
  "what-to-pack-study-abroad-india": {
    title: "The Ultimate Packing List for Indian Students Going Abroad",
    date: "2026-03-20",
    readTime: "7 min read",
    category: "Checklist",
    content: `Packing for your move abroad is stressful — you're torn between "I need everything from home" and the airline's 23 kg baggage limit. After talking to hundreds of Indian students who've made the move, here's the definitive packing list that covers what you actually need and what you can skip.

## Documents (Carry On — Never Check These In)

- Passport with visa (original + 2 photocopies)
- University admission letter (original + 2 copies)
- Blocked account confirmation (Expatrio/Coracle printout)
- Health insurance certificate
- Degree certificates, transcripts, and mark sheets (original + attested copies)
- 15 passport-size photos (biometric format — you'll need more than you think)
- Flight tickets and accommodation confirmation
- A printed folder with emergency contacts, embassy address, and university helpline numbers

**Pro tip:** Scan every single document and upload to Google Drive or iCloud. Share access with a family member so they can send you anything you've forgotten.

## Electronics

- Laptop and charger (your most important possession)
- Universal power adapter (Type C and Type F plugs for Europe)
- Power strip from India (with a single adapter, you can charge everything)
- Smartphone with dual-SIM or eSIM capability
- Portable charger / power bank (10,000 mAh minimum)
- USB-C cables and a small USB hub
- Earphones or headphones for long flights and library study sessions

**Skip:** Hair dryers and heavy appliances — voltage differences can fry them, and they're cheap to buy locally.

## Clothing

- 3-4 pairs of jeans or trousers
- 7-8 t-shirts and casual tops
- 2-3 formal shirts (for presentations and networking events)
- One blazer or formal jacket
- Thermals (top and bottom) — at least 2 sets if heading to Europe
- A good-quality winter jacket (buy locally if going to a cold country — Indian jackets often aren't warm enough)
- Comfortable walking shoes (you'll walk a lot more than you do in India)
- Flip-flops/chappals for home use
- Traditional Indian outfit (kurta-pyjama or saree) for cultural events and Diwali parties

**Pro tip:** Don't overpack clothes. Sizes and styles vary, and you'll want to buy some things locally to blend in. Pack light and shop smart.

## Kitchen Essentials (The Indian Survival Kit)

This is where Indian students differ from everyone else — and for good reason.

- Masala dabba (spice box) filled with: haldi, jeera, dhania powder, red chilli powder, garam masala, hing, and rai
- Extra packets of spice mixes: sambar powder, rasam powder, chaat masala, pav bhaji masala, biryani masala
- Small pressure cooker (3-litre is perfect — Hawkins or Prestige)
- Tawa (flat pan for rotis — hard to find abroad)
- Pickle jars (your mum's achaar will be your most prized possession for the first few months)
- Ready-to-eat meal packets (MTR, Haldiram's) for the first week when you're still setting up
- Tea powder or chai masala (finding good chai abroad is a struggle)
- Rice and dal packets (1 kg each to start — you can find Indian stores later)

**Skip:** A full set of utensils — you can buy plates, bowls, and cutlery cheaply at IKEA or local stores.

## Medicine and Health

- Prescription medications (carry a doctor's letter and prescription copies)
- Crocin/Dolo (paracetamol for fever and headaches)
- Digene/Eno (antacids — the food adjustment period is real)
- ORS packets (for dehydration)
- Betadine/Dettol antiseptic
- Band-aids, cotton, and basic first-aid supplies
- Vicks VapoRub (a universal Indian remedy)
- Moov or Volini spray (for muscle pain after all that walking)
- Any Ayurvedic or homeopathic medicines you rely on (these are hard to find abroad)

**Pro tip:** Carry a typed letter from your doctor listing all medications and their generic names. Pharmacy names differ across countries.

## Comfort Items from Home

These won't seem important until you're 7,000 km from home and missing everything.

- A light blanket or bedsheet from home (familiar texture and smell matter more than you think)
- Family photos (printed, not just digital — pin them on your wall)
- A small religious item or pooja kit if you're spiritual (agarbatti, small murti, kumkum)
- Your favourite snacks (Maggi, Parle-G, Bournvita — whatever reminds you of home)
- A notebook or journal for the first few weeks
- A good book in your mother tongue

## Final Packing Tips

Weigh your bags before leaving for the airport — not after you arrive. Use vacuum bags for winter clothing to save space. Wear your heaviest shoes and jacket on the flight. And remember: anything you forget, someone from your NexGen Connect cohort has probably already figured out where to buy it locally.

The best packing advice? Don't try to bring India with you. Bring the essentials, and build your new life with a mix of home and abroad.`,
  },
  "homesickness-tips-indian-students-abroad": {
    title: "Dealing with Homesickness: A Guide for Indian Students Abroad",
    date: "2026-03-01",
    readTime: "5 min read",
    category: "Wellness",
    content: `Let's be honest — no matter how excited you are about studying abroad, there will be nights when you miss home so much it physically hurts. The smell of your mum's cooking, the noise of your neighborhood, the comfort of your own bed. Homesickness is not a weakness. It's a natural part of one of the biggest transitions of your life. Here's how to deal with it.

## Stay Connected — But Set Boundaries

Video calls with family are a lifeline, but they can also make you feel worse if you're calling every time you feel low. Find a rhythm that works.

**Time zone tips:** If you're in Germany and your family is in India, the sweet spot is usually 7-8 PM your time (which is 11 PM-12 AM IST) or weekend mornings. Set a regular weekly video call — something your parents can look forward to as well.

**WhatsApp groups:** Stay in your family group chat, share photos of your meals and your city, and send voice notes instead of just texts. Hearing your family's voice in a 30-second voice note can lift your mood instantly.

**The boundary:** Don't call home every time something goes wrong. It worries your parents and delays your own adjustment. Process small frustrations locally, and save the calls for genuine updates and quality conversation.

## Find Indian Food — It Heals Everything

This isn't just about taste — it's about comfort and identity. When the world around you feels unfamiliar, a plate of rajma chawal or a cup of masala chai can ground you.

**Cook at home:** Even if you've never cooked in India, now is the time to learn. Start with basics — dal, rice, sabzi, and maggi. Call your mum for recipes. Cooking Indian food also fills your apartment with familiar smells, which is more comforting than you'd expect.

**Find Indian grocery stores:** Every major German city has at least one or two Indian or South Asian grocery stores. Ask seniors or check Google Maps. Stock up on spices, atta, dal, and snacks within your first week.

**Eat with others:** Cooking and eating together with other Indian students turns a solo meal into a social event. Host a Sunday biryani session or a chai evening — it brings people together faster than any icebreaker.

## Join Cultural Groups and Student Associations

Most universities have an Indian Student Association (ISA) or a broader South Asian student group. These groups organize everything from Diwali celebrations and cricket matches to study sessions and apartment-hunting support.

**Why it helps:** Being around people who share your cultural background and understand what you're going through — without needing to explain it — is deeply comforting. You can speak in your mother tongue, joke about things only desis would understand, and celebrate festivals together.

**Beyond Indian groups:** Also join international student groups and university clubs. Having a diverse social circle helps you feel connected to your new home, not just your old one. Join a sports club, a cooking group, or a language exchange — anything that gives you regular social contact.

## Find People from Your City

This is the most underrated homesickness cure. Meeting someone from your own city — someone who knows your neighborhoods, your food spots, your local slang — creates an instant bond that's hard to replicate with anyone else.

NexGen Connect was built for exactly this. Instead of landing in a new country and hoping you'll bump into someone from Pune or Hyderabad or Jaipur, you can find verified students from your hometown before you even board the flight. When you arrive, you already have someone who gets it — someone who misses the same pani puri wala, the same local train, the same monsoon smell.

## Build New Routines and Rituals

Homesickness often strikes hardest when you have unstructured time — late evenings, weekends, and holidays. The fix? Build routines that give your days structure and meaning.

**Morning ritual:** Make chai the way you make it at home. It takes five minutes and starts your day on a familiar note.

**Weekly rhythm:** Designate one evening for cooking Indian food with friends, one evening for exploring your city, and one for a family call. Predictable rhythms reduce the chaos of a new environment.

**Exercise:** Walk, run, cycle, hit the gym, or do yoga. Physical activity is the most effective antidote to the low moods that come with homesickness. Germany has beautiful parks and cycling paths — use them.

**Journal:** Write down one good thing that happened each day. On tough days, read back through your entries. You'll realize the good days outnumber the bad ones.

## Know When to Ask for Help

If homesickness persists for weeks, affects your sleep and appetite, or makes you want to drop out and go home, it may be time to seek professional support. Most German universities offer free psychological counseling for students — in English. There is no shame in using these services. You're dealing with culture shock, language barriers, academic pressure, and distance from everything familiar, all at once. That's a lot.

Talk to a friend, a senior, a counselor, or a mentor. And remember — every Indian student who's successfully studying abroad right now went through the same thing you're going through. It gets better. The first three months are the hardest, and then one day you'll realize this new city is starting to feel like home too.`,
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-gradient-to-br from-navy via-[#1a2255] to-navy py-16 md:py-20">
          <div className="container-narrow">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-ice-blue/60 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-coral/20 px-3 py-0.5 text-xs font-semibold text-coral">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-ice-blue/50">
                <Calendar className="h-3 w-3" />
                {new Date(post.date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1 text-xs text-ice-blue/50">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container-narrow">
            <article className="prose prose-slate mx-auto max-w-3xl">
              {post.content.split("\n\n").map((paragraph, i) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={i} className="mt-8 text-2xl font-bold text-navy">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                  return (
                    <p key={i} className="font-semibold text-navy">
                      {paragraph.replace(/\*\*/g, "")}
                    </p>
                  );
                }
                if (paragraph.startsWith("- ")) {
                  return (
                    <ul key={i} className="text-text-secondary">
                      {paragraph.split("\n").map((item, j) => (
                        <li key={j}>{item.replace("- ", "")}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={i} className="text-text-secondary">
                    {paragraph}
                  </p>
                );
              })}
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
