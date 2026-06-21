import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { parseBrief } from "@iceberg/parser";
import { generateHandoverPackage } from "@iceberg/handover-gen";

describe("handover generator", () => {
  it("creates the mandatory handover files with env names only", async () => {
    const input = await readFile("tests/fixtures/briefs/sample-mission.md", "utf8");
    const brief = parseBrief(input);
    const files = generateHandoverPackage(brief, {
      templateId: "api-integration-core",
      assumptionBased: true
    });

    expect(files.map((file) => file.path).sort()).toEqual([
      ".env.example",
      "HANDOVER.md",
      "README.md",
      "TEST_PLAN.md"
    ]);
    expect(files.find((file) => file.path === "HANDOVER.md")?.content).toContain("ASSUMPTION-BASED PLAN");
    expect(files.find((file) => file.path === ".env.example")?.content).toContain("API_CLIENT_SECRET=YOUR_API_CLIENT_SECRET_HERE");
  });
});
