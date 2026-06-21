import { describe, expect, it } from "vitest";
import {
  CAPABILITY_MAP,
  filterByImplementation,
  filterCapabilities
} from "../../src/capability/capability-map.js";

describe("capability-map", () => {
  it("has 27 items each with implementation", () => {
    expect(CAPABILITY_MAP).toHaveLength(27);
    for (const item of CAPABILITY_MAP) {
      expect(item.implementation).toBeDefined();
      expect(["real", "mock", "simulated", "none"]).toContain(item.implementation);
    }
  });

  it("marks Ay 1 simulated features honestly", () => {
    const simulated = CAPABILITY_MAP.filter((i) => i.implementation === "simulated");
    expect(simulated.map((i) => i.feature_key)).toEqual(
      expect.arrayContaining(["meeting_sdk_embed", "phone_click_to_call", "webinar_embed"])
    );
  });

  it("marks Ay 1 mock-only features honestly", () => {
    const mockOnly = CAPABILITY_MAP.filter((i) => i.implementation === "mock");
    expect(mockOnly.length).toBeGreaterThanOrEqual(5);
    expect(mockOnly.map((i) => i.feature_key)).toContain("meeting_create_rest");
  });

  it("filterCapabilities preserves backward-compatible status filter", () => {
    const notPossible = filterCapabilities("not_possible");
    expect(notPossible.every((i) => i.status === "not_possible")).toBe(true);
    expect(notPossible.length).toBeGreaterThan(0);
  });

  it("filterByImplementation returns mock items", () => {
    const mock = filterByImplementation("mock");
    expect(mock.every((i) => i.implementation === "mock")).toBe(true);
    expect(mock.length).toBeGreaterThan(0);
  });
});
