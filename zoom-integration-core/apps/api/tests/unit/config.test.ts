import { describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";
import { createZoomProvider } from "../../src/providers/index.js";

describe("config and provider factory", () => {
  it("loads mock config by default", () => {
    const config = loadConfig({ ZOOM_MODE: "mock", NODE_ENV: "test", APP_BASE_URL: "http://localhost:4010" });
    expect(config.zoomMode).toBe("mock");
  });

  it("throws when real mode missing credentials", () => {
    expect(() => loadConfig({ ZOOM_MODE: "real", NODE_ENV: "test", APP_BASE_URL: "http://localhost:4010" })).toThrow(
      /Missing required env/
    );
  });

  it("createZoomProvider returns mock adapter", () => {
    const provider = createZoomProvider("mock");
    expect(provider).toBeTruthy();
  });

  it("createZoomProvider throws on invalid mode", () => {
    expect(() => createZoomProvider("invalid")).toThrow(/Invalid ZOOM_MODE/);
  });
});
