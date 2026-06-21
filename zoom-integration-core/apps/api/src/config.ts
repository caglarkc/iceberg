import { z } from "zod";

const ConfigSchema = z.object({
  zoomMode: z.enum(["mock", "real"]).default("mock"),
  port: z.coerce.number().default(4010),
  appBaseUrl: z.string().url().default("http://localhost:4010"),
  webhookCallbackUrl: z.string().url().optional(),
  databaseUrl: z.string().optional(),
  nodeEnv: z.enum(["development", "test", "production"]).default("development")
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const zoomMode = env.ZOOM_MODE ?? "mock";
  if (zoomMode === "real") {
    const required = ["ZOOM_ACCOUNT_ID", "ZOOM_CLIENT_ID", "ZOOM_CLIENT_SECRET", "ZOOM_SDK_KEY", "ZOOM_SDK_SECRET"];
    const missing = required.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required env for ZOOM_MODE=real: ${missing.join(", ")}`);
    }
  }

  return ConfigSchema.parse({
    zoomMode,
    port: env.PORT ?? "4010",
    appBaseUrl: env.APP_BASE_URL ?? "http://localhost:4010",
    webhookCallbackUrl: env.WEBHOOK_CALLBACK_URL,
    databaseUrl: env.DATABASE_URL,
    nodeEnv: env.NODE_ENV ?? "development"
  });
}
