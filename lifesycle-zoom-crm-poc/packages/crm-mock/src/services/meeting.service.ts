import { randomUUID } from "node:crypto";
import type { ZoomIntegrationClient } from "@lifesycle/zoom-client";
import { ZoomServiceError } from "@lifesycle/zoom-client";
import type { CrmDatabase, ContactRow, MeetingRow, PropertyRow, AppointmentRow } from "../db.js";
import { encrypt } from "../lib/encryption.js";
import { generateMeetingTopic } from "../lib/topic-generator.js";
import { TimelineService } from "./timeline.service.js";
import { DEMO_AGENT_ID } from "../seed.js";

export class CrmError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "CrmError";
  }
}

export interface ScheduleMeetingInput {
  propertyId?: string;
  appointmentId?: string;
  startTime: string;
  duration?: number;
  topic?: string;
  agenda?: string;
  type?: "scheduled" | "instant";
}

export class MeetingService {
  private timeline: TimelineService;

  constructor(
    private readonly db: CrmDatabase,
    private readonly zoomClient: ZoomIntegrationClient
  ) {
    this.timeline = new TimelineService(db);
  }

  private getContact(id: string): ContactRow {
    const contact = this.db.prepare("SELECT * FROM contacts WHERE id = ?").get(id) as
      | ContactRow
      | undefined;
    if (!contact) throw new CrmError("Contact not found", 404, "NOT_FOUND");
    return contact;
  }

  private getProperty(id: string): PropertyRow | undefined {
    return this.db.prepare("SELECT * FROM properties WHERE id = ?").get(id) as
      | PropertyRow
      | undefined;
  }

  private getAppointment(id: string): AppointmentRow | undefined {
    return this.db.prepare("SELECT * FROM appointments WHERE id = ?").get(id) as
      | AppointmentRow
      | undefined;
  }

  private assertNoDuplicateActiveMeeting(appointmentId?: string): void {
    if (!appointmentId) return;
    const existing = this.db
      .prepare(
        `SELECT id FROM meetings WHERE appointment_id = ? AND status IN ('scheduled', 'started')`
      )
      .get(appointmentId);
    if (existing) {
      throw new CrmError(
        "An active meeting already exists for this appointment",
        409,
        "DUPLICATE_ACTIVE_MEETING"
      );
    }
  }

  private assertFutureSchedule(startTime: string): void {
    if (new Date(startTime) <= new Date()) {
      throw new CrmError("Meeting time cannot be in the past", 400, "INVALID_SCHEDULE_TIME");
    }
  }

  private buildTopic(
    contact: ContactRow,
    property?: PropertyRow,
    appointment?: AppointmentRow,
    override?: string
  ): string {
    if (override) return override;
    return generateMeetingTopic({
      contactFirstName: contact.first_name,
      contactLastName: contact.last_name,
      propertyAddress: property?.address_line1,
      propertyPostcode: property?.postcode ?? undefined,
      appointmentType: appointment?.type
    });
  }

  async createMeetingForContact(
    contactId: string,
    input: ScheduleMeetingInput
  ): Promise<MeetingRow> {
    const contact = this.getContact(contactId);
    const property = input.propertyId ? this.getProperty(input.propertyId) : undefined;
    const appointment = input.appointmentId ? this.getAppointment(input.appointmentId) : undefined;

    if (input.type !== "instant") {
      this.assertFutureSchedule(input.startTime);
    }
    this.assertNoDuplicateActiveMeeting(input.appointmentId);

    const topic = this.buildTopic(contact, property, appointment, input.topic);
    const tracking = {
      crm_contact_id: contactId,
      crm_property_id: input.propertyId,
      crm_valuation_id: input.appointmentId,
      crm_agent_id: contact.assigned_agent_id ?? DEMO_AGENT_ID
    };

    try {
      const zoomMeeting =
        input.type === "instant"
          ? await this.zoomClient.createInstantMeeting({ topic, tracking })
          : await this.zoomClient.createMeeting({
              topic,
              type: 2,
              start_time: input.startTime,
              duration: input.duration ?? 60,
              timezone: "Europe/London",
              agenda: input.agenda ?? "Market appraisal discussion",
              settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
                waiting_room: true,
                auto_recording: "cloud"
              },
              tracking
            });

      const meetingId = randomUUID();
      const startUrlEncrypted = zoomMeeting.start_url
        ? encrypt(zoomMeeting.start_url)
        : null;

      this.db
        .prepare(
          `INSERT INTO meetings
           (id, zoom_service_id, zoom_meeting_id, contact_id, property_id, appointment_id, topic, agenda,
            start_time, duration_minutes, timezone, join_url, start_url_encrypted, password, status, host_agent_id)
           VALUES (@id, @zoom_service_id, @zoom_meeting_id, @contact_id, @property_id, @appointment_id, @topic, @agenda,
            @start_time, @duration_minutes, @timezone, @join_url, @start_url_encrypted, @password, @status, @host_agent_id)`
        )
        .run({
          id: meetingId,
          zoom_service_id: zoomMeeting.id,
          zoom_meeting_id: zoomMeeting.zoom_meeting_id,
          contact_id: contactId,
          property_id: input.propertyId ?? null,
          appointment_id: input.appointmentId ?? null,
          topic: zoomMeeting.topic,
          agenda: input.agenda ?? null,
          start_time: zoomMeeting.start_time ?? input.startTime,
          duration_minutes: zoomMeeting.duration,
          timezone: zoomMeeting.timezone,
          join_url: zoomMeeting.join_url,
          start_url_encrypted: startUrlEncrypted,
          password: zoomMeeting.password ?? null,
          status: zoomMeeting.status,
          host_agent_id: contact.assigned_agent_id ?? DEMO_AGENT_ID
        });

      const eventType = input.type === "instant" ? "meeting.started" : "meeting.scheduled";
      const eventTitle =
        input.type === "instant"
          ? `Zoom meeting started — ${topic}`
          : `Zoom meeting scheduled — ${topic}`;

      this.timeline.createEvent({
        contactId,
        propertyId: input.propertyId,
        appointmentId: input.appointmentId,
        meetingId,
        eventType,
        title: eventTitle,
        actorType: "agent",
        actorId: contact.assigned_agent_id ?? DEMO_AGENT_ID,
        metadata: { zoom_meeting_id: zoomMeeting.zoom_meeting_id }
      });

      return this.getMeeting(meetingId)!;
    } catch (error) {
      if (error instanceof CrmError) throw error;
      if (error instanceof ZoomServiceError) {
        throw new CrmError(error.message, error.status >= 500 ? 502 : error.status, error.code ?? "ZOOM_ERROR");
      }
      throw error;
    }
  }

  private stripHostUrl(row: MeetingRow): MeetingRow {
    const safe = { ...row };
    delete (safe as Partial<MeetingRow>).start_url_encrypted;
    return safe;
  }

  getMeeting(id: string): MeetingRow | undefined {
    const row = this.db.prepare("SELECT * FROM meetings WHERE id = ?").get(id) as
      | MeetingRow
      | undefined;
    if (!row) return undefined;
    return this.stripHostUrl(row);
  }

  listMeetingsByContact(contactId: string): MeetingRow[] {
    return this.db
      .prepare("SELECT * FROM meetings WHERE contact_id = ? ORDER BY created_at DESC")
      .all(contactId)
      .map((row) => this.stripHostUrl(row as MeetingRow));
  }

  async cancelMeeting(id: string): Promise<MeetingRow> {
    const meeting = this.db.prepare("SELECT * FROM meetings WHERE id = ?").get(id) as
      | MeetingRow
      | undefined;
    if (!meeting) throw new CrmError("Meeting not found", 404, "NOT_FOUND");

    this.db
      .prepare("UPDATE meetings SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?")
      .run(id);

    this.timeline.createEvent({
      contactId: meeting.contact_id!,
      propertyId: meeting.property_id ?? undefined,
      appointmentId: meeting.appointment_id ?? undefined,
      meetingId: id,
      eventType: "meeting.cancelled",
      title: `Meeting cancelled — ${meeting.topic}`,
      actorType: "agent",
      actorId: meeting.host_agent_id ?? DEMO_AGENT_ID
    });

    return this.getMeeting(id)!;
  }

  async handleWebhookEvent(event: {
    event: string;
    zoom_meeting_id: string;
    payload: Record<string, unknown>;
    tracking?: { crm_contact_id?: string; crm_valuation_id?: string };
  }): Promise<MeetingRow | null> {
    const meeting = this.db
      .prepare("SELECT * FROM meetings WHERE zoom_meeting_id = ?")
      .get(event.zoom_meeting_id) as MeetingRow | undefined;

    if (!meeting) return null;

    if (event.event === "meeting.ended") {
      const duration = Number(event.payload.duration_minutes ?? 0);
      const participants = Number(event.payload.participant_count ?? 0);
      const recordingFiles = event.payload.recording_files as
        | Array<{ type: string; status: string }>
        | undefined;
      const transcriptPending = recordingFiles?.some((f) => f.type === "audio_transcript");

      this.db
        .prepare(
          `UPDATE meetings SET status = 'ended', actual_duration_min = ?, participant_count = ?,
           recording_status = ?, transcript_status = ?, updated_at = datetime('now') WHERE id = ?`
        )
        .run(
          duration,
          participants,
          transcriptPending ? "processing" : "none",
          transcriptPending ? "pending" : "none",
          meeting.id
        );

      this.timeline.createEvent({
        contactId: meeting.contact_id!,
        propertyId: meeting.property_id ?? undefined,
        appointmentId: meeting.appointment_id ?? undefined,
        meetingId: meeting.id,
        eventType: "meeting.ended",
        title: `Zoom meeting ended — ${duration} min`,
        description: `${participants} participant(s)`,
        actorType: "webhook",
        metadata: { duration_minutes: duration, participant_count: participants }
      });
    }

    return this.getMeeting(meeting.id)!;
  }

  async getEmbedSignature(meetingId: string, role: 0 | 1 = 0) {
    const meeting = this.db.prepare("SELECT * FROM meetings WHERE id = ?").get(meetingId) as
      | MeetingRow
      | undefined;
    if (!meeting) throw new CrmError("Meeting not found", 404, "NOT_FOUND");

    return this.zoomClient.getEmbedSignature(meeting.zoom_service_id, {
      role,
      user_name: "Demo Agent",
      user_email: "demo_agent@lifesycle.mock"
    });
  }

  createFollowUp(
    meetingId: string,
    input: { title: string; dueDate?: string; description?: string }
  ) {
    const meeting = this.db.prepare("SELECT * FROM meetings WHERE id = ?").get(meetingId) as
      | MeetingRow
      | undefined;
    if (!meeting) throw new CrmError("Meeting not found", 404, "NOT_FOUND");

    const id = randomUUID();
    this.db
      .prepare(
        `INSERT INTO follow_up_tasks (id, contact_id, meeting_id, title, description, due_date, status, created_by)
         VALUES (@id, @contact_id, @meeting_id, @title, @description, @due_date, 'draft', @created_by)`
      )
      .run({
        id,
        contact_id: meeting.contact_id,
        meeting_id: meetingId,
        title: input.title,
        description: input.description ?? null,
        due_date: input.dueDate ?? null,
        created_by: meeting.host_agent_id ?? DEMO_AGENT_ID
      });

    this.timeline.createEvent({
      contactId: meeting.contact_id!,
      meetingId,
      eventType: "follow_up.created",
      title: `Follow-up task drafted — ${input.title}`,
      actorType: "agent",
      actorId: meeting.host_agent_id ?? DEMO_AGENT_ID
    });

    return this.db.prepare("SELECT * FROM follow_up_tasks WHERE id = ?").get(id);
  }
}
