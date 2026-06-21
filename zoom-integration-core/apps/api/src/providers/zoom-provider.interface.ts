export type MeetingStatus = "created" | "started" | "ended" | "cancelled";

export interface CreateMeetingInput {
  topic: string;
  type?: number;
  start_time?: string;
  timezone?: string;
  duration?: number;
  settings?: Record<string, unknown>;
}

export interface Meeting {
  id: string;
  zoom_meeting_id: number;
  zoom_meeting_uuid: string;
  topic: string;
  type: number;
  start_time?: string;
  duration?: number;
  timezone?: string;
  join_url: string;
  start_url?: string;
  password?: string;
  host_id: string;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
}

export interface SignatureInput {
  meetingNumber: string;
  role: 0 | 1;
}

export interface SdkSignature {
  signature: string;
  sdkKey: string;
}

export interface ZoomWebhookEvent {
  event: string;
  event_ts: number;
  payload: Record<string, unknown>;
  event_id?: string;
}

export interface PhoneEvent {
  id: string;
  zoom_call_id: string;
  event_type: string;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  duration_seconds: number;
  occurred_at: string;
  payload: Record<string, unknown>;
}

export interface OAuthToken {
  access_token: string;
  expires_at: number;
  token_type: string;
  scopes: string[];
}

export interface RecordingFile {
  id: string;
  meeting_uuid: string;
  recording_id: string;
  file_type: string;
  download_url: string;
  transcript_text?: string;
  file_size?: number;
}

export interface ZoomProvider {
  getOAuthToken(): Promise<OAuthToken>;
  createMeeting(input: CreateMeetingInput): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting>;
  listMeetings(): Promise<Meeting[]>;
  updateMeeting(id: string, input: Partial<CreateMeetingInput>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
  generateSdkSignature(input: SignatureInput): Promise<SdkSignature>;
  verifyWebhook(headers: Record<string, string>, body: string): boolean;
  parseWebhookEvent(body: unknown): ZoomWebhookEvent;
  getRecordings(meetingUuid: string): Promise<RecordingFile[]>;
  getTranscript(meetingUuid: string): Promise<string | null>;
  listPhoneEvents?(since?: Date): Promise<PhoneEvent[]>;
  getPhoneCapabilities(): Promise<{ licensed: boolean; smart_embed: boolean; notes: string }>;
}
