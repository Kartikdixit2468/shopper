import { describe, expect, it } from "vitest";

import { parseActiveStoreType } from "./store-mode";

describe("parseActiveStoreType", () => {
  it.each(["PRESENCE", "LOCAL_STORE"])("accepts the active %s mode", (mode) => {
    expect(parseActiveStoreType(mode)).toMatchObject({ success: true });
  });

  it("rejects full e-commerce while it is coming soon", () => {
    expect(parseActiveStoreType("ECOMMERCE")).toMatchObject({ success: false });
  });

  it("rejects missing and forged values", () => {
    expect(parseActiveStoreType(undefined)).toMatchObject({ success: false });
    expect(parseActiveStoreType("ADMIN")).toMatchObject({ success: false });
  });
});
