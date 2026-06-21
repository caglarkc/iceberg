-- zoom-integration-core initial schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS zoom_meetings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoom_meeting_id   BIGINT NOT NULL UNIQUE,
  zoom_meeting_uuid VARCHAR(255) NOT NULL,
  topic             VARCHAR(500) NOT NULL,
  type              SMALLINT NOT NULL DEFAULT 2,
  start_time        TIMESTAMPTZ,
  duration          INT,
  timezone          VARCHAR(100),
  join_url          TEXT NOT NULL,
  start_url         TEXT,
  password          VARCHAR(100),
  host_id           VARCHAR(100),
  status            VARCHAR(50) NOT NULL DEFAULT 'created',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_zoom_meetings_uuid ON zoom_meetings(zoom_meeting_uuid);

CREATE TABLE IF NOT EXISTS zoom_webhook_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoom_event_id   VARCHAR(255) NOT NULL UNIQUE,
  event_type      VARCHAR(100) NOT NULL,
  event_ts        TIMESTAMPTZ NOT NULL,
  payload         JSONB NOT NULL,
  processed       BOOLEAN NOT NULL DEFAULT FALSE,
  processed_at    TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zoom_recordings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_uuid    VARCHAR(255) NOT NULL,
  recording_id    VARCHAR(255),
  file_type       VARCHAR(50),
  download_url    TEXT,
  transcript_text TEXT,
  file_size       BIGINT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS zoom_phone_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zoom_call_id    VARCHAR(255),
  event_type      VARCHAR(100) NOT NULL,
  direction       VARCHAR(20),
  from_number     VARCHAR(50),
  to_number       VARCHAR(50),
  duration_seconds INT,
  occurred_at     TIMESTAMPTZ NOT NULL,
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
