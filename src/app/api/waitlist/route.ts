import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waitlistSchema } from "@/lib/utils/validation";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, phone, originCity, destinationCountry, intakePeriod } = parsed.data;

    // Check duplicate
    const existing = await db.waitlistEntry.findFirst({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: true, message: "You're already on the waitlist! We'll notify you soon." },
        { status: 200 }
      );
    }

    await db.waitlistEntry.create({
      data: { email, phone, originCity, destinationCountry, intakePeriod },
    });

    return NextResponse.json(
      { success: true, message: "You're on the waitlist! We'll email you when your cohort is ready." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
