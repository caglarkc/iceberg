import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CrmAppointment, CrmContact, CrmProperty, CrmUser } from "@pip/matching";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../../../fixtures/m4/crm");

export type ProposalDraft = Record<string, unknown>;

export type TimelineEvent = {
  id: string;
  property_id: string;
  type: "plaud_transcript";
  provider: "plaud";
  summary: string;
  recording_id: string;
  created_at: string;
  payload: Record<string, unknown>;
};

export interface CrmAdapter {
  listProperties(companyId: string): CrmProperty[];
  getProperty(id: string): CrmProperty | undefined;
  listContacts(companyId: string): CrmContact[];
  listAppointments(companyId: string): CrmAppointment[];
  listUsers(companyId: string): CrmUser[];
  getProposalDraft(propertyId: string): ProposalDraft;
  applyProposalFields(
    propertyId: string,
    fields: Record<string, unknown>,
    actorId: string
  ): ProposalDraft;
  addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at">): TimelineEvent;
  listTimeline(propertyId: string): TimelineEvent[];
}

export class MockCrmAdapter implements CrmAdapter {
  private properties: CrmProperty[];
  private contacts: CrmContact[];
  private appointments: CrmAppointment[];
  private users: CrmUser[];
  private drafts = new Map<string, ProposalDraft>();
  private timeline: TimelineEvent[] = [];

  constructor() {
    this.properties = (JSON.parse(readFileSync(join(FIXTURES, "properties.json"), "utf8")) as { properties: CrmProperty[] }).properties;
    this.contacts = (JSON.parse(readFileSync(join(FIXTURES, "contacts.json"), "utf8")) as { contacts: CrmContact[] }).contacts;
    this.appointments = (JSON.parse(readFileSync(join(FIXTURES, "appointments.json"), "utf8")) as { appointments: CrmAppointment[] }).appointments;
    const userData = JSON.parse(readFileSync(join(FIXTURES, "users.json"), "utf8")) as { users: CrmUser[] };
    this.users = userData.users;
  }

  listProperties(companyId: string): CrmProperty[] {
    return this.properties.filter((p) => p.company_id === companyId);
  }

  getProperty(id: string): CrmProperty | undefined {
    return this.properties.find((p) => p.id === id);
  }

  listContacts(companyId: string): CrmContact[] {
    const propertyIds = new Set(this.listProperties(companyId).map((p) => p.id));
    return this.contacts.filter((c) => propertyIds.has(c.property_id));
  }

  listAppointments(companyId: string): CrmAppointment[] {
    const propertyIds = new Set(this.listProperties(companyId).map((p) => p.id));
    return this.appointments.filter((a) => propertyIds.has(a.property_id));
  }

  listUsers(companyId: string): CrmUser[] {
    return this.users.filter((u) => (u as CrmUser & { company_id?: string }).company_id === companyId);
  }

  getProposalDraft(propertyId: string): ProposalDraft {
    return this.drafts.get(propertyId) ?? {};
  }

  applyProposalFields(propertyId: string, fields: Record<string, unknown>, _actorId: string): ProposalDraft {
    const current = this.getProposalDraft(propertyId);
    const next = { ...current, ...fields };
    this.drafts.set(propertyId, next);
    return next;
  }

  addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at">): TimelineEvent {
    const record: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.timeline.push(record);
    return record;
  }

  listTimeline(propertyId: string): TimelineEvent[] {
    return this.timeline.filter((e) => e.property_id === propertyId);
  }
}

let crmInstance: MockCrmAdapter | undefined;

export function getCrmAdapter(): MockCrmAdapter {
  if (!crmInstance) crmInstance = new MockCrmAdapter();
  return crmInstance;
}

export function resetCrmAdapter(): void {
  crmInstance = undefined;
}
