import "server-only";

/**
 * Cloudflare Images client — admit-letter upload.
 *
 * Two modes:
 *   - mock: when CLOUDFLARE_IMAGES_API_TOKEN is unset, returns a fake
 *     signed-upload URL. The client never actually PUTs the file.
 *   - real: requests a one-time direct-creator-upload URL from the
 *     Cloudflare Images API. The client PUTs the bytes directly to
 *     Cloudflare; our server is never the upload conduit.
 *
 * Why direct-creator-upload (not a Worker-mediated stream): keeps
 * 4-MB payloads off our function memory, off our Vercel egress, and
 * makes the upload itself cancellable.
 *
 * Stop condition (v16 §Bucket 6): can't verify without an account
 * token + custom domain bound to images. Code path is fail-closed in
 * production if either env var is missing.
 *
 * v16 web pivot §Bucket 6.
 */

const FETCH_TIMEOUT_MS = 8_000;

export function isMockCloudflareImages(): boolean {
  if (process.env.MOCK_CLOUDFLARE_IMAGES === "true") return true;
  const inProd = process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
  if (inProd) return false;
  if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_IMAGES_API_TOKEN) {
    if (!warned) {
      warned = true;
      console.warn(
        "[cf-images] no credentials configured, falling back to mock signed-upload URL. " +
          "Set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_IMAGES_API_TOKEN to use the real API.",
      );
    }
    return true;
  }
  return false;
}
let warned = false;

export type SignUploadInput = {
  /** Image MIME type — JPEG/PNG/PDF only (PDF goes through a separate */
  /** flow when CF Images doesn't accept PDF; this scaffolds the JPEG/PNG path). */
  mimeType: string;
  /** Bytes — for the size cap and audit trail. */
  fileSizeBytes: number;
  /** Owner identity — bound to the upload as metadata. */
  ownerId: string;
};

export type SignUploadResult =
  | {
      ok: true;
      mock: boolean;
      uploadUrl: string;
      imageId: string;
      /** Caller stores this so /complete can correlate. */
      retentionMinutesAfterReview: number;
    }
  | { ok: false; error: string };

export async function signUpload(input: SignUploadInput): Promise<SignUploadResult> {
  if (input.fileSizeBytes > 8 * 1024 * 1024) {
    return { ok: false, error: "File over 8 MB, please re-upload a smaller image." };
  }
  if (!["image/jpeg", "image/png", "application/pdf"].includes(input.mimeType)) {
    return { ok: false, error: "Only JPEG, PNG, or PDF up to 8 MB." };
  }

  if (isMockCloudflareImages()) {
    return {
      ok: true,
      mock: true,
      uploadUrl: "/api/admit/mock-upload-target",
      imageId: `mock_img_${Date.now()}`,
      retentionMinutesAfterReview: 60,
    };
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_IMAGES_API_TOKEN;
  if (!accountId || !token) {
    return { ok: false, error: "Image upload not configured." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    // Cloudflare Images direct-creator-upload endpoint.
    // https://developers.cloudflare.com/images/upload-images/direct-creator-upload/
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`;
    const formData = new FormData();
    formData.set("requireSignedURLs", "true");
    formData.set("metadata", JSON.stringify({ ownerId: input.ownerId, kind: "admit_letter" }));

    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      console.error(`[cf-images.sign] status=${res.status}`);
      return { ok: false, error: "Couldn't prepare upload. Try again." };
    }
    const body = (await res.json()) as {
      result?: { id?: string; uploadURL?: string };
      success?: boolean;
    };
    if (!body.success || !body.result?.uploadURL || !body.result.id) {
      return { ok: false, error: "Invalid upload response." };
    }
    return {
      ok: true,
      mock: false,
      uploadUrl: body.result.uploadURL,
      imageId: body.result.id,
      retentionMinutesAfterReview: 60,
    };
  } catch (err) {
    console.error("[cf-images.sign] threw:", err instanceof Error ? err.message : err);
    return { ok: false, error: "Upload service timed out." };
  } finally {
    clearTimeout(timer);
  }
}
