import { describe, expect, it, beforeEach } from "vitest";
import { KJUR } from "jsrsasign";
import { MockZoomAdapter, resetMockGlobals, MOCK_SIGNATURE_TEST_VECTOR } from "../../src/providers/mock-zoom.adapter.js";

describe("MockZoomAdapter", () => {
  beforeEach(() => {
    resetMockGlobals();
  });

  it("caches OAuth token on second request", async () => {
    const adapter = new MockZoomAdapter();
    await adapter.getOAuthToken();
    await adapter.getOAuthToken();
    expect(adapter.getTokenFetchCount()).toBe(1);
  });

  it("creates deterministic meeting structure", async () => {
    const adapter = new MockZoomAdapter();
    const meeting = await adapter.createMeeting({ topic: "Test Call" });
    expect(meeting.topic).toBe("Test Call");
    expect(meeting.join_url).toContain("zoom.us/j/");
    expect(meeting.zoom_meeting_id).toBeGreaterThan(100000000);
  });

  it("generates JWT signature with required claims", async () => {
    const adapter = new MockZoomAdapter();
    const { signature, sdkKey } = await adapter.generateSdkSignature(MOCK_SIGNATURE_TEST_VECTOR);
    expect(sdkKey).toBe(MOCK_SIGNATURE_TEST_VECTOR.sdkKey);
    const payload = JSON.parse(KJUR.jws.JWS.parse(signature).payloadPP);
    expect(payload.mn).toBe(MOCK_SIGNATURE_TEST_VECTOR.meetingNumber);
    expect(payload.role).toBe(0);
    expect(payload.sdkKey).toBe(MOCK_SIGNATURE_TEST_VECTOR.sdkKey);
    expect(payload.iat).toBeTypeOf("number");
    expect(payload.exp).toBeTypeOf("number");
  });

  it("verifies webhook signature", () => {
    const adapter = new MockZoomAdapter();
    const body = JSON.stringify({ event: "meeting.ended", event_ts: 1, payload: {} });
    const timestamp = "1718966400";
    const signature = MockZoomAdapter.buildWebhookSignature(body, timestamp);
    expect(adapter.verifyWebhook({ "x-zm-request-timestamp": timestamp, "x-zm-signature": signature }, body)).toBe(true);
    expect(adapter.verifyWebhook({ "x-zm-request-timestamp": timestamp, "x-zm-signature": "v0=bad" }, body)).toBe(false);
  });

  it("returns mock phone capabilities as unlicensed", async () => {
    const adapter = new MockZoomAdapter();
    const caps = await adapter.getPhoneCapabilities();
    expect(caps.licensed).toBe(false);
    expect(caps.notes).toContain("Faz 2");
  });
});
