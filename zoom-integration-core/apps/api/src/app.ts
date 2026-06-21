import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { OAuthTokenService } from "./auth/oauth-token.service.js";
import { filterCapabilities } from "./capability/capability-map.js";
import type { AppConfig } from "./config.js";
import { webhookToTimelineEvent } from "./crm-adapter/timeline-event.js";
import { createMeeting, getMeeting, listMeetings } from "./meetings/meeting.service.js";
import type { ZoomProvider } from "./providers/zoom-provider.interface.js";
import { createInMemoryStore, maskStartUrl, type ZoomStore } from "./store.js";
import { ingestWebhook } from "./webhooks/webhook.service.js";

export type AppDeps = {
  config: AppConfig;
  provider: ZoomProvider;
  store?: ZoomStore;
  oauth?: OAuthTokenService;
};

const CreateMeetingSchema = z.object({
  topic: z.string().min(1),
  type: z.number().optional(),
  start_time: z.string().optional(),
  timezone: z.string().optional(),
  duration: z.number().optional(),
  settings: z.record(z.unknown()).optional()
});

const SignatureSchema = z.object({
  meetingNumber: z.string().min(1),
  role: z.union([z.literal(0), z.literal(1)])
});

export function createApp(deps: AppDeps) {
  const app = express();
  const store = deps.store ?? createInMemoryStore();
  const oauth = deps.oauth ?? new OAuthTokenService(deps.provider);

  app.use(cors());
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: string }).rawBody = buf.toString("utf8");
      }
    })
  );

  app.get("/api/zoom/health", async (_req, res) => {
    const oauthStatus = await oauth.health();
    res.json({
      oauth: oauthStatus,
      sdk: deps.config.zoomMode === "mock" ? "mock-configured" : "configured",
      db: "ok",
      mode: deps.config.zoomMode
    });
  });

  app.post("/api/zoom/meetings", async (req, res, next) => {
    try {
      const parsed = CreateMeetingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
      const meeting = await createMeeting(deps.provider, store, parsed.data);
      res.status(201).json(maskStartUrl(meeting));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/meetings", async (_req, res, next) => {
    try {
      const meetings = await listMeetings(deps.provider, store);
      res.json(meetings.map((m) => maskStartUrl(m)));
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/meetings/:id", async (req, res, next) => {
    try {
      const meeting = await getMeeting(deps.provider, store, req.params.id);
      if (!meeting) return res.status(404).json({ error: "Meeting not found" });
      res.json(maskStartUrl(meeting));
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      next(error);
    }
  });

  app.patch("/api/zoom/meetings/:id", async (req, res, next) => {
    try {
      const parsed = CreateMeetingSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
      const meeting = await deps.provider.updateMeeting(req.params.id, parsed.data);
      store.saveMeeting(meeting);
      res.json(maskStartUrl(meeting));
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      next(error);
    }
  });

  app.delete("/api/zoom/meetings/:id", async (req, res, next) => {
    try {
      await deps.provider.deleteMeeting(req.params.id);
      const meeting = store.getMeeting(req.params.id);
      if (meeting) store.updateMeetingStatus(meeting.zoom_meeting_uuid, "cancelled");
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      next(error);
    }
  });

  app.post("/api/zoom/signature", async (req, res, next) => {
    try {
      const parsed = SignatureSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
      const result = await deps.provider.generateSdkSignature(parsed.data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/meetings/:uuid/recordings", async (req, res, next) => {
    try {
      const recordings = await deps.provider.getRecordings(req.params.uuid);
      recordings.forEach((r) => store.saveRecording(r));
      res.json({ meeting_uuid: req.params.uuid, recordings });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      next(error);
    }
  });

  app.get("/api/zoom/meetings/:uuid/transcript", async (req, res, next) => {
    try {
      const transcript = await deps.provider.getTranscript(req.params.uuid);
      if (!transcript) return res.status(404).json({ error: "Transcript not available", hint: "Enable cloud recording or AI Companion" });
      res.json({ meeting_uuid: req.params.uuid, transcript });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      next(error);
    }
  });

  app.post("/api/zoom/webhooks", async (req, res, next) => {
    try {
      const rawBody = (req as Request & { rawBody?: string }).rawBody ?? JSON.stringify(req.body);
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") headers[key] = value;
      }
      const result = await ingestWebhook(deps.provider, store, headers, rawBody, req.body);
      res.status(result.status).json(result.body);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/events", (req, res) => {
    const eventType = req.query.event_type?.toString();
    res.json(store.listWebhookEvents(eventType ? { event_type: eventType } : undefined));
  });

  app.get("/api/zoom/events/:id", (req, res) => {
    const event = store.getWebhookEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  });

  app.get("/api/zoom/phone/capabilities", async (_req, res, next) => {
    try {
      const capabilities = await deps.provider.getPhoneCapabilities();
      res.json(capabilities);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/phone/events", async (_req, res, next) => {
    try {
      const mockEvents = deps.provider.listPhoneEvents ? await deps.provider.listPhoneEvents() : [];
      const stored = store.listPhoneEvents();
      res.json({ mock_events: mockEvents, webhook_events: stored });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/zoom/capability-map", (req, res) => {
    const status = req.query.status?.toString() as Parameters<typeof filterCapabilities>[0];
    res.json({ items: filterCapabilities(status), total: filterCapabilities(status).length });
  });

  app.post("/internal/oauth/refresh", async (_req, res, next) => {
    try {
      const token = await oauth.getToken();
      res.json({ refreshed: true, expires_at: new Date(token.expires_at).toISOString() });
    } catch (error) {
      next(error);
    }
  });

  app.post("/internal/jobs/transcript-fetch", async (req, res, next) => {
    try {
      const schema = z.object({ meeting_uuid: z.string().min(1) });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Validation failed" });
      const transcript = await deps.provider.getTranscript(parsed.data.meeting_uuid);
      res.json({ meeting_uuid: parsed.data.meeting_uuid, transcript, status: transcript ? "ok" : "unavailable" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/internal/crm-adapter/timeline-event", (req, res) => {
    const schema = z.object({ event_id: z.string().uuid() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed" });
    const event = store.getWebhookEvent(parsed.data.event_id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    const timeline = webhookToTimelineEvent(event);
    if (!timeline) return res.status(422).json({ error: "Event type not mappable to timeline" });
    res.json(timeline);
  });

  app.post("/internal/webhooks/replay", async (req, res, next) => {
    try {
      const schema = z.object({ fixture: z.string() });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Validation failed" });
      const { MockZoomAdapter } = await import("./providers/mock-zoom.adapter.js");
      const fixture = MockZoomAdapter.webhookFixtures[parsed.data.fixture as keyof typeof MockZoomAdapter.webhookFixtures];
      if (!fixture) return res.status(404).json({ error: "Fixture not found" });
      const body = JSON.stringify(fixture);
      const timestamp = String(Math.floor(Date.now() / 1000));
      const signature = MockZoomAdapter.buildWebhookSignature(body, timestamp);
      const result = await ingestWebhook(
        deps.provider,
        store,
        { "x-zm-request-timestamp": timestamp, "x-zm-signature": signature },
        body,
        fixture
      );
      res.status(result.status).json(result.body);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: error.message });
  });

  return app;
}
