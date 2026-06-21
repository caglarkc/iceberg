import { describe, expect, it } from "vitest";
import { MissionDraftSchema } from "@iceberg/shared";
import { createLlmService } from "./index.js";

describe("LlmService", () => {
  it("defaults to Gemini when no provider is configured", () => {
    const service = createLlmService({ GEMINI_API_KEY: "" });
    expect(service).toBeDefined();
  });

  it("returns deterministic structured mock output", async () => {
    const service = createLlmService({ LLM_PROVIDER: "mock" });
    const result = await service.completeStructured({
      schema: MissionDraftSchema,
      system: "mission_generate",
      user: "Plaud transcript CRM integration for property valuation workflows"
    });

    expect(result.data.title).toContain("Plaud");
    expect(result.model).toBe("mock-poc-model");
  });
});
