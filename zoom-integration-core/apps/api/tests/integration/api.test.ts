import { describe, expect, it, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { loadConfig } from "../../src/config.js";
import { MockZoomAdapter, resetMockGlobals } from "../../src/providers/mock-zoom.adapter.js";
import { createInMemoryStore } from "../../src/store.js";

describe("Zoom API integration", () => {
  const config = loadConfig({ ZOOM_MODE: "mock", NODE_ENV: "test", PORT: "4010", APP_BASE_URL: "http://localhost:4010" });
  let provider: MockZoomAdapter;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    resetMockGlobals();
    provider = new MockZoomAdapter();
    app = createApp({ config, provider, store: createInMemoryStore() });
  });

  it("GET /api/zoom/health returns ok", async () => {
    const res = await request(app).get("/api/zoom/health");
    expect(res.status).toBe(200);
    expect(res.body.oauth).toBe("ok");
    expect(res.body.mode).toBe("mock");
  });

  it("POST /api/zoom/meetings creates meeting without start_url", async () => {
    const res = await request(app).post("/api/zoom/meetings").send({ topic: "Valuation Demo Call" });
    expect(res.status).toBe(201);
    expect(res.body.join_url).toContain("zoom.us");
    expect(res.body.start_url).toBeUndefined();
  });

  it("POST /api/zoom/signature returns sdkKey and signature", async () => {
    const res = await request(app).post("/api/zoom/signature").send({ meetingNumber: "12345678901", role: 0 });
    expect(res.status).toBe(200);
    expect(res.body.sdkKey).toBeTruthy();
    expect(res.body.signature).toContain(".");
  });

  it("POST /api/zoom/webhooks rejects invalid signature", async () => {
    const res = await request(app)
      .post("/api/zoom/webhooks")
      .set("x-zm-request-timestamp", "1")
      .set("x-zm-signature", "v0=invalid")
      .send({ event: "meeting.ended", event_ts: 1, payload: {} });
    expect(res.status).toBe(401);
  });

  it("POST /api/zoom/webhooks is idempotent for duplicate event_id", async () => {
    const body = MockZoomAdapter.webhookFixtures.meetingEnded;
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = MockZoomAdapter.buildWebhookSignature(raw, timestamp);
    const headers = { "x-zm-request-timestamp": timestamp, "x-zm-signature": signature };

    const first = await request(app).post("/api/zoom/webhooks").set(headers).send(body);
    expect(first.status).toBe(200);

    const second = await request(app).post("/api/zoom/webhooks").set(headers).send(body);
    expect(second.status).toBe(200);
    expect(second.body.duplicate).toBe(true);
  });

  it("GET /api/zoom/capability-map returns 17+ items", async () => {
    const res = await request(app).get("/api/zoom/capability-map");
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(17);
  });

  it("GET /api/zoom/capability-map filters by status", async () => {
    const res = await request(app).get("/api/zoom/capability-map?status=not_possible");
    expect(res.status).toBe(200);
    expect(res.body.items.every((i: { status: string }) => i.status === "not_possible")).toBe(true);
  });

  it("GET /api/zoom/phone/events returns mock events", async () => {
    const res = await request(app).get("/api/zoom/phone/events");
    expect(res.status).toBe(200);
    expect(res.body.mock_events.length).toBeGreaterThan(0);
  });

  it("POST /internal/webhooks/replay ingests phone fixture", async () => {
    const res = await request(app).post("/internal/webhooks/replay").send({ fixture: "phoneCallCompleted" });
    expect(res.status).toBe(200);
    expect(res.body.processed).toBe(true);
  });

  it("POST /internal/crm-adapter/timeline-event maps meeting.ended", async () => {
    await request(app).post("/internal/webhooks/replay").send({ fixture: "meetingEnded" });
    const events = await request(app).get("/api/zoom/events");
    const eventId = events.body[0].id;
    const timeline = await request(app).post("/internal/crm-adapter/timeline-event").send({ event_id: eventId });
    expect(timeline.status).toBe(200);
    expect(timeline.body.event_type).toBe("zoom.meeting.ended");
    expect(timeline.body.source).toBe("zoom-integration-core");
  });

  it("GET /api/zoom/meetings/:id returns meeting", async () => {
    const created = await request(app).post("/api/zoom/meetings").send({ topic: "Lookup Test" });
    const res = await request(app).get(`/api/zoom/meetings/${created.body.zoom_meeting_id}`);
    expect(res.status).toBe(200);
    expect(res.body.topic).toBe("Lookup Test");
  });

  it("GET /api/zoom/meetings/:uuid/transcript returns mock text", async () => {
    const created = await request(app).post("/api/zoom/meetings").send({ topic: "Transcript Test" });
    const res = await request(app).get(`/api/zoom/meetings/${created.body.zoom_meeting_uuid}/transcript`);
    expect(res.status).toBe(200);
    expect(res.body.transcript).toContain("Mock transcript");
  });

  it("GET /api/zoom/phone/capabilities reports unlicensed", async () => {
    const res = await request(app).get("/api/zoom/phone/capabilities");
    expect(res.status).toBe(200);
    expect(res.body.licensed).toBe(false);
  });

  it("POST /internal/oauth/refresh returns token expiry", async () => {
    const res = await request(app).post("/internal/oauth/refresh");
    expect(res.status).toBe(200);
    expect(res.body.refreshed).toBe(true);
  });

  it("webhook url_validation returns encrypted token", async () => {
    const body = MockZoomAdapter.webhookFixtures.urlValidation;
    const raw = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = MockZoomAdapter.buildWebhookSignature(raw, timestamp);
    const res = await request(app)
      .post("/api/zoom/webhooks")
      .set({ "x-zm-request-timestamp": timestamp, "x-zm-signature": signature })
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body.plainToken).toBe("mock-plain-token-abc123");
    expect(res.body.encryptedToken).toBeTruthy();
  });
});
