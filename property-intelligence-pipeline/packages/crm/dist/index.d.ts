import type { CrmAppointment, CrmContact, CrmProperty, CrmUser } from "@pip/matching";
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
    applyProposalFields(propertyId: string, fields: Record<string, unknown>, actorId: string): ProposalDraft;
    addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at">): TimelineEvent;
    listTimeline(propertyId: string): TimelineEvent[];
}
export declare class MockCrmAdapter implements CrmAdapter {
    private properties;
    private contacts;
    private appointments;
    private users;
    private drafts;
    private timeline;
    constructor();
    listProperties(companyId: string): CrmProperty[];
    getProperty(id: string): CrmProperty | undefined;
    listContacts(companyId: string): CrmContact[];
    listAppointments(companyId: string): CrmAppointment[];
    listUsers(companyId: string): CrmUser[];
    getProposalDraft(propertyId: string): ProposalDraft;
    applyProposalFields(propertyId: string, fields: Record<string, unknown>, _actorId: string): ProposalDraft;
    addTimelineEvent(event: Omit<TimelineEvent, "id" | "created_at">): TimelineEvent;
    listTimeline(propertyId: string): TimelineEvent[];
}
export declare function getCrmAdapter(): MockCrmAdapter;
export declare function resetCrmAdapter(): void;
