import { describe, it, expect } from "vitest";
import {
  contactSchema,
  waitlistSchema,
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  signupStep4Schema,
  phoneSchema,
} from "@/lib/utils/validation";

describe("contactSchema", () => {
  it("accepts valid contact form data", () => {
    const result = contactSchema.safeParse({
      name: "Aayush Shah",
      email: "aayush@example.com",
      subject: "General",
      message: "This is a test message with enough characters.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = contactSchema.safeParse({
      name: "A",
      email: "test@test.com",
      subject: "General",
      message: "Valid message here.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = contactSchema.safeParse({
      name: "Test User",
      email: "not-an-email",
      subject: "General",
      message: "Valid message here.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid subject", () => {
    const result = contactSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      subject: "InvalidSubject",
      message: "Valid message here.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message shorter than 10 chars", () => {
    const result = contactSchema.safeParse({
      name: "Test User",
      email: "test@test.com",
      subject: "General",
      message: "Short",
    });
    expect(result.success).toBe(false);
  });
});

describe("waitlistSchema", () => {
  it("accepts valid email-only submission", () => {
    const result = waitlistSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("accepts valid Indian phone number", () => {
    const result = waitlistSchema.safeParse({
      email: "user@example.com",
      phone: "+919876543210",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid phone number", () => {
    const result = waitlistSchema.safeParse({
      email: "user@example.com",
      phone: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields", () => {
    const result = waitlistSchema.safeParse({
      email: "user@example.com",
      originCity: "Mumbai",
      destinationCountry: "Germany",
      intakePeriod: "Winter 2027",
    });
    expect(result.success).toBe(true);
  });
});

describe("phoneSchema", () => {
  it("accepts valid 10-digit number starting with 6-9", () => {
    expect(phoneSchema.safeParse("9876543210").success).toBe(true);
    expect(phoneSchema.safeParse("6123456789").success).toBe(true);
  });

  it("rejects numbers not starting with 6-9", () => {
    expect(phoneSchema.safeParse("1234567890").success).toBe(false);
    expect(phoneSchema.safeParse("5123456789").success).toBe(false);
  });

  it("rejects numbers with wrong length", () => {
    expect(phoneSchema.safeParse("98765").success).toBe(false);
    expect(phoneSchema.safeParse("98765432101").success).toBe(false);
  });
});

describe("signupStep1Schema", () => {
  it("accepts valid profile data", () => {
    const result = signupStep1Schema.safeParse({
      firstName: "Aayush",
      bio: "CS student from Mumbai who overthinks playlist order",
      photoCount: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects less than 2 photos", () => {
    const result = signupStep1Schema.safeParse({
      firstName: "Aayush",
      bio: "Valid bio text here",
      photoCount: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects more than 6 photos", () => {
    const result = signupStep1Schema.safeParse({
      firstName: "Aayush",
      bio: "Valid bio text here",
      photoCount: 7,
    });
    expect(result.success).toBe(false);
  });
});

describe("signupStep2Schema", () => {
  it("accepts valid personal details", () => {
    const result = signupStep2Schema.safeParse({
      dateOfBirth: "2004-06-15",
      gender: "Male",
      languages: ["Hindi", "English"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects age under 16", () => {
    const result = signupStep2Schema.safeParse({
      dateOfBirth: "2015-01-01",
      gender: "Male",
      languages: ["Hindi"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing gender", () => {
    const result = signupStep2Schema.safeParse({
      dateOfBirth: "2004-06-15",
      gender: "",
      languages: ["Hindi"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty languages", () => {
    const result = signupStep2Schema.safeParse({
      dateOfBirth: "2004-06-15",
      gender: "Male",
      languages: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("signupStep3Schema", () => {
  it("accepts valid destination data", () => {
    const result = signupStep3Schema.safeParse({
      originCity: "Mumbai",
      destinationCountry: "Germany",
      intakePeriod: "Winter 2027",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing origin city", () => {
    const result = signupStep3Schema.safeParse({
      originCity: "",
      destinationCountry: "Germany",
      intakePeriod: "Winter 2027",
    });
    expect(result.success).toBe(false);
  });
});

describe("signupStep4Schema", () => {
  it("accepts 3-5 hobbies", () => {
    expect(
      signupStep4Schema.safeParse({ hobbies: ["Gym", "Coding", "Travel"] }).success
    ).toBe(true);
    expect(
      signupStep4Schema.safeParse({
        hobbies: ["Gym", "Coding", "Travel", "Music", "Art"],
      }).success
    ).toBe(true);
  });

  it("rejects less than 3 hobbies", () => {
    expect(
      signupStep4Schema.safeParse({ hobbies: ["Gym", "Coding"] }).success
    ).toBe(false);
  });

  it("rejects more than 5 hobbies", () => {
    expect(
      signupStep4Schema.safeParse({
        hobbies: ["Gym", "Coding", "Travel", "Music", "Art", "Dance"],
      }).success
    ).toBe(false);
  });
});
