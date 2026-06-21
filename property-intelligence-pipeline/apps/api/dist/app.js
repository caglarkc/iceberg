import cors from "cors";
import express from "express";
import { getCrmAdapter } from "@pip/crm";
import { createPlaudAdapterFromEnv, getUploadAdapter } from "@pip/plaud";
import { ApplyService, ExtractService, IngestService, MatchService, ReviewService } from "./services.js";
import { createInMemoryStore } from "./store.js";
export function createApp(deps = {}) {
    const store = deps.store ?? createInMemoryStore();
    const config = deps.config ?? {
        companyId: process.env.COMPANY_ID ?? "company-iceberg-001",
        actorId: "user-sarah-001"
    };
    const plaud = createPlaudAdapterFromEnv();
    const ingest = new IngestService(store, plaud, config);
    const match = new MatchService(store, config);
    const extract = new ExtractService(store, config);
    const review = new ReviewService(store);
    const apply = new ApplyService(store);
    const app = express();
    app.use(cors());
    app.use(express.json({ limit: "2mb" }));
    app.use(express.text({ type: "text/plain", limit: "2mb" }));
    app.get("/api/health", (_req, res) => {
        res.json({
            ok: true,
            plaud_mode: process.env.PLAUD_MODE ?? "mock",
            llm_provider: process.env.LLM_PROVIDER ?? "gemini",
            mock_first: true
        });
    });
    app.post("/api/plaud/ingest/mock", async (_req, res, next) => {
        try {
            const recordings = await ingest.ingestFromMock();
            res.status(201).json({ ingested: recordings.length, recordings });
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/plaud/ingest/upload", (req, res, next) => {
        try {
            const uploadAdapter = getUploadAdapter();
            let input;
            if (typeof req.body === "string") {
                input = uploadAdapter.parseTextFile(req.body, req.query.filename);
            }
            else {
                input = {
                    transcript_text: String(req.body.transcript_text ?? ""),
                    title: req.body.title,
                    recorded_at: req.body.recorded_at,
                    owner_hint: req.body.owner_hint,
                    summary_text: req.body.summary_text
                };
            }
            const raw = uploadAdapter.ingestUpload(input);
            const recording = ingest.ingestUpload(raw);
            res.status(201).json(recording);
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/plaud/inbox", (req, res) => {
        const status = req.query.status;
        const items = store.listRecordings({
            company_id: config.companyId,
            status: status
        });
        res.json({
            items: items.map((r) => ({
                ...r,
                transcript: store.getTranscriptByRecording(r.id),
                match: store.getMatchByRecording(r.id)
            }))
        });
    });
    app.get("/api/plaud/recordings/:id", (req, res) => {
        const recording = store.getRecording(req.params.id);
        if (!recording)
            return res.status(404).json({ error: "Not found" });
        res.json({
            recording,
            transcript: store.getTranscriptByRecording(recording.id),
            match: store.getMatchByRecording(recording.id),
            extraction: store.getExtractionByRecording(recording.id)
        });
    });
    app.post("/api/plaud/recordings/:id/match", (req, res, next) => {
        try {
            const result = match.runMatch(req.params.id, req.body?.manual_property_id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/plaud/recordings/:id/match/confirm", (req, res, next) => {
        try {
            const propertyId = String(req.body?.property_id ?? "");
            if (!propertyId)
                return res.status(400).json({ error: "property_id required" });
            const result = match.confirmMatch(req.params.id, propertyId, config.actorId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/plaud/recordings/:id/extract", async (req, res, next) => {
        try {
            const result = await extract.extract(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/plaud/review-queue", (_req, res) => {
        res.json({ items: review.listReviewQueue(config.companyId) });
    });
    app.post("/api/plaud/review/:id/decide", (req, res, next) => {
        try {
            const decisions = req.body?.decisions;
            if (!decisions)
                return res.status(400).json({ error: "decisions required" });
            const result = review.decide(req.params.id, decisions, config.actorId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.post("/api/plaud/recordings/:id/apply", (req, res, next) => {
        try {
            const result = apply.apply(req.params.id, config.actorId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    });
    app.get("/api/properties/:id/timeline", (req, res) => {
        const crm = getCrmAdapter();
        res.json({ events: crm.listTimeline(req.params.id) });
    });
    app.get("/api/properties/:id/proposal-draft", (req, res) => {
        const crm = getCrmAdapter();
        res.json({ draft: crm.getProposalDraft(req.params.id) });
    });
    app.post("/api/consent", (req, res) => {
        const record = store.saveConsent({
            property_id: String(req.body?.property_id ?? ""),
            contact_id: req.body?.contact_id ?? null,
            consented_at: new Date().toISOString(),
            method: req.body?.method ?? "ui_checkbox"
        });
        store.addAudit({
            entity_type: "consent",
            entity_id: record.id,
            action: "consent_recorded",
            actor_id: config.actorId,
            payload_json: { property_id: record.property_id }
        });
        res.status(201).json(record);
    });
    app.use((error, _req, res, _next) => {
        res.status(400).json({ error: error.message });
    });
    return app;
}
