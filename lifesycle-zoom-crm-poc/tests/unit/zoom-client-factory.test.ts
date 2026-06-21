import { afterEach, describe, expect, it } from "vitest";
import { createZoomIntegrationClient } from "../../packages/zoom-client/src/index.js";
import { MockZoomServiceAdapter } from "../../packages/zoom-client/src/mock-adapter.js";
import { HttpZoomClient } from "../../packages/zoom-client/src/client.js";

describe("createZoomIntegrationClient", () => {
  const envSnapshot = { ...process.env };

  afterEach(() => {
    process.env = { ...envSnapshot };
  });

  it("returns in-process mock when ZOOM_MODE=mock and no ZOOM_SERVICE_URL", () => {
    delete process.env.ZOOM_SERVICE_URL;
    process.env.ZOOM_MODE = "mock";
    const client = createZoomIntegrationClient({ mode: "mock" });
    expect(client).toBeInstanceOf(MockZoomServiceAdapter);
  });

  it("returns HttpZoomClient when ZOOM_SERVICE_URL is set", () => {
    process.env.ZOOM_SERVICE_URL = "http://localhost:4010/api/v1";
    process.env.ZOOM_MODE = "mock";
    const client = createZoomIntegrationClient({ mode: "mock", apiKey: "test" });
    expect(client).toBeInstanceOf(HttpZoomClient);
  });

  it("returns HttpZoomClient for live mode", () => {
    delete process.env.ZOOM_SERVICE_URL;
    const client = createZoomIntegrationClient({
      mode: "live",
      baseUrl: "https://zoom.example/api/v1",
      apiKey: "live-key"
    });
    expect(client).toBeInstanceOf(HttpZoomClient);
  });
});
