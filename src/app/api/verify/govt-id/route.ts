import { NextResponse } from "next/server";

// Government ID verification has been replaced with face verification.
// See /api/verify/face for the current verification endpoint.

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Government ID verification has been replaced with face verification. Use /api/verify/face instead." },
    { status: 410 }
  );
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Government ID verification has been replaced with face verification. Use /api/verify/face instead." },
    { status: 410 }
  );
}
