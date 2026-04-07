import { NextRequest, NextResponse } from "next/server";

// TODO: Upload profile photo.
// - Authenticate the request (JWT)
// - Parse multipart form data to extract image file
// - Validate file type and size
// - Upload to cloud storage (e.g., Firebase Storage, S3)
// - Update user record with new photo URL
// - Return the photo URL
export async function POST(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "POST /api/users/me/photo — not implemented" }, { status: 501 });
}
