import { z } from "zod";

export const briefSchema = z.object({
  mission_id: z.string().min(1, "mission_id is required"),
  problem: z.string().min(10, "problem must be at least 10 characters"),
  deliverables: z.array(z.string().min(1)).min(1, "at least one deliverable is required"),
  constraints: z.array(z.string().min(1)).min(1, "at least one constraint is required"),
  tech_hints: z.array(z.string().min(1)).optional(),
  expected_outputs: z.array(z.string().min(1)).optional()
});

export type MissionBrief = z.infer<typeof briefSchema>;

export class BriefValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Brief validation failed: ${issues.join("; ")}`);
    this.name = "BriefValidationError";
    this.issues = issues;
  }
}

const sectionAliases: Record<string, keyof MissionBrief | "goal"> = {
  problem: "problem",
  "the problem": "problem",
  goal: "goal",
  deliverables: "deliverables",
  outputs: "expected_outputs",
  "expected outputs": "expected_outputs",
  constraints: "constraints",
  "technical hints": "tech_hints",
  "tech hints": "tech_hints",
  "technical requirements": "tech_hints"
};

export function parseBrief(input: string): MissionBrief {
  const title = extractTitle(input);
  const sections = extractSections(input);
  const missionId = normalizeMissionId(title ?? sections.mission_id?.[0] ?? "generated-mission");
  const problem = firstText(sections.problem) ?? firstText(sections.goal) ?? "";
  const candidate = {
    mission_id: missionId,
    problem,
    deliverables: sections.deliverables ?? sections.expected_outputs ?? [],
    constraints: sections.constraints ?? [],
    tech_hints: sections.tech_hints,
    expected_outputs: sections.expected_outputs
  };

  const parsed = briefSchema.safeParse(candidate);
  if (!parsed.success) {
    throw new BriefValidationError(parsed.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "brief";
      return `${path}: ${issue.message}`;
    }));
  }

  return parsed.data;
}

export function parseBriefJson(input: string): string {
  return JSON.stringify(parseBrief(input), null, 2);
}

function extractTitle(input: string): string | undefined {
  const titleMatch = input.match(/^#\s+(.+)$/m);
  if (!titleMatch?.[1]) return undefined;
  return titleMatch[1].replace(/^Mission:\s*/i, "").trim();
}

function extractSections(input: string): Partial<Record<keyof MissionBrief | "goal", string[]>> {
  const lines = input.split(/\r?\n/);
  const sections: Partial<Record<keyof MissionBrief | "goal", string[]>> = {};
  let current: keyof MissionBrief | "goal" | undefined;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!current || paragraph.length === 0) return;
    const value = paragraph.join(" ").trim();
    if (value.length > 0) {
      sections[current] = [...(sections[current] ?? []), value];
    }
    paragraph = [];
  };

  for (const line of lines) {
    const heading = line.match(/^#{2,6}\s+(.+)$/);
    if (heading?.[1]) {
      flushParagraph();
      current = sectionAliases[normalizeHeading(heading[1])];
      continue;
    }

    if (!current) continue;

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet?.[1]) {
      flushParagraph();
      sections[current] = [...(sections[current] ?? []), bullet[1].trim()];
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return sections;
}

function normalizeHeading(value: string): string {
  return value.toLowerCase().replace(/[:#]/g, "").trim();
}

function normalizeMissionId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "generated-mission";
}

function firstText(values: string[] | undefined): string | undefined {
  if (!values || values.length === 0) return undefined;
  return values.join("\n");
}
