import { z } from "zod";

export const ProposalFieldStatus = z.enum(["suggested", "approved", "rejected"]);

export const AskingExpectationSchema = z.object({
  amount_gbp: z.number().nullable(),
  qualifier: z.enum(["firm", "hopeful", "unknown"]),
  raw_phrase: z.string()
});

export const RenovationItemSchema = z.object({
  area: z.string(),
  description: z.string(),
  estimated_cost_gbp: z.number().nullable(),
  urgency: z.enum(["immediate", "before_sale", "optional", "unknown"])
});

export const FollowUpTaskSchema = z.object({
  title: z.string(),
  due_in_days: z.number().nullable(),
  assignee: z.enum(["agent", "vendor", "internal"])
});

export function proposalFieldSchema<T extends z.ZodTypeAny>(valueSchema: T) {
  return z.object({
    value: valueSchema.nullable(),
    confidence: z.number().min(0).max(1),
    evidence_quote: z.string().nullable(),
    status: ProposalFieldStatus
  });
}

export const ExtractionFieldsSchema = z.object({
  property_condition: proposalFieldSchema(z.string()),
  seller_motivation: proposalFieldSchema(z.string()),
  asking_expectation: proposalFieldSchema(AskingExpectationSchema),
  timeline: proposalFieldSchema(z.string()),
  renovations: proposalFieldSchema(z.array(RenovationItemSchema)),
  concerns: proposalFieldSchema(z.array(z.string())),
  follow_up_tasks: proposalFieldSchema(z.array(FollowUpTaskSchema))
});

export const PropertyProposalExtractionSchema = z.object({
  recording_id: z.string(),
  property_id: z.string(),
  extracted_at: z.string(),
  model: z.string(),
  prompt_version: z.string(),
  fields: ExtractionFieldsSchema
});

export type ProposalField<T> = {
  value: T | null;
  confidence: number;
  evidence_quote: string | null;
  status: "suggested" | "approved" | "rejected";
};

export type PropertyProposalExtraction = z.infer<typeof PropertyProposalExtractionSchema>;

export const EXTRACTION_PROMPT_VERSION = "m4-v1";

export const EXTRACTION_SYSTEM_PROMPT = `You extract structured property valuation insights from UK estate agent conversation transcripts.
Output ONLY valid JSON matching the schema.
Never invent facts. If not mentioned, set value null and confidence 0.
Include evidence_quote as exact substring from transcript.`;

export function buildExtractionUserPrompt(input: {
  transcript: string;
  property_address: string;
  contact_name: string;
  appointment_date: string;
}): string {
  return `Transcript:
${input.transcript}

Property context: ${input.property_address}, ${input.contact_name}
Appointment date: ${input.appointment_date}

Extract fields: property_condition, seller_motivation, asking_expectation, timeline, renovations, concerns, follow_up_tasks.`;
}

export function applyEvidencePenalty<T extends ProposalField<unknown>>(
  field: T,
  transcript: string
): T {
  if (!field.evidence_quote || !transcript.includes(field.evidence_quote)) {
    return { ...field, confidence: Math.round(field.confidence * 0.5 * 1000) / 1000 };
  }
  return field;
}

export function fieldsNeedingReview(fields: PropertyProposalExtraction["fields"]): string[] {
  const keys = Object.keys(fields) as Array<keyof PropertyProposalExtraction["fields"]>;
  return keys.filter((k) => fields[k].confidence < 0.7 || fields[k].status === "suggested");
}

export const PROPOSAL_FIELD_MAP: Record<string, string> = {
  property_condition: "proposal.condition_notes",
  seller_motivation: "proposal.vendor_motivation",
  asking_expectation: "proposal.price_expectation",
  timeline: "proposal.marketing_timeline",
  renovations: "proposal.improvements_json",
  concerns: "proposal.vendor_concerns",
  follow_up_tasks: "crm.tasks"
};
