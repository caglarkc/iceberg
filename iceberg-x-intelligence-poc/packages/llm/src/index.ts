import { createHash } from "node:crypto";
import { AIReviewSchema, HandoverDocSchema, MissionDraftSchema } from "@iceberg/shared";
import { z } from "zod";

export type LlmProviderName = "gemini" | "openai" | "anthropic" | "mock";

export type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
};

export type CompleteStructuredParams<T> = {
  schema: z.ZodSchema<T>;
  system: string;
  user: string;
  maxRetries?: number;
};

export type CompleteStructuredResult<T> = {
  data: T;
  usage?: TokenUsage;
  raw: unknown;
  model: string;
};

export interface LlmService {
  completeStructured<T>(params: CompleteStructuredParams<T>): Promise<CompleteStructuredResult<T>>;
}

type RawCompletion = {
  text: string;
  usage?: TokenUsage;
};

interface RawProvider {
  model: string;
  completeRaw(system: string, user: string): Promise<RawCompletion>;
}

export class StructuredLlmService implements LlmService {
  constructor(private readonly provider: RawProvider) {}

  async completeStructured<T>(params: CompleteStructuredParams<T>): Promise<CompleteStructuredResult<T>> {
    const attempts = Math.max(1, (params.maxRetries ?? 1) + 1);
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const healingSuffix =
        attempt === 0
          ? ""
          : "\n\nPrevious response did not match the requested JSON schema. Return only corrected JSON.";
      const raw = await this.provider.completeRaw(params.system, `${params.user}${healingSuffix}`);
      try {
        const parsed = parseJsonObject(raw.text);
        const data = params.schema.parse(parsed);
        return { data, usage: raw.usage, raw: parsed, model: this.provider.model };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError ?? new Error("LLM structured completion failed");
  }
}

export class MockLlmProvider implements RawProvider {
  readonly model = "mock-poc-model";

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    const systemLower = system.toLowerCase();
    const lower = `${system} ${user}`.toLowerCase();
    if (systemLower.includes("handover_generate")) {
      return { text: JSON.stringify(mockHandover(user)), usage: usageFor(user) };
    }
    if (systemLower.includes("review_generate")) {
      return { text: JSON.stringify(mockReview()), usage: usageFor(user) };
    }
    if (lower.includes("handover")) {
      return { text: JSON.stringify(mockHandover(user)), usage: usageFor(user) };
    }
    if (lower.includes("review")) {
      return { text: JSON.stringify(mockReview()), usage: usageFor(user) };
    }
    return { text: JSON.stringify(mockMission(user)), usage: usageFor(user) };
  }
}

export class GeminiProvider implements RawProvider {
  readonly model: string;

  constructor(private readonly apiKey: string, model = "gemini-2.0-flash") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertApiKey(this.apiKey, "GEMINI_API_KEY");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: jsonOnly(user) }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );
    const body = (await response.json()) as GeminiResponse;
    if (!response.ok) throw new Error(body.error?.message ?? "Gemini request failed");
    return { text: body.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}" };
  }
}

export class OpenAiProvider implements RawProvider {
  readonly model: string;

  constructor(private readonly apiKey: string, model = "gpt-4o-mini") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertApiKey(this.apiKey, "OPENAI_API_KEY");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: jsonOnly(user) }
        ]
      })
    });
    const body = (await response.json()) as OpenAiResponse;
    if (!response.ok) throw new Error(body.error?.message ?? "OpenAI request failed");
    return {
      text: body.choices?.[0]?.message?.content ?? "{}",
      usage: { inputTokens: body.usage?.prompt_tokens, outputTokens: body.usage?.completion_tokens }
    };
  }
}

export class AnthropicProvider implements RawProvider {
  readonly model: string;

  constructor(private readonly apiKey: string, model = "claude-3-5-sonnet-latest") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertApiKey(this.apiKey, "ANTHROPIC_API_KEY");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        system,
        messages: [{ role: "user", content: jsonOnly(user) }]
      })
    });
    const body = (await response.json()) as AnthropicResponse;
    if (!response.ok) throw new Error(body.error?.message ?? "Anthropic request failed");
    return {
      text: body.content?.find((item) => item.type === "text")?.text ?? "{}",
      usage: { inputTokens: body.usage?.input_tokens, outputTokens: body.usage?.output_tokens }
    };
  }
}

export function createLlmService(env: NodeJS.ProcessEnv = process.env): LlmService {
  const provider = (env.LLM_PROVIDER ?? "gemini") as LlmProviderName;
  const model = env.LLM_MODEL;

  if (provider === "mock") return new StructuredLlmService(new MockLlmProvider());
  if (provider === "openai") return new StructuredLlmService(new OpenAiProvider(env.OPENAI_API_KEY ?? "", model));
  if (provider === "anthropic") return new StructuredLlmService(new AnthropicProvider(env.ANTHROPIC_API_KEY ?? "", model));
  return new StructuredLlmService(new GeminiProvider(env.GEMINI_API_KEY ?? "", model));
}

export function inputHash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseJsonObject(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("LLM response did not contain JSON");
    return JSON.parse(match[0]);
  }
}

function jsonOnly(user: string): string {
  return `${user}\n\nReturn only valid JSON. No markdown.`;
}

function assertApiKey(apiKey: string, name: string): void {
  if (!apiKey) throw new Error(`${name} is required for this LLM provider`);
}

function usageFor(input: string): TokenUsage {
  return { inputTokens: Math.ceil(input.length / 4), outputTokens: 250 };
}

function mockMission(user: string): z.infer<typeof MissionDraftSchema> {
  const wantsPlaud = user.toLowerCase().includes("plaud");
  return MissionDraftSchema.parse({
    title: wantsPlaud ? "Plaud Transcript CRM Intelligence Bridge" : "Iceberg X Intelligence Layer POC",
    description:
      "Build a structured proof of concept that turns a rough R&D idea into a reviewable mission with evidence, submission tracking, readiness scoring, and handover output.",
    context:
      "Iceberg Digital needs repeatable mission operations as mentors, interns, and platform initiatives grow.",
    problemStatement:
      "Mission quality drops when briefs, evidence, submissions, and review decisions live in separate places.",
    expectedDeliverables: [
      "Working standalone web demo",
      "Evidence vault entries with reliability labels",
      "Submission tracker with deliverable checklist",
      "AI review draft gated by mentor approval",
      "Handover-ready markdown package"
    ],
    difficultyLevel: 4,
    category: wantsPlaud ? "Property Intelligence" : "R&D Operations",
    estimatedWeeks: 4,
    suggestedSkills: ["TypeScript", "React", "API design", "LLM structured outputs", "Product thinking"]
  });
}

function mockReview(): z.infer<typeof AIReviewSchema> {
  return AIReviewSchema.parse({
    strengths: [
      "The submission links implementation evidence to the original mission outcomes.",
      "The deliverable checklist makes remaining gaps easy for a mentor to inspect."
    ],
    weaknesses: [
      "Production integration details should be clearer before main team handover.",
      "The demo needs one more explicit failure-mode note for AI provider downtime."
    ],
    reviewQuestions: [
      "Which Iceberg X adapter contract should be implemented first?",
      "How will mentor edits be audited after feedback publication?"
    ],
    suggestedFeedback:
      "Strong demo-ready submission. Add a short production integration note and confirm the mock LLM fallback path before leadership review.",
    riskFlags: [{ severity: "medium", message: "Production data sync is still a documented future adapter." }]
  });
}

function mockHandover(user: string): z.infer<typeof HandoverDocSchema> {
  return HandoverDocSchema.parse({
    projectSummary: "Iceberg X Intelligence Layer is a standalone POC for structured R&D mission quality control.",
    architectureOverview: "React web talks to an Express API using shared Zod contracts and a provider-based LlmService.",
    setupInstructions: ["Install Node 20", "Run npm install", "Run npm run dev", "Open http://localhost:5173"],
    environmentVariables: ["LLM_PROVIDER=mock for CI", "LLM_PROVIDER=gemini for local Gemini usage", "DATABASE_URL for Postgres"],
    apiEndpointSummary: ["GET /api/health", "POST /api/missions/generate", "POST /api/submissions/:id/ai-review"],
    knownIssues: ["Mock auth is demo-only", "Production Iceberg X adapter is planned for Phase 2"],
    testPlanChecklist: ["Run npm run lint", "Run npm run typecheck", "Run npm run test -- --coverage"],
    productionIntegrationChecklist: ["Replace mock auth with SSO", "Connect Iceberg X adapter read-only first", "Add rate limits"],
    evidenceBibliography: [user.slice(0, 120) || "Demo seed evidence"]
  });
}

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

type OpenAiResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: { prompt_tokens?: number; completion_tokens?: number };
  error?: { message?: string };
};

type AnthropicResponse = {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
  error?: { message?: string };
};
