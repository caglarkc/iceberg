import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AIReviewSchema, HandoverDocSchema, MissionDraftSchema } from "@iceberg/shared";
import {
  AnthropicProvider,
  createLlmService,
  GeminiProvider,
  inputHash,
  MockLlmProvider,
  OpenAiProvider,
  StructuredLlmService
} from "./index.js";

const validMission = {
  title: "Retry Mission",
  description: "A mission draft returned after a failed parse attempt.",
  context: "Test context",
  problemStatement: "Test problem",
  expectedDeliverables: ["Deliverable A"],
  difficultyLevel: 3,
  category: "R&D Operations",
  estimatedWeeks: 2,
  suggestedSkills: ["TypeScript"]
};

describe("createLlmService", () => {
  it("defaults to Gemini when no provider is configured", () => {
    const service = createLlmService({ GEMINI_API_KEY: "" });
    expect(service).toBeDefined();
  });

  it("selects mock provider", () => {
    const service = createLlmService({ LLM_PROVIDER: "mock" });
    expect(service).toBeDefined();
  });

  it("selects openai provider", () => {
    const service = createLlmService({ LLM_PROVIDER: "openai", OPENAI_API_KEY: "sk-test" });
    expect(service).toBeDefined();
  });

  it("selects anthropic provider", () => {
    const service = createLlmService({ LLM_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test" });
    expect(service).toBeDefined();
  });

  it("selects gemini provider explicitly", () => {
    const service = createLlmService({ LLM_PROVIDER: "gemini", GEMINI_API_KEY: "gemini-test" });
    expect(service).toBeDefined();
  });
});

describe("MockLlmProvider branches", () => {
  const service = () => new StructuredLlmService(new MockLlmProvider());

  it("returns deterministic structured mock output for mission_generate", async () => {
    const result = await service().completeStructured({
      schema: MissionDraftSchema,
      system: "mission_generate",
      user: "Plaud transcript CRM integration for property valuation workflows"
    });

    expect(result.data.title).toContain("Plaud");
    expect(result.model).toBe("mock-poc-model");
    expect(result.usage?.inputTokens).toBeGreaterThan(0);
  });

  it("handles handover_generate system prompt", async () => {
    const result = await service().completeStructured({
      schema: HandoverDocSchema,
      system: "handover_generate",
      user: "Export package for mission abc"
    });

    expect(result.data.projectSummary).toContain("Iceberg X Intelligence Layer");
    expect(result.data.setupInstructions).toContain("Open http://localhost:5173");
  });

  it("handles review_generate system prompt", async () => {
    const result = await service().completeStructured({
      schema: AIReviewSchema,
      system: "review_generate",
      user: "Submission evidence summary"
    });

    expect(result.data.strengths.length).toBeGreaterThan(0);
    expect(result.data.riskFlags[0]?.severity).toBe("medium");
  });

  it("handles handover keyword fallback in combined prompt", async () => {
    const result = await service().completeStructured({
      schema: HandoverDocSchema,
      system: "export",
      user: "Generate handover documentation for the intern submission"
    });

    expect(result.data.architectureOverview).toContain("Express API");
  });

  it("handles review keyword fallback in combined prompt", async () => {
    const result = await service().completeStructured({
      schema: AIReviewSchema,
      system: "mentor assistant",
      user: "Draft a review of the latest submission"
    });

    expect(result.data.suggestedFeedback).toContain("Strong demo-ready submission");
  });

  it("returns default mission draft when no handover or review cues are present", async () => {
    const result = await service().completeStructured({
      schema: MissionDraftSchema,
      system: "mission_generate",
      user: "Iceberg X intelligence layer for mentor workflows"
    });

    expect(result.data.title).toContain("Iceberg X Intelligence Layer POC");
    expect(result.data.category).toBe("R&D Operations");
  });
});

describe("StructuredLlmService error paths", () => {
  it("retries after schema validation failure and succeeds on second attempt", async () => {
    let calls = 0;
    const provider = {
      model: "retry-model",
      completeRaw: async () => {
        calls += 1;
        if (calls === 1) {
          return { text: JSON.stringify({ title: "missing required fields" }) };
        }
        return { text: JSON.stringify(validMission) };
      }
    };

    const result = await new StructuredLlmService(provider).completeStructured({
      schema: MissionDraftSchema,
      system: "mission_generate",
      user: "retry test",
      maxRetries: 1
    });

    expect(calls).toBe(2);
    expect(result.data.title).toBe("Retry Mission");
    expect(result.model).toBe("retry-model");
  });

  it("throws after exhausting structured completion retries", async () => {
    const provider = {
      model: "fail-model",
      completeRaw: async () => ({ text: "not json at all" })
    };

    await expect(
      new StructuredLlmService(provider).completeStructured({
        schema: MissionDraftSchema,
        system: "mission_generate",
        user: "failure test",
        maxRetries: 1
      })
    ).rejects.toThrow(/JSON|schema|failed/i);
  });

  it("parses JSON embedded in surrounding text", async () => {
    const provider = {
      model: "markdown-model",
      completeRaw: async () => ({
        text: `Here is the mission draft:\n${JSON.stringify(validMission)}\nThanks.`
      })
    };

    const result = await new StructuredLlmService(provider).completeStructured({
      schema: MissionDraftSchema,
      system: "mission_generate",
      user: "markdown wrapped json"
    });

    expect(result.data.title).toBe("Retry Mission");
  });
});

describe("live provider guards and API errors", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("gemini throws when API key is missing", async () => {
    const provider = new GeminiProvider("");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("GEMINI_API_KEY is required");
  });

  it("openai throws when API key is missing", async () => {
    const provider = new OpenAiProvider("");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("OPENAI_API_KEY is required");
  });

  it("anthropic throws when API key is missing", async () => {
    const provider = new AnthropicProvider("");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("ANTHROPIC_API_KEY is required");
  });

  it("gemini surfaces API error responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "Gemini quota exceeded" } })
    } as Response);

    const provider = new GeminiProvider("gemini-key");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("Gemini quota exceeded");
  });

  it("openai returns content and token usage on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"title":"API Mission","description":"d","context":"c","problemStatement":"p","expectedDeliverables":["a"],"difficultyLevel":3,"category":"R&D Operations","estimatedWeeks":2,"suggestedSkills":["TS"]}' } }],
        usage: { prompt_tokens: 12, completion_tokens: 34 }
      })
    } as Response);

    const provider = new OpenAiProvider("sk-test");
    const raw = await provider.completeRaw("system", "user");
    expect(raw.text).toContain("API Mission");
    expect(raw.usage).toEqual({ inputTokens: 12, outputTokens: 34 });
  });

  it("anthropic returns text content on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: '{"ok":true}' }],
        usage: { input_tokens: 5, output_tokens: 7 }
      })
    } as Response);

    const provider = new AnthropicProvider("sk-ant-test");
    const raw = await provider.completeRaw("system", "user");
    expect(raw.text).toBe('{"ok":true}');
    expect(raw.usage).toEqual({ inputTokens: 5, outputTokens: 7 });
  });

  it("openai surfaces API error responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "OpenAI rate limited" } })
    } as Response);

    const provider = new OpenAiProvider("sk-test");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("OpenAI rate limited");
  });

  it("anthropic surfaces API error responses", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "Anthropic overloaded" } })
    } as Response);

    const provider = new AnthropicProvider("sk-ant-test");
    await expect(provider.completeRaw("system", "user")).rejects.toThrow("Anthropic overloaded");
  });

  it("gemini returns candidate text on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"gemini":true}' }] } }]
      })
    } as Response);

    const provider = new GeminiProvider("gemini-key", "gemini-2.0-flash");
    const raw = await provider.completeRaw("system", "user");
    expect(raw.text).toBe('{"gemini":true}');
    expect(provider.model).toBe("gemini-2.0-flash");
  });
});

describe("inputHash", () => {
  it("returns a stable sha256 hex digest", () => {
    const first = inputHash("mission idea");
    const second = inputHash("mission idea");
    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});
