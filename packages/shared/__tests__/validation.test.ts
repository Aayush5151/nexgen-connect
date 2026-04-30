/**
 * Unit tests — Zod validation schemas.
 *
 * Build Prompt §Bucket 6: "Every Zod schema (verify accept/reject for
 * boundary cases)."
 *
 * Tests both client-side (mobile form) and server-side (tRPC input
 * parser) usage paths since the same schema is the source of truth
 * for both.
 *
 * v6 build §16, §18 / Build Prompt Bucket 6.
 */
import {
  PhoneSchema,
  OtpSchema,
  ProfileSchema,
  CorridorChoiceSchema,
  ScaredSchema,
  UploadAdmitSchema,
  ReportSchema,
  ParentPasscodeSchema,
  ArrivalCheckinSchema,
} from "../src/validation";

describe("PhoneSchema", () => {
  it("accepts valid IN E.164", () => {
    expect(PhoneSchema.safeParse({ country: "IN", e164: "919876543210" }).success).toBe(true);
  });
  it("rejects 10-digit-only (missing 91 prefix)", () => {
    expect(PhoneSchema.safeParse({ country: "IN", e164: "9876543210" }).success).toBe(false);
  });
  it("rejects first-digit not 6/7/8/9", () => {
    expect(PhoneSchema.safeParse({ country: "IN", e164: "915876543210" }).success).toBe(false);
  });
  it("rejects too few digits", () => {
    expect(PhoneSchema.safeParse({ country: "IN", e164: "91987654" }).success).toBe(false);
  });
  it("rejects non-IN country", () => {
    expect(PhoneSchema.safeParse({ country: "US", e164: "11234567890" }).success).toBe(false);
  });
});

describe("OtpSchema", () => {
  it("accepts 6-digit code", () => {
    expect(OtpSchema.safeParse({ otpSessionId: "abc", code: "123456" }).success).toBe(true);
  });
  it("rejects 5-digit code", () => {
    expect(OtpSchema.safeParse({ otpSessionId: "abc", code: "12345" }).success).toBe(false);
  });
  it("rejects non-numeric code", () => {
    expect(OtpSchema.safeParse({ otpSessionId: "abc", code: "12345a" }).success).toBe(false);
  });
});

describe("ProfileSchema", () => {
  const valid = { firstName: "Aayush", email: "a@b.com", dobMonth: 3, homeCity: "Pune" };
  it("accepts a complete valid profile", () => {
    expect(ProfileSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts empty / null email", () => {
    expect(ProfileSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
    expect(ProfileSchema.safeParse({ ...valid, email: null }).success).toBe(true);
  });
  it("rejects firstName with digits", () => {
    expect(ProfileSchema.safeParse({ ...valid, firstName: "Aayush123" }).success).toBe(false);
  });
  it("accepts firstName with hyphen + apostrophe", () => {
    expect(ProfileSchema.safeParse({ ...valid, firstName: "O'Brien-Mary" }).success).toBe(true);
  });
  it("accepts Devanagari firstName", () => {
    expect(ProfileSchema.safeParse({ ...valid, firstName: "आयुष" }).success).toBe(true);
  });
  it("rejects dobMonth out of 1-12 range", () => {
    expect(ProfileSchema.safeParse({ ...valid, dobMonth: 0 }).success).toBe(false);
    expect(ProfileSchema.safeParse({ ...valid, dobMonth: 13 }).success).toBe(false);
  });
});

describe("CorridorChoiceSchema", () => {
  it("accepts IE Dublin UCD September 2026", () => {
    expect(
      CorridorChoiceSchema.safeParse({
        country: "IE",
        city: "Dublin",
        uni: "University College Dublin",
        intake: "September 2026",
      }).success,
    ).toBe(true);
  });
  it("rejects malformed intake", () => {
    expect(
      CorridorChoiceSchema.safeParse({
        country: "IE",
        city: "Dublin",
        uni: "UCD",
        intake: "Sept '26",
      }).success,
    ).toBe(false);
  });
  it("rejects non-IE/DE country", () => {
    expect(
      CorridorChoiceSchema.safeParse({
        country: "US",
        city: "Boston",
        uni: "MIT",
        intake: "September 2026",
      }).success,
    ).toBe(false);
  });
});

describe("ScaredSchema", () => {
  it("accepts up to 200 chars", () => {
    expect(ScaredSchema.safeParse({ text: "a".repeat(200) }).success).toBe(true);
  });
  it("rejects 201 chars", () => {
    expect(ScaredSchema.safeParse({ text: "a".repeat(201) }).success).toBe(false);
  });
  it("accepts empty (skip path)", () => {
    expect(ScaredSchema.safeParse({ text: "" }).success).toBe(true);
  });
});

describe("UploadAdmitSchema", () => {
  it("accepts JPEG / PNG / PDF under 8 MB", () => {
    for (const mimeType of ["image/jpeg", "image/png", "application/pdf"] as const) {
      expect(UploadAdmitSchema.safeParse({ mimeType, fileSizeBytes: 5_000_000 }).success).toBe(
        true,
      );
    }
  });
  it("rejects 9 MB", () => {
    expect(
      UploadAdmitSchema.safeParse({ mimeType: "image/jpeg", fileSizeBytes: 9 * 1024 * 1024 })
        .success,
    ).toBe(false);
  });
  it("rejects unsupported mime", () => {
    expect(
      UploadAdmitSchema.safeParse({ mimeType: "image/gif", fileSizeBytes: 1000 }).success,
    ).toBe(false);
  });
});

describe("ReportSchema", () => {
  it("accepts a valid report", () => {
    expect(
      ReportSchema.safeParse({
        reason: "Someone is messaging me asking for money for a Dublin lease.",
        category: "scam",
      }).success,
    ).toBe(true);
  });
  it("rejects reason under 10 chars", () => {
    expect(ReportSchema.safeParse({ reason: "x" }).success).toBe(false);
  });
  it("rejects reason over 2000 chars", () => {
    expect(ReportSchema.safeParse({ reason: "a".repeat(2001) }).success).toBe(false);
  });
});

describe("ParentPasscodeSchema", () => {
  it("accepts 6-digit passcode", () => {
    expect(ParentPasscodeSchema.safeParse({ passcode: "654321" }).success).toBe(true);
  });
  it("rejects non-numeric", () => {
    expect(ParentPasscodeSchema.safeParse({ passcode: "abcdef" }).success).toBe(false);
  });
  it("rejects wrong length", () => {
    expect(ParentPasscodeSchema.safeParse({ passcode: "12345" }).success).toBe(false);
    expect(ParentPasscodeSchema.safeParse({ passcode: "1234567" }).success).toBe(false);
  });
});

describe("ArrivalCheckinSchema", () => {
  it("accepts day 0-7", () => {
    expect(
      ArrivalCheckinSchema.safeParse({ dayPostArrival: 0, status: "received_thumb_up" }).success,
    ).toBe(true);
    expect(
      ArrivalCheckinSchema.safeParse({ dayPostArrival: 7, status: "received_thumb_down" }).success,
    ).toBe(true);
  });
  it("rejects day 8", () => {
    expect(
      ArrivalCheckinSchema.safeParse({ dayPostArrival: 8, status: "received_thumb_up" }).success,
    ).toBe(false);
  });
  it("rejects unknown status", () => {
    expect(
      // @ts-expect-error invalid by design
      ArrivalCheckinSchema.safeParse({ dayPostArrival: 1, status: "bouncy" }).success,
    ).toBe(false);
  });
});
