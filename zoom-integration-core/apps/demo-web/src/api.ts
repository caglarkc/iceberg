const base = import.meta.env.VITE_API_BASE_URL ?? "";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const zoomApi = {
  health: () => api<{ oauth: string; sdk: string; mode: string }>("/api/zoom/health"),
  createMeeting: (body: { topic: string }) => api<Meeting>("/api/zoom/meetings", { method: "POST", body: JSON.stringify(body) }),
  listMeetings: () => api<Meeting[]>("/api/zoom/meetings"),
  signature: (body: { meetingNumber: string; role: 0 | 1 }) =>
    api<{ signature: string; sdkKey: string }>("/api/zoom/signature", { method: "POST", body: JSON.stringify(body) }),
  events: () => api<WebhookEvent[]>("/api/zoom/events"),
  replayWebhook: (fixture: string) =>
    api("/internal/webhooks/replay", { method: "POST", body: JSON.stringify({ fixture }) }),
  capabilityMap: (status?: string) =>
    api<{ items: CapabilityItem[]; total: number }>(`/api/zoom/capability-map${status ? `?status=${status}` : ""}`),
  phoneCapabilities: () => api<{ licensed: boolean; smart_embed: boolean; notes: string }>("/api/zoom/phone/capabilities"),
  phoneEvents: () => api<{ mock_events: PhoneEvent[]; webhook_events: PhoneEvent[] }>("/api/zoom/phone/events"),
  transcript: (uuid: string) => api<{ transcript: string }>(`/api/zoom/meetings/${uuid}/transcript`)
};

export interface Meeting {
  zoom_meeting_id: number;
  zoom_meeting_uuid: string;
  topic: string;
  join_url: string;
  status: string;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  event_ts: string;
  processed: boolean;
}

export interface CapabilityItem {
  feature_key: string;
  title: string;
  description: string;
  status: string;
  implementation?: "real" | "mock" | "simulated" | "none";
  notes: string;
}

export interface PhoneEvent {
  id: string;
  event_type: string;
  from_number?: string;
  to_number?: string;
  duration_seconds?: number;
  occurred_at: string;
}
