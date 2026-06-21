import { randomUUID } from "node:crypto";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { inputHash, type LlmService } from "@iceberg/llm";
import {
  AIReviewSchema,
  CreateEvidenceEntrySchema,
  CreateMissionSchema,
  CreateSubmissionSchema,
  HandoverDocSchema,
  MissionDraftSchema,
  type AiRun,
  type User,
  type UserRole,
  UserRoleSchema
} from "@iceberg/shared";
import { z } from "zod";
import { handoverToMarkdown } from "./markdown.js";
import { calculateReadinessScore } from "./readiness.js";
import { createStore, type AppStore } from "./store.js";

type AppOptions = {
  store?: AppStore;
  llm: LlmService;
};

type AuthedRequest = Request & { user: User };

export function createApp(options: AppOptions) {
  const app = express();
  const store = options.store ?? createStore();

  app.locals.store = store;
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(attachUser(store));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "iceberg-x-intelligence-poc" });
  });

  app.get("/api/users/me", (req, res) => {
    res.json((req as AuthedRequest).user);
  });

  app.get("/api/missions", (req, res) => {
    const status = req.query.status?.toString();
    const category = req.query.category?.toString();
    const missions = store.missions.filter((mission) => {
      if (status && mission.status !== status) return false;
      if (category && mission.category !== category) return false;
      return mission.status !== "archived";
    });
    res.json(missions);
  });

  app.post("/api/missions/generate", requireRole(["admin"]), async (req, res, next) => {
    const schema = z.object({ idea: z.string().min(20), categoryHint: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);

    const started = Date.now();
    let run: AiRun | undefined;
    try {
      const system = "You are the AI Mission Generator for Iceberg X. Produce a mission_generate JSON draft.";
      const user = `Idea: ${parsed.data.idea}\nCategory hint: ${parsed.data.categoryHint ?? "none"}`;
      run = store.addAiRun({
        runType: "mission_generate",
        subjectType: "mission",
        model: process.env.LLM_MODEL ?? process.env.LLM_PROVIDER ?? "unknown",
        promptVersion: "v1.0.0",
        inputHash: inputHash(user),
        status: "pending",
        latencyMs: 0,
        createdBy: (req as AuthedRequest).user.id
      });
      const result = await options.llm.completeStructured({ schema: MissionDraftSchema, system, user, maxRetries: 1 });
      Object.assign(run, { status: "completed", latencyMs: Date.now() - started, model: result.model, tokenUsage: result.usage });
      store.addArtifact({ aiRunId: run.id, artifactType: "validated_output", content: result.data, humanReviewStatus: "pending" });
      res.json({ draft: result.data, aiRun: run });
    } catch (error) {
      if (run) Object.assign(run, { status: "failed", latencyMs: Date.now() - started, errorMessage: errorMessage(error) });
      next(error);
    }
  });

  app.post("/api/missions", requireRole(["admin"]), (req, res) => {
    const parsed = CreateMissionSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    res.status(201).json(store.addMission(parsed.data, (req as AuthedRequest).user.id));
  });

  app.get("/api/missions/:id", (req, res) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    res.json({
      ...mission,
      evidenceCount: store.evidence.filter((item) => item.missionId === mission.id).length,
      submissionCount: store.submissions.filter((item) => item.missionId === mission.id).length
    });
  });

  app.patch("/api/missions/:id", requireRole(["admin"]), (req, res) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    const parsed = CreateMissionSchema.partial().safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    Object.assign(mission, parsed.data, { updatedAt: store.now() });
    res.json(mission);
  });

  app.delete("/api/missions/:id", requireRole(["admin"]), (req, res) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    Object.assign(mission, { status: "archived", updatedAt: store.now() });
    res.status(204).send();
  });

  app.get("/api/missions/:id/evidence", (req, res) => {
    const missionId = paramId(req);
    if (!findMission(store, missionId)) return notFound(res, "Mission not found");
    res.json(store.evidence.filter((item) => item.missionId === missionId));
  });

  app.post("/api/missions/:id/evidence", requireRole(["admin", "intern"]), (req, res) => {
    const missionId = paramId(req);
    if (!findMission(store, missionId)) return notFound(res, "Mission not found");
    const parsed = CreateEvidenceEntrySchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    res.status(201).json(store.addEvidence(missionId, parsed.data, (req as AuthedRequest).user.id));
  });

  app.patch("/api/evidence/:id", requireRole(["admin", "intern"]), (req, res) => {
    const item = store.evidence.find((entry) => entry.id === req.params.id);
    if (!item) return notFound(res, "Evidence not found");
    const user = (req as AuthedRequest).user;
    if (user.role !== "admin" && item.createdBy !== user.id) return forbidden(res);
    const parsed = CreateEvidenceEntrySchema.partial().safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    Object.assign(item, parsed.data);
    res.json(item);
  });

  app.delete("/api/evidence/:id", requireRole(["admin"]), (req, res) => {
    const index = store.evidence.findIndex((entry) => entry.id === req.params.id);
    if (index < 0) return notFound(res, "Evidence not found");
    store.evidence.splice(index, 1);
    res.status(204).send();
  });

  app.post("/api/missions/:id/submissions", requireRole(["intern"]), (req, res) => {
    const missionId = paramId(req);
    if (!findMission(store, missionId)) return notFound(res, "Mission not found");
    const parsed = CreateSubmissionSchema.safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    res.status(201).json(store.addSubmission(missionId, parsed.data, (req as AuthedRequest).user.id));
  });

  app.post("/api/submissions/:id/submit", requireRole(["intern"]), (req, res) => {
    const submission = store.submissions.find((item) => item.id === req.params.id);
    if (!submission) return notFound(res, "Submission not found");
    Object.assign(submission, { status: "submitted", submittedAt: store.now(), updatedAt: store.now() });
    const incomplete = submission.deliverableChecklist.filter((item) => !item.completed);
    res.json({ submission, warning: incomplete.length > 0 ? `${incomplete.length} checklist item(s) incomplete` : undefined });
  });

  app.get("/api/submissions", requireRole(["mentor", "admin"]), (req, res) => {
    const status = req.query.status?.toString();
    const submissions = store.submissions.filter((submission) => (status ? submission.status === status : true));
    res.json(submissions);
  });

  app.patch("/api/submissions/:id/status", requireRole(["mentor"]), (req, res) => {
    const submission = store.submissions.find((item) => item.id === req.params.id);
    if (!submission) return notFound(res, "Submission not found");
    const parsed = z
      .object({
        status: z.enum(["under_review", "revision_requested", "approved"]),
        mentorFeedback: z.string().optional()
      })
      .safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    Object.assign(submission, parsed.data, { reviewedAt: store.now(), updatedAt: store.now() });
    res.json(submission);
  });

  app.post("/api/submissions/:id/ai-review", requireRole(["mentor"]), async (req, res, next) => {
    const submission = store.submissions.find((item) => item.id === req.params.id);
    if (!submission) return notFound(res, "Submission not found");
    const mission = findMission(store, submission.missionId);
    if (!mission) return notFound(res, "Mission not found");
    const started = Date.now();
    let run: AiRun | undefined;
    try {
      const system = "You are the AI Review Assistant for Iceberg X. Produce review_generate JSON.";
      const missionEvidence = store.evidence.filter((item) => item.missionId === mission.id);
      const user = JSON.stringify({ mission, evidence: missionEvidence, submission });
      run = store.addAiRun({
        runType: "review_generate",
        subjectType: "submission",
        subjectId: submission.id,
        model: process.env.LLM_MODEL ?? process.env.LLM_PROVIDER ?? "unknown",
        promptVersion: "v1.0.0",
        inputHash: inputHash(user),
        status: "pending",
        latencyMs: 0,
        createdBy: (req as AuthedRequest).user.id
      });
      const result = await options.llm.completeStructured({ schema: AIReviewSchema, system, user, maxRetries: 1 });
      Object.assign(run, { status: "completed", latencyMs: Date.now() - started, model: result.model, tokenUsage: result.usage });
      store.addArtifact({ aiRunId: run.id, artifactType: "validated_output", content: result.data, humanReviewStatus: "pending" });
      res.status(201).json(store.addReview(submission.id, run.id, result.data));
    } catch (error) {
      if (run) Object.assign(run, { status: "failed", latencyMs: Date.now() - started, errorMessage: errorMessage(error) });
      next(error);
    }
  });

  app.get("/api/submissions/:id/ai-review", requireRole(["mentor", "intern", "admin"]), (req, res) => {
    const review = store.reviews.find((item) => item.submissionId === req.params.id);
    if (!review) return notFound(res, "AI review not found");
    const user = (req as AuthedRequest).user;
    if (user.role === "intern" && !review.publishedAt) return forbidden(res);
    res.json(review);
  });

  app.patch("/api/ai-reviews/:id", requireRole(["mentor"]), (req, res) => {
    const review = store.reviews.find((item) => item.id === req.params.id);
    if (!review) return notFound(res, "AI review not found");
    const parsed = AIReviewSchema.partial()
      .extend({ humanReviewStatus: z.enum(["pending", "approved", "rejected", "edited"]).optional() })
      .safeParse(req.body);
    if (!parsed.success) return validationError(res, parsed.error);
    Object.assign(review, parsed.data);
    res.json(review);
  });

  app.post("/api/ai-reviews/:id/publish", requireRole(["mentor"]), (req, res) => {
    const review = store.reviews.find((item) => item.id === req.params.id);
    if (!review) return notFound(res, "AI review not found");
    if (!["approved", "edited"].includes(review.humanReviewStatus)) {
      return res.status(409).json({ error: "Review must be approved or edited before publish" });
    }
    Object.assign(review, { publishedAt: store.now() });
    res.json(review);
  });

  app.get("/api/missions/:id/readiness", (req, res) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    res.json(computeReadiness(store, mission.id));
  });

  app.post("/api/missions/:id/readiness/compute", requireRole(["admin", "mentor"]), (req, res) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    res.json(computeReadiness(store, mission.id));
  });

  app.get("/api/dashboard/summary", requireRole(["admin", "leadership"]), (_req, res) => {
    const active = store.missions.filter((mission) => mission.status !== "archived");
    const submittedThisWeek = store.submissions.filter((submission) => Boolean(submission.submittedAt)).length;
    const scores = active.map((mission) => computeReadiness(store, mission.id).totalScore);
    res.json({
      totalMissions: active.length,
      submittedThisWeek,
      blockedCount: active.filter((mission) => mission.status === "blocked").length,
      avgReadiness: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
    });
  });

  app.get("/api/dashboard/mentor-workload", requireRole(["admin", "leadership"]), (_req, res) => {
    const mentors = store.users.filter((user) => user.role === "mentor");
    res.json(
      mentors.map((mentor) => ({
        mentorId: mentor.id,
        mentorName: mentor.name,
        activeMissions: store.missions.filter((mission) => mission.assignedMentorId === mentor.id && mission.status === "active").length,
        pendingSubmissions: store.submissions.filter((submission) => {
          const mission = findMission(store, submission.missionId);
          return mission?.assignedMentorId === mentor.id && submission.status === "submitted";
        }).length
      }))
    );
  });

  app.post("/api/missions/:id/handover/generate", requireRole(["admin", "mentor"]), async (req, res, next) => {
    const mission = findMission(store, paramId(req));
    if (!mission) return notFound(res, "Mission not found");
    const evidence = store.evidence.filter((item) => item.missionId === mission.id);
    const submission = latestSubmission(store, mission.id);
    const readiness = computeReadiness(store, mission.id);
    const started = Date.now();
    let run: AiRun | undefined;
    try {
      const system = "You are the Handover Checklist Generator for Iceberg X. Produce handover_generate JSON.";
      const user = JSON.stringify({ mission, evidence, submission, readiness });
      run = store.addAiRun({
        runType: "handover_generate",
        subjectType: "mission",
        subjectId: mission.id,
        model: process.env.LLM_MODEL ?? process.env.LLM_PROVIDER ?? "unknown",
        promptVersion: "v1.0.0",
        inputHash: inputHash(user),
        status: "pending",
        latencyMs: 0,
        createdBy: (req as AuthedRequest).user.id
      });
      const result = await options.llm.completeStructured({ schema: HandoverDocSchema, system, user, maxRetries: 1 });
      Object.assign(run, { status: "completed", latencyMs: Date.now() - started, model: result.model, tokenUsage: result.usage });
      store.addArtifact({ aiRunId: run.id, artifactType: "validated_output", content: result.data, humanReviewStatus: "pending" });
      const contentMarkdown = handoverToMarkdown({ mission, handover: result.data, evidence, submission, readiness });
      res.status(201).json(store.addHandover({ missionId: mission.id, aiRunId: run.id, contentMarkdown, structured: result.data, createdBy: (req as AuthedRequest).user.id }));
    } catch (error) {
      if (run) Object.assign(run, { status: "failed", latencyMs: Date.now() - started, errorMessage: errorMessage(error) });
      next(error);
    }
  });

  app.get("/api/missions/:id/handover", requireRole(["admin", "mentor"]), (req, res) => {
    const handover = store.handovers.find((item) => item.missionId === req.params.id);
    if (!handover) return notFound(res, "Handover not found");
    res.json(handover);
  });

  app.get("/api/ai-runs", requireRole(["admin"]), (_req, res) => {
    res.json(store.aiRuns);
  });

  app.get("/api/ai-runs/:id", requireRole(["admin"]), (req, res) => {
    const run = store.aiRuns.find((item) => item.id === req.params.id);
    if (!run) return notFound(res, "AI run not found");
    res.json({ ...run, artifacts: store.artifacts.filter((item) => item.aiRunId === run.id) });
  });

  app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
    void next;
    res.status(500).json({ error: error.message });
  });

  return app;
}

function attachUser(store: AppStore) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const roleHeader = req.header("x-user-role") ?? "admin";
    const role = UserRoleSchema.safeParse(roleHeader).success ? (roleHeader as UserRole) : "admin";
    (req as AuthedRequest).user = store.userForRole(role);
    next();
  };
}

function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).user;
    if (!roles.includes(user.role)) return forbidden(res);
    next();
  };
}

function validationError(res: Response, error: z.ZodError) {
  return res.status(400).json({ error: "Validation failed", issues: error.issues });
}

function notFound(res: Response, error: string) {
  return res.status(404).json({ error });
}

function forbidden(res: Response) {
  return res.status(403).json({ error: "Forbidden" });
}

function paramId(req: Request): string {
  return String(req.params.id);
}

function findMission(store: AppStore, id: string) {
  return store.missions.find((mission) => mission.id === id);
}

function latestSubmission(store: AppStore, missionId: string) {
  return store.submissions.find((submission) => submission.missionId === missionId);
}

function latestReviewForMission(store: AppStore, missionId: string) {
  const submission = latestSubmission(store, missionId);
  if (!submission) return undefined;
  return store.reviews.find((review) => review.submissionId === submission.id);
}

function computeReadiness(store: AppStore, missionId: string) {
  const score = calculateReadinessScore({
    missionId,
    evidence: store.evidence.filter((item) => item.missionId === missionId),
    submission: latestSubmission(store, missionId),
    review: latestReviewForMission(store, missionId)
  });
  return store.saveReadiness(score);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function demoRequestId(): string {
  return randomUUID();
}
