import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * DigiLocker OAuth 2.0 client.
 *
 * Spec & endpoints per the DigiLocker Partner Portal
 * (https://partners.digitallocker.gov.in). Verify against current docs
 * before production - the sandbox vs prod base URL and path versions have
 * been known to shift.
 *
 * Two modes:
 *   - MOCK_DIGILOCKER=true: skips the government round-trip entirely.
 *     Returns deterministic fake data so the UI flow is testable offline.
 *   - production: full OAuth 2.0 + PKCE (S256) exchange, eAadhaar fetch.
 *
 * Security properties:
 *   - PKCE S256 code challenge on every auth init
 *   - State parameter bound to a DB row (CSRF defense)
 *   - Nonce generated and stored, available for optional JWT verification
 *     if DigiLocker adds id_token issuance
 *   - Access tokens are never persisted - consumed in-memory during callback
 */

const AUTHORIZE_PATH = "/public/oauth2/1/authorize";
const TOKEN_PATH = "/public/oauth2/1/token";
const EAADHAAR_PATH = "/public/oauth2/3/xml/eaadhaar";

// Module flag — log once per process when MOCK_DIGILOCKER is ignored in prod.
let mock_dl_in_prod_warned = false;

/**
 * Returns true when DigiLocker should skip the government round-trip and
 * use deterministic mock data. Production refuses mocking unconditionally —
 * even a misset MOCK_DIGILOCKER=true env var is ignored. The previous
 * design honored MOCK_DIGILOCKER=true everywhere, which meant a single
 * Vercel env-var typo could synth-verify every real user's identity.
 */
export function isMockDigiLocker(): boolean {
  const inProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";
  if (inProd) {
    if (process.env.MOCK_DIGILOCKER === "true" && !mock_dl_in_prod_warned) {
      mock_dl_in_prod_warned = true;
      console.error(
        "[digilocker] MOCK_DIGILOCKER=true detected in production — IGNORING. " +
          "Mock identity verification is refused in production regardless of env state.",
      );
    }
    return false;
  }
  return process.env.MOCK_DIGILOCKER === "true";
}

/**
 * Master kill-switch. Defaults to off. In dev, MOCK_DIGILOCKER=true also
 * enables the flow so the page is clickable during development.
 */
export function isDigiLockerEnabled(): boolean {
  return process.env.DIGILOCKER_ENABLED === "true" || isMockDigiLocker();
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// ---------------------------------------------------------------------------
// PKCE + state + nonce generators
// ---------------------------------------------------------------------------

export function generateCodeVerifier(): string {
  // 32 random bytes → 43-char base64url - inside the RFC 7636 range of 43-128.
  return randomBytes(32).toString("base64url");
}

export function codeChallengeS256(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function generateState(): string {
  return randomBytes(24).toString("base64url");
}

export function generateNonce(): string {
  return randomBytes(16).toString("base64url");
}

// ---------------------------------------------------------------------------
// Authorize URL
// ---------------------------------------------------------------------------

export function buildAuthorizeUrl(params: {
  state: string;
  codeChallenge: string;
  nonce: string;
}): string {
  if (isMockDigiLocker()) {
    // Skip the government entirely. The consent page's "Continue" button
    // simply redirects to our own callback with a fake code, so the whole
    // flow round-trips without a partner account.
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const url = new URL("/api/digilocker/callback", origin);
    url.searchParams.set("code", "MOCK_CODE");
    url.searchParams.set("state", params.state);
    return url.toString();
  }

  const base = required("DIGILOCKER_BASE_URL");
  const clientId = required("DIGILOCKER_CLIENT_ID");
  const redirectUri = required("DIGILOCKER_REDIRECT_URI");

  const url = new URL(base + AUTHORIZE_PATH);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("nonce", params.nonce);
  return url.toString();
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

export type DigiLockerExchangeResult =
  | { ok: true; accessToken: string }
  | { ok: false; error: string };

export async function exchangeCodeForToken(params: {
  code: string;
  codeVerifier: string;
}): Promise<DigiLockerExchangeResult> {
  if (isMockDigiLocker()) {
    return { ok: true, accessToken: "MOCK_ACCESS_TOKEN" };
  }

  const base = required("DIGILOCKER_BASE_URL");
  const clientId = required("DIGILOCKER_CLIENT_ID");
  const clientSecret = required("DIGILOCKER_CLIENT_SECRET");
  const redirectUri = required("DIGILOCKER_REDIRECT_URI");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code_verifier: params.codeVerifier,
  });

  try {
    const res = await fetch(base + TOKEN_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) {
      return { ok: false, error: `token exchange failed: ${res.status}` };
    }
    const data = (await res.json()) as {
      access_token?: string;
      token_type?: string;
      expires_in?: number;
    };
    if (!data.access_token) {
      return { ok: false, error: "no access token in response" };
    }
    return { ok: true, accessToken: data.access_token };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "token exchange failed",
    };
  }
}

// ---------------------------------------------------------------------------
// eAadhaar fetch + parse
// ---------------------------------------------------------------------------

export type EAadhaarData = {
  name: string;
  last4: string;
  referenceId: string;
  signatureVerified: boolean;
};

export type EAadhaarResult =
  | { ok: true; data: EAadhaarData }
  | { ok: false; error: string };

export async function fetchEAadhaar(
  accessToken: string,
): Promise<EAadhaarResult> {
  if (isMockDigiLocker()) {
    return {
      ok: true,
      data: {
        name: "MOCK USER",
        last4: "1234",
        referenceId: `MOCK-${Date.now().toString(36).toUpperCase()}`,
        signatureVerified: true,
      },
    };
  }

  const base = required("DIGILOCKER_BASE_URL");

  try {
    const res = await fetch(base + EAADHAAR_PATH, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      return { ok: false, error: `eAadhaar fetch failed: ${res.status}` };
    }
    const xml = await res.text();

    // XMLDSig verification — see verifyEAadhaarSignature below. In
    // production, `signatureVerified=false` MUST cause the callback route
    // to refuse to flip identity_status=verified. The previous design
    // trusted the TLS channel only, which let a compromised partner
    // egress mint forged identity claims.
    const signatureVerified = await verifyEAadhaarSignature(xml);

    const parsed = parseEAadhaarXml(xml);
    if (!parsed) return { ok: false, error: "could not parse eAadhaar XML" };

    return { ok: true, data: { ...parsed, signatureVerified } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "eAadhaar fetch failed",
    };
  }
}

/**
 * Minimal regex-based extractor. The eAadhaar XML is stable per the UIDAI
 * spec but a proper DOM parse (via fast-xml-parser) would be more robust
 * for V2. We only extract the fields we actually store.
 */
function parseEAadhaarXml(xml: string): EAadhaarData | null {
  const nameMatch = xml.match(/<Person[^>]*\bname="([^"]+)"/i);
  const uidMatch = xml.match(/\buid="(\d{4})(\d{4})(\d{4})"/);
  const refMatch =
    xml.match(/<KycRes[^>]*\btxn="([^"]+)"/i) ||
    xml.match(/\bref(?:erence)?="([^"]+)"/i);

  if (!nameMatch || !uidMatch) return null;
  const last4 = uidMatch[3];
  return {
    name: nameMatch[1],
    last4,
    referenceId: refMatch ? refMatch[1] : `UNKNOWN-${last4}`,
    // signatureVerified is set by the caller in fetchEAadhaar() via
    // verifyEAadhaarSignature() — defaulting to false here is correct.
    signatureVerified: false,
  };
}

/**
 * Verify the XMLDSig embedded in an eAadhaar response against UIDAI's
 * public certificate.
 *
 * UIDAI publishes its signing certificate at https://uidai.gov.in/
 * (rotated periodically). The PEM-encoded cert MUST be present in
 * UIDAI_PUBLIC_CERT_PEM as an env var. Without it, this function
 * fails-closed (returns false) — and the callback route refuses to
 * mark identity_status=verified.
 *
 * Implementation strategy:
 *   - In production, require UIDAI_PUBLIC_CERT_PEM AND a working xml-crypto
 *     install. If either is missing, log loudly and return false.
 *   - In dev (non-prod), if xml-crypto is missing the function returns
 *     false but does NOT crash — local development without the optional
 *     dep installed remains workable, and the callback route's prod-only
 *     verification gate (verifyIdentityRequiresSignature) prevents
 *     unsafe dev behavior from leaking to prod.
 *
 * xml-crypto is added as an optional dep so projects without DigiLocker
 * configured don't pay the install cost.
 */
async function verifyEAadhaarSignature(xml: string): Promise<boolean> {
  const certPem = process.env.UIDAI_PUBLIC_CERT_PEM;
  if (!certPem) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[digilocker] UIDAI_PUBLIC_CERT_PEM not set in production. " +
          "Refusing to mark identity verified without signature check.",
      );
    }
    return false;
  }

  // Lazy import — xml-crypto is an optional dep. If it's not installed,
  // log once and fail-closed. ESM dynamic import is used so the bundler
  // doesn't try to resolve the module at build time when it's absent.
  let xmlCrypto: {
    SignedXml: new (opts: {
      idMode?: string;
      getCertFromKeyInfo?: () => string;
    }) => {
      loadSignature(node: string): void;
      checkSignature(xml: string): boolean;
      validationErrors: unknown[];
    };
  };
  try {
    // @ts-expect-error xml-crypto is optional; types resolve at runtime when present
    xmlCrypto = await import("xml-crypto");
  } catch {
    if (!xml_crypto_missing_warned) {
      xml_crypto_missing_warned = true;
      console.error(
        "[digilocker] xml-crypto not installed. Run `npm i xml-crypto` to enable " +
          "XMLDSig verification. Failing closed.",
      );
    }
    return false;
  }

  try {
    // SignedXml expects the cert as `getCertFromKeyInfo`/`getKey` callback.
    const sig = new xmlCrypto.SignedXml({
      idMode: "wssecurity",
      getCertFromKeyInfo: () => certPem,
    });
    // Locate the <Signature> element within the eAadhaar response.
    const sigNode = findSignatureNode(xml);
    if (!sigNode) return false;
    sig.loadSignature(sigNode);
    const valid = sig.checkSignature(xml);
    if (!valid) {
      console.warn("[digilocker] eAadhaar XMLDSig FAILED:", sig.validationErrors);
    }
    return valid;
  } catch (err) {
    console.error(
      "[digilocker] XMLDSig verify threw:",
      err instanceof Error ? err.message : err,
    );
    return false;
  }
}
let xml_crypto_missing_warned = false;

/** Extract the <Signature>…</Signature> block as a string for xml-crypto.
 *  We don't DOM-parse here because xml-crypto accepts a serialized
 *  signature string; the full XML body is fed to checkSignature() to
 *  recompute the digest. Returns null if no signature element is found. */
function findSignatureNode(xml: string): string | null {
  const match = xml.match(/<Signature[\s\S]*?<\/Signature>/);
  return match ? match[0] : null;
}

// ---------------------------------------------------------------------------
// Name matching
// ---------------------------------------------------------------------------

/**
 * Soft token-overlap name match. Aadhaar returns a full legal name
 * ("RAHUL KUMAR SHARMA"); the waitlist stores what the user typed
 * ("Rahul"). We accept if any waitlist token appears in Aadhaar's tokens.
 *
 * Strict equality fails too often on Indian naming conventions (multiple
 * given names, order variance, initials). This is a conservative middle
 * ground. Manual admit-letter review still happens at step 3 so this
 * isn't the only defense against impersonation.
 */
export function namesMatch(
  aadhaarName: string,
  waitlistFirstName: string,
): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);

  const a = new Set(norm(aadhaarName));
  const w = norm(waitlistFirstName);
  if (w.length === 0) return false;
  return w.some((tok) => a.has(tok));
}
