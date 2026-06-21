import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXTRACTION_PROMPT_VERSION,
  PropertyProposalExtractionSchema,
  type PropertyProposalExtraction
} from "@pip/extraction";
import { z } from "zod";

export type LlmProviderName = "gemini" | "openai" | "anthropic" | "mock";

export type CompleteStructuredParams<T> = {
  schema: z.ZodSchema<T>;
  system: string;
  user: string;
  maxRetries?: number;
};

export type CompleteStructuredResult<T> = {
  data: T;
  model: string;
  raw: unknown;
};

export interface LlmService {
  completeStructured<T>(params: CompleteStructuredParams<T>): Promise<CompleteStructuredResult<T>>;
}

type RawCompletion = { text: string };

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
      const healing =
        attempt === 0
          ? ""
          : "\n\nPrevious response failed validation. Return only corrected JSON.";
      const raw = await this.provider.completeRaw(params.system, `${params.user}${healing}`);
      try {
        const parsed = parseJsonObject(raw.text);
        const data = params.schema.parse(parsed);
        return { data, model: this.provider.model, raw: parsed };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError ?? new Error("LLM structured completion failed");
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOLDEN_EXTRACTION = join(__dirname, "../../../fixtures/m4/expected_extractions.json");

export class MockLlmProvider implements RawProvider {
  readonly model = "mock-m4-extraction";

  async completeRaw(_system: string, user: string): Promise<RawCompletion> {
    if (user.toLowerCase().includes("oak lane") || user.includes("plaud-t5")) {
      const golden = JSON.parse(readFileSync(GOLDEN_EXTRACTION, "utf8")) as {
        recording_id: string;
        property_id: string;
        fields: PropertyProposalExtraction["fields"];
      };
      const payload: PropertyProposalExtraction = {
        recording_id: golden.recording_id,
        property_id: golden.property_id,
        extracted_at: new Date().toISOString(),
        model: this.model,
        prompt_version: EXTRACTION_PROMPT_VERSION,
        fields: golden.fields
      };
      return { text: JSON.stringify(payload) };
    }

    const empty = PropertyProposalExtractionSchema.parse({
      recording_id: "mock",
      property_id: "mock",
      extracted_at: new Date().toISOString(),
      model: this.model,
      prompt_version: EXTRACTION_PROMPT_VERSION,
      fields: {
        property_condition: { value: null, confidence: 0, evidence_quote: null, status: "suggested" },
        seller_motivation: { value: null, confidence: 0, evidence_quote: null, status: "suggested" },
        asking_expectation: {
          value: null,
          confidence: 0,
          evidence_quote: null,
          status: "suggested"
        },
        timeline: { value: null, confidence: 0, evidence_quote: null, status: "suggested" },
        renovations: { value: null, confidence: 0, evidence_quote: null, status: "suggested" },
        concerns: { value: null, confidence: 0, evidence_quote: null, status: "suggested" },
        follow_up_tasks: { value: null, confidence: 0, evidence_quote: null, status: "suggested" }
      }
    });
    return { text: JSON.stringify(empty) };
  }
}

export class GeminiProvider implements RawProvider {
  readonly model: string;
  constructor(private readonly apiKey: string, model = "gemini-2.0-flash") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertKey(this.apiKey, "GEMINI_API_KEY");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: `${user}\n\nReturn only valid JSON.` }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );
    const body = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } };
    if (!response.ok) throw new Error(body.error?.message ?? "Gemini failed");
    return { text: body.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}" };
  }
}

export class OpenAiProvider implements RawProvider {
  readonly model: string;
  constructor(private readonly apiKey: string, model = "gpt-4o-mini") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertKey(this.apiKey, "OPENAI_API_KEY");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${user}\n\nReturn only valid JSON.` }
        ]
      })
    });
    const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
    if (!response.ok) throw new Error(body.error?.message ?? "OpenAI failed");
    return { text: body.choices?.[0]?.message?.content ?? "{}" };
  }
}

export class AnthropicProvider implements RawProvider {
  readonly model: string;
  constructor(private readonly apiKey: string, model = "claude-3-5-sonnet-latest") {
    this.model = model;
  }

  async completeRaw(system: string, user: string): Promise<RawCompletion> {
    assertKey(this.apiKey, "ANTHROPIC_API_KEY");
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
        messages: [{ role: "user", content: `${user}\n\nReturn only valid JSON.` }]
      })
    });
    const body = (await response.json()) as { content?: Array<{ type: string; text?: string }>; error?: { message?: string } };
    if (!response.ok) throw new Error(body.error?.message ?? "Anthropic failed");
    return { text: body.content?.find((c) => c.type === "text")?.text ?? "{}" };
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
    if (!match) throw new Error("No JSON in LLM response");
    return JSON.parse(match[0]);
  }
}

function assertKey(key: string, name: string): void {
  if (!key) throw new Error(`${name} required`);
}
