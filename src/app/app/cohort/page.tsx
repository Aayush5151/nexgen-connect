"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Globe,
  Calendar,
  Activity,
  Lock,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface BlurredProfile {
  id: string;
  initial: string;
  hobbies: string[];
  originCity: string;
  destinationCity: string;
}

const cohortInfo = {
  route: "Mumbai \u2192 Germany",
  intakePeriod: "Winter 2027",
  memberCount: 34,
  activeToday: 12,
};

const blurredProfiles: BlurredProfile[] = [
  {
    id: "1",
    initial: "R",
    hobbies: ["Gym", "Photography", "Cooking"],
    originCity: "Mumbai",
    destinationCity: "Munich",
  },
  {
    id: "2",
    initial: "A",
    hobbies: ["Music", "Travel", "Reading"],
    originCity: "Mumbai",
    destinationCity: "Berlin",
  },
  {
    id: "3",
    initial: "S",
    hobbies: ["Hiking", "Gaming", "Football"],
    originCity: "Pune",
    destinationCity: "Stuttgart",
  },
  {
    id: "4",
    initial: "N",
    hobbies: ["Dance", "Cooking", "Yoga"],
    originCity: "Mumbai",
    destinationCity: "Hamburg",
  },
  {
    id: "5",
    initial: "D",
    hobbies: ["Cricket", "Movies", "Running"],
    originCity: "Thane",
    destinationCity: "Munich",
  },
  {
    id: "6",
    initial: "K",
    hobbies: ["Art", "Photography", "Music"],
    originCity: "Mumbai",
    destinationCity: "Frankfurt",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
};

function BlurredProfileCard({
  profile,
  index,
}: {
  profile: BlurredProfile;
  index: number;
}) {
  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03 }}
    >
      {/* Photo placeholder - blurred, with hover tease */}
      <div className="relative h-36 bg-gradient-to-br from-navy/10 via-ice-blue/30 to-coral/10">
        <div className="absolute inset-0 flex items-center justify-center blur-lg transition-[filter] duration-300 group-hover:blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 text-2xl font-bold text-navy">
            {profile.initial}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-navy/60 p-2 transition-transform duration-300 group-hover:scale-110">
            <Lock className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>

      <div className="p-3.5">
        {/* Name - blurred */}
        <div className="mb-2">
          <div className="h-4 w-24 rounded bg-muted blur-[6px]" />
          <div className="mt-1.5 h-3 w-32 rounded bg-muted/60 blur-[4px]" />
        </div>

        {/* Hobbies - visible */}
        <div className="flex flex-wrap gap-1.5">
          {profile.hobbies.map((hobby) => (
            <span
              key={hobby}
              className="rounded-full bg-ice-blue/40 px-2.5 py-0.5 text-[10px] font-medium text-navy"
            >
              {hobby}
            </span>
          ))}
        </div>

        {/* Route hint */}
        <p className="mt-2 text-[10px] text-text-muted">
          {profile.originCity} &rarr; {profile.destinationCity}
        </p>
      </div>
    </motion.div>
  );
}

export default function CohortPage() {
  // Simulated toast notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      toast("Priya from Pune just joined India \u2192 Germany!", {
        description: "Your cohort is growing",
        icon: <Users className="h-4 w-4 text-coral" />,
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] pb-40 md:pb-32">
      <div className="px-4 py-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-navy">Your Cohort</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Students in your intake group
          </p>
        </div>

        {/* Cohort Info Banner */}
        <motion.div
          className="mb-6 rounded-2xl bg-gradient-to-r from-navy to-navy/90 p-5 text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-ice-blue" />
            <h2 className="text-lg font-bold">
              {cohortInfo.route}, {cohortInfo.intakePeriod}
            </h2>
          </div>

          <div className="mt-3 flex flex-wrap gap-4">
            <div className="flex items-center gap-1.5 text-sm text-ice-blue/80">
              <Users className="h-4 w-4" />
              <span>
                <strong className="text-white">{cohortInfo.memberCount}</strong>{" "}
                verified students
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ice-blue/80">
              <Activity className="h-4 w-4" />
              <span>
                <strong className="text-white">{cohortInfo.activeToday}</strong>{" "}
                active today
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-ice-blue/80">
              <Calendar className="h-4 w-4" />
              <span>{cohortInfo.intakePeriod}</span>
            </div>
          </div>
        </motion.div>

        {/* Profile Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {blurredProfiles.map((profile, index) => (
            <BlurredProfileCard
              key={profile.id}
              profile={profile}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Sticky Paywall CTA */}
      <div className="fixed bottom-14 left-0 right-0 z-30 border-t border-border bg-white/95 backdrop-blur-sm md:bottom-0 md:left-64">
        <div className="mx-auto max-w-lg px-4 py-4 text-center md:px-8 md:py-5">
          <h3 className="text-base font-bold text-navy">
            Unlock your cohort. See full profiles. Start matching.
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            One-time payment. No subscription.
          </p>

          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-navy">&#8377;599</span>
              <span className="text-sm text-text-muted">one-time</span>
            </div>

            <Link href="/app/payment" className="w-full max-w-xs">
              <Button className="h-11 w-full rounded-xl bg-coral text-base font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral-hover animate-pulse-gentle">
                Unlock Now
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <style>{`
                @keyframes pulse-gentle {
                  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
                  50% { box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
                }
                .animate-pulse-gentle {
                  animation: pulse-gentle 3s ease-in-out infinite;
                }
              `}</style>
            </Link>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald" />
                Full profiles
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald" />
                Swipe & match
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-emerald" />
                Lifetime access
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
