import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "mentor", "intern", "leadership"]);
export const missionStatus = pgEnum("mission_status", ["draft", "active", "blocked", "completed", "archived"]);
export const evidenceSourceType = pgEnum("evidence_source_type", ["url", "document", "screenshot", "meeting", "manual"]);
export const evidenceReliability = pgEnum("evidence_reliability", ["high", "medium", "low", "unverified"]);
export const submissionStatus = pgEnum("submission_status", ["draft", "submitted", "under_review", "revision_requested", "approved"]);
export const aiRunType = pgEnum("ai_run_type", ["mission_generate", "review_generate", "handover_generate", "readiness_explain"]);
export const aiRunStatus = pgEnum("ai_run_status", ["pending", "completed", "failed"]);
export const artifactType = pgEnum("artifact_type", ["raw_response", "parsed_output", "validated_output"]);
export const humanReviewStatus = pgEnum("human_review_status", ["pending", "approved", "rejected", "edited"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const missions = pgTable("missions", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  context: text("context").notNull(),
  problemStatement: text("problem_statement").notNull(),
  expectedDeliverables: jsonb("expected_deliverables").notNull().default([]),
  difficultyLevel: smallint("difficulty_level").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  estimatedWeeks: smallint("estimated_weeks").notNull(),
  suggestedSkills: jsonb("suggested_skills").notNull().default([]),
  status: missionStatus("status").notNull().default("draft"),
  assignedMentorId: uuid("assigned_mentor_id").references(() => users.id),
  assignedInternId: uuid("assigned_intern_id").references(() => users.id),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const evidenceEntries = pgTable("evidence_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionId: uuid("mission_id").notNull().references(() => missions.id),
  claim: text("claim").notNull(),
  sourceType: evidenceSourceType("source_type").notNull(),
  sourceUrl: varchar("source_url", { length: 2048 }),
  sourceTitle: varchar("source_title", { length: 255 }),
  reliability: evidenceReliability("reliability").notNull(),
  notes: text("notes"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  missionId: uuid("mission_id").notNull().references(() => missions.id),
  internId: uuid("intern_id").notNull().references(() => users.id),
  repoUrl: varchar("repo_url", { length: 2048 }).notNull(),
  demoUrl: varchar("demo_url", { length: 2048 }).notNull(),
  videoUrl: varchar("video_url", { length: 2048 }),
  notes: text("notes").notNull(),
  deliverableChecklist: jsonb("deliverable_checklist").notNull().default([]),
  hasReadme: boolean("has_readme").notNull().default(false),
  status: submissionStatus("status").notNull().default("draft"),
  mentorFeedback: text("mentor_feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const aiRuns = pgTable("ai_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  runType: aiRunType("run_type").notNull(),
  subjectType: varchar("subject_type", { length: 80 }).notNull(),
  subjectId: uuid("subject_id"),
  model: varchar("model", { length: 120 }).notNull(),
  promptVersion: varchar("prompt_version", { length: 40 }).notNull(),
  inputHash: varchar("input_hash", { length: 64 }).notNull(),
  status: aiRunStatus("status").notNull(),
  latencyMs: integer("latency_ms").notNull().default(0),
  tokenUsage: jsonb("token_usage"),
  errorMessage: text("error_message"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});
