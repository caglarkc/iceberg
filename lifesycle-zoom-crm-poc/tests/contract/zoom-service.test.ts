import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createZoomServiceMockApp } from "../../tools/zoom-service-mock/src/server.js";
import type { Server } from "node:http";

describe("Zoom Integration Service mock contract", () => {
  let server: Server;
  const apiKey = "test-api-key";

  beforeAll(async () => {
    process.env.ZOOM_SERVICE_API_KEY = apiKey;
    const app = createZoomServiceMockApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });
  });

  afterAll(() => {
    server?.close();
  });

  function baseUrl(): string {
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("No server address");
    return `http://127.0.0.1:${addr.port}`;
  }

  it("GET /capabilities returns embed_sdk=true", async () => {
    const res = await request(baseUrl())
      .get("/api/v1/capabilities")
      .set("Authorization", `Bearer ${apiKey}`);
    expect(res.status).toBe(200);
    expect(res.body.embed_sdk).toBe(true);
    expect(res.body.create_meeting).toBe(true);
  });

  it("POST /meetings returns 201 with join_url", async () => {
    const res = await request(baseUrl())
      .post("/api/v1/meetings")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({
        topic: "Valuation call — 14 Oak Lane, SW19",
        type: 2,
        start_time: "2026-07-01T10:00:00Z",
        duration: 60,
        timezone: "Europe/London",
        tracking: { crm_contact_id: "cnt_sarah", crm_property_id: "prop_oak_lane" }
      });
    expect(res.status).toBe(201);
    expect(res.body.join_url).toMatch(/^https:\/\/zoom\.us\/j\//);
    expect(res.body.status).toBe("scheduled");
  });

  it("POST /meetings/instant returns status=started", async () => {
    const res = await request(baseUrl())
      .post("/api/v1/meetings/instant")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({
        topic: "Quick call — Sarah Mitchell",
        tracking: { crm_contact_id: "cnt_sarah" }
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("started");
  });

  it("POST /embed-signature returns future expires_at", async () => {
    const create = await request(baseUrl())
      .post("/api/v1/meetings/instant")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({
        topic: "Embed test",
        tracking: { crm_contact_id: "cnt_sarah" }
      });
    const res = await request(baseUrl())
      .post(`/api/v1/meetings/${create.body.id}/embed-signature`)
      .set("Authorization", `Bearer ${apiKey}`)
      .send({
        role: 1,
        user_name: "Demo Agent",
        user_email: "demo_agent@lifesycle.mock"
      });
    expect(res.status).toBe(200);
    expect(res.body.signature).toBeTruthy();
    expect(new Date(res.body.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("returns 401 for invalid token", async () => {
    const res = await request(baseUrl())
      .get("/api/v1/capabilities")
      .set("Authorization", "Bearer wrong");
    expect(res.status).toBe(401);
  });

  it("POST /webhooks/replay echoes payload", async () => {
    const res = await request(baseUrl())
      .post("/api/v1/webhooks/replay")
      .set("Authorization", `Bearer ${apiKey}`)
      .send({ event: "meeting.ended", zoom_meeting_id: "123" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
