"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MultiPhotoGridProps {
  photos: File[];
  previews: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
  minPhotos?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Image quality validation helpers
// ---------------------------------------------------------------------------

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Convert an RGBA pixel array to grayscale (single channel, same length / 4). */
function toGrayscale(data: Uint8ClampedArray, width: number, height: number): Float32Array {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

/**
 * Compute the variance of the Laplacian on a grayscale image.
 * Low variance means the image is blurry.
 */
function laplacianVariance(gray: Float32Array, width: number, height: number): number {
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      // Laplacian kernel: 0 1 0 / 1 -4 1 / 0 1 0
      const lap =
        gray[idx - width] +
        gray[idx - 1] +
        gray[idx + 1] +
        gray[idx + width] -
        4 * gray[idx];
      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

/**
 * Check whether pixel variance is very low (solid / blank image).
 * Returns true if the image appears blank.
 */
function isBlankImage(data: Uint8ClampedArray, totalPixels: number): boolean {
  let sumR = 0,
    sumG = 0,
    sumB = 0;
  let sumSqR = 0,
    sumSqG = 0,
    sumSqB = 0;

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    sumR += r;
    sumG += g;
    sumB += b;
    sumSqR += r * r;
    sumSqG += g * g;
    sumSqB += b * b;
  }

  const n = totalPixels;
  const varR = sumSqR / n - (sumR / n) ** 2;
  const varG = sumSqG / n - (sumG / n) ** 2;
  const varB = sumSqB / n - (sumB / n) ** 2;
  const avgVar = (varR + varG + varB) / 3;

  return avgVar < 10;
}

/**
 * Run all quality checks on an image file.
 * Returns null if OK, or an error message string.
 */
async function validateImageQuality(file: File): Promise<string | null> {
  const img = await loadImageFromFile(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // 1. Minimum resolution
  if (w < 200 || h < 200) {
    return "Image too small. Minimum 200x200 pixels.";
  }

  const imageData = getImageData(img);
  const { data } = imageData;
  const totalPixels = w * h;

  // 2. Blank / solid image
  if (isBlankImage(data, totalPixels)) {
    return "This doesn't appear to be a real photo.";
  }

  // 3. Blur detection via Laplacian variance
  const gray = toGrayscale(data, w, h);
  const lapVar = laplacianVariance(gray, w, h);
  if (lapVar < 100) {
    return "Image is too blurry. Please upload a clearer photo.";
  }

  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MultiPhotoGrid({
  photos,
  previews,
  onAdd,
  onRemove,
  maxPhotos = 6,
  minPhotos = 2,
  error,
}: MultiPhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Track which slot indices are currently being validated
  const [validatingSlots, setValidatingSlots] = useState<Set<number>>(new Set());

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (inputRef.current) inputRef.current.value = "";

    // First pass: basic type/size filter (same as before)
    const candidates: File[] = [];
    for (const file of files) {
      if (!["image/jpeg", "image/png"].includes(file.type)) continue;
      if (file.size > 5 * 1024 * 1024) continue;
      if (photos.length + candidates.length >= maxPhotos) break;
      candidates.push(file);
    }

    if (candidates.length === 0) return;

    // Mark upcoming slots as validating
    const startSlot = photos.length;
    const slotsToValidate = new Set(
      candidates.map((_, i) => startSlot + i)
    );
    setValidatingSlots((prev) => new Set([...prev, ...slotsToValidate]));

    // Validate each candidate in parallel
    const results = await Promise.all(
      candidates.map(async (file) => {
        try {
          const errorMsg = await validateImageQuality(file);
          return { file, errorMsg };
        } catch {
          return { file, errorMsg: "Failed to analyze image." };
        }
      })
    );

    // Clear validating state
    setValidatingSlots((prev) => {
      const next = new Set(prev);
      for (const s of slotsToValidate) next.delete(s);
      return next;
    });

    // Separate passed vs rejected
    const passed: File[] = [];
    for (const { file, errorMsg } of results) {
      if (errorMsg) {
        toast.error(errorMsg, {
          description: file.name,
        });
      } else {
        passed.push(file);
      }
    }

    if (passed.length > 0) onAdd(passed);
  }

  const slots = Array.from({ length: maxPhotos }, (_, i) => i);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-navy">
          Photos <span className="text-coral">*</span>
        </label>
        <span
          className={cn(
            "text-xs font-semibold",
            photos.length >= minPhotos ? "text-emerald" : "text-text-muted"
          )}
        >
          {photos.length}/{maxPhotos} (min {minPhotos})
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {slots.map((i) => {
          const hasPhoto = i < previews.length;
          const isRequired = i < minPhotos;
          const isValidating = validatingSlots.has(i);

          return (
            <div key={i} className="relative">
              {/* Validating spinner overlay */}
              {isValidating && !hasPhoto ? (
                <div className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border-2 border-coral/30 bg-coral/5">
                  <Loader2 className="h-6 w-6 animate-spin text-coral" />
                  <span className="mt-1.5 text-[10px] font-medium text-coral">
                    Analyzing...
                  </span>
                </div>
              ) : hasPhoto ? (
                <div className="group relative aspect-[3/4] overflow-hidden rounded-xl border-2 border-emerald/30 bg-off-white">
                  <img
                    src={previews[i]}
                    alt={`Photo ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(i)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={photos.length >= maxPhotos}
                  className={cn(
                    "flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                    i === photos.length
                      ? "border-coral/40 bg-coral/5 text-coral hover:border-coral hover:bg-coral/10"
                      : "border-border bg-off-white text-text-muted"
                  )}
                >
                  {i === photos.length ? (
                    <Plus className="h-6 w-6" />
                  ) : (
                    <Camera className="h-5 w-5 opacity-30" />
                  )}
                  {isRequired && !hasPhoto && (
                    <span className="mt-1 text-[9px] font-bold uppercase tracking-wider opacity-60">
                      Required
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
      />

      <p className="mt-2 text-xs text-text-muted">
        JPG or PNG, max 5MB each. Clear face visible in photos.
      </p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
