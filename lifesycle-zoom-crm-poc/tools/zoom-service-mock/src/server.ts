import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import {
  CreateMeetingInputSchema,
  InstantMeetingInputSchema,
  EmbedSignatureInputSchema,
  MockZoomServiceAdapter
} from "@lifesycle/zoom-client";

const adapter = new MockZoomServiceAdapter();

function getApiKey(): string {
  return process.env.ZOOM_SERVICE_API_KEY ?? "local-zoom-service-key";
}

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== getApiKey()) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid service token" });
    return;
  }
  next();
}

export function createZoomServiceMockApp(): express.Application {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api/v1", authMiddleware);

  app.get("/api/v1/capabilities", async (_req, res) => {
    res.json(await adapter.getCapabilities());
  });

  app.post("/api/v1/meetings", async (req, res) => {
    const parsed = CreateMeetingInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
      return;
    }
    const meeting = await adapter.createMeeting(parsed.data);
    res.status(201).json(meeting);
  });

  app.post("/api/v1/meetings/instant", async (req, res) => {
    const parsed = InstantMeetingInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
      return;
    }
    const meeting = await adapter.createInstantMeeting(parsed.data);
    res.status(201).json(meeting);
  });

  app.get("/api/v1/meetings/:id", async (req, res) => {
    try {
      res.json(await adapter.getMeeting(req.params.id));
    } catch {
      res.status(404).json({ code: "NOT_FOUND", message: "Meeting not found" });
    }
  });

  app.post("/api/v1/meetings/:id/embed-signature", async (req, res) => {
    const parsed = EmbedSignatureInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ code: "INVALID_INPUT", message: parsed.error.message });
      return;
    }
    try {
      res.json(await adapter.getEmbedSignature(req.params.id, parsed.data));
    } catch {
      res.status(404).json({ code: "NOT_FOUND", message: "Meeting not found" });
    }
  });

  app.post("/api/v1/webhooks/replay", async (req, res) => {
    res.json({ ok: true, event: req.body });
  });

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "zoom-integration-mock" });
  });

  return app;
}

export function startZoomServiceMock(port = Number(process.env.PORT ?? 4010)): ReturnType<express.Application["listen"]> {
  const app = createZoomServiceMockApp();
  return app.listen(port, () => {
    console.log(`Zoom Integration Service (mock) listening on http://localhost:${port}/api/v1`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startZoomServiceMock();
}
