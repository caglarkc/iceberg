import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiPlaudAdapter } from "@pip/plaud";

const webhookSecret = "webhook-test-secret";
const config = {
  baseUrl: "https://api.plaud.test",
  clientId: "client-iceberg",
  apiKey: "test-api-key",
  webhookSecret
};

function signWebhookBody(body: string): string {
  return createHmac("sha256", webhookSecret).update(body, "utf8").digest("hex");
}

describe("ApiPlaudAdapter", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/v1/recordings/rec-1")) {
          return new Response(
            JSON.stringify({
              provider_recording_id: "rec-1",
              transcript_text: "Live transcript body",
              recorded_at: "2026-06-21T10:00:00.000Z",
              metadata: {}
            }),
            { status: 200 }
          );
        }
        if (url.includes("/v1/recordings")) {
          expect(init?.headers).toMatchObject({
            Authorization: "Bearer test-api-key",
            "X-Client-Id": "client-iceberg"
          });
          return new Response(
            JSON.stringify({
              recordings: [
                {
                  provider_recording_id: "rec-1",
                  transcript_text: "Live transcript body",
                  recorded_at: "2026-06-21T10:00:00.000Z",
                  metadata: {}
                }
              ]
            }),
            { status: 200 }
          );
        }
        return new Response("not found", { status: 404 });
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws when credentials missing", async () => {
    const adapter = new ApiPlaudAdapter({ baseUrl: "", clientId: "", apiKey: "" });
    await expect(adapter.listRecordings()).rejects.toThrow(/PLAUD_API_BASE_URL/);
  });

  it("listRecordings maps API response with fetched_via api", async () => {
    const adapter = new ApiPlaudAdapter(config);
    const list = await adapter.listRecordings();
    expect(list).toHaveLength(1);
    expect(list[0].fetched_via).toBe("api");
    expect(list[0].provider_recording_id).toBe("rec-1");
  });

  it("fetchRecording returns single recording", async () => {
    const adapter = new ApiPlaudAdapter(config);
    const rec = await adapter.fetchRecording("rec-1");
    expect(rec.transcript_text).toBe("Live transcript body");
    expect(rec.fetched_via).toBe("api");
  });

  it("listRecordings appends since query param", async () => {
    const adapter = new ApiPlaudAdapter(config);
    const since = new Date("2026-06-01T00:00:00.000Z");
    await adapter.listRecordings(since);
    const fetchMock = vi.mocked(fetch);
    const calledUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(calledUrl).toContain("since=2026-06-01");
  });

  it("verifyWebhook accepts valid HMAC-SHA256 signature", () => {
    const adapter = new ApiPlaudAdapter(config);
    const body = '{"event":"recording.ready"}';
    const signature = signWebhookBody(body);
    expect(adapter.verifyWebhook?.({ "x-plaud-signature": signature }, body)).toBe(true);
    expect(adapter.verifyWebhook?.({ "X-Plaud-Signature": `sha256=${signature}` }, body)).toBe(true);
  });

  it("verifyWebhook rejects missing secret, header, or invalid signature", () => {
    const adapter = new ApiPlaudAdapter(config);
    const body = '{"event":"recording.ready"}';
    const validSig = signWebhookBody(body);

    expect(adapter.verifyWebhook?.({}, body)).toBe(false);

    const noSecret = new ApiPlaudAdapter({ ...config, webhookSecret: undefined });
    expect(noSecret.verifyWebhook?.({ "x-plaud-signature": validSig }, body)).toBe(false);

    expect(adapter.verifyWebhook?.({ "x-plaud-signature": "deadbeef" }, body)).toBe(false);
    expect(adapter.verifyWebhook?.({ "x-plaud-signature": signWebhookBody('{"tampered":true}') }, body)).toBe(
      false
    );
  });

  it("surfaces HTTP errors from partner API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("forbidden", { status: 403, statusText: "Forbidden" }))
    );
    const adapter = new ApiPlaudAdapter(config);
    await expect(adapter.listRecordings()).rejects.toThrow(/403/);
  });
});
