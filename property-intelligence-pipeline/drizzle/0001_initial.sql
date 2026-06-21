-- M4 Property Intelligence Pipeline — reference schema (Faz 2 persistence)
-- POC uses in-memory PipStore; apply via docker-compose postgres init.

CREATE TABLE IF NOT EXISTS plaud_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_recording_id TEXT UNIQUE NOT NULL,
  company_id UUID NOT NULL,
  fetched_via TEXT NOT NULL,
  title TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  duration_sec INT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES plaud_recordings(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  summary TEXT,
  speaker_json JSONB,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES plaud_recordings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  user_id UUID,
  property_id UUID,
  contact_id UUID,
  confidence NUMERIC(4,3) NOT NULL,
  signals_json JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL,
  decided_by UUID,
  decided_at TIMESTAMPTZ,
  candidates_json JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS ai_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES plaud_recordings(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_json JSONB NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proposal_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES plaud_recordings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL,
  ai_run_id UUID NOT NULL REFERENCES ai_runs(id),
  fields_json JSONB NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS proposal_field_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extraction_id UUID NOT NULL REFERENCES proposal_extractions(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by UUID
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID,
  payload_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  contact_id UUID,
  consented_at TIMESTAMPTZ NOT NULL,
  method TEXT NOT NULL,
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recordings_company ON plaud_recordings(company_id);
CREATE INDEX IF NOT EXISTS idx_recordings_status ON plaud_recordings(status);
CREATE INDEX IF NOT EXISTS idx_matches_recording ON transcript_matches(recording_id);
