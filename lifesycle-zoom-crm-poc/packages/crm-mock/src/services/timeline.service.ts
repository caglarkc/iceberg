import { randomUUID } from "node:crypto";
import type { CrmDatabase, TimelineEventRow } from "../db.js";

export interface CreateTimelineEventInput {
  contactId: string;
  propertyId?: string;
  appointmentId?: string;
  meetingId?: string;
  eventType: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  actorType?: string;
  actorId?: string;
  occurredAt?: string;
}

export class TimelineService {
  constructor(private readonly db: CrmDatabase) {}

  createEvent(input: CreateTimelineEventInput): TimelineEventRow {
    const id = randomUUID();
    const occurredAt = input.occurredAt ?? new Date().toISOString();
    this.db
      .prepare(
        `INSERT INTO timeline_events
         (id, contact_id, property_id, appointment_id, meeting_id, event_type, title, description, metadata, actor_type, actor_id, occurred_at)
         VALUES (@id, @contact_id, @property_id, @appointment_id, @meeting_id, @event_type, @title, @description, @metadata, @actor_type, @actor_id, @occurred_at)`
      )
      .run({
        id,
        contact_id: input.contactId,
        property_id: input.propertyId ?? null,
        appointment_id: input.appointmentId ?? null,
        meeting_id: input.meetingId ?? null,
        event_type: input.eventType,
        title: input.title,
        description: input.description ?? null,
        metadata: JSON.stringify(input.metadata ?? {}),
        actor_type: input.actorType ?? "system",
        actor_id: input.actorId ?? null,
        occurred_at: occurredAt
      });
    return this.getById(id)!;
  }

  getById(id: string): TimelineEventRow | undefined {
    return this.db.prepare("SELECT * FROM timeline_events WHERE id = ?").get(id) as
      | TimelineEventRow
      | undefined;
  }

  listByContact(contactId: string, limit = 50): TimelineEventRow[] {
    return this.db
      .prepare(
        "SELECT * FROM timeline_events WHERE contact_id = ? ORDER BY occurred_at DESC LIMIT ?"
      )
      .all(contactId, limit) as TimelineEventRow[];
  }

  mapEvent(row: TimelineEventRow) {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || "{}")
    };
  }
}

export function mapTimelineEventType(eventType: string, duration?: number): string {
  switch (eventType) {
    case "meeting.scheduled":
      return "meeting_scheduled";
    case "meeting.started":
      return "meeting_started";
    case "meeting.ended":
      return duration !== undefined ? `meeting_ended — ${duration} min` : "meeting_ended";
    case "meeting.recording_ready":
      return "recording_ready";
    default:
      return eventType;
  }
}
