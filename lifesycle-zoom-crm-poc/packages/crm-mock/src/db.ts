import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  type TEXT NOT NULL,
  assigned_agent_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  contact_id TEXT REFERENCES contacts(id),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  listing_type TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  external_id TEXT,
  property_id TEXT REFERENCES properties(id),
  contact_id TEXT REFERENCES contacts(id),
  type TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  agent_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  zoom_service_id TEXT NOT NULL,
  zoom_meeting_id TEXT NOT NULL,
  contact_id TEXT REFERENCES contacts(id),
  property_id TEXT,
  appointment_id TEXT,
  topic TEXT NOT NULL,
  agenda TEXT,
  start_time TEXT,
  duration_minutes INTEGER,
  timezone TEXT DEFAULT 'Europe/London',
  join_url TEXT NOT NULL,
  start_url_encrypted TEXT,
  password TEXT,
  status TEXT NOT NULL,
  host_agent_id TEXT,
  actual_duration_min INTEGER,
  participant_count INTEGER,
  recording_status TEXT,
  transcript_status TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_meetings_contact ON meetings(contact_id);
CREATE INDEX IF NOT EXISTS idx_meetings_appointment ON meetings(appointment_id);

CREATE TABLE IF NOT EXISTS timeline_events (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id),
  property_id TEXT,
  appointment_id TEXT,
  meeting_id TEXT,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata TEXT DEFAULT '{}',
  actor_type TEXT,
  actor_id TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_timeline_contact ON timeline_events(contact_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id),
  meeting_id TEXT REFERENCES meetings(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'draft',
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

export type CrmDatabase = Database.Database;

let sharedDb: CrmDatabase | null = null;

export function resolveDbPath(databaseUrl?: string): string {
  const url = databaseUrl ?? process.env.DATABASE_URL ?? "sqlite://./dev.db";
  return url.replace("sqlite://", "");
}

export function createDatabase(databaseUrl?: string): CrmDatabase {
  const path = resolveDbPath(databaseUrl);
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

export function getDatabase(databaseUrl?: string): CrmDatabase {
  if (!sharedDb) {
    sharedDb = createDatabase(databaseUrl);
  }
  return sharedDb;
}

export function resetDatabase(databaseUrl?: string): CrmDatabase {
  if (sharedDb) {
    sharedDb.close();
    sharedDb = null;
  }
  return getDatabase(databaseUrl);
}

export function closeDatabase(): void {
  if (sharedDb) {
    sharedDb.close();
    sharedDb = null;
  }
}

export interface ContactRow {
  id: string;
  external_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  type: string;
  assigned_agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyRow {
  id: string;
  external_id: string | null;
  contact_id: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  listing_type: string | null;
  created_at: string;
}

export interface AppointmentRow {
  id: string;
  external_id: string | null;
  property_id: string | null;
  contact_id: string | null;
  type: string;
  scheduled_at: string;
  status: string;
  agent_id: string | null;
  created_at: string;
}

export interface MeetingRow {
  id: string;
  zoom_service_id: string;
  zoom_meeting_id: string;
  contact_id: string | null;
  property_id: string | null;
  appointment_id: string | null;
  topic: string;
  agenda: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  timezone: string | null;
  join_url: string;
  start_url_encrypted: string | null;
  password: string | null;
  status: string;
  host_agent_id: string | null;
  actual_duration_min: number | null;
  participant_count: number | null;
  recording_status: string | null;
  transcript_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEventRow {
  id: string;
  contact_id: string | null;
  property_id: string | null;
  appointment_id: string | null;
  meeting_id: string | null;
  event_type: string;
  title: string;
  description: string | null;
  metadata: string;
  actor_type: string | null;
  actor_id: string | null;
  occurred_at: string;
  created_at: string;
}

export interface FollowUpTaskRow {
  id: string;
  contact_id: string | null;
  meeting_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
}
