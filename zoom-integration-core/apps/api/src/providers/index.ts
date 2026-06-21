import type { ZoomProvider } from "./zoom-provider.interface.js";
import { MockZoomAdapter } from "./mock-zoom.adapter.js";
import { RealZoomAdapter } from "./real-zoom.adapter.js";

export function createZoomProvider(mode?: string): ZoomProvider {
  const zoomMode = mode ?? process.env.ZOOM_MODE ?? "mock";
  if (zoomMode === "mock") return new MockZoomAdapter();
  if (zoomMode === "real") return new RealZoomAdapter();
  throw new Error(`Invalid ZOOM_MODE: ${zoomMode}. Use 'mock' or 'real'.`);
}

export { MockZoomAdapter, RealZoomAdapter };
