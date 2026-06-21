import { z } from "zod";

export const MeetingTrackingSchema = z.object({
  crm_contact_id: z.string(),
  crm_property_id: z.string().optional(),
  crm_valuation_id: z.string().optional(),
  crm_agent_id: z.string().optional()
});

export type MeetingTracking = z.infer<typeof MeetingTrackingSchema>;

export const CreateMeetingInputSchema = z.object({
  topic: z.string().min(1),
  type: z.number().default(2),
  start_time: z.string().optional(),
  duration: z.number().default(60),
  timezone: z.string().default("Europe/London"),
  agenda: z.string().optional(),
  settings: z
    .object({
      host_video: z.boolean().optional(),
      participant_video: z.boolean().optional(),
      join_before_host: z.boolean().optional(),
      waiting_room: z.boolean().optional(),
      auto_recording: z.string().optional()
    })
    .optional(),
  tracking: MeetingTrackingSchema
});

export type CreateMeetingInput = z.infer<typeof CreateMeetingInputSchema>;

export const InstantMeetingInputSchema = z.object({
  topic: z.string().min(1),
  tracking: MeetingTrackingSchema
});

export type InstantMeetingInput = z.infer<typeof InstantMeetingInputSchema>;

export const ZoomMeetingResponseSchema = z.object({
  id: z.string(),
  zoom_meeting_id: z.string(),
  topic: z.string(),
  start_time: z.string().optional(),
  duration: z.number(),
  timezone: z.string(),
  join_url: z.string(),
  start_url: z.string().optional(),
  password: z.string().optional(),
  status: z.enum(["scheduled", "started", "ended", "cancelled"]),
  created_at: z.string(),
  participants_count: z.number().optional(),
  actual_start: z.string().optional(),
  actual_end: z.string().optional(),
  recording_status: z.string().optional()
});

export type ZoomMeetingResponse = z.infer<typeof ZoomMeetingResponseSchema>;

export const EmbedSignatureInputSchema = z.object({
  role: z.union([z.literal(0), z.literal(1)]).default(0),
  user_name: z.string(),
  user_email: z.string().email()
});

export type EmbedSignatureInput = z.infer<typeof EmbedSignatureInputSchema>;

export const EmbedSignatureResponseSchema = z.object({
  signature: z.string(),
  sdk_key: z.string(),
  meeting_number: z.string(),
  password: z.string().optional(),
  zak: z.string().nullable().optional(),
  expires_at: z.string()
});

export type EmbedSignatureResponse = z.infer<typeof EmbedSignatureResponseSchema>;

export const CapabilitiesResponseSchema = z.object({
  create_meeting: z.boolean(),
  instant_meeting: z.boolean(),
  embed_sdk: z.boolean(),
  cloud_recording: z.boolean(),
  transcript_webhook: z.string(),
  phone: z.boolean()
});

export type CapabilitiesResponse = z.infer<typeof CapabilitiesResponseSchema>;

export const NormalizedWebhookEventSchema = z.object({
  event: z.string(),
  zoom_meeting_id: z.string(),
  payload: z.record(z.unknown()),
  tracking: MeetingTrackingSchema.partial().optional()
});

export type NormalizedWebhookEvent = z.infer<typeof NormalizedWebhookEventSchema>;

export class ZoomServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ZoomServiceError";
  }
}

export interface ZoomIntegrationClient {
  getCapabilities(): Promise<CapabilitiesResponse>;
  createMeeting(input: CreateMeetingInput): Promise<ZoomMeetingResponse>;
  createInstantMeeting(input: InstantMeetingInput): Promise<ZoomMeetingResponse>;
  getMeeting(id: string): Promise<ZoomMeetingResponse>;
  getEmbedSignature(meetingId: string, input: EmbedSignatureInput): Promise<EmbedSignatureResponse>;
}
