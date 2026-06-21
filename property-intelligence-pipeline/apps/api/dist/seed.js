import { createPlaudAdapterFromEnv } from "@pip/plaud";
import { createApp } from "./app.js";
import { IngestService } from "./services.js";
import { createInMemoryStore } from "./store.js";
const store = createInMemoryStore();
const config = {
    companyId: process.env.COMPANY_ID ?? "company-iceberg-001",
    actorId: "user-sarah-001"
};
const plaud = createPlaudAdapterFromEnv();
const ingest = new IngestService(store, plaud, config);
async function seed() {
    const recordings = await ingest.ingestFromMock();
    console.log(`Seeded ${recordings.length} mock Plaud recordings`);
}
seed().catch((err) => {
    console.error(err);
    process.exit(1);
});
export { createApp, store };
