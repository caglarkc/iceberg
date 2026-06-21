import { describe, expect, it } from "vitest";
import {
  extractContactNames,
  extractStreetAddresses,
  extractUkPostcodes,
  jaroWinkler,
  normalizePostcode
} from "@pip/matching";

describe("transcript parse helpers", () => {
  it("extracts and normalizes UK postcodes", () => {
    const codes = extractUkPostcodes("Wimbledon SW19 3PQ and Mitcham CR4 1AA");
    expect(codes).toContain("SW19 3PQ");
    expect(codes).toContain("CR4 1AA");
    expect(normalizePostcode("sw193pq")).toBe("SW19 3PQ");
  });

  it("extracts street addresses", () => {
    const streets = extractStreetAddresses("Valuation at 14 Oak Lane near 22 Maple Close");
    expect(streets.length).toBeGreaterThanOrEqual(1);
    expect(streets[0].number).toBe("14");
    expect(streets[0].street).toMatch(/Oak Lane/i);
  });

  it("extracts titled contact names", () => {
    const names = extractContactNames("Mrs Patricia Hartley met Dr James Williams");
    expect(names).toContain("Mrs Patricia Hartley");
    expect(names).toContain("Dr James Williams");
  });

  it("scores jaro-winkler similarity", () => {
    expect(jaroWinkler("oak lane", "oak lane")).toBe(1);
    expect(jaroWinkler("oak", "maple")).toBeLessThan(0.7);
    expect(jaroWinkler("wimbledon", "wimbleton")).toBeGreaterThan(0.85);
  });
});
