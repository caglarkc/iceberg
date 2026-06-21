import type { CrmDatabase, ContactRow, PropertyRow, AppointmentRow } from "../db.js";
import { TimelineService } from "./timeline.service.js";

export class ContactService {
  private timeline: TimelineService;

  constructor(private readonly db: CrmDatabase) {
    this.timeline = new TimelineService(db);
  }

  listContacts(): ContactRow[] {
    return this.db
      .prepare("SELECT * FROM contacts ORDER BY last_name, first_name")
      .all() as ContactRow[];
  }

  getContactDetail(id: string) {
    const contact = this.db.prepare("SELECT * FROM contacts WHERE id = ?").get(id) as
      | ContactRow
      | undefined;
    if (!contact) return null;

    const properties = this.db
      .prepare("SELECT * FROM properties WHERE contact_id = ?")
      .all(id) as PropertyRow[];

    const appointments = this.db
      .prepare("SELECT * FROM appointments WHERE contact_id = ?")
      .all(id) as AppointmentRow[];

    const timeline = this.timeline.listByContact(id).map((e) => this.timeline.mapEvent(e));

    return { contact, properties, appointments, timeline };
  }

  getPropertyDetail(id: string) {
    const property = this.db.prepare("SELECT * FROM properties WHERE id = ?").get(id) as
      | PropertyRow
      | undefined;
    if (!property) return null;

    const contact = property.contact_id
      ? (this.db.prepare("SELECT * FROM contacts WHERE id = ?").get(property.contact_id) as ContactRow)
      : null;

    const appointments = this.db
      .prepare("SELECT * FROM appointments WHERE property_id = ?")
      .all(id) as AppointmentRow[];

    const timeline = property.contact_id
      ? this.timeline.listByContact(property.contact_id).map((e) => this.timeline.mapEvent(e))
      : [];

    return { property, contact, appointments, timeline };
  }
}
