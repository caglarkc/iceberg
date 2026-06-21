import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../apps/api/src/app.js";
import { createInMemoryStore } from "../apps/api/src/store.js";
import { resetCrmAdapter } from "@pip/crm";

describe("API pipeline", () => {
  const store = createInMemoryStore();
  const app = createApp({
    store,
    config: { companyId: "company-iceberg-001", actorId: "user-sarah-001" }
  });

  it("health returns mock-first flag", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.mock_first).toBe(true);
  });

  it("mock ingest loads recordings", async () => {
    const res = await request(app).post("/api/plaud/ingest/mock");
    expect(res.status).toBe(201);
    expect(res.body.ingested).toBe(5);
  });

  it("T1 end-to-end: ingest → match → confirm → extract → review → apply", async () => {
    resetCrmAdapter();
    const freshStore = createInMemoryStore();
    const freshApp = createApp({
      store: freshStore,
      config: { companyId: "company-iceberg-001", actorId: "user-sarah-001" }
    });

    process.env.LLM_PROVIDER = "mock";

    await request(freshApp).post("/api/plaud/ingest/mock");
    const inbox = await request(freshApp).get("/api/plaud/inbox");
    const t1 = inbox.body.items.find(
      (r: { provider_recording_id: string }) => r.provider_recording_id === "plaud-t1-oak-lane"
    );
    expect(t1).toBeTruthy();

    const matchRes = await request(freshApp).post(`/api/plaud/recordings/${t1.id}/match`);
    expect(matchRes.body.confidence).toBeGreaterThanOrEqual(0.9);
    expect(matchRes.body.candidates_json[0].property_id).toBe("prop-oak-lane-14");

    await request(freshApp)
      .post(`/api/plaud/recordings/${t1.id}/match/confirm`)
      .send({ property_id: "prop-oak-lane-14" });

    const extractRes = await request(freshApp).post(`/api/plaud/recordings/${t1.id}/extract`);
    expect(extractRes.status).toBe(200);
    const extractionId = extractRes.body.extraction.id;

    const decisions = {
      property_condition: "approved",
      seller_motivation: "approved",
      asking_expectation: "approved",
      timeline: "approved"
    };
    await request(freshApp)
      .post(`/api/plaud/review/${extractionId}/decide`)
      .send({ decisions });

    const applyRes = await request(freshApp).post(`/api/plaud/recordings/${t1.id}/apply`);
    expect(applyRes.status).toBe(200);
    expect(applyRes.body.property_id).toBe("prop-oak-lane-14");

    const timeline = await request(freshApp).get("/api/properties/prop-oak-lane-14/timeline");
    expect(timeline.body.events.length).toBeGreaterThan(0);

    const dup = await request(freshApp).post(`/api/plaud/recordings/${t1.id}/apply`);
    expect(dup.status).toBe(400);
  });

  it("upload ingest accepts text", async () => {
    const res = await request(app)
      .post("/api/plaud/ingest/upload")
      .set("Content-Type", "text/plain")
      .send("Recorded: 2026-06-21\n\nManual valuation transcript for CR4 1AA.");
    expect(res.status).toBe(201);
    expect(res.body.provider_recording_id).toMatch(/^upload-/);
  });

  it("records consent via API", async () => {
    const res = await request(app).post("/api/consent").send({
      property_id: "prop-oak-lane-14",
      contact_id: "contact-mrs-hartley",
      method: "ui_checkbox"
    });
    expect(res.status).toBe(201);
    expect(res.body.property_id).toBe("prop-oak-lane-14");
  });

  it("T3 manual property confirm after review-queue match", async () => {
    resetCrmAdapter();
    const freshStore = createInMemoryStore();
    const freshApp = createApp({
      store: freshStore,
      config: { companyId: "company-iceberg-001", actorId: "user-sarah-001" }
    });

    await request(freshApp).post("/api/plaud/ingest/mock");
    const inbox = await request(freshApp).get("/api/plaud/inbox");
    const t3 = inbox.body.items.find(
      (r: { provider_recording_id: string }) => r.provider_recording_id === "plaud-t3-oak-neighbor"
    );
    expect(t3).toBeTruthy();

    const matchRes = await request(freshApp).post(`/api/plaud/recordings/${t3.id}/match`);
    expect(matchRes.body.queue).toBe("review");
    expect(matchRes.body.candidates_json[0].property_id).toBe("prop-oak-lane-16");

    const confirmRes = await request(freshApp)
      .post(`/api/plaud/recordings/${t3.id}/match/confirm`)
      .send({ property_id: "prop-oak-lane-16" });
    expect(confirmRes.body.status).toBe("confirmed");
    expect(confirmRes.body.property_id).toBe("prop-oak-lane-16");
  });

  it("T5 mock LLM extraction populates proposal fields", async () => {
    resetCrmAdapter();
    const freshStore = createInMemoryStore();
    const freshApp = createApp({
      store: freshStore,
      config: { companyId: "company-iceberg-001", actorId: "user-sarah-001" }
    });
    process.env.LLM_PROVIDER = "mock";

    await request(freshApp).post("/api/plaud/ingest/mock");
    const inbox = await request(freshApp).get("/api/plaud/inbox");
    const t5 = inbox.body.items.find(
      (r: { provider_recording_id: string }) => r.provider_recording_id === "plaud-t5-extraction"
    );

    await request(freshApp).post(`/api/plaud/recordings/${t5.id}/match`);
    await request(freshApp)
      .post(`/api/plaud/recordings/${t5.id}/match/confirm`)
      .send({ property_id: "prop-oak-lane-14" });

    const extractRes = await request(freshApp).post(`/api/plaud/recordings/${t5.id}/extract`);
    expect(extractRes.status).toBe(200);
    const fields = extractRes.body.extraction.fields_json;
    const populated = Object.values(fields).filter((f: { value: unknown }) => f.value !== null);
    expect(populated.length).toBeGreaterThanOrEqual(7);
    expect(fields.seller_motivation.evidence_quote).toContain("Manchester");
  });
});
