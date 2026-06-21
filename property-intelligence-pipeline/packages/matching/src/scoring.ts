export function appointmentProximityScore(minutesDiff: number): number {
  const abs = Math.abs(minutesDiff);
  if (abs <= 30) return 1.0;
  if (abs <= 60) return 0.85;
  if (abs <= 120) return 0.7;
  if (abs <= 240) return 0.5;
  if (abs <= 480) return 0.25;
  return 0.0;
}

export function minutesBetween(a: Date, b: Date): number {
  return (a.getTime() - b.getTime()) / 60_000;
}

export type AddressParts = {
  address: string;
  postcode: string;
};

export function addressMatchScore(
  transcriptText: string,
  property: AddressParts,
  title?: string
): number {
  const text = `${transcriptText} ${title ?? ""}`.toLowerCase();
  const postcodeNorm = property.postcode.replace(/\s+/g, "").toLowerCase();
  const textCompact = text.replace(/\s+/g, "");

  let score = 0;
  if (textCompact.includes(postcodeNorm)) score += 0.4;

  const streetParts = property.address.toLowerCase().split(/\s+/);
  const houseNumber = streetParts[0]?.match(/^\d+$/) ? streetParts[0] : undefined;
  const streetName = streetParts.slice(houseNumber ? 1 : 0).join(" ") || streetParts[0];

  const streetFuzzy = fuzzyStreetInText(streetName, text);
  if (streetFuzzy >= 0.9) score += 0.35;
  else if (streetFuzzy >= 0.75) score += 0.25;
  else if (streetFuzzy >= 0.5) score += 0.15;

  if (houseNumber) {
    const primaryNumber = extractPrimaryHouseNumber(text, streetName);
    const mentionsNumber = new RegExp(`\\b(number\\s+)?${houseNumber}\\b`, "i").test(text);
    if (primaryNumber === houseNumber) score += 0.35;
    else if (mentionsNumber && !primaryNumber) score += 0.2;
    else if (primaryNumber && primaryNumber !== houseNumber) score *= 0.35;
  }

  return Math.min(1, score);
}

function extractPrimaryHouseNumber(text: string, streetName: string): string | undefined {
  const streetWord = streetName.split(/\s+/)[0] ?? streetName;
  const primaryPatterns = [
    new RegExp(`this is number\\s+(\\d+)\\s+${streetWord}`, "i"),
    new RegExp(`(?:yes,?\\s+)?this is\\s+(\\d+)\\s+${streetWord}`, "i"),
    new RegExp(`at\\s+(\\d+)\\s+${streetWord}`, "i")
  ];
  for (const pattern of primaryPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

function fuzzyStreetInText(street: string, text: string): number {
  const words = street.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const hits = words.filter((w) => text.includes(w));
  return hits.length / words.length;
}

export function userMatchScore(ownerHint: string | undefined, userEmail: string, userName: string): number {
  if (!ownerHint) return 0;
  const hint = ownerHint.toLowerCase();
  if (hint === userEmail.toLowerCase()) return 1;
  if (userName.toLowerCase().includes(hint) || hint.includes(userName.toLowerCase())) return 0.8;
  const hintLocal = hint.split("@")[0];
  const emailLocal = userEmail.split("@")[0];
  if (hintLocal && emailLocal && hintLocal === emailLocal) return 0.9;
  return 0;
}

export function contactNameMatchScore(transcriptText: string, contactName: string): number {
  const names = contactName.toLowerCase().split(/\s+/);
  const text = transcriptText.toLowerCase();
  const surname = names[names.length - 1];
  const given = names[0];
  if (text.includes(contactName.toLowerCase())) return 1;
  if (surname && text.includes(surname)) return 0.7;
  if (given && text.includes(given.replace(/^(mr|mrs|ms|dr)\.?/i, ""))) return 0.5;
  return 0;
}

export function titleMatchScore(title: string | undefined, propertyAddress: string): number {
  if (!title) return 0;
  const t = title.toLowerCase();
  const addr = propertyAddress.toLowerCase();
  if (t.includes(addr)) return 1;
  const fragments = addr.split(/\s+/).filter((w) => w.length > 2);
  const hits = fragments.filter((f) => t.includes(f));
  return fragments.length ? hits.length / fragments.length : 0;
}

export type MatchSignals = {
  appointment_proximity: number;
  address_match: number;
  user_match: number;
  contact_name_match: number;
  recording_title_match: number;
  manual_hint: number;
};

export const SIGNAL_WEIGHTS: Record<keyof MatchSignals, number> = {
  appointment_proximity: 0.25,
  address_match: 0.25,
  user_match: 0.2,
  contact_name_match: 0.15,
  recording_title_match: 0.1,
  manual_hint: 0.05
};

export function weightedConfidence(signals: MatchSignals): number {
  let total = 0;
  for (const key of Object.keys(SIGNAL_WEIGHTS) as Array<keyof MatchSignals>) {
    total += SIGNAL_WEIGHTS[key] * signals[key];
  }
  return Math.round(total * 1000) / 1000;
}

export type MatchQueue = "suggested" | "review" | "unmatched";

export function classifyQueue(confidence: number): MatchQueue {
  if (confidence >= 0.85) return "suggested";
  if (confidence >= 0.6) return "review";
  return "unmatched";
}

export function signalChips(signals: MatchSignals): string[] {
  const chips: string[] = [];
  if (signals.appointment_proximity > 0) {
    chips.push(`Appointment proximity (${signals.appointment_proximity.toFixed(2)})`);
  }
  if (signals.address_match > 0) {
    chips.push(`Address match (${signals.address_match.toFixed(2)})`);
  }
  if (signals.user_match > 0) {
    chips.push(`Agent match (${signals.user_match.toFixed(2)})`);
  }
  if (signals.contact_name_match > 0) {
    chips.push(`Contact name (${signals.contact_name_match.toFixed(2)})`);
  }
  if (signals.recording_title_match > 0) {
    chips.push(`Title hint (${signals.recording_title_match.toFixed(2)})`);
  }
  if (signals.manual_hint > 0) {
    chips.push(`Manual hint (${signals.manual_hint.toFixed(2)})`);
  }
  return chips;
}
