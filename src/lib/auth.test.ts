import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "./auth";

describe("safeRedirectPath", () => {
  it("allows a local application path", () => {
    expect(safeRedirectPath("/dashboard")).toBe("/dashboard");
  });

  it.each([null, "https://example.com", "//example.com", "/\\example.com", "dashboard"])(
    "rejects an unsafe OAuth callback target: %s",
    (value) => {
      expect(safeRedirectPath(value)).toBe("/start");
    },
  );
});
