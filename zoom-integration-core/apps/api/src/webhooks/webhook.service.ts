import type { ZoomProvider } from "../providers/zoom-provider.interface.js";
import type { ZoomStore } from "../store.js";

export async function ingestWebhook(
  provider: ZoomProvider,
  store: ZoomStore,
  headers: Record<string, string>,
  rawBody: string,
  parsedBody: unknown
) {
  if (!provider.verifyWebhook(headers, rawBody)) {
    return { status: 401 as const, body: { error: "Invalid webhook signature" } };
  }

  const event = provider.parseWebhookEvent(parsedBody);
  const zoomEventId = event.event_id ?? `${event.event}-${event.event_ts}`;

  if (event.event === "endpoint.url_validation") {
    const plainToken = (event.payload.plainToken as string) ?? "";
    const encryptedToken = await hashPlainToken(plainToken);
    return {
      status: 200 as const,
      body: { plainToken, encryptedToken }
    };
  }

  const existing = store.getWebhookEventByZoomId(zoomEventId);
  if (existing) {
    return { status: 200 as const, body: { duplicate: true, event: existing } };
  }

  const record = store.saveWebhookEvent({
    zoom_event_id: zoomEventId,
    event_type: event.event,
    event_ts: new Date(event.event_ts).toISOString(),
    payload: event.payload,
    processed: false
  });

  try {
    await routeWebhookEvent(provider, store, event);
    record.processed = true;
    record.processed_at = new Date().toISOString();
  } catch (error) {
    record.error_message = error instanceof Error ? error.message : String(error);
  }

  return { status: 200 as const, body: { processed: record.processed, event: record } };
}

async function routeWebhookEvent(
  provider: ZoomProvider,
  store: ZoomStore,
  event: ReturnType<ZoomProvider["parseWebhookEvent"]>
) {
  const object = (event.payload.object ?? {}) as Record<string, unknown>;
  const uuid = String(object.uuid ?? "");

  switch (event.event) {
    case "meeting.started":
      store.updateMeetingStatus(uuid, "started");
      break;
    case "meeting.ended": {
      store.updateMeetingStatus(uuid, "ended");
      if (uuid) {
        const recordings = await provider.getRecordings(uuid);
        recordings.forEach((r) => store.saveRecording(r));
      }
      break;
    }
    case "recording.completed":
      if (uuid) {
        const recordings = await provider.getRecordings(uuid);
        recordings.forEach((r) => store.saveRecording(r));
      }
      break;
    case "phone.callee_call_log_completed":
    case "phone.caller_call_log_completed":
      store.savePhoneEvent({
        id: `wh-${event.event_id}`,
        zoom_call_id: String(object.call_id ?? event.event_id),
        event_type: event.event,
        direction: (object.direction as "inbound" | "outbound") ?? "outbound",
        from_number: String((object.caller as Record<string, unknown>)?.phone_number ?? ""),
        to_number: String((object.callee as Record<string, unknown>)?.phone_number ?? ""),
        duration_seconds: Number(object.duration ?? 0),
        occurred_at: new Date(event.event_ts).toISOString(),
        payload: event.payload
      });
      break;
    default:
      break;
  }
}

async function hashPlainToken(plainToken: string): Promise<string> {
  const { createHmac } = await import("node:crypto");
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "mock-webhook-secret";
  return createHmac("sha256", secret).update(plainToken).digest("hex");
}
