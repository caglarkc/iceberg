import { describe, expect, it } from "vitest";
import { access, mkdtemp, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import os from "node:os";
import path from "node:path";

describe("CLI", () => {
  it("dry-run generate prints a tree and does not write output", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "agent-stack-cli-"));
    await rm(outputDir, { recursive: true, force: true });

    const result = await runCli([
      "apps/cli/dist/src/index.js",
      "generate",
      "--brief",
      "tests/fixtures/briefs/sample-mission.md",
      "--template",
      "api-integration-core",
      "--out",
      outputDir,
      "--dry-run"
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Dry-run tree");
    await expect(access(outputDir)).rejects.toThrow();
  });

  it("blocks generate writes without approve", async () => {
    const outputDir = await mkdtemp(path.join(os.tmpdir(), "agent-stack-cli-block-"));
    await rm(outputDir, { recursive: true, force: true });

    const result = await runCli([
      "apps/cli/dist/src/index.js",
      "generate",
      "--brief",
      "tests/fixtures/briefs/sample-mission.md",
      "--template",
      "api-integration-core",
      "--out",
      outputDir
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Write blocked");
    await expect(access(outputDir)).rejects.toThrow();
  });

  it("runs through the package scaffold script path after build", async () => {
    const result = await runCli([
      "apps/cli/dist/src/index.js",
      "templates"
    ]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("api-integration-core");
  });
});

function runCli(args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: process.cwd(),
      env: { ...process.env, LLM_PROVIDER: "mock" }
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
