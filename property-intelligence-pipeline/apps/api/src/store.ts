import { randomUUID } from "node:crypto";
import type { PropertyProposalExtraction } from "@pip/extraction";
import type { MatchCandidate, MatchQueue } from "@pip/matching";

export type RecordingStatus = "pending" | "matched" | "extracted" | "reviewed" | "applied";

export interface PlaudRecording {
  id: string;
  provider_recording_id: string;
  company_id: string;
  fetched_via: string;
  title?: string;
  recorded_at: string;
  duration_sec?: number;
  status: RecordingStatus;
  metadata_json: Record<string, unknown>;
  created_at: string;
}

export interface Transcript {
  id: string;
  recording_id: string;
  text: string;
  summary?: string;
  owner_hint?: string;
  imported_at: string;
}

export interface TranscriptMatch {
  id: string;
  recording_id: string;
  company_id: string;
  user_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  confidence: number;
  signals_json: MatchCandidate["signals"];
  reason_chips: string[];
  queue: MatchQueue;
  status: "suggested" | "confirmed" | "rejected" | "unmatched";
  candidates_json: MatchCandidate[];
  decided_by: string | null;
  decided_at: string | null;
}

export interface AiRun {
  id: string;
  recording_id: string;
  model: string;
  prompt_version: string;
  input_hash: string;
  output_json: PropertyProposalExtraction;
  status: "success" | "failed" | "healed";
  created_at: string;
}

export interface ProposalExtraction {
  id: string;
  recording_id: string;
  property_id: string;
  ai_run_id: string;
  fields_json: PropertyProposalExtraction["fields"];
  review_status: "pending" | "partial" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string | null;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface ConsentRecord {
  id: string;
  property_id: string;
  contact_id: string | null;
  consented_at: string;
  method: string;
}

export interface PipStore {
  saveRecording(rec: PlaudRecording): PlaudRecording;
  getRecording(id: string): PlaudRecording | undefined;
  getRecordingByProviderId(providerId: string): PlaudRecording | undefined;
  listRecordings(filter?: { company_id?: string; status?: RecordingStatus }): PlaudRecording[];
  updateRecordingStatus(id: string, status: RecordingStatus): PlaudRecording | undefined;

  saveTranscript(t: Transcript): Transcript;
  getTranscriptByRecording(recordingId: string): Transcript | undefined;

  saveMatch(m: TranscriptMatch): TranscriptMatch;
  getMatchByRecording(recordingId: string): TranscriptMatch | undefined;

  saveAiRun(r: AiRun): AiRun;
  saveExtraction(e: ProposalExtraction): ProposalExtraction;
  getExtractionByRecording(recordingId: string): ProposalExtraction | undefined;
  getExtraction(id: string): ProposalExtraction | undefined;
  updateExtraction(e: ProposalExtraction): ProposalExtraction;

  addAudit(entry: Omit<AuditLogEntry, "id" | "created_at">): AuditLogEntry;
  listAudit(entityId?: string): AuditLogEntry[];

  saveConsent(c: Omit<ConsentRecord, "id">): ConsentRecord;

  isApplied(recordingId: string): boolean;
  markApplied(recordingId: string): void;
}

export function createInMemoryStore(): PipStore {
  const recordings = new Map<string, PlaudRecording>();
  const byProvider = new Map<string, string>();
  const transcripts = new Map<string, Transcript>();
  const matches = new Map<string, TranscriptMatch>();
  const extractions = new Map<string, ProposalExtraction>();
  const extractionsByRecording = new Map<string, string>();
  const aiRuns = new Map<string, AiRun>();
  const audit: AuditLogEntry[] = [];
  const consents: ConsentRecord[] = [];
  const applied = new Set<string>();

  return {
    saveRecording(rec) {
      recordings.set(rec.id, rec);
      byProvider.set(rec.provider_recording_id, rec.id);
      return rec;
    },
    getRecording(id) {
      return recordings.get(id);
    },
    getRecordingByProviderId(providerId) {
      const id = byProvider.get(providerId);
      return id ? recordings.get(id) : undefined;
    },
    listRecordings(filter) {
      return [...recordings.values()]
        .filter((r) => (filter?.company_id ? r.company_id === filter.company_id : true))
        .filter((r) => (filter?.status ? r.status === filter.status : true))
        .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
    },
    updateRecordingStatus(id, status) {
      const rec = recordings.get(id);
      if (!rec) return undefined;
      rec.status = status;
      return rec;
    },
    saveTranscript(t) {
      transcripts.set(t.recording_id, t);
      return t;
    },
    getTranscriptByRecording(recordingId) {
      return transcripts.get(recordingId);
    },
    saveMatch(m) {
      matches.set(m.recording_id, m);
      return m;
    },
    getMatchByRecording(recordingId) {
      return matches.get(recordingId);
    },
    saveAiRun(r) {
      aiRuns.set(r.id, r);
      return r;
    },
    saveExtraction(e) {
      extractions.set(e.id, e);
      extractionsByRecording.set(e.recording_id, e.id);
      return e;
    },
    getExtractionByRecording(recordingId) {
      const id = extractionsByRecording.get(recordingId);
      return id ? extractions.get(id) : undefined;
    },
    getExtraction(id) {
      return extractions.get(id);
    },
    updateExtraction(e) {
      extractions.set(e.id, e);
      return e;
    },
    addAudit(entry) {
      const record: AuditLogEntry = {
        id: randomUUID(),
        created_at: new Date().toISOString(),
        ...entry
      };
      audit.push(record);
      return record;
    },
    listAudit(entityId) {
      return entityId ? audit.filter((a) => a.entity_id === entityId) : [...audit];
    },
    saveConsent(c) {
      const record = { id: randomUUID(), ...c };
      consents.push(record);
      return record;
    },
    isApplied(recordingId) {
      return applied.has(recordingId);
    },
    markApplied(recordingId) {
      applied.add(recordingId);
    }
  };
}
