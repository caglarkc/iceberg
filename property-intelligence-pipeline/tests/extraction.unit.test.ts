import { describe, expect, it } from "vitest";
import { PropertyProposalExtractionSchema } from "@pip/extraction";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(readFileSync(join(__dirname, "../fixtures/m4/expected_extractions.json"), "utf8"));

describe("extraction schema", () => {
  it("validates golden T5 extraction with 7 fields", () => {
    const parsed = PropertyProposalExtractionSchema.parse({
      recording_id: golden.recording_id,
      property_id: golden.property_id,
      extracted_at: new Date().toISOString(),
      model: "mock",
      prompt_version: "m4-v1",
      fields: golden.fields
    });
    const populated = Object.values(parsed.fields).filter((f) => f.value !== null);
    expect(populated.length).toBeGreaterThanOrEqual(7);
  });
});
