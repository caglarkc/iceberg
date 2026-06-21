// @ai-generated
interface TokenState {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: TokenState | undefined;

export async function getAccessToken(now = Date.now()): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.accessToken;
  }

  cachedToken = {
    accessToken: "mock-access-token",
    expiresAt: now + 55 * 60 * 1000
  };
  return cachedToken.accessToken;
}
