import { randomUUID } from "node:crypto";
import {
  type AIReviewDraft,
  type AIReviewRecord,
  type AiRun,
  type AiRunArtifact,
  type CreateEvidenceEntry,
  type CreateMission,
  type CreateSubmission,
  type EvidenceEntry,
  type HandoverDoc,
  type Mission,
  type ReadinessScore,
  type Submission,
  type User,
  type UserRole
} from "@iceberg/shared";

export type HandoverPackage = {
  id: string;
  missionId: string;
  aiRunId: string;
  contentMarkdown: string;
  structured: HandoverDoc;
  exportedAt: string;
  createdBy: string;
  createdAt: string;
};

export type AppStore = ReturnType<typeof createStore>;

export function createStore() {
  const now = () => new Date().toISOString();
  const users: User[] = [
    { id: "11111111-1111-4111-8111-111111111111", email: "admin@iceberg.local", name: "Ada Admin", role: "admin", createdAt: now() },
    { id: "22222222-2222-4222-8222-222222222222", email: "mentor@iceberg.local", name: "Mert Mentor", role: "mentor", createdAt: now() },
    { id: "33333333-3333-4333-8333-333333333333", email: "intern@iceberg.local", name: "Iris Intern", role: "intern", createdAt: now() },
    {
      id: "44444444-4444-4444-8444-444444444444",
      email: "leadership@iceberg.local",
      name: "Lara Leadership",
      role: "leadership",
      createdAt: now()
    }
  ];

  const missions: Mission[] = [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      title: "Seed: Plaud Transcript CRM Intelligence Bridge",
      description: "Demo mission showing the cross-mission scenario from transcript evidence to handover package.",
      context: "Seeded for dashboard and demo rehearsals.",
      problemStatement: "Transcript-driven property intelligence needs traceable mission execution and mentor review.",
      expectedDeliverables: ["API contract", "Evidence model", "Submission demo", "Review notes", "Handover package"],
      difficultyLevel: 4,
      category: "Property Intelligence",
      estimatedWeeks: 4,
      suggestedSkills: ["TypeScript", "CRM workflows", "LLM structured output"],
      status: "active",
      assignedMentorId: users[1].id,
      assignedInternId: users[2].id,
      aiGenerated: true,
      createdBy: users[0].id,
      createdAt: now(),
      updatedAt: now()
    }
  ];

  const evidence: EvidenceEntry[] = [
    {
      id: randomUUID(),
      missionId: missions[0].id,
      claim: "Mock-first POC mode is required for CI and demo safety.",
      sourceType: "manual",
      sourceTitle: "Shared constraints",
      reliability: "high",
      notes: "No production Iceberg X writes.",
      createdBy: users[0].id,
      createdAt: now()
    }
  ];
  const submissions: Submission[] = [];
  const aiRuns: AiRun[] = [];
  const artifacts: AiRunArtifact[] = [];
  const reviews: AIReviewRecord[] = [];
  const readinessScores: ReadinessScore[] = [];
  const handovers: HandoverPackage[] = [];

  return {
    users,
    missions,
    evidence,
    submissions,
    aiRuns,
    artifacts,
    reviews,
    readinessScores,
    handovers,
    now,
    userForRole(role: UserRole): User {
      return users.find((user) => user.role === role) ?? users[0];
    },
    addMission(input: CreateMission, createdBy: string): Mission {
      const mission: Mission = {
        ...input,
        id: randomUUID(),
        createdBy,
        createdAt: now(),
        updatedAt: now()
      };
      missions.unshift(mission);
      return mission;
    },
    addEvidence(missionId: string, input: CreateEvidenceEntry, createdBy: string): EvidenceEntry {
      const item: EvidenceEntry = { ...input, id: randomUUID(), missionId, createdBy, createdAt: now() };
      evidence.unshift(item);
      return item;
    },
    addSubmission(missionId: string, input: CreateSubmission, internId: string): Submission {
      const existing = submissions.find((submission) => submission.missionId === missionId && submission.internId === internId);
      if (existing) {
        Object.assign(existing, input, { updatedAt: now() });
        return existing;
      }
      const submission: Submission = {
        ...input,
        id: randomUUID(),
        missionId,
        internId,
        status: "draft",
        createdAt: now(),
        updatedAt: now()
      };
      submissions.unshift(submission);
      return submission;
    },
    addAiRun(input: Omit<AiRun, "id" | "createdAt">): AiRun {
      const run: AiRun = { ...input, id: randomUUID(), createdAt: now() };
      aiRuns.unshift(run);
      return run;
    },
    addArtifact(input: Omit<AiRunArtifact, "id" | "createdAt">): AiRunArtifact {
      const artifact: AiRunArtifact = { ...input, id: randomUUID(), createdAt: now() };
      artifacts.unshift(artifact);
      return artifact;
    },
    addReview(submissionId: string, aiRunId: string, draft: AIReviewDraft): AIReviewRecord {
      const existing = reviews.find((review) => review.submissionId === submissionId);
      if (existing) {
        Object.assign(existing, draft, { aiRunId, humanReviewStatus: "pending" });
        return existing;
      }
      const review: AIReviewRecord = {
        ...draft,
        id: randomUUID(),
        submissionId,
        aiRunId,
        humanReviewStatus: "pending",
        createdAt: now()
      };
      reviews.unshift(review);
      return review;
    },
    saveReadiness(score: ReadinessScore): ReadinessScore {
      const index = readinessScores.findIndex((item) => item.missionId === score.missionId);
      if (index >= 0) readinessScores[index] = score;
      else readinessScores.unshift(score);
      return score;
    },
    addHandover(input: Omit<HandoverPackage, "id" | "createdAt" | "exportedAt">): HandoverPackage {
      const handover: HandoverPackage = { ...input, id: randomUUID(), createdAt: now(), exportedAt: now() };
      handovers.unshift(handover);
      return handover;
    }
  };
}
