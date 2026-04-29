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

export function isMockDigiLocker(): boolean {
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

    // TODO(security): full XMLDSig validation before production launch.
    // DigiLocker returns XML with an embedded <Signature> per the W3C
    // XMLDSig spec. Today we rely on the TLS channel to DigiLocker;
    // pre-launch we should verify the signature against UIDAI's public
    // key to block forged callbacks from a compromised partner server.
    const parsed = parseEAadhaarXml(xml);
    if (!parsed) return { ok: false, error: "could not parse eAadhaar XML" };

    return { ok: true, data: parsed };
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
    signatureVerified: false,
  };
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
