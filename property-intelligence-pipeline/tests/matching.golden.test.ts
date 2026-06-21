import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { matchRecording } from "@pip/matching";
import { MockCrmAdapter } from "@pip/crm";
import { MockPlaudAdapter } from "@pip/plaud";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../fixtures/m4");
const expected = JSON.parse(readFileSync(join(FIXTURES, "expected_matches.json"), "utf8"));

function loadTranscript(id: string) {
  const files = ["t1", "t2", "t3", "t4", "t5"];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(FIXTURES, `transcripts/${f}.json`), "utf8"));
    if (raw.provider_recording_id === id) return raw;
  }
  throw new Error(`Transcript ${id} not found`);
}

describe("golden match expectations", () => {
  const crm = new MockCrmAdapter();
  const companyId = "company-iceberg-001";

  const ctx = {
    properties: crm.listProperties(companyId),
    contacts: crm.listContacts(companyId),
    appointments: crm.listAppointments(companyId),
    users: crm.listUsers(companyId)
  };

  it("T1 suggests 14 Oak Lane with high confidence", () => {
    const scenario = expected.scenarios.T1;
    const t = loadTranscript(scenario.transcript_id);
    const candidates = matchRecording({
      company_id: companyId,
      recorded_at: t.recorded_at,
      transcript_text: t.transcript_text,
      title: t.title,
      owner_hint: t.owner_hint,
      ...ctx
    });
    expect(candidates[0].property_id).toBe(scenario.expected_top1_property_id);
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(scenario.min_confidence);
    expect(candidates[0].queue).toBe(scenario.queue);
  });

  it("T2 lands in review queue", () => {
    const scenario = expected.scenarios.T2;
    const t = loadTranscript(scenario.transcript_id);
    const candidates = matchRecording({
      company_id: companyId,
      recorded_at: t.recorded_at,
      transcript_text: t.transcript_text,
      title: t.title,
      owner_hint: t.owner_hint,
      ...ctx
    });
    expect(candidates[0].property_id).toBe(scenario.expected_top1_property_id);
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(scenario.min_confidence);
    expect(candidates[0].confidence).toBeLessThanOrEqual(scenario.max_confidence);
    expect(candidates[0].queue).toBe(scenario.queue);
  });

  it("T3 top-1 is 16 Oak Lane (neighbor property)", () => {
    const scenario = expected.scenarios.T3;
    const t = loadTranscript(scenario.transcript_id);
    const candidates = matchRecording({
      company_id: companyId,
      recorded_at: t.recorded_at,
      transcript_text: t.transcript_text,
      title: t.title,
      owner_hint: t.owner_hint,
      ...ctx
    });
    expect(candidates[0].property_id).toBe(scenario.expected_top1_property_id);
    expect(candidates[0].queue).toBe(scenario.queue);
  });

  it("T4 is unmatched due to agent/time mismatch", () => {
    const scenario = expected.scenarios.T4;
    const t = loadTranscript(scenario.transcript_id);
    const candidates = matchRecording({
      company_id: companyId,
      recorded_at: t.recorded_at,
      transcript_text: t.transcript_text,
      title: t.title,
      owner_hint: t.owner_hint,
      ...ctx
    });
    expect(candidates[0].confidence).toBeLessThan(scenario.max_confidence);
    expect(candidates[0].queue).toBe(scenario.queue);
  });
});

describe("MockPlaudAdapter", () => {
  it("loads five fixture recordings", async () => {
    const adapter = new MockPlaudAdapter(join(FIXTURES, "transcripts"));
    const list = await adapter.listRecordings();
    expect(list).toHaveLength(5);
  });
});
