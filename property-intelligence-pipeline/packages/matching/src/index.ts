import {
  addressMatchScore,
  appointmentProximityScore,
  classifyQueue,
  contactNameMatchScore,
  minutesBetween,
  signalChips,
  titleMatchScore,
  userMatchScore,
  weightedConfidence,
  type MatchQueue,
  type MatchSignals
} from "./scoring.js";

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

export function matchRecording(input: MatchInput): MatchCandidate[] {
  const recordedAt = new Date(input.recorded_at);
  const companyProperties = input.properties.filter((p) => p.company_id === input.company_id);

  const candidates: MatchCandidate[] = companyProperties.map((property) => {
    const contact = input.contacts.find((c) => c.property_id === property.id);
    const appointment = input.appointments
      .filter((a) => a.property_id === property.id)
      .sort(
        (a, b) =>
          Math.abs(minutesBetween(recordedAt, new Date(a.scheduled_at))) -
          Math.abs(minutesBetween(recordedAt, new Date(b.scheduled_at)))
      )[0];

    const user = appointment
      ? input.users.find((u) => u.id === appointment.assigned_user_id)
      : undefined;

    let appointmentScore = 0;
    if (appointment) {
      const diff = minutesBetween(recordedAt, new Date(appointment.scheduled_at));
      appointmentScore = appointmentProximityScore(diff);
    }

    const signals: MatchSignals = {
      appointment_proximity: appointmentScore,
      address_match: addressMatchScore(input.transcript_text, property, input.title),
      user_match: user ? userMatchScore(input.owner_hint, user.email, user.full_name) : 0,
      contact_name_match: contact
        ? contactNameMatchScore(input.transcript_text, contact.full_name)
        : 0,
      recording_title_match: titleMatchScore(input.title, property.address),
      manual_hint: input.manual_property_id === property.id ? 1 : 0
    };

    const confidence = weightedConfidence(signals);

    return {
      property_id: property.id,
      contact_id: contact?.id ?? null,
      user_id: user?.id ?? null,
      appointment_id: appointment?.id ?? null,
      confidence,
      queue: classifyQueue(confidence),
      signals,
      reason_chips: signalChips(signals)
    };
  });

  return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

export * from "./scoring.js";
export * from "./parse.js";
