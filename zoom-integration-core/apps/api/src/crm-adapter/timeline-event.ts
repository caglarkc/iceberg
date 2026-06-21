import type { WebhookEventRecord } from "../store.js";

export interface TimelineEvent {
  event_type: "zoom.meeting.ended" | "zoom.phone.call.completed" | "zoom.recording.ready";
  occurred_at: string;
  source: "zoom-integration-core";
  external_id: string;
  title: string;
  summary: string;
  metadata: Record<string, unknown>;
  related_entity: {
    type: "contact" | "property" | "appointment" | null;
    id?: string;
  };
}

export function webhookToTimelineEvent(event: WebhookEventRecord): TimelineEvent | null {
  const object = (event.payload.object ?? {}) as Record<string, unknown>;
  const base: Omit<TimelineEvent, "event_type" | "title" | "summary" | "metadata"> = {
    occurred_at: event.event_ts,
    source: "zoom-integration-core",
    external_id: `zoom:${event.zoom_event_id}`,
    related_entity: { type: null }
  };

  switch (event.event_type) {
    case "meeting.ended":
      return {
        ...base,
        event_type: "zoom.meeting.ended",
        title: `${String(object.topic ?? "Meeting")} ended`,
        summary: `Meeting duration ${String(object.duration ?? "unknown")} min`,
        metadata: {
          zoom_meeting_uuid: object.uuid,
          join_url: object.join_url,
          transcript_available: true
        }
      };
    case "recording.completed":
      return {
        ...base,
        event_type: "zoom.recording.ready",
        title: `Recording ready: ${String(object.topic ?? "Meeting")}`,
        summary: "Cloud recording completed",
        metadata: {
          zoom_meeting_uuid: object.uuid,
          recording_files: object.recording_files
        }
      };
    case "phone.callee_call_log_completed":
    case "phone.caller_call_log_completed":
      return {
        ...base,
        event_type: "zoom.phone.call.completed",
        title: "Phone call completed",
        summary: `Duration ${String(object.duration ?? 0)}s`,
        metadata: {
          call_id: object.call_id,
          direction: object.direction,
          from: (object.caller as Record<string, unknown>)?.phone_number,
          to: (object.callee as Record<string, unknown>)?.phone_number
        }
      };
    default:
      return null;
  }
}
