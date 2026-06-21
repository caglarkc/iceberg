import { describe, expect, it } from "vitest";
import { webhookToTimelineEvent } from "../../src/crm-adapter/timeline-event.js";

describe("crm-adapter timeline-event", () => {
  it("maps recording.completed to zoom.recording.ready", () => {
    const event = webhookToTimelineEvent({
      id: "1",
      zoom_event_id: "z-1",
      event_type: "recording.completed",
      event_ts: "2026-06-21T10:00:00.000Z",
      payload: { object: { uuid: "u-1", topic: "Valuation Demo Call", recording_files: [{ id: "rec-1" }] } },
      processed: true,
      created_at: "2026-06-21T10:00:00.000Z"
    });
    expect(event?.event_type).toBe("zoom.recording.ready");
    expect(event?.title).toContain("Valuation Demo Call");
    expect(event?.metadata.recording_files).toBeTruthy();
  });

  it("maps phone call to zoom.phone.call.completed", () => {
    const event = webhookToTimelineEvent({
      id: "2",
      zoom_event_id: "z-2",
      event_type: "phone.callee_call_log_completed",
      event_ts: "2026-06-21T10:00:00.000Z",
      payload: {
        object: {
          call_id: "c-1",
          duration: 120,
          direction: "outbound",
          caller: { phone_number: "+44111" },
          callee: { phone_number: "+44222" }
        }
      },
      processed: true,
      created_at: "2026-06-21T10:00:00.000Z"
    });
    expect(event?.event_type).toBe("zoom.phone.call.completed");
  });

  it("returns null for unmapped events", () => {
    expect(
      webhookToTimelineEvent({
        id: "3",
        zoom_event_id: "z-3",
        event_type: "meeting.started",
        event_ts: "2026-06-21T10:00:00.000Z",
        payload: {},
        processed: true,
        created_at: "2026-06-21T10:00:00.000Z"
      })
    ).toBeNull();
  });
});
