import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, unlinkSync } from "node:fs";
import { TimelineService, mapTimelineEventType, createDatabase, seedDatabase } from "../../packages/crm-mock/src/index.js";

const TEST_DB = "./test-timeline.db";

describe("TimelineService", () => {
  let db: ReturnType<typeof createDatabase>;
  let timeline: TimelineService;

  beforeEach(() => {
    db = createDatabase(`sqlite://${TEST_DB}`);
    seedDatabase(db);
    timeline = new TimelineService(db);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it("creates and retrieves events", () => {
    const event = timeline.createEvent({
      contactId: "cnt_sarah",
      eventType: "note.added",
      title: "Test note"
    });
    const fetched = timeline.getById(event.id);
    expect(fetched?.title).toBe("Test note");
  });

  it("maps event metadata for API", () => {
    const event = timeline.createEvent({
      contactId: "cnt_sarah",
      eventType: "meeting.scheduled",
      title: "Scheduled",
      metadata: { foo: "bar" }
    });
    const mapped = timeline.mapEvent(event);
    expect(mapped.metadata).toEqual({ foo: "bar" });
  });
});

describe("mapTimelineEventType", () => {
  it("formats ended events with duration", () => {
    expect(mapTimelineEventType("meeting.ended", 47)).toContain("47 min");
  });
});
