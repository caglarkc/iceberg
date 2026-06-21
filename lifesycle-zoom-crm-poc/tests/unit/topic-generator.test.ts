import { describe, expect, it } from "vitest";
import { generateMeetingTopic } from "../../packages/crm-mock/src/lib/topic-generator.js";

describe("generateMeetingTopic", () => {
  it("generates valuation topic with property address", () => {
    expect(
      generateMeetingTopic({
        appointmentType: "valuation",
        propertyAddress: "14 Oak Lane",
        propertyPostcode: "SW19"
      })
    ).toBe("Valuation call — 14 Oak Lane, SW19");
  });

  it("generates contact-only topic", () => {
    expect(
      generateMeetingTopic({
        contactFirstName: "Sarah",
        contactLastName: "Mitchell"
      })
    ).toBe("Call with Sarah Mitchell");
  });

  it("generates viewing topic", () => {
    expect(
      generateMeetingTopic({
        appointmentType: "viewing",
        propertyAddress: "22 High Street"
      })
    ).toBe("Virtual viewing — 22 High Street");
  });
});
