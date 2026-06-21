import { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it } from "vitest";
import { createLlmService } from "@iceberg/llm";
import { createApp } from "../src/app.js";
import { createStore, type AppStore } from "../src/store.js";

describe("Iceberg X Intelligence API", () => {
  let store: AppStore;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    process.env.LLM_PROVIDER = "mock";
    store = createStore();
    app = createApp({ store, llm: createLlmService({ LLM_PROVIDER: "mock" }) });
  });

  it("serves health status", async () => {
    const response = await inject(app, { method: "GET", path: "/api/health" });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("blocks intern access to admin-only mission generation", async () => {
    const response = await inject(app, {
      method: "POST",
      path: "/api/missions/generate",
      role: "intern",
      body: { idea: "Plaud transcript CRM integration for property valuation workflows" }
    });
    expect(response.status).toBe(403);
  });

  it("runs the 7-step demo flow with mock LLM and human review gate", async () => {
    const generated = await inject(app, {
      method: "POST",
      path: "/api/missions/generate",
      role: "admin",
      body: { idea: "Plaud transcript CRM integration for property valuation workflows", categoryHint: "Property Intelligence" }
    });
    expect(generated.status).toBe(200);

    const missionResponse = await inject(app, {
      method: "POST",
      path: "/api/missions",
      role: "admin",
      body: {
        ...generated.body.draft,
        status: "active",
        assignedMentorId: store.users.find((user) => user.role === "mentor")?.id,
        assignedInternId: store.users.find((user) => user.role === "intern")?.id,
        aiGenerated: true
      }
    });
    expect(missionResponse.status).toBe(201);
    const mission = missionResponse.body;

    const badEvidence = await inject(app, {
      method: "POST",
      path: `/api/missions/${mission.id}/evidence`,
      role: "intern",
      body: { claim: "", sourceType: "manual", reliability: "high" }
    });
    expect(badEvidence.status).toBe(400);

    const evidence = await inject(app, {
      method: "POST",
      path: `/api/missions/${mission.id}/evidence`,
      role: "intern",
      body: {
        claim: "Mock-first POC keeps CI free from real LLM credentials.",
        sourceType: "document",
        sourceTitle: "Shared constraints",
        reliability: "high"
      }
    });
    expect(evidence.status).toBe(201);

    const submissionResponse = await inject(app, {
      method: "POST",
      path: `/api/missions/${mission.id}/submissions`,
      role: "intern",
      body: {
        repoUrl: "https://github.com/iceberg/example",
        demoUrl: "https://demo.iceberg.local",
        notes: "Demo implementation with mock LLM and audit trail.",
        hasReadme: true,
        deliverableChecklist: mission.expectedDeliverables.map((name: string, index: number) => ({
          name,
          completed: index < mission.expectedDeliverables.length - 1
        }))
      }
    });
    expect(submissionResponse.status).toBe(201);

    const submitted = await inject(app, { method: "POST", path: `/api/submissions/${submissionResponse.body.id}/submit`, role: "intern" });
    expect(submitted.status).toBe(200);
    expect(submitted.body.warning).toContain("checklist");

    const status = await inject(app, {
      method: "PATCH",
      path: `/api/submissions/${submissionResponse.body.id}/status`,
      role: "mentor",
      body: { status: "under_review", mentorFeedback: "Review started" }
    });
    expect(status.status).toBe(200);

    const aiReview = await inject(app, {
      method: "POST",
      path: `/api/submissions/${submissionResponse.body.id}/ai-review`,
      role: "mentor"
    });
    expect(aiReview.status).toBe(201);
    expect(aiReview.body.humanReviewStatus).toBe("pending");

    const hidden = await inject(app, {
      method: "GET",
      path: `/api/submissions/${submissionResponse.body.id}/ai-review`,
      role: "intern"
    });
    expect(hidden.status).toBe(403);

    const edited = await inject(app, {
      method: "PATCH",
      path: `/api/ai-reviews/${aiReview.body.id}`,
      role: "mentor",
      body: { humanReviewStatus: "edited", suggestedFeedback: "Publishable after mentor edit." }
    });
    expect(edited.status).toBe(200);
    const published = await inject(app, { method: "POST", path: `/api/ai-reviews/${aiReview.body.id}/publish`, role: "mentor" });
    expect(published.status).toBe(200);

    const readiness = await inject(app, { method: "GET", path: `/api/missions/${mission.id}/readiness` });
    expect(readiness.status).toBe(200);
    expect(readiness.body.totalScore).toBeGreaterThan(50);

    const handover = await inject(app, { method: "POST", path: `/api/missions/${mission.id}/handover/generate`, role: "mentor" });
    expect(handover.status).toBe(201);
    expect(handover.body.contentMarkdown).toContain("Production Integration Checklist");

    const audit = await inject(app, { method: "GET", path: "/api/ai-runs", role: "admin" });
    expect(audit.status).toBe(200);
    expect(audit.body).toHaveLength(3);
  });
});

async function inject(
  app: ReturnType<typeof createApp>,
  options: { method: string; path: string; role?: string; body?: unknown }
): Promise<{ status: number; body: any; raw: string }> {
  const payload = options.body ? JSON.stringify(options.body) : "";
  let sent = false;
  const req = new Readable({
    read() {
      if (sent) {
        this.push(null);
        return;
      }
      sent = true;
      this.push(payload || null);
    }
  }) as IncomingMessage;
  req.method = options.method;
  req.url = options.path;
  req.headers = {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(payload).toString(),
    "x-user-role": options.role ?? "admin"
  };

  const chunks: Buffer[] = [];
  const res = new ServerResponse(req);
  res.write = ((chunk: string | Buffer) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  }) as typeof res.write;
  res.end = ((chunk?: string | Buffer) => {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    res.emit("finish");
    return res;
  }) as typeof res.end;

  await new Promise<void>((resolve) => {
    res.on("finish", resolve);
    app.handle(req, res);
  });

  const raw = Buffer.concat(chunks).toString("utf8");
  return { status: res.statusCode, body: raw ? JSON.parse(raw) : undefined, raw };
}
