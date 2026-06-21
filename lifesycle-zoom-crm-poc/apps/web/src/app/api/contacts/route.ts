import { getCrmContext, jsonError } from "@/lib/crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { contacts } = getCrmContext();
    return Response.json(contacts.listContacts());
  } catch (error) {
    return jsonError(error);
  }
}
