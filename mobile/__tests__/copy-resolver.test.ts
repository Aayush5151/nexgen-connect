/**
 * Sample unit test — exercises the @nexgen-connect/copy resolver.
 *
 * This is the v6 §23 testing scaffold's first test. Validates the
 * three resolver branches:
 *   1. EN key hit
 *   2. HI key hit (locale-specific copy)
 *   3. HI key miss → EN fallback
 *   4. Both miss → returns key string for dev visibility
 *
 * Run with: cd mobile && npx jest copy-resolver
 */

import { copy, pick, _keysIn } from "@nexgen-connect/copy";

describe("@nexgen-connect/copy resolver", () => {
  describe("pick()", () => {
    it("returns EN string for an EN-known key", () => {
      const result = pick("en", "onboarding", "welcome.heading");
      expect(result).toBe("Find your people");
    });

    it("returns HI string for a HI-known key", () => {
      const result = pick("hi", "onboarding", "welcome.heading");
      expect(result).toBe("अपने लोग ढूंढो");
    });

    it("falls back HI → EN for a HI-missing key", () => {
      const result = pick("hi", "onboarding", "welcome.caption");
      // HI doesn't translate this key; should get EN text.
      expect(result).toContain("Free to verify");
    });

    it("returns the key string when both locales miss", () => {
      const result = pick("hi", "onboarding", "totally.made.up.key");
      expect(result).toBe("totally.made.up.key");
    });

    it("falls back HI namespace miss → EN if EN has it", () => {
      // HI doesn't define the chat namespace; resolver falls back.
      const result = pick("hi", "chat", "ct1.heading");
      expect(result).toBe("Threads");
    });
  });

  describe("copy() curried lookup", () => {
    it("returns a per-namespace function", () => {
      const t = copy("en", "premium");
      expect(t("pr1.heading")).toBe("One unlock.");
      expect(t("pr1.accent")).toBe("Never a sub.");
    });
  });

  describe("v6 NEW catalogue entries (E063-E065, N33-N36)", () => {
    it("error E063 has v6-spec title + recovery", () => {
      const title = pick("en", "errors", "E063.title");
      expect(title).toBe("Corridor placement glitch");
      const recovery = pick("en", "errors", "E063.recovery");
      expect(recovery).toContain("re-syncing");
    });

    it("push N34 has the founder-call copy", () => {
      const title = pick("en", "push", "N34.title");
      expect(title).toBe("Your founder-call is scheduled");
    });
  });

  describe("catalogue completeness", () => {
    it("EN errors namespace has all 65 entries", () => {
      const keys = _keysIn("en", "errors");
      const codes = new Set(keys.map((k) => k.split(".")[0]));
      // 65 unique codes E001-E065.
      expect(codes.size).toBe(65);
    });

    it("EN push namespace has all 36 entries", () => {
      const keys = _keysIn("en", "push");
      const codes = new Set(keys.map((k) => k.split(".")[0]));
      expect(codes.size).toBe(36);
    });

    it("EN empty-states namespace has all 10 entries", () => {
      const keys = _keysIn("en", "empty-states");
      const codes = new Set(keys.map((k) => k.split(".")[0]));
      expect(codes.size).toBe(10);
    });
  });
});
