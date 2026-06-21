import { describe, expect, it } from "vitest";
import { createLlmService, MockLlmService, OptionalRemoteLlmService } from "@iceberg/llm";

describe("LLM service", () => {
  it("creates a deterministic mock provider", async () => {
    const service = createLlmService({ LLM_PROVIDER: "mock" });
    const result = await service.completeJson<{ suggestion: string }>({
      prompt: "CRM timeline workflow",
      schemaName: "template_suggestion"
    });

    expect(result.provider).toBe("mock");
    expect(result.data.suggestion).toBe("crm-mock-poc");
  });

  it("falls back to api integration for generic prompts", async () => {
    const service = new MockLlmService();
    const result = await service.completeJson<{ suggestion: string }>({
      prompt: "OAuth webhook integration",
      schemaName: "template_suggestion"
    });

    expect(result.data.suggestion).toBe("api-integration-core");
  });

  it("keeps remote providers optional and credential gated", async () => {
    const service = new OptionalRemoteLlmService("gemini", "GEMINI_API_KEY", "gemini-2.0-flash");

    await expect(service.completeJson({ prompt: "test" })).rejects.toThrow(/GEMINI_API_KEY/);
  });
});
