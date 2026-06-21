import { randomUUID } from "node:crypto";
import type { CrmDatabase } from "./db.js";

const DEMO_AGENT_ID = "agent_42";

const SEED_CONTACTS = [
  {
    id: "cnt_sarah",
    first_name: "Sarah",
    last_name: "Mitchell",
    email: "sarah.mitchell@example.com",
    phone: "+44 7700 900123",
    type: "seller"
  },
  {
    id: "cnt_james",
    first_name: "James",
    last_name: "Thornton",
    email: "james.thornton@example.com",
    phone: "+44 7700 900456",
    type: "buyer"
  },
  {
    id: "cnt_emma",
    first_name: "Emma",
    last_name: "Walsh",
    email: "emma.walsh@example.com",
    phone: "+44 7700 900789",
    type: "landlord"
  },
  {
    id: "cnt_david",
    first_name: "David",
    last_name: "Chen",
    email: "david.chen@example.com",
    phone: "+44 7700 900321",
    type: "lead"
  },
  {
    id: "cnt_lucy",
    first_name: "Lucy",
    last_name: "Patel",
    email: "lucy.patel@example.com",
    phone: "+44 7700 900654",
    type: "buyer"
  }
];

export function seedDatabase(db: CrmDatabase): void {
  db.exec("DELETE FROM follow_up_tasks; DELETE FROM timeline_events; DELETE FROM meetings; DELETE FROM appointments; DELETE FROM properties; DELETE FROM contacts;");

  const insertContact = db.prepare(`
    INSERT INTO contacts (id, first_name, last_name, email, phone, type, assigned_agent_id)
    VALUES (@id, @first_name, @last_name, @email, @phone, @type, @assigned_agent_id)
  `);

  for (const c of SEED_CONTACTS) {
    insertContact.run({ ...c, assigned_agent_id: DEMO_AGENT_ID });
  }

  db.prepare(`
    INSERT INTO properties (id, contact_id, address_line1, city, postcode, listing_type)
    VALUES ('prop_oak_lane', 'cnt_sarah', '14 Oak Lane', 'London', 'SW19', 'sale')
  `).run();

  db.prepare(`
    INSERT INTO properties (id, contact_id, address_line1, city, postcode, listing_type)
    VALUES ('prop_high_st', 'cnt_james', '22 High Street', 'Wimbledon', 'SW19', 'sale')
  `).run();

  db.prepare(`
    INSERT INTO appointments (id, property_id, contact_id, type, scheduled_at, agent_id)
    VALUES ('val_001', 'prop_oak_lane', 'cnt_sarah', 'valuation', '2026-06-25T10:00:00Z', @agent_id)
  `).run({ agent_id: DEMO_AGENT_ID });

  db.prepare(`
    INSERT INTO timeline_events (id, contact_id, property_id, event_type, title, description, actor_type, actor_id, occurred_at, metadata)
    VALUES (@id, 'cnt_sarah', 'prop_oak_lane', 'appointment.scheduled', 'Valuation appointment scheduled', 'Market appraisal at 14 Oak Lane', 'agent', @agent_id, '2026-06-20T09:00:00Z', '{}')
  `).run({ id: randomUUID(), agent_id: DEMO_AGENT_ID });
}

export { DEMO_AGENT_ID };
