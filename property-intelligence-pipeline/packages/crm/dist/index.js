import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, "../../../fixtures/m4/crm");
export class MockCrmAdapter {
    properties;
    contacts;
    appointments;
    users;
    drafts = new Map();
    timeline = [];
    constructor() {
        this.properties = JSON.parse(readFileSync(join(FIXTURES, "properties.json"), "utf8")).properties;
        this.contacts = JSON.parse(readFileSync(join(FIXTURES, "contacts.json"), "utf8")).contacts;
        this.appointments = JSON.parse(readFileSync(join(FIXTURES, "appointments.json"), "utf8")).appointments;
        const userData = JSON.parse(readFileSync(join(FIXTURES, "users.json"), "utf8"));
        this.users = userData.users;
    }
    listProperties(companyId) {
        return this.properties.filter((p) => p.company_id === companyId);
    }
    getProperty(id) {
        return this.properties.find((p) => p.id === id);
    }
    listContacts(companyId) {
        const propertyIds = new Set(this.listProperties(companyId).map((p) => p.id));
        return this.contacts.filter((c) => propertyIds.has(c.property_id));
    }
    listAppointments(companyId) {
        const propertyIds = new Set(this.listProperties(companyId).map((p) => p.id));
        return this.appointments.filter((a) => propertyIds.has(a.property_id));
    }
    listUsers(companyId) {
        return this.users.filter((u) => u.company_id === companyId);
    }
    getProposalDraft(propertyId) {
        return this.drafts.get(propertyId) ?? {};
    }
    applyProposalFields(propertyId, fields, _actorId) {
        const current = this.getProposalDraft(propertyId);
        const next = { ...current, ...fields };
        this.drafts.set(propertyId, next);
        return next;
    }
    addTimelineEvent(event) {
        const record = {
            ...event,
            id: `tl-${Date.now()}`,
            created_at: new Date().toISOString()
        };
        this.timeline.push(record);
        return record;
    }
    listTimeline(propertyId) {
        return this.timeline.filter((e) => e.property_id === propertyId);
    }
}
let crmInstance;
export function getCrmAdapter() {
    if (!crmInstance)
        crmInstance = new MockCrmAdapter();
    return crmInstance;
}
export function resetCrmAdapter() {
    crmInstance = undefined;
}
