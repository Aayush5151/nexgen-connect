"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Moon,
  UtensilsCrossed,
  Sparkles,
  Save,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiPhotoGrid } from "@/components/shared/MultiPhotoGrid";
import { PillSelector } from "@/components/shared/PillSelector";
import { GENDER_OPTIONS, RELIGION_OPTIONS } from "@/lib/constants/indian-cities";

const BIO_MAX_LENGTH = 200;

const HOBBY_OPTIONS = [
  "Gym",
  "Photography",
  "Cooking",
  "Hiking",
  "Music",
  "Travel",
  "Reading",
  "Gaming",
  "Football",
  "Cricket",
  "Running",
  "Dance",
  "Art",
  "Movies",
  "Yoga",
  "Tech",
  "Board Games",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Gujarati",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali",
  "Punjabi",
  "German",
  "French",
  "Spanish",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
      {children}
    </h3>
  );
}

export default function EditProfilePage() {
  const [firstName, setFirstName] = useState("Aayush");
  const [bio, setBio] = useState(
    "Builder, runner, and chai addict. Excited to explore Munich and connect with fellow students making the move."
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [dateOfBirth, setDateOfBirth] = useState("2003-06-15");
  const [gender, setGender] = useState("Male");
  const [religion, setReligion] = useState("Hindu");
  const [hobbies, setHobbies] = useState<string[]>([
    "Running",
    "Tech",
    "Cooking",
  ]);
  const [languages, setLanguages] = useState<string[]>([
    "English",
    "Hindi",
    "Gujarati",
  ]);
  const [isNightOwl, setIsNightOwl] = useState(false);
  const [isCooking, setIsCooking] = useState(true);
  const [isNeatFreak, setIsNeatFreak] = useState(true);
  const [icebreaker, setIcebreaker] = useState(
    "What's the first thing you're eating when you land in Germany?"
  );
  const [instagramHandle, setInstagramHandle] = useState("aayush.shah");
  const [linkedinUrl, setLinkedinUrl] = useState(
    "https://linkedin.com/in/aayushshah"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAddPhotos = useCallback(
    (files: File[]) => {
      const newPhotos = [...photos, ...files];
      setPhotos(newPhotos);
      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setPhotoPreviews((prev) => [...prev, ...newPreviews]);
    },
    [photos]
  );

  const handleRemovePhoto = useCallback(
    (index: number) => {
      URL.revokeObjectURL(photoPreviews[index]);
      setPhotos((prev) => prev.filter((_, i) => i !== index));
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [photoPreviews]
  );

  function toggleHobby(hobby: string) {
    setHobbies((prev) =>
      prev.includes(hobby)
        ? prev.filter((h) => h !== hobby)
        : prev.length < 5
          ? [...prev, hobby]
          : prev
    );
  }

  function toggleLanguage(lang: string) {
    setLanguages((prev) =>
      prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang]
    );
  }

  function handleSave() {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  }

  return (
    <div className="px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/app/profile"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/80"
        >
          <ArrowLeft className="h-5 w-5 text-navy" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-navy">Edit Profile</h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Update your information
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-8">
        {/* Photo Upload - MultiPhotoGrid */}
        <div>
          <SectionTitle>Photos</SectionTitle>
          <MultiPhotoGrid
            photos={photos}
            previews={photoPreviews}
            onAdd={handleAddPhotos}
            onRemove={handleRemovePhoto}
            maxPhotos={6}
            minPhotos={2}
          />
        </div>

        {/* First Name */}
        <div>
          <SectionTitle>First Name</SectionTitle>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className="h-10 rounded-xl"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <SectionTitle>Date of Birth</SectionTitle>
          <Input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>

        {/* Gender */}
        <div>
          <SectionTitle>Gender</SectionTitle>
          <PillSelector
            options={GENDER_OPTIONS}
            value={gender}
            onChange={setGender}
            colorScheme="coral"
          />
        </div>

        {/* Religion */}
        <div>
          <SectionTitle>Religion</SectionTitle>
          <PillSelector
            options={RELIGION_OPTIONS}
            value={religion}
            onChange={setReligion}
            colorScheme="navy"
          />
        </div>

        {/* Bio */}
        <div>
          <SectionTitle>Bio</SectionTitle>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
              placeholder="Tell people about yourself..."
              rows={3}
              className="w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm transition-colors placeholder:text-text-muted focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <span
              className={`absolute bottom-2 right-3 text-xs ${
                bio.length >= BIO_MAX_LENGTH
                  ? "text-coral"
                  : "text-text-muted"
              }`}
            >
              {bio.length}/{BIO_MAX_LENGTH}
            </span>
          </div>
        </div>

        {/* Hobbies */}
        <div>
          <SectionTitle>
            Hobbies{" "}
            <span className="text-text-muted font-normal normal-case tracking-normal">
              (pick up to 5)
            </span>
          </SectionTitle>
          <div className="flex flex-wrap gap-2">
            {HOBBY_OPTIONS.map((hobby) => {
              const selected = hobbies.includes(hobby);
              return (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => toggleHobby(hobby)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-coral text-white"
                      : "bg-ice-blue/30 text-navy hover:bg-ice-blue/50"
                  }`}
                >
                  {selected && <span className="mr-1">&times;</span>}
                  {hobby}
                </button>
              );
            })}
          </div>
        </div>

        {/* Languages */}
        <div>
          <SectionTitle>Languages</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => {
              const selected = languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selected
                      ? "bg-navy text-white"
                      : "bg-muted text-text-secondary hover:bg-muted/80"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lifestyle Toggles */}
        <div>
          <SectionTitle>Lifestyle</SectionTitle>
          <div className="space-y-3">
            <LifestyleToggleRow
              icon={Moon}
              label="Night Owl"
              description="I stay up late and sleep in"
              active={isNightOwl}
              onToggle={() => setIsNightOwl(!isNightOwl)}
            />
            <LifestyleToggleRow
              icon={UtensilsCrossed}
              label="I Cook"
              description="I enjoy cooking meals"
              active={isCooking}
              onToggle={() => setIsCooking(!isCooking)}
            />
            <LifestyleToggleRow
              icon={Sparkles}
              label="Neat Freak"
              description="I keep my space tidy"
              active={isNeatFreak}
              onToggle={() => setIsNeatFreak(!isNeatFreak)}
            />
          </div>
        </div>

        {/* Icebreaker */}
        <div>
          <SectionTitle>Icebreaker Question</SectionTitle>
          <Input
            value={icebreaker}
            onChange={(e) => setIcebreaker(e.target.value)}
            placeholder="Ask something fun..."
            className="h-10 rounded-xl"
          />
          <p className="mt-1.5 text-[10px] text-text-muted">
            This appears on your profile to spark conversation.
          </p>
        </div>

        {/* Social Links */}
        <div>
          <SectionTitle>Social Links</SectionTitle>
          <div className="space-y-3">
            <div className="relative">
              <InstagramIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="Instagram handle (without @)"
                className="h-10 rounded-xl pl-10"
              />
            </div>
            <div className="relative">
              <LinkedinIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="LinkedIn profile URL"
                className="h-10 rounded-xl pl-10"
              />
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-text-muted">
            Social links are only revealed to your matches.
          </p>
        </div>

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 w-full rounded-xl bg-coral text-sm font-semibold text-white shadow-lg shadow-coral/20 hover:bg-coral-hover disabled:opacity-70"
        >
          {isSaving ? (
            "Saving..."
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function LifestyleToggleRow({
  icon: Icon,
  label,
  description,
  active,
  onToggle,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-white p-3 text-left transition-colors hover:bg-off-white"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-coral/10" : "bg-muted"
        }`}
      >
        <Icon
          className={`h-5 w-5 ${active ? "text-coral" : "text-text-muted"}`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
      {/* Toggle switch */}
      <div
        className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
          active ? "bg-coral" : "bg-muted"
        }`}
      >
        <div
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
