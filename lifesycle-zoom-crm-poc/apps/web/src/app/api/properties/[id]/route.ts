import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { contacts, meetings } = getCrmContext();
    const property = contacts.getPropertyDetail(id);
    if (!property) {
      return Response.json({ code: "NOT_FOUND", message: "Property not found" }, { status: 404 });
    }
    const meetingList = property.contact
      ? meetings.listMeetingsByContact(property.contact.id).filter((m) => m.property_id === id)
      : [];
    return Response.json({ ...property, meetings: meetingList });
  } catch (error) {
    return jsonError(error);
  }
}
