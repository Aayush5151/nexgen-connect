"use client";

import { useState, useCallback } from "react";
import {
  X,
  Heart,
  MapPin,
  GraduationCap,
  Languages,
  Moon,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  Frown,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import ConfettiEffect from "@/components/shared/ConfettiEffect";

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

interface ProfileCard {
  id: string;
  firstName: string;
  originCity: string;
  destinationCity: string;
  university: string;
  courseField: string;
  intakePeriod: string;
  bio: string;
  hobbies: string[];
  languages: string[];
  isNightOwl: boolean;
  isCooking: boolean;
  isNeatFreak: boolean;
  isFaceVerified: boolean;
  isLinkedinVerified: boolean;
  icebreakerText: string;
  cohortTag: string;
}

const sampleProfiles: ProfileCard[] = [
  {
    id: "1",
    firstName: "Rahul",
    originCity: "Mumbai",
    destinationCity: "Munich",
    university: "TU Munich",
    courseField: "Computer Science",
    intakePeriod: "Winter 2027",
    bio: "Chai enthusiast turned coffee convert. Looking for gym buddies and apartment-hunting partners in Munich.",
    hobbies: ["Gym", "Photography", "Cooking", "Hiking"],
    languages: ["Hindi", "English", "Basic German"],
    isNightOwl: true,
    isCooking: true,
    isNeatFreak: false,
    isFaceVerified: true,
    isLinkedinVerified: true,
    icebreakerText: "Best street food spot in Mumbai?",
    cohortTag: "From your city",
  },
  {
    id: "2",
    firstName: "Priya",
    originCity: "Bangalore",
    destinationCity: "Berlin",
    university: "TU Berlin",
    courseField: "Data Science",
    intakePeriod: "Winter 2027",
    bio: "Startup kid exploring Europe. Love board games and filter coffee debates.",
    hobbies: ["Board Games", "Running", "Reading", "Music"],
    languages: ["English", "Hindi", "Kannada"],
    isNightOwl: false,
    isCooking: true,
    isNeatFreak: true,
    isFaceVerified: true,
    isLinkedinVerified: false,
    icebreakerText: "Which is better: filter coffee or espresso?",
    cohortTag: "Same university",
  },
  {
    id: "3",
    firstName: "Arjun",
    originCity: "Delhi",
    destinationCity: "Munich",
    university: "LMU Munich",
    courseField: "Mechanical Engineering",
    intakePeriod: "Winter 2027",
    bio: "Football fanatic and amateur cook. Need someone to split groceries with.",
    hobbies: ["Football", "Cooking", "Gaming", "Travel"],
    languages: ["Hindi", "English", "Punjabi"],
    isNightOwl: true,
    isCooking: true,
    isNeatFreak: false,
    isFaceVerified: true,
    isLinkedinVerified: true,
    icebreakerText: "Messi or Ronaldo?",
    cohortTag: "Same destination",
  },
];

function LifestyleToggle({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-coral/10 text-coral"
          : "bg-muted text-text-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

const SWIPE_THRESHOLD = 100;

function SwipeableCard({
  profile,
  onSwipeLeft,
  onSwipeRight,
}: {
  profile: ProfileCard;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) {
          onSwipeRight();
        } else if (info.offset.x < -SWIPE_THRESHOLD) {
          onSwipeLeft();
        }
      }}
      initial={{ y: 40, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* LIKE overlay */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 border-emerald bg-emerald/10 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <span className="rounded-lg border-4 border-emerald px-6 py-2 text-3xl font-black uppercase text-emerald -rotate-12">
          LIKE
        </span>
      </motion.div>

      {/* NOPE overlay */}
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl border-4 border-red-500 bg-red-500/10 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <span className="rounded-lg border-4 border-red-500 px-6 py-2 text-3xl font-black uppercase text-red-500 rotate-12">
          NOPE
        </span>
      </motion.div>

      {/* Cohort badge */}
      <motion.div
        className="mb-3 flex justify-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-ice-blue/60 px-3 py-1 text-xs font-semibold text-navy">
          <MapPin className="h-3 w-3" />
          {profile.cohortTag}
        </span>
      </motion.div>

      {/* Card */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-lg">
        {/* Photo placeholder */}
        <div className="relative h-64 bg-gradient-to-br from-navy/10 via-ice-blue/30 to-coral/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-4xl font-bold text-navy">
              {profile.firstName[0]}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          {/* Name & route */}
          <div>
            <h2 className="text-xl font-bold text-navy">
              {profile.firstName} &mdash; {profile.originCity} &rarr;{" "}
              {profile.destinationCity}
            </h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
              <GraduationCap className="h-4 w-4" />
              {profile.university} &middot; {profile.courseField}
            </div>
            <p className="mt-1 text-xs text-text-muted">{profile.intakePeriod}</p>
          </div>

          {/* Bio */}
          <p className="text-sm leading-relaxed text-text-secondary">
            {profile.bio}
          </p>

          {/* Hobbies */}
          <div className="flex flex-wrap gap-2">
            {profile.hobbies.map((hobby) => (
              <span
                key={hobby}
                className="rounded-full bg-ice-blue/40 px-3 py-1 text-xs font-medium text-navy"
              >
                {hobby}
              </span>
            ))}
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-secondary">
              {profile.languages.join(", ")}
            </span>
          </div>

          {/* Lifestyle toggles */}
          <div className="flex flex-wrap gap-2">
            <LifestyleToggle
              icon={Moon}
              label="Night Owl"
              active={profile.isNightOwl}
            />
            <LifestyleToggle
              icon={UtensilsCrossed}
              label="Cooks"
              active={profile.isCooking}
            />
            <LifestyleToggle
              icon={Sparkles}
              label="Neat Freak"
              active={profile.isNeatFreak}
            />
          </div>

          {/* Icebreaker */}
          <div className="rounded-xl bg-off-white p-3">
            <p className="text-xs font-medium text-text-muted">Icebreaker</p>
            <p className="mt-0.5 text-sm font-medium text-navy">
              &ldquo;{profile.icebreakerText}&rdquo;
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-3">
            {profile.isFaceVerified && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald">
                <ShieldCheck className="h-3.5 w-3.5" />
                Face Verified
              </span>
            )}
            {profile.isLinkedinVerified && (
              <span className="flex items-center gap-1 text-xs font-medium text-[#0077B5]">
                <LinkedinIcon className="h-3.5 w-3.5" />
                LinkedIn Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MatchModal({
  currentInitial,
  matchedProfile,
  onKeepSwiping,
}: {
  currentInitial: string;
  matchedProfile: ProfileCard;
  onKeepSwiping: () => void;
}) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-xs rounded-3xl bg-white p-8 text-center shadow-2xl"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
        >
          <Heart className="mx-auto h-12 w-12 text-coral" fill="currentColor" />
        </motion.div>

        <h2 className="mt-4 text-2xl font-bold text-navy">
          It&apos;s a Match!
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          You and {matchedProfile.firstName} both showed interest
        </p>

        {/* Profile initials */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-ice-blue/30 text-2xl font-bold text-navy">
            {currentInitial}
          </div>
          <Heart className="h-6 w-6 text-coral" fill="currentColor" />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-coral/20 to-ice-blue/30 text-2xl font-bold text-navy">
            {matchedProfile.firstName[0]}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <a
            href={`https://instagram.com/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <InstagramIcon className="h-4 w-4" />
            View on Instagram
          </a>
          <button
            onClick={onKeepSwiping}
            className="w-full rounded-xl border border-border px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-muted"
          >
            Keep Swiping
          </button>
        </div>
      </motion.div>
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
        className="flex h-20 w-20 items-center justify-center rounded-full bg-ice-blue/40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 15 }}
      >
        <Frown className="h-10 w-10 text-navy/50" />
      </motion.div>
      <motion.h3
        className="mt-6 text-lg font-bold text-navy"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        No more profiles right now
      </motion.h3>
      <motion.p
        className="mt-2 max-w-xs text-sm text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Check back later for new members
      </motion.p>
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/20">
          <Bell className="h-4 w-4" />
          Notify me
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<ProfileCard | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const availableProfiles = sampleProfiles.filter(
    (p) => !swipedIds.has(p.id)
  );
  const currentProfile = availableProfiles[0] ?? null;

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentProfile) return;

      // Simulate a match on the last profile when swiping right
      const isLastProfile =
        availableProfiles.length === 1 && direction === "right";

      setSwipedIds((prev) => new Set(prev).add(currentProfile.id));
      setCurrentIndex((prev) => prev + 1);

      if (isLastProfile) {
        setMatchedProfile(currentProfile);
        setShowConfetti(true);
        setShowMatch(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
    },
    [currentProfile, availableProfiles.length]
  );

  function handleSkip() {
    handleSwipe("left");
  }

  function handleInterested() {
    handleSwipe("right");
  }

  function handleKeepSwiping() {
    setShowMatch(false);
    setMatchedProfile(null);
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <ConfettiEffect active={showConfetti} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Discover</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Find students heading your way
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentProfile ? (
          <div key="cards" className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <SwipeableCard
                key={currentProfile.id}
                profile={currentProfile}
                onSwipeLeft={handleSkip}
                onSwipeRight={handleInterested}
              />
            </AnimatePresence>

            {/* Action buttons */}
            <motion.div
              className="mt-6 flex items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-border bg-white shadow-md transition-transform hover:scale-105 hover:border-text-muted"
              >
                <X className="h-6 w-6 text-text-secondary" />
              </Button>

              <Button
                onClick={handleInterested}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-coral shadow-lg shadow-coral/30 transition-transform hover:scale-105 hover:bg-coral-hover"
              >
                <Heart className="h-7 w-7 text-white" />
              </Button>
            </motion.div>

            {/* Counter */}
            <p className="mt-4 text-xs text-text-muted">
              {currentIndex + 1} of {sampleProfiles.length} profiles today
            </p>
          </div>
        ) : (
          <EmptyState key="empty" />
        )}
      </AnimatePresence>

      {/* Match modal */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <MatchModal
            currentInitial="A"
            matchedProfile={matchedProfile}
            onKeepSwiping={handleKeepSwiping}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
