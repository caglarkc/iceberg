import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseBrief } from "@iceberg/parser";
import { renderScaffold, writeScaffold } from "@iceberg/scaffolder";
import { generateHandoverPackage, writeHandoverPackage } from "@iceberg/handover-gen";

describe("scaffold flow", () => {
  it("parses, renders, writes approved scaffold, and writes handover package", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "agent-stack-flow-"));
    const input = await readFile("tests/fixtures/briefs/sample-mission.md", "utf8");
    const brief = parseBrief(input);
    const plan = await renderScaffold(brief, {
      repoRoot: process.cwd(),
      templateId: "api-integration-core"
    });

    await writeScaffold(plan, { outputDir, approve: true });
    await writeHandoverPackage(generateHandoverPackage(brief, {
      templateId: "api-integration-core",
      assumptionBased: true
    }), outputDir);

    await expect(access(path.join(outputDir, "README.md"))).resolves.toBeUndefined();
    await expect(access(path.join(outputDir, ".ai-metadata.json"))).resolves.toBeUndefined();
    await rm(outputDir, { recursive: true, force: true });
  });
});
