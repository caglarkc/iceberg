import type { ZoomProvider } from "./zoom-provider.interface.js";

export class RealZoomAdapter implements ZoomProvider {
  constructor() {
    throw new Error("RealZoomAdapter is not implemented — set ZOOM_MODE=mock for Ay 1 POC (Faz 2)");
  }

  getOAuthToken() {
    return this.notImplemented();
  }
  createMeeting() {
    return this.notImplemented();
  }
  getMeeting() {
    return this.notImplemented();
  }
  listMeetings() {
    return this.notImplemented();
  }
  updateMeeting() {
    return this.notImplemented();
  }
  deleteMeeting() {
    return this.notImplemented();
  }
  generateSdkSignature() {
    return this.notImplemented();
  }
  verifyWebhook() {
    return this.notImplemented();
  }
  parseWebhookEvent() {
    return this.notImplemented();
  }
  getRecordings() {
    return this.notImplemented();
  }
  getTranscript() {
    return this.notImplemented();
  }
  getPhoneCapabilities() {
    return this.notImplemented();
  }

  private notImplemented(): never {
    throw new Error("RealZoomAdapter: Faz 2 — Zoom credentials required");
  }
}
