import { randomUUID } from "node:crypto";
export function createInMemoryStore() {
    const recordings = new Map();
    const byProvider = new Map();
    const transcripts = new Map();
    const matches = new Map();
    const extractions = new Map();
    const extractionsByRecording = new Map();
    const aiRuns = new Map();
    const audit = [];
    const consents = [];
    const applied = new Set();
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
            if (!rec)
                return undefined;
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
            const record = {
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
