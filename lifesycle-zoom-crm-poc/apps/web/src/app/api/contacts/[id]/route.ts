import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { contacts, meetings } = getCrmContext();
    const detail = contacts.getContactDetail(id);
    if (!detail) {
      return Response.json({ code: "NOT_FOUND", message: "Contact not found" }, { status: 404 });
    }
    const meetingList = meetings.listMeetingsByContact(id);
    return Response.json({ ...detail, meetings: meetingList });
  } catch (error) {
    return jsonError(error);
  }
}
