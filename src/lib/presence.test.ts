import { describe, expect, it } from "vitest";

import { normalizeIndianPhone, slugifyStoreName } from "./presence";

describe("slugifyStoreName", () => {
  it("creates a clean public slug", () => {
    expect(slugifyStoreName("  Rao's Fresh Mart Bengaluru ")).toBe("rao-s-fresh-mart-bengaluru");
  });

  it("limits slug length", () => {
    expect(slugifyStoreName("a".repeat(80))).toHaveLength(48);
  });
});

describe("normalizeIndianPhone", () => {
  it("adds the India country code to valid mobile numbers", () => {
    expect(normalizeIndianPhone("98765 43210")).toBe("+919876543210");
  });

  it("preserves a valid E.164 India number", () => {
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("+919876543210");
  });

  it("rejects invalid mobile numbers", () => {
    expect(normalizeIndianPhone("12345")).toBeNull();
  });
});
