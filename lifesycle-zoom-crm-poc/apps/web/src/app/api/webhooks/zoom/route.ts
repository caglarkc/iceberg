import { z } from "zod";
import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WebhookSchema = z.object({
  event: z.string(),
  zoom_meeting_id: z.string(),
  payload: z.record(z.unknown()),
  tracking: z
    .object({
      crm_contact_id: z.string().optional(),
      crm_valuation_id: z.string().optional()
    })
    .optional()
});

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    const expected = process.env.ZOOM_WEBHOOK_SECRET ?? "whsec_local_dev_secret";
    if (secret !== expected) {
      return Response.json({ code: "UNAUTHORIZED", message: "Invalid webhook secret" }, { status: 401 });
    }

    const body = WebhookSchema.parse(await req.json());
    const { meetings } = getCrmContext();
    const updated = await meetings.handleWebhookEvent(body);
    return Response.json({ ok: true, meeting: updated });
  } catch (error) {
    return jsonError(error);
  }
}
