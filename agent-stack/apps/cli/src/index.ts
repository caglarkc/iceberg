#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { parseBrief } from "@iceberg/parser";
import { createLlmService } from "@iceberg/llm";
import {
  assertReadableBriefPath,
  listTemplates,
  renderScaffold,
  writeScaffold
} from "@iceberg/scaffolder";
import { generateHandoverPackage, writeHandoverPackage } from "@iceberg/handover-gen";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

const program = new Command()
  .name("iceberg-agent")
  .description("Iceberg Agent Stack CLI")
  .version("0.1.0");

program
  .command("templates")
  .description("List available scaffold templates")
  .action(() => {
    console.log(JSON.stringify(listTemplates(), null, 2));
  });

program
  .command("parse")
  .description("Parse a mission brief into structured JSON")
  .requiredOption("--brief <path>", "Mission brief markdown path")
  .action(async (options: { brief: string }) => {
    await assertReadableBriefPath(options.brief);
    const input = await readFile(options.brief, "utf8");
    console.log(JSON.stringify(parseBrief(input), null, 2));
  });

program
  .command("generate")
  .description("Generate a scaffold from a mission brief")
  .requiredOption("--brief <path>", "Mission brief markdown path")
  .option("--template <id>", "Template id")
  .option("--out <path>", "Output directory", "worktrees/generated")
  .option("--dry-run", "Print tree preview without writing files")
  .option("--approve", "Human approval gate for writing files")
  .action(async (options: { brief: string; template?: string; out: string; dryRun?: boolean; approve?: boolean }) => {
    await assertReadableBriefPath(options.brief);
    const input = await readFile(options.brief, "utf8");
    const brief = parseBrief(input);
    const scaffoldOptions = {
      repoRoot,
      llm: createLlmService({ ...process.env, LLM_PROVIDER: process.env.LLM_PROVIDER ?? "mock" })
    };
    const plan = await renderScaffold(
      brief,
      options.template ? { ...scaffoldOptions, templateId: options.template } : scaffoldOptions
    );

    if (options.dryRun || !options.approve) {
      console.log(formatPreview(plan.template.id, plan.tree));
      if (!options.dryRun && !options.approve) {
        console.log("\nWrite blocked: rerun with --approve after human review.");
      }
      return;
    }

    await writeScaffold(plan, {
      outputDir: options.out,
      approve: options.approve,
      auditLogPath: path.join(repoRoot, "scaffold_runs.jsonl")
    });
    console.log(`Wrote ${plan.files.length} files to ${options.out}`);
  });

program
  .command("handover")
  .description("Generate README, TEST_PLAN, HANDOVER, and .env.example")
  .requiredOption("--brief <path>", "Mission brief markdown path")
  .option("--template <id>", "Template id", "api-integration-core")
  .option("--out <path>", "Output directory", "worktrees/generated")
  .option("--approve", "Human approval gate for writing files")
  .action(async (options: { brief: string; template: string; out: string; approve?: boolean }) => {
    if (!options.approve) {
      throw new Error("Write blocked: pass --approve after human review to generate handover files");
    }
    await assertReadableBriefPath(options.brief);
    const input = await readFile(options.brief, "utf8");
    const brief = parseBrief(input);
    const files = generateHandoverPackage(brief, { templateId: options.template, assumptionBased: true });
    await writeHandoverPackage(files, options.out);
    console.log(`Wrote handover package to ${options.out}`);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

function formatPreview(templateId: string, tree: string[]): string {
  return [
    `Template: ${templateId}`,
    "Dry-run tree:",
    ...tree.map((file) => `  ${file}`)
  ].join("\n");
}
