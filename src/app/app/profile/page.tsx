"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Languages,
  Moon,
  UtensilsCrossed,
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Pencil,
  UserCircle,
} from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import { Button } from "@/components/ui/button";

const profileData = {
  firstName: "Aayush Shah",
  bio: "Builder, runner, and chai addict. Excited to explore Munich and connect with fellow students making the move.",
  photoUrls: [
    "/photos/aayush-1.jpg",
    "/photos/aayush-2.jpg",
    "/photos/aayush-3.jpg",
  ],
  dateOfBirth: "2003-06-15",
  gender: "Male",
  religion: "Hindu",
  originCity: "Mumbai",
  destinationCountry: "Germany",
  destinationCity: "Munich",
  university: "TU Munich",
  courseField: "Computer Science",
  intakePeriod: "Winter 2027",
  hobbies: ["Running", "Tech", "Cooking"],
  languages: ["English", "Hindi", "Gujarati"],
  isNightOwl: false,
  isCooking: true,
  isNeatFreak: true,
  icebreakerText: "What's the first thing you're eating when you land in Germany?",
  isFaceVerified: true,
  isLinkedinVerified: true,
};

function calculateAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
        active ? "bg-coral/10 text-coral" : "bg-muted text-text-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

export default function ProfilePage() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Your Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">
            This is how others see you
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border/50 bg-white shadow-lg">
        {/* Photo Gallery */}
        <div className="relative">
          {profileData.photoUrls.length > 0 ? (
            <div>
              {/* Main photo */}
              <div className="relative h-52 bg-gradient-to-br from-navy/10 via-ice-blue/30 to-coral/10 sm:h-64">
                <img
                  src={profileData.photoUrls[selectedPhotoIndex]}
                  alt={`${profileData.firstName} photo ${selectedPhotoIndex + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-4xl font-bold text-navy shadow-md">
                    {profileData.firstName[0]}
                  </div>
                </div>
              </div>
              {/* Thumbnails */}
              {profileData.photoUrls.length > 1 && (
                <div className="flex gap-2 px-5 pt-3">
                  {profileData.photoUrls.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(i)}
                      className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                        i === selectedPhotoIndex
                          ? "border-coral shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.style.display = "none";
                          el.parentElement!.classList.add(
                            "bg-gradient-to-br",
                            "from-navy/10",
                            "to-coral/10",
                            "flex",
                            "items-center",
                            "justify-center"
                          );
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-52 bg-gradient-to-br from-navy/10 via-ice-blue/30 to-coral/10 sm:h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/80 text-4xl font-bold text-navy shadow-md">
                  {profileData.firstName[0]}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* Name */}
          <div>
            <h2 className="text-xl font-bold text-navy">
              {profileData.firstName}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {profileData.bio}
            </p>
          </div>

          {/* Personal Details */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Personal Details
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Calendar className="h-4 w-4 text-coral" />
                {calculateAge(profileData.dateOfBirth)} years old
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <UserCircle className="h-4 w-4 text-navy" />
                {profileData.gender}
              </div>
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <UserCircle className="h-4 w-4 text-text-muted" />
                {profileData.religion}
              </div>
            </div>
          </div>

          {/* Route & University */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 text-coral" />
              {profileData.originCity} &rarr; {profileData.destinationCountry}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <GraduationCap className="h-4 w-4 text-navy" />
              {profileData.university} &middot; {profileData.courseField}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4 text-text-muted" />
              {profileData.intakePeriod}
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Hobbies
            </p>
            <div className="flex flex-wrap gap-2">
              {profileData.hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="rounded-full bg-ice-blue/40 px-3 py-1 text-xs font-medium text-navy"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-text-muted" />
            <span className="text-sm text-text-secondary">
              {profileData.languages.join(", ")}
            </span>
          </div>

          {/* Lifestyle */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Lifestyle
            </p>
            <div className="flex flex-wrap gap-2">
              <LifestyleToggle
                icon={Moon}
                label="Night Owl"
                active={profileData.isNightOwl}
              />
              <LifestyleToggle
                icon={UtensilsCrossed}
                label="Cooks"
                active={profileData.isCooking}
              />
              <LifestyleToggle
                icon={Sparkles}
                label="Neat Freak"
                active={profileData.isNeatFreak}
              />
            </div>
          </div>

          {/* Icebreaker */}
          <div className="rounded-xl bg-off-white p-4">
            <p className="text-xs font-medium text-text-muted">
              Your Icebreaker
            </p>
            <p className="mt-1 text-sm font-medium text-navy">
              &ldquo;{profileData.icebreakerText}&rdquo;
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4">
            {profileData.isFaceVerified && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald">
                <ShieldCheck className="h-4 w-4" />
                Face Verified
              </span>
            )}
            {profileData.isLinkedinVerified && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#0077B5]">
                <LinkedinIcon className="h-4 w-4" />
                LinkedIn Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit button */}
      <div className="mx-auto mt-6 max-w-md">
        <Link href="/app/profile/edit" className="block">
          <Button className="h-11 w-full rounded-xl bg-navy text-sm font-semibold text-white hover:bg-navy/90">
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
