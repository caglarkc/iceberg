import { z } from "zod";

export const UserRoleSchema = z.enum(["admin", "mentor", "intern", "leadership"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const HumanReviewStatusSchema = z.enum(["pending", "approved", "rejected", "edited"]);
export type HumanReviewStatus = z.infer<typeof HumanReviewStatusSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
  createdAt: z.string()
});
export type User = z.infer<typeof UserSchema>;

export const MissionStatusSchema = z.enum(["draft", "active", "blocked", "completed", "archived"]);
export const MissionDraftSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  context: z.string().min(10),
  problemStatement: z.string().min(10),
  expectedDeliverables: z.array(z.string().min(3)).min(1),
  difficultyLevel: z.number().int().min(1).max(5),
  category: z.string().min(2),
  estimatedWeeks: z.number().int().min(1).max(12),
  suggestedSkills: z.array(z.string().min(2)).min(1)
});
export type MissionDraft = z.infer<typeof MissionDraftSchema>;

export const MissionSchema = MissionDraftSchema.extend({
  id: z.string().uuid(),
  status: MissionStatusSchema,
  assignedMentorId: z.string().uuid().optional(),
  assignedInternId: z.string().uuid().optional(),
  aiGenerated: z.boolean(),
  createdBy: z.string().uuid(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type Mission = z.infer<typeof MissionSchema>;

export const CreateMissionSchema = MissionDraftSchema.extend({
  status: MissionStatusSchema.default("draft"),
  assignedMentorId: z.string().uuid().optional(),
  assignedInternId: z.string().uuid().optional(),
  aiGenerated: z.boolean().default(false)
});
export type CreateMission = z.infer<typeof CreateMissionSchema>;

export const EvidenceReliabilitySchema = z.enum(["high", "medium", "low", "unverified"]);
export const EvidenceSourceTypeSchema = z.enum(["url", "document", "screenshot", "meeting", "manual"]);
export const EvidenceEntrySchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  claim: z.string().min(3),
  sourceType: EvidenceSourceTypeSchema,
  sourceUrl: z.string().url().optional(),
  sourceTitle: z.string().min(2).optional(),
  reliability: EvidenceReliabilitySchema,
  notes: z.string().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string()
});
export type EvidenceEntry = z.infer<typeof EvidenceEntrySchema>;

export const CreateEvidenceEntrySchema = EvidenceEntrySchema.omit({
  id: true,
  missionId: true,
  createdBy: true,
  createdAt: true
});
export type CreateEvidenceEntry = z.infer<typeof CreateEvidenceEntrySchema>;

export const ChecklistItemSchema = z.object({
  name: z.string().min(2),
  completed: z.boolean(),
  evidenceLink: z.string().optional()
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const SubmissionStatusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "revision_requested",
  "approved"
]);
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  missionId: z.string().uuid(),
  internId: z.string().uuid(),
  repoUrl: z.string().url(),
  demoUrl: z.string().url(),
  videoUrl: z.string().url().optional(),
  notes: z.string().min(1),
  deliverableChecklist: z.array(ChecklistItemSchema).min(1),
  hasReadme: z.boolean().default(false),
  status: SubmissionStatusSchema,
  mentorFeedback: z.string().optional(),
  submittedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});
export type Submission = z.infer<typeof SubmissionSchema>;

export const CreateSubmissionSchema = SubmissionSchema.omit({
  id: true,
  internId: true,
  missionId: true,
  status: true,
  mentorFeedback: true,
  submittedAt: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true
});
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;

export const RiskFlagSchema = z.object({
  severity: z.enum(["low", "medium", "high", "critical"]),
  message: z.string().min(3)
});
export const AIReviewSchema = z.object({
  strengths: z.array(z.string().min(3)).min(1),
  weaknesses: z.array(z.string().min(3)).min(1),
  reviewQuestions: z.array(z.string().min(3)).min(1),
  suggestedFeedback: z.string().min(10),
  riskFlags: z.array(RiskFlagSchema)
});
export type AIReviewDraft = z.infer<typeof AIReviewSchema>;

export const AIReviewRecordSchema = AIReviewSchema.extend({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
  aiRunId: z.string().uuid(),
  humanReviewStatus: HumanReviewStatusSchema,
  publishedAt: z.string().optional(),
  createdAt: z.string()
});
export type AIReviewRecord = z.infer<typeof AIReviewRecordSchema>;

export const AiRunSchema = z.object({
  id: z.string().uuid(),
  runType: z.enum(["mission_generate", "review_generate", "handover_generate", "readiness_explain"]),
  subjectType: z.string(),
  subjectId: z.string().optional(),
  model: z.string(),
  promptVersion: z.string(),
  inputHash: z.string(),
  status: z.enum(["pending", "completed", "failed"]),
  latencyMs: z.number().int().nonnegative(),
  tokenUsage: z.object({ inputTokens: z.number().optional(), outputTokens: z.number().optional() }).optional(),
  errorMessage: z.string().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.string()
});
export type AiRun = z.infer<typeof AiRunSchema>;

export const AiRunArtifactSchema = z.object({
  id: z.string().uuid(),
  aiRunId: z.string().uuid(),
  artifactType: z.enum(["raw_response", "parsed_output", "validated_output"]),
  content: z.unknown(),
  humanReviewStatus: HumanReviewStatusSchema.default("pending"),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.string().optional(),
  createdAt: z.string()
});
export type AiRunArtifact = z.infer<typeof AiRunArtifactSchema>;

export const ReadinessBreakdownSchema = z.object({
  checklist: z.number().min(0).max(25),
  evidence: z.number().min(0).max(20),
  submissionCompleteness: z.number().min(0).max(15),
  aiRisk: z.number().min(0).max(15),
  mentorApproval: z.number().min(0).max(15),
  documentation: z.number().min(0).max(10)
});
export const ReadinessScoreSchema = z.object({
  missionId: z.string().uuid(),
  totalScore: z.number().int().min(0).max(100),
  label: z.enum(["Handover-ready", "Needs work", "Not ready"]),
  breakdown: ReadinessBreakdownSchema,
  computedAt: z.string()
});
export type ReadinessScore = z.infer<typeof ReadinessScoreSchema>;

export const HandoverDocSchema = z.object({
  projectSummary: z.string().min(10),
  architectureOverview: z.string().min(10),
  setupInstructions: z.array(z.string().min(3)).min(1),
  environmentVariables: z.array(z.string().min(3)).min(1),
  apiEndpointSummary: z.array(z.string().min(3)).min(1),
  knownIssues: z.array(z.string().min(3)),
  testPlanChecklist: z.array(z.string().min(3)).min(1),
  productionIntegrationChecklist: z.array(z.string().min(3)).min(1),
  evidenceBibliography: z.array(z.string().min(3))
});
export type HandoverDoc = z.infer<typeof HandoverDocSchema>;

export function readinessLabel(totalScore: number): ReadinessScore["label"] {
  if (totalScore >= 85) return "Handover-ready";
  if (totalScore >= 60) return "Needs work";
  return "Not ready";
}
