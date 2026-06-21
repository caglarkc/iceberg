import Link from "next/link";
import { getCrmContext } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const { contacts } = getCrmContext();
  const list = contacts.listContacts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="text-sm text-slate-500">Demo agent: demo_agent@lifesycle.mock</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/contacts/${c.id}`} className="font-medium text-brand-600 hover:underline">
                    {c.first_name} {c.last_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.email}</td>
                <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">{c.type}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
