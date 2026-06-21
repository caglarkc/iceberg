export type LlmProviderName = "mock" | "gemini" | "openai" | "anthropic";

export interface LlmRequest {
  prompt: string;
  schemaName?: string;
}

export interface LlmResponse<T = unknown> {
  provider: LlmProviderName;
  model: string;
  data: T;
}

export interface LlmService {
  completeJson<T>(request: LlmRequest): Promise<LlmResponse<T>>;
}

export class MockLlmService implements LlmService {
  async completeJson<T>(request: LlmRequest): Promise<LlmResponse<T>> {
    const templateId = /crm|customer|timeline/i.test(request.prompt)
      ? "crm-mock-poc"
      : /intelligence|rag|classification|summary/i.test(request.prompt)
        ? "intelligence-layer"
        : "api-integration-core";

    return {
      provider: "mock",
      model: "mock-deterministic",
      data: {
        suggestion: templateId,
        confidence: 0.9,
        reason: `Rule fixture for ${request.schemaName ?? "json"}`
      } as T
    };
  }
}

export class OptionalRemoteLlmService implements LlmService {
  constructor(
    private readonly provider: Exclude<LlmProviderName, "mock">,
    private readonly apiKeyEnvName: string,
    private readonly model: string
  ) {}

  async completeJson<T>(): Promise<LlmResponse<T>> {
    if (!process.env[this.apiKeyEnvName]) {
      throw new Error(`${this.provider} requires ${this.apiKeyEnvName}; use LLM_PROVIDER=mock for deterministic fallback`);
    }

    throw new Error(`${this.provider} remote calls are intentionally not wired into the POC; scaffold works without LLM`);
  }
}

export function createLlmService(env: NodeJS.ProcessEnv = process.env): LlmService {
  const provider = (env.LLM_PROVIDER ?? "gemini") as LlmProviderName;
  const model = env.LLM_MODEL ?? defaultModel(provider);

  if (provider === "mock") return new MockLlmService();
  if (provider === "gemini") return new OptionalRemoteLlmService("gemini", "GEMINI_API_KEY", model);
  if (provider === "openai") return new OptionalRemoteLlmService("openai", "OPENAI_API_KEY", model);
  if (provider === "anthropic") return new OptionalRemoteLlmService("anthropic", "ANTHROPIC_API_KEY", model);

  return new MockLlmService();
}

function defaultModel(provider: LlmProviderName): string {
  if (provider === "gemini") return "gemini-2.0-flash";
  if (provider === "openai") return "gpt-4o-mini";
  if (provider === "anthropic") return "claude-3-5-sonnet-latest";
  return "mock-deterministic";
}
