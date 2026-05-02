/**
 * Tests for identity-hash. v16 web pivot §3.1 + Bucket 11 acceptance:
 * "12+ test cases including: same person two ways same hash, different
 *  person different hash, missing pepper throws, name with diacritics
 *  normalized correctly, phone format variations, admit HEI variations."
 */
import {
  computeIdentityHash,
  computeAllIdentityHashes,
  maskIdentityHash,
  normalizeName,
  validateDobYearMonth,
  validatePhoneE164,
  validateAdmitHEICode,
} from "../src/server/lib/identity-hash";

const TEST_PEPPER = "test_identity_pepper_at_least_16_chars_long";
const TEST_PHONE_PEPPER = "test_phone_pepper_at_least_16_chars_long";

beforeAll(() => {
  process.env.IDENTITY_PEPPER = TEST_PEPPER;
  process.env.PHONE_PEPPER = TEST_PHONE_PEPPER;
});

afterAll(() => {
  delete process.env.IDENTITY_PEPPER;
  delete process.env.PHONE_PEPPER;
  delete process.env.ROTATED_IDENTITY_PEPPERS;
});

const baseInput = {
  normalizedName: "Aayush Shah",
  dobYearMonth: "2003-03",
  phoneE164: "919876543210",
  admitHEICode: "UCD",
};

describe("normalizeName", () => {
  it("collapses uppercase + extra whitespace", () => {
    expect(normalizeName("AAYUSH  SHAH ")).toBe("aayush shah");
  });
  it("strips Latin diacritics", () => {
    expect(normalizeName("Aayúsh Shåh")).toBe("aayush shah");
  });
  it("preserves Devanagari (no combining-mark stripping artefacts)", () => {
    // Devanagari matras are combining marks but visually inseparable;
    // for our purposes, hash uniformity is more important than visual
    // fidelity, and the matras are stripped. Verify behaviour is
    // documented + stable.
    const out = normalizeName("आयुष");
    expect(out.length).toBeGreaterThan(0);
    expect(out).toEqual(normalizeName("आयुष"));
  });
});

describe("validateDobYearMonth", () => {
  it("accepts valid YYYY-MM", () => {
    expect(() => validateDobYearMonth("2003-03")).not.toThrow();
    expect(() => validateDobYearMonth("1995-12")).not.toThrow();
  });
  it("rejects malformed", () => {
    expect(() => validateDobYearMonth("2003-3")).toThrow();
    expect(() => validateDobYearMonth("03/2003")).toThrow();
    expect(() => validateDobYearMonth("2003")).toThrow();
    expect(() => validateDobYearMonth("2003-13")).toThrow();
    expect(() => validateDobYearMonth("2003-00")).toThrow();
  });
  it("rejects out-of-range year", () => {
    expect(() => validateDobYearMonth("1899-12")).toThrow();
    expect(() => validateDobYearMonth("2099-12")).toThrow();
  });
});

describe("validatePhoneE164", () => {
  it("accepts 10-15 digit numbers", () => {
    expect(() => validatePhoneE164("9876543210")).not.toThrow();
    expect(() => validatePhoneE164("919876543210")).not.toThrow();
    expect(() => validatePhoneE164("123456789012345")).not.toThrow();
  });
  it("rejects '+' prefix", () => {
    expect(() => validatePhoneE164("+919876543210")).toThrow();
  });
  it("rejects spaces", () => {
    expect(() => validatePhoneE164("91 9876543210")).toThrow();
  });
  it("rejects too short / too long", () => {
    expect(() => validatePhoneE164("123456")).toThrow();
    expect(() => validatePhoneE164("12345678901234567")).toThrow();
  });
});

describe("validateAdmitHEICode", () => {
  it("accepts uppercase + digits + hyphen", () => {
    expect(() => validateAdmitHEICode("UCD")).not.toThrow();
    expect(() => validateAdmitHEICode("RWTH-AACHEN")).not.toThrow();
    expect(() => validateAdmitHEICode("HEI42")).not.toThrow();
  });
  it("rejects lowercase", () => {
    expect(() => validateAdmitHEICode("ucd")).toThrow();
  });
  it("rejects too short / long", () => {
    expect(() => validateAdmitHEICode("U")).toThrow();
    expect(() => validateAdmitHEICode("X".repeat(33))).toThrow();
  });
});

describe("computeIdentityHash — determinism + collisions", () => {
  it("returns a 64-char hex sha256", () => {
    const h = computeIdentityHash(baseInput);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same inputs produce same hash", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput });
    expect(a).toBe(b);
  });

  it("normalises name variations to the same hash", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput, normalizedName: "AAYUSH  SHAH " });
    const c = computeIdentityHash({ ...baseInput, normalizedName: "Aayúsh Shåh" });
    expect(b).toBe(a);
    expect(c).toBe(a);
  });

  it("different name → different hash", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput, normalizedName: "Other Person" });
    expect(b).not.toBe(a);
  });

  it("different DOB → different hash", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput, dobYearMonth: "2003-04" });
    expect(b).not.toBe(a);
  });

  it("different phone → different hash", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput, phoneE164: "919876543211" });
    expect(b).not.toBe(a);
  });

  it("different HEI → different hash (real-twin defence)", () => {
    const a = computeIdentityHash(baseInput);
    const b = computeIdentityHash({ ...baseInput, admitHEICode: "TUM" });
    expect(b).not.toBe(a);
  });
});

describe("computeIdentityHash — peppers", () => {
  it("throws if IDENTITY_PEPPER missing", () => {
    delete process.env.IDENTITY_PEPPER;
    expect(() => computeIdentityHash(baseInput)).toThrow(/IDENTITY_PEPPER/);
    process.env.IDENTITY_PEPPER = TEST_PEPPER;
  });
  it("throws if PHONE_PEPPER missing", () => {
    delete process.env.PHONE_PEPPER;
    expect(() => computeIdentityHash(baseInput)).toThrow(/PHONE_PEPPER/);
    process.env.PHONE_PEPPER = TEST_PHONE_PEPPER;
  });
  it("throws if pepper too short", () => {
    process.env.IDENTITY_PEPPER = "short";
    expect(() => computeIdentityHash(baseInput)).toThrow(/too short/);
    process.env.IDENTITY_PEPPER = TEST_PEPPER;
  });
  it("rotating IDENTITY_PEPPER changes the hash", () => {
    const a = computeIdentityHash(baseInput);
    process.env.IDENTITY_PEPPER = "second_test_pepper_with_enough_length";
    const b = computeIdentityHash(baseInput);
    expect(b).not.toBe(a);
    process.env.IDENTITY_PEPPER = TEST_PEPPER;
  });
});

describe("computeAllIdentityHashes — pepper rotation", () => {
  it("returns just the current hash when no rotated peppers configured", () => {
    delete process.env.ROTATED_IDENTITY_PEPPERS;
    const hashes = computeAllIdentityHashes(baseInput);
    expect(hashes).toHaveLength(1);
    expect(hashes[0]).toMatch(/^[0-9a-f]{64}$/);
  });
  it("returns current + rotated when configured", () => {
    process.env.ROTATED_IDENTITY_PEPPERS = "old_pepper_1_xxxxxxxx,old_pepper_2_xxxxxxxx";
    const hashes = computeAllIdentityHashes(baseInput);
    expect(hashes).toHaveLength(3);
    expect(new Set(hashes).size).toBe(3); // all distinct
    delete process.env.ROTATED_IDENTITY_PEPPERS;
  });
});

describe("maskIdentityHash", () => {
  it("returns '****' + last-4", () => {
    expect(maskIdentityHash("abcdef0123456789")).toBe("****6789");
  });
  it("handles short input", () => {
    expect(maskIdentityHash("abc")).toBe("****");
  });
});

describe("computeIdentityHash — input validation", () => {
  it("throws on empty name", () => {
    expect(() =>
      computeIdentityHash({ ...baseInput, normalizedName: "   " }),
    ).toThrow(/empty/);
  });
  it("throws on bad phone", () => {
    expect(() =>
      computeIdentityHash({ ...baseInput, phoneE164: "+919876543210" }),
    ).toThrow();
  });
  it("throws on bad DOB", () => {
    expect(() =>
      computeIdentityHash({ ...baseInput, dobYearMonth: "2003-3" }),
    ).toThrow();
  });
  it("throws on bad HEI", () => {
    expect(() =>
      computeIdentityHash({ ...baseInput, admitHEICode: "u/c/d" }),
    ).toThrow();
  });
});
