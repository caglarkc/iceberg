import { randomUUID } from "node:crypto";
import type { Meeting, PhoneEvent, RecordingFile } from "../providers/zoom-provider.interface.js";

export interface WebhookEventRecord {
  id: string;
  zoom_event_id: string;
  event_type: string;
  event_ts: string;
  payload: Record<string, unknown>;
  processed: boolean;
  processed_at?: string;
  error_message?: string;
  created_at: string;
}

export interface ZoomStore {
  saveMeeting(meeting: Meeting): Meeting;
  getMeeting(id: string): Meeting | undefined;
  listMeetings(): Meeting[];
  updateMeetingStatus(uuid: string, status: Meeting["status"]): Meeting | undefined;
  saveWebhookEvent(event: Omit<WebhookEventRecord, "id" | "created_at">): WebhookEventRecord;
  getWebhookEventByZoomId(zoomEventId: string): WebhookEventRecord | undefined;
  listWebhookEvents(filter?: { event_type?: string }): WebhookEventRecord[];
  getWebhookEvent(id: string): WebhookEventRecord | undefined;
  saveRecording(recording: RecordingFile): RecordingFile;
  listRecordings(meetingUuid: string): RecordingFile[];
  savePhoneEvent(event: PhoneEvent): PhoneEvent;
  listPhoneEvents(): PhoneEvent[];
}

export function createInMemoryStore(): ZoomStore {
  const meetings = new Map<string, Meeting>();
  const webhookEvents = new Map<string, WebhookEventRecord>();
  const webhookByZoomId = new Map<string, string>();
  const recordings = new Map<string, RecordingFile[]>();
  const phoneEvents: PhoneEvent[] = [];

  return {
    saveMeeting(meeting) {
      meetings.set(String(meeting.zoom_meeting_id), meeting);
      meetings.set(meeting.zoom_meeting_uuid, meeting);
      return meeting;
    },
    getMeeting(id) {
      return meetings.get(id);
    },
    listMeetings() {
      const seen = new Set<number>();
      return [...meetings.values()].filter((m) => {
        if (seen.has(m.zoom_meeting_id)) return false;
        seen.add(m.zoom_meeting_id);
        return true;
      });
    },
    updateMeetingStatus(uuid, status) {
      const meeting = meetings.get(uuid);
      if (!meeting) return undefined;
      meeting.status = status;
      meeting.updated_at = new Date().toISOString();
      return meeting;
    },
    saveWebhookEvent(event) {
      const record: WebhookEventRecord = {
        id: randomUUID(),
        created_at: new Date().toISOString(),
        ...event
      };
      webhookEvents.set(record.id, record);
      webhookByZoomId.set(record.zoom_event_id, record.id);
      return record;
    },
    getWebhookEventByZoomId(zoomEventId) {
      const id = webhookByZoomId.get(zoomEventId);
      return id ? webhookEvents.get(id) : undefined;
    },
    listWebhookEvents(filter) {
      return [...webhookEvents.values()]
        .filter((e) => (filter?.event_type ? e.event_type === filter.event_type : true))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    getWebhookEvent(id) {
      return webhookEvents.get(id);
    },
    saveRecording(recording) {
      const list = recordings.get(recording.meeting_uuid) ?? [];
      list.push(recording);
      recordings.set(recording.meeting_uuid, list);
      return recording;
    },
    listRecordings(meetingUuid) {
      return recordings.get(meetingUuid) ?? [];
    },
    savePhoneEvent(event) {
      phoneEvents.push(event);
      return event;
    },
    listPhoneEvents() {
      return [...phoneEvents].sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
    }
  };
}

export function maskStartUrl(meeting: Meeting, isHost = false): Meeting {
  if (isHost) return meeting;
  const { start_url: _startUrl, ...rest } = meeting;
  return { ...rest, start_url: undefined };
}
