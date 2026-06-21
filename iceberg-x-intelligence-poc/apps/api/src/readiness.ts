import {
  type AIReviewRecord,
  type EvidenceEntry,
  type ReadinessScore,
  type Submission,
  readinessLabel
} from "@iceberg/shared";

const reliabilityWeights: Record<EvidenceEntry["reliability"], number> = {
  high: 1,
  medium: 0.7,
  low: 0.4,
  unverified: 0.2
};

export function calculateReadinessScore(params: {
  missionId: string;
  evidence: EvidenceEntry[];
  submission?: Submission;
  review?: AIReviewRecord;
}): ReadinessScore {
  const checklist = params.submission
    ? ratio(
        params.submission.deliverableChecklist.filter((item) => item.completed).length,
        params.submission.deliverableChecklist.length
      ) * 25
    : 0;

  const evidence =
    params.evidence.length === 0
      ? 0
      : (params.evidence.reduce((sum, item) => sum + reliabilityWeights[item.reliability], 0) / params.evidence.length) * 20;

  const submissionCompleteness = params.submission
    ? [params.submission.repoUrl, params.submission.demoUrl, params.submission.notes].filter(Boolean).length * 5
    : 0;

  const aiRisk = scoreRisk(params.review);
  const mentorApproval = scoreMentorStatus(params.submission?.status);
  const documentation = params.submission?.hasReadme ? 10 : 0;

  const breakdown = {
    checklist: round(checklist),
    evidence: round(evidence),
    submissionCompleteness: round(submissionCompleteness),
    aiRisk,
    mentorApproval,
    documentation
  };

  const totalScore = Math.min(100, Math.round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)));
  return {
    missionId: params.missionId,
    totalScore,
    label: readinessLabel(totalScore),
    breakdown,
    computedAt: new Date().toISOString()
  };
}

function ratio(done: number, total: number): number {
  return total === 0 ? 0 : done / total;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function scoreRisk(review?: AIReviewRecord): number {
  if (!review) return 8;
  if (review.riskFlags.some((flag) => flag.severity === "critical")) return 0;
  if (review.riskFlags.some((flag) => flag.severity === "high")) return 5;
  if (review.riskFlags.some((flag) => flag.severity === "medium")) return 10;
  if (review.riskFlags.some((flag) => flag.severity === "low")) return 13;
  return 15;
}

function scoreMentorStatus(status?: Submission["status"]): number {
  if (status === "approved") return 15;
  if (status === "revision_requested") return 7.5;
  if (status === "under_review") return 5;
  return 0;
}
