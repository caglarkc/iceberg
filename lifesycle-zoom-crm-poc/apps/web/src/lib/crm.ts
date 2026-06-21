import {
  ContactService,
  MeetingService,
  createDatabase,
  seedDatabase,
  createZoomIntegrationClient
} from "@lifesycle/crm-mock";

let initialized = false;

export function getCrmContext() {
  if (!initialized) {
    const db = createDatabase();
    const count = db.prepare("SELECT COUNT(*) as c FROM contacts").get() as { c: number };
    if (count.c === 0) seedDatabase(db);
    initialized = true;
  }

  const db = createDatabase();
  const zoomClient = createZoomIntegrationClient({
    mode: process.env.ZOOM_MODE,
    baseUrl: process.env.ZOOM_SERVICE_URL,
    apiKey: process.env.ZOOM_SERVICE_API_KEY
  });

  return {
    db,
    contacts: new ContactService(db),
    meetings: new MeetingService(db, zoomClient)
  };
}

export function jsonError(error: unknown, fallback = "Internal server error") {
  if (error && typeof error === "object" && "code" in error && "status" in error) {
    const e = error as { code: string; status: number; message: string };
    return Response.json({ code: e.code, message: e.message }, { status: e.status });
  }
  console.error(error);
  return Response.json({ code: "INTERNAL_ERROR", message: fallback }, { status: 500 });
}
