import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import Handlebars from "handlebars";
import type { MissionBrief } from "@iceberg/parser";
import type { LlmService } from "@iceberg/llm";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface RenderedFile {
  path: string;
  content: string;
}

export interface ScaffoldPlan {
  template: TemplateDefinition;
  files: RenderedFile[];
  tree: string[];
}

export interface ScaffoldOptions {
  repoRoot: string;
  templateId?: string;
  llm?: LlmService;
}

export interface WriteScaffoldOptions {
  outputDir: string;
  approve?: boolean;
  auditLogPath?: string;
  runId?: string;
}

export const templateRegistry: TemplateDefinition[] = [
  {
    id: "api-integration-core",
    name: "API Integration Core",
    description: "Adapter-oriented third-party API integration POC with backend, frontend, docs, and mock mode.",
    tags: ["api", "integration", "oauth", "webhook", "sdk", "meeting", "event"]
  },
  {
    id: "crm-mock-poc",
    name: "CRM Mock POC",
    description: "Minimal CRM workflow mock with timeline, mock CRM API, and handover-ready docs.",
    tags: ["crm", "customer", "timeline", "mock", "workflow"]
  },
  {
    id: "intelligence-layer",
    name: "Intelligence Layer",
    description: "Document ingestion and structured insight service skeleton with mock LLM fallback.",
    tags: ["intelligence", "rag", "llm", "classification", "summary", "document"]
  }
];

export function listTemplates(): TemplateDefinition[] {
  return templateRegistry;
}

export async function suggestTemplate(brief: MissionBrief, llm?: LlmService): Promise<TemplateDefinition> {
  const ruleMatch = selectTemplateByRules(brief);
  if (!llm) return ruleMatch;

  try {
    const response = await llm.completeJson<{ suggestion: string }>({
      prompt: JSON.stringify(brief),
      schemaName: "template_suggestion"
    });
    return templateRegistry.find((template) => template.id === response.data.suggestion) ?? ruleMatch;
  } catch {
    return ruleMatch;
  }
}

export async function renderScaffold(brief: MissionBrief, options: ScaffoldOptions): Promise<ScaffoldPlan> {
  const template = options.templateId
    ? requireTemplate(options.templateId)
    : await suggestTemplate(brief, options.llm);
  const templateRoot = path.join(options.repoRoot, "templates", template.id, "files");
  const files = await renderTemplateDirectory(templateRoot, {
    brief,
    generatedAt: new Date().toISOString(),
    template
  });

  const metadata = {
    "ai-generated": true,
    template_id: template.id,
    mission_id: brief.mission_id,
    human_review_required: true,
    assumption_based_plan: true
  };

  files.push({
    path: ".ai-metadata.json",
    content: `${JSON.stringify(metadata, null, 2)}\n`
  });

  return {
    template,
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
    tree: files.map((file) => file.path).sort()
  };
}

export async function writeScaffold(plan: ScaffoldPlan, options: WriteScaffoldOptions): Promise<void> {
  if (!options.approve) {
    throw new Error("Write blocked: pass --approve after human review to create files");
  }

  await assertWritableTarget(options.outputDir);
  for (const file of plan.files) {
    const target = path.join(options.outputDir, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }

  await appendAuditLog(options.auditLogPath, {
    run_id: options.runId ?? `run-${Date.now()}`,
    template_id: plan.template.id,
    output_dir: options.outputDir,
    file_count: plan.files.length,
    approved: true,
    created_at: new Date().toISOString()
  });
}

export async function assertReadableBriefPath(briefPath: string): Promise<void> {
  const base = path.basename(briefPath);
  if (base === ".env" || base.startsWith(".env.") || /\.(pem|key|p12|pfx)$/i.test(base) || /credential|secret/i.test(base)) {
    throw new Error(`Refusing to read secret-like brief path: ${briefPath}`);
  }
}

function selectTemplateByRules(brief: MissionBrief): TemplateDefinition {
  const haystack = [
    brief.problem,
    ...brief.deliverables,
    ...brief.constraints,
    ...(brief.tech_hints ?? [])
  ].join(" ");

  const scored = templateRegistry.map((template) => ({
    template,
    score: template.tags.reduce((sum, tag) => sum + (new RegExp(`\\b${tag}\\b`, "i").test(haystack) ? 1 : 0), 0)
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.score ? scored[0].template : requireTemplate("api-integration-core");
}

function requireTemplate(templateId: string): TemplateDefinition {
  const template = templateRegistry.find((candidate) => candidate.id === templateId);
  if (!template) {
    throw new Error(`Unknown template "${templateId}". Available: ${templateRegistry.map((item) => item.id).join(", ")}`);
  }
  return template;
}

async function renderTemplateDirectory(root: string, context: unknown, relativeDir = ""): Promise<RenderedFile[]> {
  const entries = await readdir(path.join(root, relativeDir), { withFileTypes: true });
  const files: RenderedFile[] = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await renderTemplateDirectory(root, context, relativePath));
      continue;
    }

    const source = await readFile(path.join(root, relativePath), "utf8");
    const compiled = Handlebars.compile(source, { noEscape: true });
    const outputPath = relativePath.replace(/\.hbs$/, "");
    files.push({
      path: outputPath,
      content: compiled(context)
    });
  }

  return files;
}

async function assertWritableTarget(outputDir: string): Promise<void> {
  const resolved = path.resolve(outputDir);
  if (resolved === path.parse(resolved).root) {
    throw new Error("Refusing to write scaffold to filesystem root");
  }
  if (/\/\.git(?:\/|$)/.test(resolved)) {
    throw new Error("Refusing to write scaffold inside .git");
  }
}

async function appendAuditLog(auditLogPath: string | undefined, payload: Record<string, unknown>): Promise<void> {
  if (!auditLogPath) return;
  await mkdir(path.dirname(auditLogPath), { recursive: true });
  const line = `${JSON.stringify(payload)}\n`;
  const { appendFile } = await import("node:fs/promises");
  await appendFile(auditLogPath, line, "utf8");
}
