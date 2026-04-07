"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PillSelectorProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  colorScheme?: "coral" | "navy";
  label?: string;
  required?: boolean;
  error?: string;
}

export function PillSelector({
  options,
  value,
  onChange,
  colorScheme = "coral",
  label,
  required,
  error,
}: PillSelectorProps) {
  const activeClasses =
    colorScheme === "coral"
      ? "border-coral bg-coral/10 text-coral"
      : "border-navy bg-navy/10 text-navy";

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-navy">
          {label} {required && <span className="text-coral">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(selected ? "" : option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                selected
                  ? activeClasses
                  : "border-border bg-off-white text-text-secondary hover:border-navy/30"
              )}
            >
              {selected && <Check className="h-3.5 w-3.5" />}
              {option}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
