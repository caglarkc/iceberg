export { MockPlaudAdapter } from "./mock-plaud.adapter.js";
export { ApiPlaudAdapter } from "./api-plaud.adapter.js";
export { UploadPlaudAdapter, getUploadAdapter } from "./upload-plaud.adapter.js";
import { MockPlaudAdapter } from "./mock-plaud.adapter.js";
import { ApiPlaudAdapter } from "./api-plaud.adapter.js";
export function createPlaudAdapterFromEnv(env = process.env) {
    const mode = (env.PLAUD_MODE ?? "mock");
    if (mode === "mock")
        return new MockPlaudAdapter();
    return new ApiPlaudAdapter({
        baseUrl: env.PLAUD_API_BASE_URL ?? "",
        clientId: env.PLAUD_CLIENT_ID ?? "",
        apiKey: env.PLAUD_CLIENT_API_KEY ?? ""
    });
}
