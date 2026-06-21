import { describe, expect, it } from "vitest";
import { appointmentProximityScore, addressMatchScore, weightedConfidence } from "@pip/matching";

describe("appointment_proximity", () => {
  it("scores time windows per plan", () => {
    expect(appointmentProximityScore(15)).toBe(1.0);
    expect(appointmentProximityScore(45)).toBe(0.85);
    expect(appointmentProximityScore(90)).toBe(0.7);
    expect(appointmentProximityScore(180)).toBe(0.5);
    expect(appointmentProximityScore(360)).toBe(0.25);
    expect(appointmentProximityScore(500)).toBe(0.0);
  });
});

describe("address_match", () => {
  it("matches UK postcode and street", () => {
    const score = addressMatchScore(
      "Valuation at 14 Oak Lane Wimbledon SW19 3PQ",
      { address: "14 Oak Lane", postcode: "SW19 3PQ" },
      "14 Oak Lane SW19"
    );
    expect(score).toBeGreaterThanOrEqual(0.9);
  });

  it("handles postcode-only partial address", () => {
    const score = addressMatchScore(
      "High Street Mitcham postcode CR4 1AA",
      { address: "8 High Street", postcode: "CR4 1AA" }
    );
    expect(score).toBeGreaterThanOrEqual(0.4);
  });
});

describe("weighted confidence", () => {
  it("sums signal weights", () => {
    const confidence = weightedConfidence({
      appointment_proximity: 1,
      address_match: 1,
      user_match: 1,
      contact_name_match: 1,
      recording_title_match: 1,
      manual_hint: 1
    });
    expect(confidence).toBe(1);
  });
});
