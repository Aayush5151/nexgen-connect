"use client";

import {
  Heart,
  GraduationCap,
  Calendar,
  ExternalLink,
  HeartOff,
} from "lucide-react";
import { motion } from "framer-motion";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface Match {
  id: string;
  firstName: string;
  initial: string;
  originCity: string;
  destinationCity: string;
  university: string;
  courseField: string;
  matchedAt: string;
  instagramHandle: string | null;
  linkedinUrl: string | null;
}

const sampleMatches: Match[] = [
  {
    id: "1",
    firstName: "Priya",
    initial: "P",
    originCity: "Bangalore",
    destinationCity: "Munich",
    university: "TU Munich",
    courseField: "Data Science",
    matchedAt: "2 days ago",
    instagramHandle: "priya.ds",
    linkedinUrl: "https://linkedin.com/in/priyads",
  },
  {
    id: "2",
    firstName: "Arjun",
    initial: "A",
    originCity: "Delhi",
    destinationCity: "Munich",
    university: "LMU Munich",
    courseField: "Mechanical Engineering",
    matchedAt: "5 days ago",
    instagramHandle: "arjun.mech",
    linkedinUrl: "https://linkedin.com/in/arjunmech",
  },
  {
    id: "3",
    firstName: "Sneha",
    initial: "S",
    originCity: "Pune",
    destinationCity: "Berlin",
    university: "TU Berlin",
    courseField: "Computer Science",
    matchedAt: "1 week ago",
    instagramHandle: null,
    linkedinUrl: "https://linkedin.com/in/snehacs",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function MatchCard({ match, index }: { match: Match; index: number }) {
  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-5"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex gap-4">
        {/* Photo placeholder */}
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-coral/20 to-ice-blue/30 text-2xl font-bold text-navy sm:h-20 sm:w-20">
          {match.initial}
        </div>

        {/* Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-navy sm:text-lg">
              {match.firstName}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-text-muted sm:text-xs">
              <Calendar className="h-3 w-3" />
              {match.matchedAt}
            </div>
          </div>

          <p className="mt-0.5 text-sm text-text-secondary">
            {match.originCity} &rarr; {match.destinationCity}
          </p>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
            <GraduationCap className="h-3.5 w-3.5" />
            {match.university} &middot; {match.courseField}
          </div>

          {/* Social links - styled as tappable pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {match.instagramHandle && (
              <a
                href={`https://instagram.com/${match.instagramHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#833AB4]/10 via-[#FD1D1D]/10 to-[#F77737]/10 px-3.5 py-1.5 text-xs font-medium text-[#833AB4] transition-all duration-200 hover:from-[#833AB4]/25 hover:via-[#FD1D1D]/25 hover:to-[#F77737]/25 hover:shadow-sm active:scale-95"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
                @{match.instagramHandle}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}

            {match.linkedinUrl && (
              <a
                href={match.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0077B5]/10 px-3.5 py-1.5 text-xs font-medium text-[#0077B5] transition-all duration-200 hover:bg-[#0077B5]/25 hover:shadow-sm active:scale-95"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
                LinkedIn
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
      >
        <HeartOff className="h-10 w-10 text-coral/50" />
      </motion.div>
      <h3 className="mt-6 text-lg font-bold text-navy">No matches yet</h3>
      <p className="mt-2 max-w-xs text-sm text-text-secondary">
        Keep swiping! When you and another student both show interest, you&apos;ll
        see them here.
      </p>
      {/* Animated floating heart */}
      <motion.div
        className="mt-4"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="h-6 w-6 text-coral/40" />
      </motion.div>
    </motion.div>
  );
}

export default function MatchesPage() {
  const matches = sampleMatches;

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Matches</h1>
          <p className="mt-1 text-sm text-text-secondary">
            People who matched with you
          </p>
        </div>
        {matches.length > 0 && (
          <motion.span
            className="flex h-7 items-center rounded-full bg-coral/10 px-3 text-xs font-semibold text-coral"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
          >
            {matches.length} {matches.length === 1 ? "match" : "matches"}
          </motion.span>
        )}
      </div>

      {matches.length > 0 ? (
        <div className="space-y-3">
          {matches.map((match, index) => (
            <MatchCard key={match.id} match={match} index={index} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
