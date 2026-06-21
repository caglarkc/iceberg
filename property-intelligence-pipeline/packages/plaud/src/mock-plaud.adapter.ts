import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_FIXTURES = join(__dirname, "../../../fixtures/m4/transcripts");

export class MockPlaudAdapter implements PlaudProviderAdapter {
  readonly source = "mock" as const;
  private readonly recordings: Map<string, PlaudRecordingRaw>;

  constructor(fixturesDir = DEFAULT_FIXTURES) {
    this.recordings = new Map();
    for (const file of readdirSync(fixturesDir).filter((f) => f.endsWith(".json"))) {
      const raw = JSON.parse(readFileSync(join(fixturesDir, file), "utf8")) as PlaudRecordingRaw;
      this.recordings.set(raw.provider_recording_id, raw);
    }
  }

  async listRecordings(since?: Date): Promise<PlaudRecordingRaw[]> {
    const all = [...this.recordings.values()];
    if (!since) return all.sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
    return all
      .filter((r) => new Date(r.recorded_at) >= since)
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
  }

  async fetchRecording(providerId: string): Promise<PlaudRecordingRaw> {
    const recording = this.recordings.get(providerId);
    if (!recording) throw new Error(`Mock recording not found: ${providerId}`);
    return recording;
  }
}
