import { describe, expect, it } from "vitest";
import type { AIReviewRecord, EvidenceEntry, Submission } from "@iceberg/shared";
import { calculateReadinessScore } from "../src/readiness.js";

const missionId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("calculateReadinessScore", () => {
  it("scores approved complete submissions as handover-ready", () => {
    const score = calculateReadinessScore({
      missionId,
      evidence: [evidence("high"), evidence("medium"), evidence("high")],
      submission: submission("approved", true),
      review: review([])
    });

    expect(score.totalScore).toBeGreaterThanOrEqual(85);
    expect(score.label).toBe("Handover-ready");
  });

  it("penalizes missing evidence and critical risk flags", () => {
    const score = calculateReadinessScore({
      missionId,
      evidence: [],
      submission: submission("submitted", false),
      review: review([{ severity: "critical", message: "No production boundary documented" }])
    });

    expect(score.totalScore).toBeLessThan(60);
    expect(score.label).toBe("Not ready");
  });
});

function evidence(reliability: EvidenceEntry["reliability"]): EvidenceEntry {
  return {
    id: crypto.randomUUID(),
    missionId,
    claim: "Claim",
    sourceType: "manual",
    reliability,
    createdBy: "11111111-1111-4111-8111-111111111111",
    createdAt: new Date().toISOString()
  };
}

function submission(status: Submission["status"], hasReadme: boolean): Submission {
  return {
    id: crypto.randomUUID(),
    missionId,
    internId: "33333333-3333-4333-8333-333333333333",
    repoUrl: "https://github.com/example/repo",
    demoUrl: "https://demo.example.com",
    notes: "Demo notes",
    deliverableChecklist: [
      { name: "API", completed: true },
      { name: "UI", completed: true },
      { name: "Tests", completed: status === "approved" }
    ],
    hasReadme,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function review(riskFlags: AIReviewRecord["riskFlags"]): AIReviewRecord {
  return {
    id: crypto.randomUUID(),
    submissionId: crypto.randomUUID(),
    aiRunId: crypto.randomUUID(),
    strengths: ["Good structure"],
    weaknesses: ["Needs polish"],
    reviewQuestions: ["What is next?"],
    suggestedFeedback: "Looks good after final checks.",
    riskFlags,
    humanReviewStatus: "approved",
    createdAt: new Date().toISOString()
  };
}
