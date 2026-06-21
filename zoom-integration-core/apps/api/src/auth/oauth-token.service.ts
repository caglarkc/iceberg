import type { ZoomProvider } from "../providers/zoom-provider.interface.js";

export class OAuthTokenService {
  private lastFetchAt = 0;

  constructor(private readonly provider: ZoomProvider) {}

  async getToken() {
    const token = await this.provider.getOAuthToken();
    this.lastFetchAt = Date.now();
    return token;
  }

  async health(): Promise<"ok" | "expired"> {
    const token = await this.provider.getOAuthToken();
    return token.expires_at > Date.now() ? "ok" : "expired";
  }

  get lastFetchTimestamp(): number {
    return this.lastFetchAt;
  }
}
