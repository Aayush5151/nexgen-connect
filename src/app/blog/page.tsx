import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, guides, and stories for Indian students moving abroad.",
};

const posts = [
  {
    slug: "moving-to-germany-from-india-guide",
    title: "The Complete Guide to Moving to Germany from India (2027)",
    excerpt:
      "Everything you need to know: from blocked accounts to finding accommodation, city registration, and making friends before you land.",
    date: "2026-03-15",
    category: "Guide",
    readTime: "12 min read",
  },
  {
    slug: "how-to-find-roommates-abroad",
    title: "How to Find Roommates Before You Move Abroad",
    excerpt:
      "Skip the WhatsApp group chaos. Here's a smarter way to find compatible roommates from your own city who are going to the same destination.",
    date: "2026-03-08",
    category: "Tips",
    readTime: "6 min read",
  },
  {
    slug: "pre-departure-checklist-indian-students",
    title: "Pre-Departure Checklist for Indian Students (2027 Edition)",
    excerpt:
      "Documents, packing, finances, SIM cards, bank accounts. The ultimate checklist so you don't forget anything.",
    date: "2026-02-28",
    category: "Checklist",
    readTime: "8 min read",
  },
  {
    slug: "best-cities-in-germany-for-indian-students",
    title: "7 Best Cities in Germany for Indian Students (2027 Guide)",
    excerpt:
      "Munich, Berlin, Stuttgart, Frankfurt, Hamburg, Aachen, and Darmstadt. A practical breakdown of cost of living, top universities, Indian community, and job prospects in each city.",
    date: "2026-04-01",
    category: "Guide",
    readTime: "10 min read",
  },
  {
    slug: "what-to-pack-study-abroad-india",
    title: "The Ultimate Packing List for Indian Students Going Abroad",
    excerpt:
      "From your masala dabba to your pressure cooker. A no-nonsense packing list covering documents, electronics, clothing, kitchen essentials, medicines, and comfort items from home.",
    date: "2026-03-20",
    category: "Checklist",
    readTime: "7 min read",
  },
  {
    slug: "homesickness-tips-indian-students-abroad",
    title: "Dealing with Homesickness: A Guide for Indian Students Abroad",
    excerpt:
      "Practical advice on staying connected with family, finding Indian food, joining cultural groups, building routines, and knowing when to ask for help.",
    date: "2026-03-01",
    category: "Wellness",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-[#020617] py-20 md:py-28">
          <div className="container-narrow text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">Blog</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#94A3B8]">
              Tips, guides, and stories for Indian students moving abroad.
            </p>
          </div>
        </section>

        <section className="section-padding bg-[#020617]">
          <div className="container-narrow">
            <div className="mx-auto max-w-3xl space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-white/[0.06] bg-[#0F172A] p-6 shadow-none transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[#3B82F6]/10 px-3 py-0.5 text-xs font-semibold text-[#3B82F6]">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-[#94A3B8]">{post.readTime}</span>
                  </div>

                  <h2 className="mt-3 text-xl font-bold text-[#F8FAFC] transition-colors group-hover:text-[#3B82F6] sm:text-2xl">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                    {post.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#3B82F6]">
                    Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
