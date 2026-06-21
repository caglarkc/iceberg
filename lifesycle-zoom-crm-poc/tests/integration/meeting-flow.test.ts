import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { unlinkSync, existsSync } from "node:fs";
import {
  createDatabase,
  seedDatabase,
  MeetingService,
  TimelineService
} from "../../packages/crm-mock/src/index.js";
import { MockZoomServiceAdapter } from "../../packages/zoom-client/src/index.js";

const TEST_DB = "./test-integration.db";
const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("Meeting flow integration", () => {
  let db: ReturnType<typeof createDatabase>;
  let meetingService: MeetingService;
  let timelineService: TimelineService;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
    process.env.DATABASE_URL = `sqlite://${TEST_DB}`;
    db = createDatabase(`sqlite://${TEST_DB}`);
    seedDatabase(db);
    const zoom = new MockZoomServiceAdapter();
    meetingService = new MeetingService(db, zoom);
    timelineService = new TimelineService(db);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it("T01: schedule meeting from valuation context creates meeting + timeline", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      propertyId: "prop_oak_lane",
      appointmentId: "val_001",
      startTime: "2026-07-15T10:00:00Z",
      duration: 60
    });

    expect(meeting.topic).toBe("Valuation call — 14 Oak Lane, SW19");
    expect(meeting.join_url).toMatch(/^https:\/\/zoom\.us\/j\//);
    expect(meeting.start_url_encrypted).toBeUndefined();

    const events = timelineService.listByContact("cnt_sarah");
    expect(events.some((e) => e.event_type === "meeting.scheduled")).toBe(true);
  });

  it("T02: instant meeting sets status=started", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      startTime: new Date().toISOString(),
      type: "instant"
    });
    expect(meeting.status).toBe("started");
    const events = timelineService.listByContact("cnt_sarah");
    expect(events.some((e) => e.event_type === "meeting.started")).toBe(true);
  });

  it("T06: webhook meeting.ended updates timeline", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      propertyId: "prop_oak_lane",
      appointmentId: "val_001",
      startTime: "2026-07-20T10:00:00Z"
    });

    await meetingService.handleWebhookEvent({
      event: "meeting.ended",
      zoom_meeting_id: meeting.zoom_meeting_id,
      payload: {
        duration_minutes: 47,
        participant_count: 2,
        recording_files: [{ type: "audio_transcript", status: "processing" }]
      },
      tracking: { crm_contact_id: "cnt_sarah", crm_valuation_id: "val_001" }
    });

    const updated = meetingService.getMeeting(meeting.id)!;
    expect(updated.status).toBe("ended");
    expect(updated.actual_duration_min).toBe(47);
    expect(updated.transcript_status).toBe("pending");

    const events = timelineService.listByContact("cnt_sarah");
    expect(events.some((e) => e.title.includes("47 min"))).toBe(true);
  });

  it("T07: duplicate active meeting returns 409", async () => {
    await meetingService.createMeetingForContact("cnt_sarah", {
      propertyId: "prop_oak_lane",
      appointmentId: "val_001",
      startTime: "2026-07-25T10:00:00Z"
    });

    await expect(
      meetingService.createMeetingForContact("cnt_sarah", {
        propertyId: "prop_oak_lane",
        appointmentId: "val_001",
        startTime: "2026-07-26T10:00:00Z"
      })
    ).rejects.toMatchObject({ code: "DUPLICATE_ACTIVE_MEETING", status: 409 });
  });

  it("T09: start_url never exposed in GET meeting", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      startTime: "2026-08-01T10:00:00Z"
    });
    const safe = meetingService.getMeeting(meeting.id)!;
    expect(safe).not.toHaveProperty("start_url_encrypted");
  });

  it("T10: cancel meeting writes timeline event", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_james", {
      startTime: "2026-08-05T10:00:00Z"
    });
    const cancelled = await meetingService.cancelMeeting(meeting.id);
    expect(cancelled.status).toBe("cancelled");
    const events = timelineService.listByContact("cnt_james");
    expect(events.some((e) => e.event_type === "meeting.cancelled")).toBe(true);
  });

  it("recording.completed webhook sets recording_ready timeline", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      startTime: "2026-08-10T10:00:00Z"
    });

    await meetingService.handleWebhookEvent({
      event: "recording.completed",
      zoom_meeting_id: meeting.zoom_meeting_id,
      payload: { recording_files: [{ type: "MP4", status: "completed" }] }
    });

    const updated = meetingService.getMeeting(meeting.id)!;
    expect(updated.recording_status).toBe("available");
    const events = timelineService.listByContact("cnt_sarah");
    expect(events.some((e) => e.event_type === "meeting.recording_ready")).toBe(true);
  });

  it("follow-up task creates draft and timeline event", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_emma", {
      startTime: "2026-09-01T10:00:00Z"
    });

    const task = meetingService.createFollowUp(meeting.id, {
      title: "Send valuation summary to Sarah",
      dueDate: "2026-09-02"
    });

    expect(task).toMatchObject({ title: "Send valuation summary to Sarah", status: "draft" });
    const events = timelineService.listByContact("cnt_emma");
    expect(events.some((e) => e.event_type === "follow_up.created")).toBe(true);
  });

  it("rejects past schedule time", async () => {
    await expect(
      meetingService.createMeetingForContact("cnt_sarah", {
        startTime: "2020-01-01T10:00:00Z"
      })
    ).rejects.toMatchObject({ code: "INVALID_SCHEDULE_TIME", status: 400 });
  });

  it("getEmbedSignature returns mock SDK payload", async () => {
    const meeting = await meetingService.createMeetingForContact("cnt_sarah", {
      startTime: "2026-09-15T10:00:00Z"
    });
    const sig = await meetingService.getEmbedSignature(meeting.id, 1);
    expect(sig.signature).toBeTruthy();
    expect(sig.meeting_number).toBe(meeting.zoom_meeting_id);
  });
});
