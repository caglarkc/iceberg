import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseBrief } from "@iceberg/parser";
import { MockLlmService } from "@iceberg/llm";
import { assertReadableBriefPath, renderScaffold, suggestTemplate, writeScaffold } from "@iceberg/scaffolder";

const repoRoot = process.cwd();

describe("scaffolder", () => {
  it("renders the api integration golden tree", async () => {
    const input = await readFile("tests/fixtures/briefs/sample-mission.md", "utf8");
    const brief = parseBrief(input);
    const plan = await renderScaffold(brief, { repoRoot, templateId: "api-integration-core" });
    const expected = await readFile("tests/golden/api-integration-core-tree.txt", "utf8");

    expect(plan.tree.join("\n")).toBe(expected.trim());
  });

  it("uses deterministic mock LLM suggestion when available", async () => {
    const input = await readFile("tests/fixtures/briefs/crm-mission.md", "utf8");
    const brief = parseBrief(input);
    const suggestion = await suggestTemplate(brief, new MockLlmService());

    expect(suggestion.id).toBe("crm-mock-poc");
  });

  it("does not write files without approval", async () => {
    const input = await readFile("tests/fixtures/briefs/sample-mission.md", "utf8");
    const brief = parseBrief(input);
    const plan = await renderScaffold(brief, { repoRoot, templateId: "api-integration-core" });
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "agent-stack-test-"));

    await expect(writeScaffold(plan, { outputDir })).rejects.toThrow(/--approve/);
    await rm(outputDir, { recursive: true, force: true });
  });

  it("rejects secret-like brief paths", async () => {
    await expect(assertReadableBriefPath(".env")).rejects.toThrow(/secret-like/);
    await expect(assertReadableBriefPath("credentials.json")).rejects.toThrow(/secret-like/);
  });
});
