"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MeetingCard, ScheduleMeetingModal, TimelinePanel, type MeetingView, type TimelineEventView } from "@/components/crm-ui";

interface PropertyDetail {
  property: { id: string; address_line1: string; postcode: string | null; city: string | null };
  contact: { id: string; first_name: string; last_name: string } | null;
  appointments: Array<{ id: string; type: string; scheduled_at: string }>;
  timeline: TimelineEventView[];
  meetings: MeetingView[];
}

export default function PropertyDetailClient({ propertyId }: { propertyId: string }) {
  const [data, setData] = useState<PropertyDetail | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/properties/${propertyId}`);
    if (res.ok) setData(await res.json());
  }, [propertyId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createMeeting(form: { startTime: string; duration: number; topic: string }) {
    if (!data?.contact) return;
    setLoading(true);
    setError(null);
    const valuation = data.appointments.find((a) => a.type === "valuation");
    try {
      const res = await fetch(`/api/contacts/${data.contact.id}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_id: propertyId,
          appointment_id: valuation?.id,
          start_time: form.startTime,
          duration: form.duration,
          topic: form.topic,
          type: "scheduled"
        })
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message ?? "Failed");
      setScheduleOpen(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!data) return <p className="text-sm text-slate-500">Loading…</p>;

  const valuation = data.appointments.find((a) => a.type === "valuation");

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div>
          {data.contact && (
            <Link href={`/contacts/${data.contact.id}`} className="text-xs text-brand-600 hover:underline">
              ← {data.contact.first_name} {data.contact.last_name}
            </Link>
          )}
          <h1 className="mt-2 text-2xl font-bold">{data.property.address_line1}</h1>
          <p className="text-sm text-slate-500">
            {data.property.city}, {data.property.postcode}
          </p>
        </div>

        {valuation && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase text-slate-500">Valuation Appointment</p>
            <p className="font-medium">
              {new Date(valuation.scheduled_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}
            </p>
            <button
              onClick={() => setScheduleOpen(true)}
              className="mt-3 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              Schedule Valuation Call
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3">
          {data.meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} onRefresh={load} />
          ))}
        </div>
      </div>
      <TimelinePanel events={data.timeline} />
      <ScheduleMeetingModal
        open={scheduleOpen}
        defaultStartTime={valuation?.scheduled_at?.slice(0, 16)}
        onClose={() => setScheduleOpen(false)}
        onSubmit={createMeeting}
        loading={loading}
      />
    </div>
  );
}
