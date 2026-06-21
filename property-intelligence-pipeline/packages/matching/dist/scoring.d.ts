export declare function appointmentProximityScore(minutesDiff: number): number;
export declare function minutesBetween(a: Date, b: Date): number;
export type AddressParts = {
    address: string;
    postcode: string;
};
export declare function addressMatchScore(transcriptText: string, property: AddressParts, title?: string): number;
export declare function userMatchScore(ownerHint: string | undefined, userEmail: string, userName: string): number;
export declare function contactNameMatchScore(transcriptText: string, contactName: string): number;
export declare function titleMatchScore(title: string | undefined, propertyAddress: string): number;
export type MatchSignals = {
    appointment_proximity: number;
    address_match: number;
    user_match: number;
    contact_name_match: number;
    recording_title_match: number;
    manual_hint: number;
};
export declare const SIGNAL_WEIGHTS: Record<keyof MatchSignals, number>;
export declare function weightedConfidence(signals: MatchSignals): number;
export type MatchQueue = "suggested" | "review" | "unmatched";
export declare function classifyQueue(confidence: number): MatchQueue;
export declare function signalChips(signals: MatchSignals): string[];
