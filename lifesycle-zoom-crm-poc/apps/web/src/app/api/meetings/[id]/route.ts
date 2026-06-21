import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { meetings } = getCrmContext();
    const meeting = meetings.getMeeting(id);
    if (!meeting) {
      return Response.json({ code: "NOT_FOUND", message: "Meeting not found" }, { status: 404 });
    }
    return Response.json(meeting);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { meetings } = getCrmContext();
    const meeting = await meetings.cancelMeeting(id);
    return Response.json(meeting);
  } catch (error) {
    return jsonError(error);
  }
}
