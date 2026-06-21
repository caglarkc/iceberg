import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { EXTRACTION_PROMPT_VERSION, PropertyProposalExtractionSchema } from "@pip/extraction";
export class StructuredLlmService {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    async completeStructured(params) {
        const attempts = Math.max(1, (params.maxRetries ?? 1) + 1);
        let lastError;
        for (let attempt = 0; attempt < attempts; attempt += 1) {
            const healing = attempt === 0
                ? ""
                : "\n\nPrevious response failed validation. Return only corrected JSON.";
            const raw = await this.provider.completeRaw(params.system, `${params.user}${healing}`);
            try {
                const parsed = parseJsonObject(raw.text);
                const data = params.schema.parse(parsed);
                return { data, model: this.provider.model, raw: parsed };
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
            }
        }
        throw lastError ?? new Error("LLM structured completion failed");
    }
}
const __dirname = dirname(fileURLToPath(import.meta.url));
const GOLDEN_EXTRACTION = join(__dirname, "../../../fixtures/m4/expected_extractions.json");
export class MockLlmProvider {
    model = "mock-m4-extraction";
    async completeRaw(_system, user) {
        if (user.toLowerCase().includes("oak lane") || user.includes("plaud-t5")) {
            const golden = JSON.parse(readFileSync(GOLDEN_EXTRACTION, "utf8"));
            const payload = {
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
export class GeminiProvider {
    apiKey;
    model;
    constructor(apiKey, model = "gemini-2.0-flash") {
        this.apiKey = apiKey;
        this.model = model;
    }
    async completeRaw(system, user) {
        assertKey(this.apiKey, "GEMINI_API_KEY");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: system }] },
                contents: [{ role: "user", parts: [{ text: `${user}\n\nReturn only valid JSON.` }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });
        const body = (await response.json());
        if (!response.ok)
            throw new Error(body.error?.message ?? "Gemini failed");
        return { text: body.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}" };
    }
}
export class OpenAiProvider {
    apiKey;
    model;
    constructor(apiKey, model = "gpt-4o-mini") {
        this.apiKey = apiKey;
        this.model = model;
    }
    async completeRaw(system, user) {
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
        const body = (await response.json());
        if (!response.ok)
            throw new Error(body.error?.message ?? "OpenAI failed");
        return { text: body.choices?.[0]?.message?.content ?? "{}" };
    }
}
export class AnthropicProvider {
    apiKey;
    model;
    constructor(apiKey, model = "claude-3-5-sonnet-latest") {
        this.apiKey = apiKey;
        this.model = model;
    }
    async completeRaw(system, user) {
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
        const body = (await response.json());
        if (!response.ok)
            throw new Error(body.error?.message ?? "Anthropic failed");
        return { text: body.content?.find((c) => c.type === "text")?.text ?? "{}" };
    }
}
export function createLlmService(env = process.env) {
    const provider = (env.LLM_PROVIDER ?? "gemini");
    const model = env.LLM_MODEL;
    if (provider === "mock")
        return new StructuredLlmService(new MockLlmProvider());
    if (provider === "openai")
        return new StructuredLlmService(new OpenAiProvider(env.OPENAI_API_KEY ?? "", model));
    if (provider === "anthropic")
        return new StructuredLlmService(new AnthropicProvider(env.ANTHROPIC_API_KEY ?? "", model));
    return new StructuredLlmService(new GeminiProvider(env.GEMINI_API_KEY ?? "", model));
}
export function inputHash(value) {
    return createHash("sha256").update(value).digest("hex");
}
function parseJsonObject(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (!match)
            throw new Error("No JSON in LLM response");
        return JSON.parse(match[0]);
    }
}
function assertKey(key, name) {
    if (!key)
        throw new Error(`${name} required`);
}
