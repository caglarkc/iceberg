import { randomBytes } from "node:crypto";
import type {
  CapabilitiesResponse,
  CreateMeetingInput,
  EmbedSignatureInput,
  EmbedSignatureResponse,
  InstantMeetingInput,
  ZoomIntegrationClient,
  ZoomMeetingResponse
} from "./types.js";

let meetingCounter = 87654321000;

function nextMeetingId(): { serviceId: string; zoomId: string } {
  meetingCounter += 1;
  return {
    serviceId: `zm_meet_${meetingCounter.toString(36)}`,
    zoomId: String(meetingCounter)
  };
}

function buildMeeting(
  input: CreateMeetingInput | InstantMeetingInput,
  status: ZoomMeetingResponse["status"],
  startTime?: string
): ZoomMeetingResponse {
  const { serviceId, zoomId } = nextMeetingId();
  const now = new Date().toISOString();
  return {
    id: serviceId,
    zoom_meeting_id: zoomId,
    topic: input.topic,
    start_time: startTime ?? (status === "started" ? now : undefined),
    duration: "duration" in input ? (input.duration ?? 60) : 60,
    timezone: "timezone" in input ? (input.timezone ?? "Europe/London") : "Europe/London",
    join_url: `https://zoom.us/j/${zoomId}?pwd=mockpwd`,
    start_url: `https://zoom.us/s/${zoomId}?zak=mock-host-token`,
    password: "abc123",
    status,
    created_at: now
  };
}

/** In-process mock — Ay 1 default when ZOOM_MODE=mock and no external server */
export class MockZoomServiceAdapter implements ZoomIntegrationClient {
  private meetings = new Map<string, ZoomMeetingResponse>();

  async getCapabilities(): Promise<CapabilitiesResponse> {
    return {
      create_meeting: true,
      instant_meeting: true,
      embed_sdk: true,
      cloud_recording: true,
      transcript_webhook: "beta",
      phone: false
    };
  }

  async createMeeting(input: CreateMeetingInput): Promise<ZoomMeetingResponse> {
    const meeting = buildMeeting(input, "scheduled", input.start_time);
    this.meetings.set(meeting.id, meeting);
    return meeting;
  }

  async createInstantMeeting(input: InstantMeetingInput): Promise<ZoomMeetingResponse> {
    const meeting = buildMeeting(input, "started");
    this.meetings.set(meeting.id, meeting);
    return meeting;
  }

  async getMeeting(id: string): Promise<ZoomMeetingResponse> {
    const meeting = this.meetings.get(id);
    if (!meeting) {
      throw new Error(`Meeting not found: ${id}`);
    }
    return {
      ...meeting,
      participants_count: meeting.status === "ended" ? 2 : 0,
      recording_status: meeting.status === "ended" ? "processing" : "none"
    };
  }

  async getEmbedSignature(
    meetingId: string,
    input: EmbedSignatureInput
  ): Promise<EmbedSignatureResponse> {
    const meeting = await this.getMeeting(meetingId);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const payload = Buffer.from(
      JSON.stringify({
        mn: meeting.zoom_meeting_id,
        role: input.role,
        user: input.user_name
      })
    ).toString("base64url");
    return {
      signature: `mock-sig-${payload}-${randomBytes(8).toString("hex")}`,
      sdk_key: "mock-sdk-key-lifesycle",
      meeting_number: meeting.zoom_meeting_id,
      password: meeting.password,
      zak: input.role === 1 ? "mock-zak-token" : null,
      expires_at: expiresAt
    };
  }

  reset(): void {
    this.meetings.clear();
    meetingCounter = 87654321000;
  }
}

export function resetMockZoomGlobals(): void {
  meetingCounter = 87654321000;
}
