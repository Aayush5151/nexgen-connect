import { describe, it, expect } from "vitest";
import {
  INDIAN_CITIES,
  INDIAN_CITY_NAMES,
  DESTINATION_COUNTRIES,
  INTAKE_PERIODS,
  HOBBY_OPTIONS,
  HOBBY_CATEGORIES,
  LANGUAGE_OPTIONS,
  COURSE_FIELDS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  ICEBREAKER_PROMPTS,
  THIS_OR_THAT_OPTIONS,
} from "@/lib/constants/indian-cities";

describe("INDIAN_CITIES", () => {
  it("maps city names to state names", () => {
    expect(INDIAN_CITIES["Mumbai"]).toBe("Maharashtra");
    expect(INDIAN_CITIES["Bangalore"]).toBe("Karnataka");
    expect(INDIAN_CITIES["Delhi"]).toBe("Delhi");
    expect(INDIAN_CITIES["Hyderabad"]).toBe("Telangana");
  });

  it("has at least 50 cities", () => {
    expect(Object.keys(INDIAN_CITIES).length).toBeGreaterThan(50);
  });

  it("INDIAN_CITY_NAMES is sorted alphabetically", () => {
    const sorted = [...INDIAN_CITY_NAMES].sort();
    expect(INDIAN_CITY_NAMES).toEqual(sorted);
  });
});

describe("DESTINATION_COUNTRIES", () => {
  it("includes major study destinations", () => {
    expect(DESTINATION_COUNTRIES).toContain("Germany");
    expect(DESTINATION_COUNTRIES).toContain("United States");
    expect(DESTINATION_COUNTRIES).toContain("United Kingdom");
    expect(DESTINATION_COUNTRIES).toContain("Canada");
    expect(DESTINATION_COUNTRIES).toContain("Australia");
  });

  it("ends with 'Other'", () => {
    expect(DESTINATION_COUNTRIES[DESTINATION_COUNTRIES.length - 1]).toBe("Other");
  });
});

describe("INTAKE_PERIODS", () => {
  it("contains periods from 2025 to 2028", () => {
    expect(INTAKE_PERIODS.some((p) => p.includes("2025"))).toBe(true);
    expect(INTAKE_PERIODS.some((p) => p.includes("2028"))).toBe(true);
  });
});

describe("HOBBY_CATEGORIES", () => {
  it("has at least 5 categories", () => {
    expect(HOBBY_CATEGORIES.length).toBeGreaterThanOrEqual(5);
  });

  it("each category has hobbies with name and emoji", () => {
    for (const cat of HOBBY_CATEGORIES) {
      expect(cat.category).toBeTruthy();
      expect(cat.hobbies.length).toBeGreaterThan(0);
      for (const hobby of cat.hobbies) {
        expect(hobby.name).toBeTruthy();
        expect(hobby.emoji).toBeTruthy();
      }
    }
  });

  it("HOBBY_OPTIONS flattens all hobby names", () => {
    const totalHobbies = HOBBY_CATEGORIES.reduce((sum, c) => sum + c.hobbies.length, 0);
    expect(HOBBY_OPTIONS.length).toBe(totalHobbies);
  });
});

describe("LANGUAGE_OPTIONS", () => {
  it("includes major Indian languages", () => {
    expect(LANGUAGE_OPTIONS).toContain("Hindi");
    expect(LANGUAGE_OPTIONS).toContain("English");
    expect(LANGUAGE_OPTIONS).toContain("Tamil");
    expect(LANGUAGE_OPTIONS).toContain("Bengali");
  });
});

describe("GENDER_OPTIONS", () => {
  it("has 4 options including prefer not to say", () => {
    expect(GENDER_OPTIONS).toHaveLength(4);
    expect(GENDER_OPTIONS).toContain("Prefer not to say");
  });
});

describe("RELIGION_OPTIONS", () => {
  it("includes major Indian religions", () => {
    expect(RELIGION_OPTIONS).toContain("Hindu");
    expect(RELIGION_OPTIONS).toContain("Muslim");
    expect(RELIGION_OPTIONS).toContain("Sikh");
    expect(RELIGION_OPTIONS).toContain("Prefer not to say");
  });
});

describe("ICEBREAKER_PROMPTS", () => {
  it("has at least 5 prompts", () => {
    expect(ICEBREAKER_PROMPTS.length).toBeGreaterThanOrEqual(5);
  });

  it("each prompt contains ___", () => {
    for (const prompt of ICEBREAKER_PROMPTS) {
      expect(prompt).toContain("___");
    }
  });
});

describe("THIS_OR_THAT_OPTIONS", () => {
  it("each option has id, left, right, and emojis", () => {
    for (const option of THIS_OR_THAT_OPTIONS) {
      expect(option.id).toBeTruthy();
      expect(option.left).toBeTruthy();
      expect(option.right).toBeTruthy();
      expect(option.leftEmoji).toBeTruthy();
      expect(option.rightEmoji).toBeTruthy();
    }
  });
});

describe("COURSE_FIELDS", () => {
  it("includes common fields", () => {
    expect(COURSE_FIELDS).toContain("Computer Science");
    expect(COURSE_FIELDS).toContain("MBA / Business");
    expect(COURSE_FIELDS).toContain("Medicine");
  });

  it("ends with 'Other'", () => {
    expect(COURSE_FIELDS[COURSE_FIELDS.length - 1]).toBe("Other");
  });
});
