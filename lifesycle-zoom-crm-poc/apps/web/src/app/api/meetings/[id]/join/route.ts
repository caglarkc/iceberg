import { z } from "zod";
import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  role: z.union([z.literal(0), z.literal(1)]).optional()
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = BodySchema.parse(await req.json().catch(() => ({})));
    const { meetings } = getCrmContext();
    const signature = await meetings.getEmbedSignature(id, body.role ?? 1);
    return Response.json(signature);
  } catch (error) {
    return jsonError(error);
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { meetings } = getCrmContext();
    const meeting = meetings.getMeeting(id);
    if (!meeting) {
      return Response.json({ code: "NOT_FOUND", message: "Meeting not found" }, { status: 404 });
    }
    const embedEnabled = process.env.FEATURE_EMBED_SDK !== "false";
    return Response.json({
      mode: embedEnabled ? "embed" : "redirect",
      join_url: meeting.join_url,
      signature_endpoint: `/api/meetings/${id}/embed-signature`
    });
  } catch (error) {
    return jsonError(error);
  }
}
