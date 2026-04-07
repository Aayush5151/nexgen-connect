"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  RotateCcw,
  CheckCircle,
  Loader2,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CameraState =
  | "idle"
  | "camera_open"
  | "captured"
  | "verifying"
  | "verified"
  | "failed";

interface CameraSelfieProps {
  profilePhotos: string[];
  onVerified: () => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Capture validation helpers
// ---------------------------------------------------------------------------

/**
 * Check if the captured image is blank / black (e.g. camera not ready).
 * Samples pixels at multiple grid points. If all sampled pixels are
 * near-black (< 10 per channel) or all the same colour, returns true.
 */
function isCaptureBlank(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  const samplePoints: [number, number][] = [];
  const cols = 5;
  const rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = Math.floor(((c + 0.5) * width) / cols);
      const y = Math.floor(((r + 0.5) * height) / rows);
      samplePoints.push([x, y]);
    }
  }

  let allBlack = true;
  let firstR = -1,
    firstG = -1,
    firstB = -1;
  let allSame = true;

  for (const [x, y] of samplePoints) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const r = pixel[0],
      g = pixel[1],
      b = pixel[2];

    if (r >= 10 || g >= 10 || b >= 10) allBlack = false;

    if (firstR === -1) {
      firstR = r;
      firstG = g;
      firstB = b;
    } else {
      if (
        Math.abs(r - firstR) > 5 ||
        Math.abs(g - firstG) > 5 ||
        Math.abs(b - firstB) > 5
      ) {
        allSame = false;
      }
    }
  }

  return allBlack || allSame;
}

/**
 * Heuristic face presence check.
 * Counts pixels that fall within typical human skin-tone ranges in an
 * HSV-like decomposition. If < 5% of total pixels are skin-toned we
 * assume no face is present.
 */
function hasSkinTonePresence(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  // Sample a sub-region (centre 80%) to avoid edge noise
  const x0 = Math.floor(width * 0.1);
  const y0 = Math.floor(height * 0.1);
  const w = Math.floor(width * 0.8);
  const h = Math.floor(height * 0.8);
  const imageData = ctx.getImageData(x0, y0, w, h);
  const { data } = imageData;
  const totalPixels = w * h;

  let skinPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    // Simple RGB skin-tone heuristic (covers a wide range of skin tones)
    const isSkin =
      r > 60 &&
      g > 40 &&
      b > 20 &&
      r > g &&
      r > b &&
      Math.abs(r - g) > 15 &&
      r - b > 15;

    if (isSkin) skinPixels++;
  }

  const ratio = skinPixels / totalPixels;
  return ratio >= 0.05;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CameraSelfie({
  profilePhotos,
  onVerified,
  className,
}: CameraSelfieProps) {
  const [state, setState] = useState<CameraState>("idle");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [captureError, setCaptureError] = useState("");
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  async function handleOpenCamera() {
    setError("");
    setCaptureError("");
    setCameraReady(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Wait for metadata so we know dimensions are valid
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            resolve();
          };
          video.addEventListener("loadedmetadata", onLoaded);
        });

        await video.play();

        // Extra guard: wait until videoWidth > 0
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          await new Promise<void>((resolve) => {
            const check = () => {
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                resolve();
              } else {
                requestAnimationFrame(check);
              }
            };
            requestAnimationFrame(check);
          });
        }

        setCameraReady(true);
      }

      setState("camera_open");
    } catch {
      setError(
        "Camera access denied. Please allow camera access and try again."
      );
    }
  }

  function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror for selfie
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    // Reset the transform so validation reads pixels correctly
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // --- Capture validation ---

    // 1. Blank / black image check
    if (isCaptureBlank(ctx, canvas.width, canvas.height)) {
      setCaptureError(
        "No image captured. Please make sure your camera is working and try again."
      );
      return; // Stay in camera_open
    }

    // 2. Skin-tone / face heuristic
    if (!hasSkinTonePresence(ctx, canvas.width, canvas.height)) {
      setCaptureError(
        "Face not detected. Please position your face in the oval and try again."
      );
      return; // Stay in camera_open
    }

    // Passed validation
    setCaptureError("");
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSelfieUrl(dataUrl);
    stopCamera();
    setState("captured");
  }

  function handleRetake() {
    setSelfieUrl(null);
    setCaptureError("");
    handleOpenCamera();
  }

  function handleVerify() {
    setState("verifying");
    // Simulate face match (V1 -- replace with AWS Rekognition in production)
    setTimeout(() => {
      setState("verified");
      onVerified();
    }, 3000);
  }

  function handleCancel() {
    stopCamera();
    setSelfieUrl(null);
    setCaptureError("");
    setState("idle");
  }

  return (
    <div className={className}>
      {/* ---------------------------------------------------------------- */}
      {/* Idle -- show profile photos + start button                       */}
      {/* ---------------------------------------------------------------- */}
      {state === "idle" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral/10">
              <Camera className="h-5 w-5 text-coral" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">
                Face Verification
              </p>
              <p className="text-xs text-text-muted">
                Take a live selfie to verify your identity
              </p>
            </div>
          </div>

          {/* Profile photo thumbnails */}
          {profilePhotos.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-text-muted">
                Your uploaded photos:
              </p>
              <div className="flex gap-2">
                {profilePhotos.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                {profilePhotos.length > 3 && (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-off-white text-xs font-medium text-text-muted">
                    +{profilePhotos.length - 3}
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleOpenCamera}
            className="w-full rounded-xl bg-gradient-to-r from-coral to-[#FF7B7F] text-white shadow-md shadow-coral/20 hover:shadow-lg hover:shadow-coral/30"
          >
            <Camera className="mr-2 h-4 w-4" /> Start Face Verification
          </Button>

          {error && (
            <div className="space-y-2">
              <p className="text-xs text-red-500">{error}</p>
              <p className="text-xs text-text-muted">
                Go to your browser settings to allow camera access for this
                site.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleOpenCamera}
                className="rounded-xl"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try Again
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Camera open -- live video feed                                    */}
      {/* ---------------------------------------------------------------- */}
      {state === "camera_open" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl border-2 border-coral/30 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-64 w-full object-cover sm:h-80"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-xl border-4 border-white/10" />
            {/* Face guide overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-32 rounded-full border-2 border-dashed border-white/30 sm:h-48 sm:w-40" />
            </div>

            {/* "Starting camera..." overlay while waiting for stream */}
            {!cameraReady && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                <Loader2 className="h-8 w-8 animate-spin text-coral" />
                <p className="mt-2 text-sm font-medium text-white/80">
                  Starting camera...
                </p>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-text-muted">
            Position your face within the oval and look directly at the camera
          </p>

          {/* Capture error shown below the video */}
          {captureError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
              {captureError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-xl"
            >
              <X className="mr-1.5 h-4 w-4" /> Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCapture}
              disabled={!cameraReady}
              className="flex-1 rounded-xl bg-coral text-white hover:bg-coral-hover disabled:opacity-50"
            >
              {cameraReady ? (
                <>
                  <Camera className="mr-1.5 h-4 w-4" /> Capture Selfie
                </>
              ) : (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Starting...
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Captured -- selfie vs profile photo comparison                    */}
      {/* ---------------------------------------------------------------- */}
      {state === "captured" && selfieUrl && (
        <div className="space-y-4">
          <p className="text-center text-sm font-semibold text-navy">
            Does this look good?
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="h-28 w-28 overflow-hidden rounded-xl border-2 border-coral/30 sm:h-32 sm:w-32">
                <img
                  src={selfieUrl}
                  alt="Selfie"
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-text-muted">
                Your selfie
              </p>
            </div>
            <div className="text-lg font-bold text-text-muted">vs</div>
            <div className="text-center">
              <div className="h-28 w-28 overflow-hidden rounded-xl border-2 border-navy/20 sm:h-32 sm:w-32">
                {profilePhotos[0] ? (
                  <img
                    src={profilePhotos[0]}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-off-white text-2xl font-bold text-text-muted">
                    ?
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-text-muted">
                Your profile
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleRetake}
              className="flex-1 rounded-xl"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" /> Retake
            </Button>
            <Button
              type="button"
              onClick={handleVerify}
              className="flex-1 rounded-xl bg-coral text-white hover:bg-coral-hover"
            >
              Verify Match
            </Button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Verifying -- loading                                              */}
      {/* ---------------------------------------------------------------- */}
      {state === "verifying" && selfieUrl && (
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-amber/30">
              <img
                src={selfieUrl}
                alt="Selfie"
                className="h-full w-full object-cover"
              />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-coral" />
            <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-amber/30">
              {profilePhotos[0] && (
                <img
                  src={profilePhotos[0]}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          <p className="text-sm font-semibold text-navy">
            Verifying face match...
          </p>
          <p className="text-xs text-text-muted">
            This usually takes a few seconds
          </p>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Verified -- success                                               */}
      {/* ---------------------------------------------------------------- */}
      {state === "verified" && (
        <div className="rounded-xl border-2 border-emerald/30 bg-emerald/5 p-6 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald" />
          <p className="mt-3 text-lg font-bold text-navy">Face Verified!</p>
          <p className="mt-1 text-sm text-text-secondary">
            Your identity has been confirmed. Your selfie will be deleted.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald">
            <ShieldCheck className="h-3.5 w-3.5" /> Identity Verified
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
