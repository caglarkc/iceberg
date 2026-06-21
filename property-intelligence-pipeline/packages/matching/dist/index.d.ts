import { type MatchQueue, type MatchSignals } from "./scoring.js";
export type CrmProperty = {
    id: string;
    company_id: string;
    address: string;
    postcode: string;
};
export type CrmContact = {
    id: string;
    property_id: string;
    full_name: string;
};
export type CrmAppointment = {
    id: string;
    property_id: string;
    contact_id: string;
    assigned_user_id: string;
    scheduled_at: string;
};
export type CrmUser = {
    id: string;
    email: string;
    full_name: string;
};
export type MatchCandidate = {
    property_id: string;
    contact_id: string | null;
    user_id: string | null;
    appointment_id: string | null;
    confidence: number;
    queue: MatchQueue;
    signals: MatchSignals;
    reason_chips: string[];
};
export type MatchInput = {
    company_id: string;
    recorded_at: string;
    transcript_text: string;
    title?: string;
    owner_hint?: string;
    manual_property_id?: string;
    properties: CrmProperty[];
    contacts: CrmContact[];
    appointments: CrmAppointment[];
    users: CrmUser[];
};
export declare function matchRecording(input: MatchInput): MatchCandidate[];
export * from "./scoring.js";
export * from "./parse.js";
