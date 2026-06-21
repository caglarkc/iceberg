import { createHmac, timingSafeEqual } from "node:crypto";
import type { PlaudProviderAdapter, PlaudRecordingRaw } from "./plaud-provider.interface.js";

export type ApiPlaudConfig = {
  baseUrl: string;
  clientId: string;
  apiKey: string;
  /** HMAC-SHA256 secret for webhook signature verification (PLAUD_WEBHOOK_SECRET). */
  webhookSecret?: string;
};

export class ApiPlaudAdapter implements PlaudProviderAdapter {
  readonly source = "api" as const;

  constructor(private readonly config: ApiPlaudConfig) {}

  private assertConfigured(): void {
    if (!this.config.baseUrl || !this.config.apiKey) {
      throw new Error(
        "ApiPlaudAdapter requires PLAUD_API_BASE_URL and PLAUD_CLIENT_API_KEY. Use PLAUD_MODE=mock for CI."
      );
    }
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.apiKey}`,
      "X-Client-Id": this.config.clientId
    };
  }

  async listRecordings(since?: Date): Promise<PlaudRecordingRaw[]> {
    this.assertConfigured();
    const url = new URL("/v1/recordings", this.config.baseUrl);
    if (since) url.searchParams.set("since", since.toISOString());

    const response = await fetch(url, { headers: this.headers() });
    if (!response.ok) {
      throw new Error(`Plaud API listRecordings failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as { recordings?: PlaudRecordingRaw[] };
    return (body.recordings ?? []).map((r) => ({ ...r, fetched_via: "api" as const }));
  }

  async fetchRecording(providerId: string): Promise<PlaudRecordingRaw> {
    this.assertConfigured();
    const response = await fetch(`${this.config.baseUrl}/v1/recordings/${providerId}`, {
      headers: this.headers()
    });
    if (!response.ok) {
      throw new Error(`Plaud API fetchRecording failed: ${response.status} ${response.statusText}`);
    }
    const raw = (await response.json()) as PlaudRecordingRaw;
    return { ...raw, fetched_via: "api" };
  }

  verifyWebhook(headers: Record<string, string>, body: string): boolean {
    const secret = this.config.webhookSecret;
    if (!secret) return false;

    const signature = headers["x-plaud-signature"] ?? headers["X-Plaud-Signature"];
    if (!signature) return false;

    const expected = createHmac("sha256", secret).update(body, "utf8").digest("hex");
    const provided = signature.startsWith("sha256=") ? signature.slice("sha256=".length) : signature;

    try {
      const providedBuf = Buffer.from(provided, "hex");
      const expectedBuf = Buffer.from(expected, "hex");
      return providedBuf.length === expectedBuf.length && timingSafeEqual(providedBuf, expectedBuf);
    } catch {
      return false;
    }
  }
}
