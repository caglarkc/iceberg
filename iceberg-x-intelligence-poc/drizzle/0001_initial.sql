CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'intern', 'leadership');
CREATE TYPE mission_status AS ENUM ('draft', 'active', 'blocked', 'completed', 'archived');
CREATE TYPE evidence_source_type AS ENUM ('url', 'document', 'screenshot', 'meeting', 'manual');
CREATE TYPE evidence_reliability AS ENUM ('high', 'medium', 'low', 'unverified');
CREATE TYPE submission_status AS ENUM ('draft', 'submitted', 'under_review', 'revision_requested', 'approved');
CREATE TYPE ai_run_type AS ENUM ('mission_generate', 'review_generate', 'handover_generate', 'readiness_explain');
CREATE TYPE ai_run_status AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE artifact_type AS ENUM ('raw_response', 'parsed_output', 'validated_output');
CREATE TYPE human_review_status AS ENUM ('pending', 'approved', 'rejected', 'edited');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  context TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  expected_deliverables JSONB NOT NULL DEFAULT '[]',
  difficulty_level SMALLINT NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  category VARCHAR(120) NOT NULL,
  estimated_weeks SMALLINT NOT NULL CHECK (estimated_weeks BETWEEN 1 AND 12),
  suggested_skills JSONB NOT NULL DEFAULT '[]',
  status mission_status NOT NULL DEFAULT 'draft',
  assigned_mentor_id UUID REFERENCES users(id),
  assigned_intern_id UUID REFERENCES users(id),
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE evidence_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  claim TEXT NOT NULL,
  source_type evidence_source_type NOT NULL,
  source_url VARCHAR(2048),
  source_title VARCHAR(255),
  reliability evidence_reliability NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  intern_id UUID NOT NULL REFERENCES users(id),
  repo_url VARCHAR(2048) NOT NULL,
  demo_url VARCHAR(2048) NOT NULL,
  video_url VARCHAR(2048),
  notes TEXT NOT NULL,
  deliverable_checklist JSONB NOT NULL DEFAULT '[]',
  has_readme BOOLEAN NOT NULL DEFAULT false,
  status submission_status NOT NULL DEFAULT 'draft',
  mentor_feedback TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_type ai_run_type NOT NULL,
  subject_type VARCHAR(80) NOT NULL,
  subject_id UUID,
  model VARCHAR(120) NOT NULL,
  prompt_version VARCHAR(40) NOT NULL,
  input_hash VARCHAR(64) NOT NULL,
  status ai_run_status NOT NULL,
  latency_ms INT NOT NULL DEFAULT 0,
  token_usage JSONB,
  error_message TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_run_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_run_id UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
  artifact_type artifact_type NOT NULL,
  content JSONB NOT NULL,
  human_review_status human_review_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  ai_run_id UUID NOT NULL REFERENCES ai_runs(id),
  strengths JSONB NOT NULL DEFAULT '[]',
  weaknesses JSONB NOT NULL DEFAULT '[]',
  review_questions JSONB NOT NULL DEFAULT '[]',
  suggested_feedback TEXT NOT NULL,
  risk_flags JSONB NOT NULL DEFAULT '[]',
  human_review_status human_review_status NOT NULL DEFAULT 'pending',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE readiness_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL UNIQUE REFERENCES missions(id) ON DELETE CASCADE,
  total_score SMALLINT NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  breakdown JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE handover_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  ai_run_id UUID NOT NULL REFERENCES ai_runs(id),
  content_markdown TEXT NOT NULL,
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
