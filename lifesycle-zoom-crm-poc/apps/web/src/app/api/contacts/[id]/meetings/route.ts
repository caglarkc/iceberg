import { z } from "zod";
import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  property_id: z.string().optional(),
  appointment_id: z.string().optional(),
  start_time: z.string(),
  duration: z.number().optional(),
  topic: z.string().optional(),
  agenda: z.string().optional(),
  type: z.enum(["scheduled", "instant"]).default("scheduled")
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = BodySchema.parse(await req.json());
    const { meetings } = getCrmContext();

    const meeting = await meetings.createMeetingForContact(id, {
      propertyId: body.property_id,
      appointmentId: body.appointment_id,
      startTime: body.start_time,
      duration: body.duration,
      topic: body.topic,
      agenda: body.agenda,
      type: body.type
    });

    return Response.json(meeting, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
