import { createHmac } from "node:crypto";
import { KJUR } from "jsrsasign";
import type {
  CreateMeetingInput,
  Meeting,
  OAuthToken,
  PhoneEvent,
  RecordingFile,
  SdkSignature,
  SignatureInput,
  ZoomProvider,
  ZoomWebhookEvent
} from "./zoom-provider.interface.js";

const MOCK_SDK_KEY = "mock-sdk-key-iceberg";
const MOCK_SDK_SECRET = "mock-sdk-secret-iceberg-demo";
const MOCK_WEBHOOK_SECRET = "mock-webhook-secret";

let meetingCounter = 100000000;
let tokenFetchCount = 0;
let cachedToken: OAuthToken | null = null;

export const MOCK_SIGNATURE_TEST_VECTOR = {
  meetingNumber: "12345678901",
  role: 0 as const,
  sdkKey: MOCK_SDK_KEY
};

export class MockZoomAdapter implements ZoomProvider {
  private meetings = new Map<string, Meeting>();
  private phoneEvents: PhoneEvent[] = [
    {
      id: "phone-evt-1",
      zoom_call_id: "mock-call-001",
      event_type: "phone.callee_call_log_completed",
      direction: "outbound",
      from_number: "+441234567890",
      to_number: "+449876543210",
      duration_seconds: 180,
      occurred_at: "2026-06-21T10:30:00.000Z",
      payload: { mock: true, note: "Simulated call — Zoom Phone license deferred to Faz 2" }
    }
  ];

  constructor() {
    this.seedMeeting();
  }

  private seedMeeting(): void {
    const meeting = this.buildMeeting({ topic: "Seed Demo Meeting" });
    this.meetings.set(String(meeting.zoom_meeting_id), meeting);
    this.meetings.set(meeting.zoom_meeting_uuid, meeting);
  }

  private buildMeeting(input: CreateMeetingInput): Meeting {
    meetingCounter += 1;
    const now = new Date().toISOString();
    const id = meetingCounter;
    const uuid = `mock-uuid-${id}`;
    return {
      id: `db-${id}`,
      zoom_meeting_id: id,
      zoom_meeting_uuid: uuid,
      topic: input.topic,
      type: input.type ?? 2,
      start_time: input.start_time,
      duration: input.duration ?? 30,
      timezone: input.timezone ?? "Europe/London",
      join_url: `https://zoom.us/j/${id}?pwd=mockpwd`,
      start_url: `https://zoom.us/s/${id}?zak=mock-host-token`,
      password: "mockpwd",
      host_id: "mock-host-iceberg",
      status: "created",
      created_at: now,
      updated_at: now
    };
  }

  async getOAuthToken(): Promise<OAuthToken> {
    const now = Date.now();
    if (cachedToken && cachedToken.expires_at > now + 60_000) {
      return cachedToken;
    }
    tokenFetchCount += 1;
    cachedToken = {
      access_token: `mock-access-token-${tokenFetchCount}`,
      expires_at: now + 3_600_000,
      token_type: "bearer",
      scopes: [
        "meeting:write:meeting",
        "meeting:read:meeting",
        "recording:read",
        "user:read",
        "phone:read"
      ]
    };
    return cachedToken;
  }

  getTokenFetchCount(): number {
    return tokenFetchCount;
  }

  resetTokenCache(): void {
    cachedToken = null;
    tokenFetchCount = 0;
  }

  async createMeeting(input: CreateMeetingInput): Promise<Meeting> {
    await this.getOAuthToken();
    const meeting = this.buildMeeting(input);
    this.meetings.set(String(meeting.zoom_meeting_id), meeting);
    this.meetings.set(meeting.zoom_meeting_uuid, meeting);
    return meeting;
  }

  async getMeeting(id: string): Promise<Meeting> {
    const meeting = this.meetings.get(id);
    if (!meeting) throw new Error(`Meeting not found: ${id}`);
    return meeting;
  }

  async listMeetings(): Promise<Meeting[]> {
    const seen = new Set<number>();
    return [...this.meetings.values()].filter((m) => {
      if (seen.has(m.zoom_meeting_id)) return false;
      seen.add(m.zoom_meeting_id);
      return true;
    });
  }

  async updateMeeting(id: string, input: Partial<CreateMeetingInput>): Promise<Meeting> {
    const meeting = await this.getMeeting(id);
    Object.assign(meeting, input, { updated_at: new Date().toISOString() });
    return meeting;
  }

  async deleteMeeting(id: string): Promise<void> {
    const meeting = await this.getMeeting(id);
    meeting.status = "cancelled";
    meeting.updated_at = new Date().toISOString();
  }

  async generateSdkSignature(input: SignatureInput): Promise<SdkSignature> {
    const iat = Math.floor(Date.now() / 1000) - 30;
    const exp = iat + 60 * 60 * 2;
    const oHeader = { alg: "HS256", typ: "JWT" };
    const oPayload = {
      sdkKey: MOCK_SDK_KEY,
      mn: input.meetingNumber,
      role: input.role,
      iat,
      exp,
      tokenExp: exp
    };
    const signature = KJUR.jws.JWS.sign("HS256", JSON.stringify(oHeader), JSON.stringify(oPayload), MOCK_SDK_SECRET);
    return { signature, sdkKey: MOCK_SDK_KEY };
  }

  verifyWebhook(headers: Record<string, string>, body: string): boolean {
    const timestamp = headers["x-zm-request-timestamp"] ?? headers["X-Zm-Request-Timestamp"];
    const sig = headers["x-zm-signature"] ?? headers["X-Zm-Signature"];
    if (!timestamp || !sig) return false;
    const message = `v0:${timestamp}:${body}`;
    const expected = `v0=${createHmac("sha256", MOCK_WEBHOOK_SECRET).update(message).digest("hex")}`;
    return sig === expected;
  }

  parseWebhookEvent(body: unknown): ZoomWebhookEvent {
    const data = body as Record<string, unknown>;
    const event = String(data.event ?? "");
    const payload = (data.payload ?? {}) as Record<string, unknown>;
    const eventId =
      (payload.object as Record<string, unknown> | undefined)?.uuid?.toString() ??
      `${event}-${data.event_ts ?? Date.now()}`;
    return {
      event,
      event_ts: Number(data.event_ts ?? Date.now()),
      payload,
      event_id: eventId
    };
  }

  async getRecordings(meetingUuid: string): Promise<RecordingFile[]> {
    await this.getMeeting(meetingUuid);
    return [
      {
        id: `rec-${meetingUuid}`,
        meeting_uuid: meetingUuid,
        recording_id: `mock-recording-${meetingUuid}`,
        file_type: "MP4",
        download_url: `https://mock.zoom.us/recording/${meetingUuid}.mp4`,
        file_size: 12_000_000
      },
      {
        id: `trans-${meetingUuid}`,
        meeting_uuid: meetingUuid,
        recording_id: `mock-transcript-${meetingUuid}`,
        file_type: "TRANSCRIPT",
        download_url: `https://mock.zoom.us/transcript/${meetingUuid}.vtt`,
        transcript_text: "Mock transcript: Valuation demo call completed successfully.",
        file_size: 4096
      }
    ];
  }

  async getTranscript(meetingUuid: string): Promise<string | null> {
    const recordings = await this.getRecordings(meetingUuid);
    const transcript = recordings.find((r) => r.file_type === "TRANSCRIPT");
    return transcript?.transcript_text ?? null;
  }

  async listPhoneEvents(since?: Date): Promise<PhoneEvent[]> {
    if (!since) return this.phoneEvents;
    return this.phoneEvents.filter((e) => new Date(e.occurred_at) >= since);
  }

  async getPhoneCapabilities(): Promise<{ licensed: boolean; smart_embed: boolean; notes: string }> {
    return {
      licensed: false,
      smart_embed: false,
      notes: "Zoom Phone license deferred to Faz 2. Mock events only in Ay 1."
    };
  }

  static buildWebhookSignature(body: string, timestamp: string): string {
    const message = `v0:${timestamp}:${body}`;
    return `v0=${createHmac("sha256", MOCK_WEBHOOK_SECRET).update(message).digest("hex")}`;
  }

  static webhookFixtures = {
    urlValidation: {
      event: "endpoint.url_validation",
      event_ts: 1718966400000,
      payload: {
        plainToken: "mock-plain-token-abc123"
      }
    },
    meetingStarted: {
      event: "meeting.started",
      event_ts: 1718966500000,
      payload: {
        account_id: "mock-account",
        object: {
          uuid: "mock-uuid-100000001",
          id: 100000001,
          host_id: "mock-host-iceberg",
          topic: "Valuation Demo Call",
          type: 2,
          start_time: "2026-06-21T10:00:00Z"
        }
      }
    },
    meetingEnded: {
      event: "meeting.ended",
      event_ts: 1718968200000,
      payload: {
        account_id: "mock-account",
        object: {
          uuid: "mock-uuid-100000001",
          id: 100000001,
          host_id: "mock-host-iceberg",
          topic: "Valuation Demo Call",
          duration: 32
        }
      }
    },
    recordingCompleted: {
      event: "recording.completed",
      event_ts: 1718968300000,
      payload: {
        account_id: "mock-account",
        object: {
          uuid: "mock-uuid-100000001",
          id: 100000001,
          topic: "Valuation Demo Call",
          recording_files: [{ id: "rec-file-1", file_type: "MP4" }]
        }
      }
    },
    phoneCallCompleted: {
      event: "phone.callee_call_log_completed",
      event_ts: 1718968400000,
      payload: {
        account_id: "mock-account",
        object: {
          call_id: "mock-call-002",
          caller: { phone_number: "+441234567890" },
          callee: { phone_number: "+449876543210" },
          duration: 240,
          direction: "outbound"
        }
      }
    }
  };
}

export function resetMockGlobals(): void {
  meetingCounter = 100000000;
  tokenFetchCount = 0;
  cachedToken = null;
}
