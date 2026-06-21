import { randomUUID } from "node:crypto";
import { EXTRACTION_PROMPT_VERSION, EXTRACTION_SYSTEM_PROMPT, PropertyProposalExtractionSchema, PROPOSAL_FIELD_MAP, applyEvidencePenalty, buildExtractionUserPrompt } from "@pip/extraction";
import { createLlmService, inputHash } from "@pip/llm";
import { matchRecording } from "@pip/matching";
import { getCrmAdapter } from "@pip/crm";
export class IngestService {
    store;
    plaud;
    config;
    constructor(store, plaud, config) {
        this.store = store;
        this.plaud = plaud;
        this.config = config;
    }
    async ingestFromMock() {
        const rawList = await this.plaud.listRecordings();
        return rawList.map((raw) => this.persistRaw(raw));
    }
    async ingestRecording(providerId) {
        const existing = this.store.getRecordingByProviderId(providerId);
        if (existing)
            return existing;
        const raw = await this.plaud.fetchRecording(providerId);
        return this.persistRaw(raw);
    }
    ingestUpload(raw) {
        const existing = this.store.getRecordingByProviderId(raw.provider_recording_id);
        if (existing)
            return existing;
        return this.persistRaw(raw);
    }
    persistRaw(raw) {
        const recording = {
            id: randomUUID(),
            provider_recording_id: raw.provider_recording_id,
            company_id: this.config.companyId,
            fetched_via: raw.fetched_via,
            title: raw.title,
            recorded_at: raw.recorded_at,
            duration_sec: raw.duration_sec,
            status: "pending",
            metadata_json: raw.metadata,
            created_at: new Date().toISOString()
        };
        this.store.saveRecording(recording);
        this.store.saveTranscript({
            id: randomUUID(),
            recording_id: recording.id,
            text: raw.transcript_text,
            summary: raw.summary_text,
            owner_hint: raw.owner_hint,
            imported_at: new Date().toISOString()
        });
        this.store.addAudit({
            entity_type: "recording",
            entity_id: recording.id,
            action: "ingest",
            actor_id: this.config.actorId,
            payload_json: { provider_id: raw.provider_recording_id, via: raw.fetched_via }
        });
        return recording;
    }
}
export class MatchService {
    store;
    config;
    constructor(store, config) {
        this.store = store;
        this.config = config;
    }
    runMatch(recordingId, manualPropertyId) {
        const recording = this.store.getRecording(recordingId);
        if (!recording)
            throw new Error("Recording not found");
        const transcript = this.store.getTranscriptByRecording(recordingId);
        if (!transcript)
            throw new Error("Transcript not found");
        const crm = getCrmAdapter();
        const candidates = matchRecording({
            company_id: recording.company_id,
            recorded_at: recording.recorded_at,
            transcript_text: transcript.text,
            title: recording.title,
            owner_hint: transcript.owner_hint,
            manual_property_id: manualPropertyId,
            properties: crm.listProperties(recording.company_id),
            contacts: crm.listContacts(recording.company_id),
            appointments: crm.listAppointments(recording.company_id),
            users: crm.listUsers(recording.company_id)
        });
        const top = candidates[0];
        const match = {
            id: randomUUID(),
            recording_id: recordingId,
            company_id: recording.company_id,
            user_id: top?.user_id ?? null,
            property_id: top?.property_id ?? null,
            contact_id: top?.contact_id ?? null,
            confidence: top?.confidence ?? 0,
            signals_json: top?.signals ?? {
                appointment_proximity: 0,
                address_match: 0,
                user_match: 0,
                contact_name_match: 0,
                recording_title_match: 0,
                manual_hint: 0
            },
            reason_chips: top?.reason_chips ?? [],
            queue: top?.queue ?? "unmatched",
            status: top?.queue === "unmatched" ? "unmatched" : "suggested",
            candidates_json: candidates,
            decided_by: null,
            decided_at: null
        };
        this.store.saveMatch(match);
        this.store.updateRecordingStatus(recordingId, "matched");
        this.store.addAudit({
            entity_type: "match",
            entity_id: match.id,
            action: "match_run",
            actor_id: this.config.actorId,
            payload_json: { confidence: match.confidence, queue: match.queue }
        });
        return match;
    }
    confirmMatch(recordingId, propertyId, actorId) {
        const match = this.store.getMatchByRecording(recordingId);
        if (!match)
            throw new Error("Match not found — run match first");
        const candidate = match.candidates_json.find((c) => c.property_id === propertyId);
        if (!candidate)
            throw new Error("Property not in candidate list");
        match.property_id = propertyId;
        match.contact_id = candidate.contact_id;
        match.user_id = candidate.user_id;
        match.confidence = candidate.confidence;
        match.status = "confirmed";
        match.decided_by = actorId;
        match.decided_at = new Date().toISOString();
        this.store.saveMatch(match);
        this.store.addAudit({
            entity_type: "match",
            entity_id: match.id,
            action: "match_confirm",
            actor_id: actorId,
            payload_json: { property_id: propertyId }
        });
        return match;
    }
}
export class ExtractService {
    store;
    config;
    constructor(store, config) {
        this.store = store;
        this.config = config;
    }
    async extract(recordingId) {
        const recording = this.store.getRecording(recordingId);
        if (!recording)
            throw new Error("Recording not found");
        const match = this.store.getMatchByRecording(recordingId);
        if (!match?.property_id || match.status !== "confirmed") {
            throw new Error("Confirmed property match required before extraction");
        }
        const transcript = this.store.getTranscriptByRecording(recordingId);
        if (!transcript)
            throw new Error("Transcript not found");
        const crm = getCrmAdapter();
        const property = crm.getProperty(match.property_id);
        const contact = crm.listContacts(recording.company_id).find((c) => c.property_id === match.property_id);
        const appointment = crm.listAppointments(recording.company_id).find((a) => a.property_id === match.property_id);
        const llm = createLlmService();
        const userPrompt = buildExtractionUserPrompt({
            transcript: transcript.text,
            property_address: property ? `${property.address}, ${property.postcode}` : "",
            contact_name: contact?.full_name ?? "",
            appointment_date: appointment?.scheduled_at ?? recording.recorded_at
        });
        const input = `${EXTRACTION_SYSTEM_PROMPT}\n${userPrompt}`;
        const result = await llm.completeStructured({
            schema: PropertyProposalExtractionSchema,
            system: EXTRACTION_SYSTEM_PROMPT,
            user: userPrompt,
            maxRetries: 2
        });
        const rawFields = { ...result.data.fields };
        const penalized = { ...rawFields };
        for (const key of Object.keys(rawFields)) {
            penalized[key] = applyEvidencePenalty(rawFields[key], transcript.text);
        }
        const fields = penalized;
        const extraction = {
            ...result.data,
            recording_id: recordingId,
            property_id: match.property_id,
            extracted_at: new Date().toISOString(),
            prompt_version: EXTRACTION_PROMPT_VERSION,
            fields
        };
        const aiRun = this.store.saveAiRun({
            id: randomUUID(),
            recording_id: recordingId,
            model: result.model,
            prompt_version: EXTRACTION_PROMPT_VERSION,
            input_hash: inputHash(input),
            output_json: extraction,
            status: "success",
            created_at: new Date().toISOString()
        });
        const proposalExtraction = this.store.saveExtraction({
            id: randomUUID(),
            recording_id: recordingId,
            property_id: match.property_id,
            ai_run_id: aiRun.id,
            fields_json: fields,
            review_status: "pending",
            reviewed_by: null,
            reviewed_at: null
        });
        this.store.updateRecordingStatus(recordingId, "extracted");
        return { extraction: proposalExtraction, aiRun };
    }
}
export class ReviewService {
    store;
    constructor(store) {
        this.store = store;
    }
    decide(extractionId, decisions, actorId) {
        const extraction = this.store.getExtraction(extractionId);
        if (!extraction)
            throw new Error("Extraction not found");
        const nextFields = { ...extraction.fields_json };
        for (const [key, status] of Object.entries(decisions)) {
            const fieldKey = key;
            if (nextFields[fieldKey]) {
                nextFields[fieldKey] = { ...nextFields[fieldKey], status };
            }
        }
        const fields = nextFields;
        const approved = Object.values(fields).filter((f) => f.status === "approved").length;
        const rejected = Object.values(fields).filter((f) => f.status === "rejected").length;
        const review_status = approved > 0 && rejected === 0 ? "approved" : approved > 0 ? "partial" : "rejected";
        extraction.fields_json = fields;
        extraction.review_status = review_status;
        extraction.reviewed_by = actorId;
        extraction.reviewed_at = new Date().toISOString();
        this.store.updateExtraction(extraction);
        this.store.updateRecordingStatus(extraction.recording_id, "reviewed");
        this.store.addAudit({
            entity_type: "extraction",
            entity_id: extraction.id,
            action: "review_decide",
            actor_id: actorId,
            payload_json: { decisions, review_status }
        });
        return extraction;
    }
    listReviewQueue(companyId) {
        return this.store
            .listRecordings({ company_id: companyId })
            .filter((r) => r.status === "extracted" || r.status === "reviewed")
            .map((r) => ({
            recording: r,
            extraction: this.store.getExtractionByRecording(r.id),
            match: this.store.getMatchByRecording(r.id)
        }))
            .filter((item) => item.extraction && item.extraction.review_status !== "approved");
    }
}
export class ApplyService {
    store;
    constructor(store) {
        this.store = store;
    }
    apply(recordingId, actorId) {
        if (this.store.isApplied(recordingId)) {
            throw new Error("Recording already applied — duplicate guard");
        }
        const recording = this.store.getRecording(recordingId);
        if (!recording)
            throw new Error("Recording not found");
        const extraction = this.store.getExtractionByRecording(recordingId);
        if (!extraction)
            throw new Error("Extraction not found");
        if (extraction.review_status !== "approved" && extraction.review_status !== "partial") {
            throw new Error("Review approval required before apply");
        }
        const crm = getCrmAdapter();
        const approvedFields = {};
        for (const [key, field] of Object.entries(extraction.fields_json)) {
            if (field.status !== "approved" || field.value === null)
                continue;
            const crmKey = PROPOSAL_FIELD_MAP[key]?.split(".")[1] ?? key;
            approvedFields[crmKey] = field.value;
        }
        const draft = crm.applyProposalFields(extraction.property_id, approvedFields, actorId);
        const transcript = this.store.getTranscriptByRecording(recordingId);
        crm.addTimelineEvent({
            property_id: extraction.property_id,
            type: "plaud_transcript",
            provider: "plaud",
            summary: transcript?.summary ?? "Plaud transcript applied to proposal",
            recording_id: recordingId,
            payload: { approved_fields: Object.keys(approvedFields), mock_first: true }
        });
        this.store.markApplied(recordingId);
        this.store.updateRecordingStatus(recordingId, "applied");
        this.store.addAudit({
            entity_type: "recording",
            entity_id: recordingId,
            action: "apply",
            actor_id: actorId,
            payload_json: { property_id: extraction.property_id, fields: Object.keys(approvedFields) }
        });
        return { draft, property_id: extraction.property_id };
    }
}
