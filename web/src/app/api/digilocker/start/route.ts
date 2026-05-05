import { NextResponse } from "next/server";

import { isDigiLockerEnabled, isMockDigiLocker } from "@/lib/digilocker";

/**
 * GET /api/digilocker/start
 *
 * Initiates the DigiLocker OAuth handshake. The full PKCE / state flow
 * lives in the existing v15 module (`src/lib/digilocker.ts`) and the
 * existing callback route (`/api/digilocker/callback`).
 *
 * For Bucket 6 we expose a thin start-route the new signup funnel can
 * link to. When MOCK_DIGILOCKER=true we hand back a fake authUrl that
 * round-trips to the success page locally.
 *
 * Output: { authUrl, state }
 *
 * v16 web pivot §Bucket 6.
 */

export async function GET() {
  if (!isDigiLockerEnabled()) {
    return NextResponse.json(
      { error: "E031:digilocker_disabled" },
      { status: 503 },
    );
  }

  if (isMockDigiLocker()) {
    return NextResponse.json({
      authUrl: "/signup/identity/callback?mock=success",
      state: "mock-digilocker-state",
      mock: true,
    });
  }

  // Real path: builds the PKCE-bound authorize URL. Bucket 7 wires the
  // full state-row persistence + cookie-set; here we return a 501 so
  // production can't silently no-op.
  return NextResponse.json(
    { error: "E031:digilocker_oauth_not_yet_wired" },
    { status: 501 },
  );
}
