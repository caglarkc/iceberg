// @ai-generated
export interface AppConfig {
  mockApi: boolean;
  apiBaseUrl: string;
}

export function getConfig(): AppConfig {
  return {
    mockApi: process.env.MOCK_API !== "false",
    apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:4010"
  };
}
