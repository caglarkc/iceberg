import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { parseBrief, BriefValidationError } from "@iceberg/parser";

describe("parseBrief", () => {
  it("parses a valid markdown mission brief", async () => {
    const input = await readFile("tests/fixtures/briefs/sample-mission.md", "utf8");
    const parsed = parseBrief(input);

    expect(parsed.mission_id).toBe("third-party-api-integration-core-service");
    expect(parsed.deliverables).toContain("README with setup steps");
    expect(parsed.constraints).toContain("Mock mode default");
    expect(parsed.tech_hints).toContain("Backend: Node.js + Express + TypeScript");
  });

  it("returns clear validation errors for missing required sections", async () => {
    const input = await readFile("tests/fixtures/briefs/incomplete.md", "utf8");

    expect(() => parseBrief(input)).toThrow(BriefValidationError);
    expect(() => parseBrief(input)).toThrow(/deliverables/);
  });
});
