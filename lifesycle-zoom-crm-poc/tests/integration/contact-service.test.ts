import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, unlinkSync } from "node:fs";
import {
  createDatabase,
  seedDatabase,
  ContactService
} from "../../packages/crm-mock/src/index.js";

const TEST_DB = "./test-contact.db";

describe("ContactService", () => {
  let db: ReturnType<typeof createDatabase>;
  let contacts: ContactService;

  beforeEach(() => {
    process.env.DATABASE_URL = `sqlite://${TEST_DB}`;
    db = createDatabase(`sqlite://${TEST_DB}`);
    seedDatabase(db);
    contacts = new ContactService(db);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB)) unlinkSync(TEST_DB);
  });

  it("lists 5 seed contacts", () => {
    const list = contacts.listContacts();
    expect(list).toHaveLength(5);
    expect(list.some((c) => c.first_name === "Sarah")).toBe(true);
  });

  it("returns contact detail with properties and timeline", () => {
    const detail = contacts.getContactDetail("cnt_sarah");
    expect(detail).not.toBeNull();
    expect(detail!.properties).toHaveLength(1);
    expect(detail!.properties[0].address_line1).toBe("14 Oak Lane");
    expect(detail!.appointments.some((a) => a.id === "val_001")).toBe(true);
    expect(detail!.timeline.length).toBeGreaterThan(0);
  });

  it("returns null for unknown contact", () => {
    expect(contacts.getContactDetail("cnt_missing")).toBeNull();
  });

  it("returns property detail with contact and appointments", () => {
    const detail = contacts.getPropertyDetail("prop_oak_lane");
    expect(detail).not.toBeNull();
    expect(detail!.contact?.last_name).toBe("Mitchell");
    expect(detail!.appointments.some((a) => a.type === "valuation")).toBe(true);
    expect(detail!.timeline.length).toBeGreaterThan(0);
  });

  it("returns null for unknown property", () => {
    expect(contacts.getPropertyDetail("prop_missing")).toBeNull();
  });
});
