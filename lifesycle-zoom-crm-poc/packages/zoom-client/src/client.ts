import {
  CapabilitiesResponseSchema,
  CreateMeetingInput,
  EmbedSignatureInput,
  EmbedSignatureResponseSchema,
  InstantMeetingInput,
  ZoomMeetingResponseSchema,
  ZoomServiceError
} from "./types.js";

export interface HttpZoomClientConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

export class HttpZoomClient {
  constructor(private readonly config: HttpZoomClientConfig) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    schema?: { parse: (data: unknown) => T }
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 10_000);

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          typeof data === "object" && data && "message" in data
            ? String((data as { message: string }).message)
            : `Zoom service error (${response.status})`;
        const code =
          typeof data === "object" && data && "code" in data
            ? String((data as { code: string }).code)
            : undefined;
        throw new ZoomServiceError(message, response.status, code);
      }

      return schema ? schema.parse(data) : (data as T);
    } catch (error) {
      if (error instanceof ZoomServiceError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ZoomServiceError("Zoom service timeout", 504, "ZOOM_SERVICE_TIMEOUT");
      }
      throw new ZoomServiceError("Zoom service unavailable", 502, "ZOOM_SERVICE_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  }

  getCapabilities() {
    return this.request("GET", "/capabilities", undefined, CapabilitiesResponseSchema);
  }

  createMeeting(input: CreateMeetingInput) {
    return this.request("POST", "/meetings", input, ZoomMeetingResponseSchema);
  }

  createInstantMeeting(input: InstantMeetingInput) {
    return this.request("POST", "/meetings/instant", input, ZoomMeetingResponseSchema);
  }

  getMeeting(id: string) {
    return this.request("GET", `/meetings/${id}`, undefined, ZoomMeetingResponseSchema);
  }

  getEmbedSignature(meetingId: string, input: EmbedSignatureInput) {
    return this.request(
      "POST",
      `/meetings/${meetingId}/embed-signature`,
      input,
      EmbedSignatureResponseSchema
    );
  }
}

export function createZoomClient(config: HttpZoomClientConfig): HttpZoomClient {
  return new HttpZoomClient(config);
}
