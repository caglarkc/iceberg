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
type RawCompletion = {
    text: string;
};
interface RawProvider {
    model: string;
    completeRaw(system: string, user: string): Promise<RawCompletion>;
}
export declare class StructuredLlmService implements LlmService {
    private readonly provider;
    constructor(provider: RawProvider);
    completeStructured<T>(params: CompleteStructuredParams<T>): Promise<CompleteStructuredResult<T>>;
}
export declare class MockLlmProvider implements RawProvider {
    readonly model = "mock-m4-extraction";
    completeRaw(_system: string, user: string): Promise<RawCompletion>;
}
export declare class GeminiProvider implements RawProvider {
    private readonly apiKey;
    readonly model: string;
    constructor(apiKey: string, model?: string);
    completeRaw(system: string, user: string): Promise<RawCompletion>;
}
export declare class OpenAiProvider implements RawProvider {
    private readonly apiKey;
    readonly model: string;
    constructor(apiKey: string, model?: string);
    completeRaw(system: string, user: string): Promise<RawCompletion>;
}
export declare class AnthropicProvider implements RawProvider {
    private readonly apiKey;
    readonly model: string;
    constructor(apiKey: string, model?: string);
    completeRaw(system: string, user: string): Promise<RawCompletion>;
}
export declare function createLlmService(env?: NodeJS.ProcessEnv): LlmService;
export declare function inputHash(value: string): string;
export {};
