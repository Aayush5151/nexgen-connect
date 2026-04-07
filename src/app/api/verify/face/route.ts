import { NextRequest, NextResponse } from "next/server";

// POST: Accept selfie image and compare against profile photos
// V1: Simulated face match (always succeeds if selfie provided)
// V2: Integrate AWS Rekognition CompareFaces or similar
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.selfieData) {
      return NextResponse.json(
        { error: "Selfie image data is required" },
        { status: 400 }
      );
    }

    // TODO: Authenticate user via JWT
    // TODO: Retrieve user's photoUrls from database
    // TODO: Send selfie + profile photo to face comparison API
    // TODO: Update user record: isFaceVerified = true, faceVerifiedAt = new Date()

    // V1: Simulated match — always succeeds
    return NextResponse.json(
      {
        matched: true,
        confidence: 0.96,
        message: "Face verification successful. Your identity has been confirmed.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Face verification error:", error);
    return NextResponse.json(
      { error: "Face verification failed. Please try again." },
      { status: 500 }
    );
  }
}
