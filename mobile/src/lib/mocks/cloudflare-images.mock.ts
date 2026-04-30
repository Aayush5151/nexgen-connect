/**
 * Cloudflare Images — mock client.
 *
 * v15 BP §13 — avatar + admit-letter PDF + crisis-resource image
 * delivery. Real implementation uses Cloudflare Images delivery URLs
 * (https://imagedelivery.net/{accountHash}/{imageId}/{variant}).
 *
 * Mock: returns local placeholder URLs (data: URI for tiny images,
 * https:// for larger placeholders via picsum.photos for variety).
 * Drop-in API for the methods the app uses: getDeliveryUrl, upload.
 *
 * Note: v6 spec delegates avatars + admit PDFs to Supabase Storage.
 * Cloudflare Images is for marketing-side imagery not user uploads.
 * Listed here for completeness.
 */

export type ImageVariant = "thumb" | "card" | "hero";

const dimensions: Record<ImageVariant, { w: number; h: number }> = {
  thumb: { w: 64, h: 64 },
  card: { w: 480, h: 320 },
  hero: { w: 1200, h: 630 },
};

export const cloudflareImagesMock = {
  /** Compute the delivery URL for an imageId+variant. Mock returns a
   *  picsum.photos URL with a deterministic seed for stable testing. */
  getDeliveryUrl(imageId: string, variant: ImageVariant): string {
    const { w, h } = dimensions[variant];
    // Use the first 6 chars of imageId as the picsum seed for stability.
    const seed = imageId.slice(0, 6);
    return `https://picsum.photos/seed/${seed}/${w}/${h}`;
  },

  /** Mock upload — returns a fake imageId. Real impl POSTs to
   *  Cloudflare's /v1/upload endpoint with the auth token. */
  async upload(input: {
    file: { uri: string; mimeType: string };
  }): Promise<{ imageId: string; deliveryUrlBase: string }> {
    void input;
    const imageId = `img_${Math.random().toString(36).slice(2, 16)}`;
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            imageId,
            deliveryUrlBase: `https://imagedelivery.net/MOCK/${imageId}`,
          }),
        500,
      ),
    );
  },
};

export type CloudflareImagesClient = typeof cloudflareImagesMock;
