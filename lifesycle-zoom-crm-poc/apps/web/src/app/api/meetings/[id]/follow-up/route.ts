import { z } from "zod";
import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  title: z.string(),
  due_date: z.string().optional(),
  description: z.string().optional()
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (process.env.FEATURE_FOLLOW_UP_TASKS === "false") {
      return Response.json({ code: "DISABLED", message: "Follow-up tasks disabled" }, { status: 403 });
    }
    const { id } = await params;
    const body = BodySchema.parse(await req.json());
    const { meetings } = getCrmContext();
    const task = meetings.createFollowUp(id, {
      title: body.title,
      dueDate: body.due_date,
      description: body.description
    });
    return Response.json(task, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
