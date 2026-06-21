import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { HttpZoomClient, ZoomServiceError } from "../../packages/zoom-client/src/index.js";
import { createZoomServiceMockApp } from "../../tools/zoom-service-mock/src/server.js";

describe("HttpZoomClient against mock server", () => {
  let server: Server;
  let client: HttpZoomClient;
  const apiKey = "http-client-test-key";

  beforeAll(async () => {
    process.env.ZOOM_SERVICE_API_KEY = apiKey;
    const app = createZoomServiceMockApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, resolve);
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("No address");
    client = new HttpZoomClient({
      baseUrl: `http://127.0.0.1:${addr.port}/api/v1`,
      apiKey,
      timeoutMs: 5000
    });
  });

  afterAll(() => {
    server?.close();
  });

  it("getCapabilities returns parsed response", async () => {
    const caps = await client.getCapabilities();
    expect(caps.embed_sdk).toBe(true);
    expect(caps.instant_meeting).toBe(true);
  });

  it("createMeeting returns join_url", async () => {
    const meeting = await client.createMeeting({
      topic: "Http client test",
      tracking: { crm_contact_id: "cnt_sarah" },
      start_time: "2026-08-01T10:00:00Z",
      duration: 30
    });
    expect(meeting.join_url).toMatch(/^https:\/\/zoom\.us\/j\//);
    expect(meeting.status).toBe("scheduled");
  });

  it("createInstantMeeting returns started status", async () => {
    const meeting = await client.createInstantMeeting({
      topic: "Instant via HTTP",
      tracking: { crm_contact_id: "cnt_sarah" }
    });
    expect(meeting.status).toBe("started");
  });

  it("getMeeting returns meeting detail", async () => {
    const created = await client.createInstantMeeting({
      topic: "Get detail test",
      tracking: { crm_contact_id: "cnt_sarah" }
    });
    const detail = await client.getMeeting(created.id);
    expect(detail.id).toBe(created.id);
  });

  it("getEmbedSignature returns signature and expiry", async () => {
    const created = await client.createInstantMeeting({
      topic: "Embed sig test",
      tracking: { crm_contact_id: "cnt_sarah" }
    });
    const sig = await client.getEmbedSignature(created.id, {
      role: 1,
      user_name: "Demo Agent",
      user_email: "demo_agent@lifesycle.mock"
    });
    expect(sig.signature).toBeTruthy();
    expect(new Date(sig.expires_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("throws ZoomServiceError on 401", async () => {
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("No address");
    const wrong = new HttpZoomClient({
      baseUrl: `http://127.0.0.1:${addr.port}/api/v1`,
      apiKey: "wrong-key"
    });
    await expect(wrong.getCapabilities()).rejects.toBeInstanceOf(ZoomServiceError);
    await expect(wrong.getCapabilities()).rejects.toMatchObject({ status: 401 });
  });

  it("throws ZoomServiceError on unreachable host", async () => {
    const offline = new HttpZoomClient({
      baseUrl: "http://127.0.0.1:1/api/v1",
      apiKey: "x",
      timeoutMs: 500
    });
    await expect(offline.getCapabilities()).rejects.toMatchObject({
      code: "ZOOM_SERVICE_UNAVAILABLE"
    });
  });
});
