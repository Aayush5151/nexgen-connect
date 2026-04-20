/**
 * Next.js instrumentation hook.
 *
 * Runs once per cold start in each environment (dev, preview, prod). We use
 * it to surface env-configuration issues LOUDLY in server logs so a prod
 * deployment that's missing a secret or shipping with MOCK_OTP=true can't
 * hide.
 *
 * https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */

export async function register() {
  // Only run on the Node runtime — edge has no filesystem / limited runtime.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { runEnvChecks } = await import("./src/lib/env");
  try {
    runEnvChecks();
  } catch (err) {
    console.error("[instrumentation] env check threw:", err);
  }
}
